"""Resolve the newest published PowerX container Release; never install or upgrade."""
import hashlib
import json
from pathlib import Path
import platform
import re
import sys
from urllib.error import HTTPError
from urllib.request import Request, urlopen

REPO = 'ArtisanCloud/PowerX'
API = 'https://api.github.com/repos/' + REPO


def fetch(url):
    request = Request(url, headers={'User-Agent': 'PowerX-install-tutorial',
                                  'Accept': 'application/vnd.github+json'})
    try:
        with urlopen(request, timeout=60) as response:
            return response.read()
    except HTTPError as error:
        if error.code in (403, 429):
            raise ValueError('GitHub 拒绝请求或触发限流；稍后重试，不要改成旧版本绕过。') from error
        raise


def newest_release(fetch_bytes=fetch):
    releases = []
    for page in range(1, 101):
        batch = json.loads(fetch_bytes(f'{API}/releases?per_page=100&page={page}'))
        if not isinstance(batch, list):
            raise ValueError('Release 列表无效，请检查 GitHub API 限流或网络。')
        releases.extend(r for r in batch if not r.get('draft')
                        and r.get('published_at') and (r.get('tag_name', '').startswith('docker-')
                        or any(a.get('name') in ('powerx-docker.tar.gz', 'powerx-upgrade-manifest.json')
                               for a in r.get('assets', []))))
        if len(batch) < 100:
            break
    else:
        raise ValueError('Release 分页超出范围，停止而不选择可能过期的版本。')
    if not releases:
        raise ValueError('尚无已发布的容器 Release；不会退回 develop 或旧镜像。')
    return max(releases, key=lambda r: (r['published_at'], r['id']))


def resolve(release, fetch_bytes=fetch):
    tag = release['tag_name']
    if not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9._-]*', tag):
        raise ValueError('Release 标签格式不受支持。')
    assets = {a['name']: a for a in release.get('assets', [])}
    name = 'powerx-upgrade-manifest.json'
    downloads = {}
    for filename in (name, name + '.sha256'):
        asset = assets.get(filename)
        expected = f'https://github.com/{REPO}/releases/download/{tag}/{filename}'
        if not asset or asset.get('browser_download_url') != expected:
            raise ValueError('最新 Release 缺少发布清单或校验文件；停止，不退回旧版。')
        downloads[filename] = fetch_bytes(expected)
        digest = asset.get('digest')
        if digest and digest != 'sha256:' + hashlib.sha256(downloads[filename]).hexdigest():
            raise ValueError('下载内容与 GitHub 资产校验值不一致。')
    checksum = downloads[name + '.sha256'].decode().strip().split()
    if len(checksum) != 2 or checksum[1].lstrip('*') != name:
        raise ValueError('发布清单校验文件格式不受支持。')
    if hashlib.sha256(downloads[name]).hexdigest() != checksum[0]:
        raise ValueError('发布清单 SHA256 校验失败。')
    manifest = json.loads(downloads[name])
    sha = manifest.get('source_sha', '')
    if (manifest.get('schema_version') != 'powerx.upgrade-manifest/v1'
            or manifest.get('executable') is not True
            or not re.fullmatch(r'[a-f0-9]{40}', sha)
            or manifest.get('verification', {}).get('status') != 'passed'):
        raise ValueError('发布清单尚不可执行、未通过验证或协议已变化；停止检查新版说明。')
    if 16 not in manifest.get('database', {}).get('postgres_major', []):
        raise ValueError('最新 Release 的 PostgreSQL 要求已变化；请先核对环境规格。')
    machine = platform.machine().lower()
    arch = {'x86_64': 'amd64', 'amd64': 'amd64', 'arm64': 'arm64', 'aarch64': 'arm64'}.get(machine)
    if not arch:
        raise ValueError('本教程仅覆盖 x86_64 / arm64。')
    values = {'POWERX_RELEASE_TAG': tag, 'POWERX_SOURCE_SHA': sha}
    for component, variable, repo in (
        ('backend', 'POWERX_BACKEND_IMAGE', 'ghcr.io/artisancloud/powerx-backend'),
        ('web_admin', 'POWERX_WEB_IMAGE', 'ghcr.io/artisancloud/powerx-web-admin')):
        image = manifest['images'][component]
        evidence = image.get('platforms', {}).get('linux/' + arch, {})
        if (image.get('repository') != repo or evidence.get('source_revision') != sha
                or not re.fullmatch(r'sha256:[a-f0-9]{64}', image.get('index_digest', ''))):
            raise ValueError('成对镜像或当前 CPU 平台的版本依据不完整。')
        values[variable] = repo + '@' + image['index_digest']
    return values, downloads


def main():
    target = Path('powerx-release')
    if target.exists():
        raise ValueError('powerx-release 已存在：沿用已有 release.env，不重复解析或覆盖。')
    release = newest_release()
    values, downloads = resolve(release)
    target.mkdir(mode=0o755)
    for name, content in downloads.items():
        (target / name).write_bytes(content)
    (target / 'release.json').write_text(json.dumps(release, ensure_ascii=False, indent=2) + '\n')
    (target / 'release.env').write_text(''.join(f'{key}={value}\n' for key, value in values.items()))
    print('已选择：' + values['POWERX_RELEASE_TAG'])
    print('发布时间：' + release['published_at'])
    print('发布状态：' + ('预发布（非稳定版承诺）' if release['prerelease'] else '正式发布'))
    print('已保存 powerx-release/release.env；本步骤没有安装或升级任何服务。')


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print('停止：' + str(error), file=sys.stderr)
        raise SystemExit(1)
