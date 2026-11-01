import sys
sys.dont_write_bytecode = True
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('resolver', 'scripts/tutorials/resolve-release.py')
r = importlib.util.module_from_spec(spec)
spec.loader.exec_module(r)
release = json.loads(Path('tests/fixtures/releases/release.json').read_text())
manifest_bytes = Path('tests/fixtures/releases/powerx-upgrade-manifest.json').read_bytes()


def fetch_asset(url):
    if url.endswith('.sha256'):
        return (hashlib.sha256(manifest_bytes).hexdigest() + '  powerx-upgrade-manifest.json\n').encode()
    return manifest_bytes


class ReleaseTests(unittest.TestCase):
    def test_latest_includes_prerelease_sorted_by_publish_not_api_order(self):
        old = dict(release, id=2, published_at='2026-10-01T00:00:00Z')
        stable = dict(release, id=3, tag_name='v1.0.2', prerelease=False, assets=[])
        newest = r.newest_release(lambda url: json.dumps([old, stable, release]).encode())
        self.assertEqual(newest['tag_name'], 'docker-dev-f99333ccd80e')
        self.assertTrue(newest['prerelease'])

    def test_future_stable_container_release_can_be_selected(self):
        stable = dict(release, id=999, tag_name='v2.0.0', prerelease=False, published_at='2027-01-01T00:00:00Z')
        newest = r.newest_release(lambda url: json.dumps([release, stable]).encode())
        self.assertEqual(newest['tag_name'], 'v2.0.0')

    def test_resolves_current_real_manifest(self):
        # Checksum fixture is regenerated; only its GitHub metadata digest is irrelevant here.
        record = copy.deepcopy(release)
        for asset in record['assets']:
            if asset['name'].endswith('.sha256'):
                asset.pop('digest', None)
        values, _ = r.resolve(record, fetch_asset)
        self.assertEqual(values['POWERX_SOURCE_SHA'], 'f99333ccd80eb3c2467fe6cc9009917340556424')
        self.assertIn('@sha256:', values['POWERX_BACKEND_IMAGE'])
        self.assertIn('@sha256:', values['POWERX_WEB_IMAGE'])

    def test_missing_latest_manifest_does_not_fallback(self):
        record = dict(release, assets=[])
        with self.assertRaisesRegex(ValueError, '不退回旧版'):
            r.resolve(record, fetch_asset)

    def test_corrupt_download_blocked(self):
        with self.assertRaisesRegex(ValueError, '校验值不一致'):
            r.resolve(release, lambda url: b'corrupt')

    def test_untrusted_asset_location_blocked(self):
        record = copy.deepcopy(release)
        record['assets'][2]['browser_download_url'] = 'https://example.com/manifest.json'
        with self.assertRaises(ValueError):
            r.resolve(record, fetch_asset)

    def test_invalid_image_pair_blocked(self):
        manifest = json.loads(manifest_bytes)
        manifest['images']['backend']['repository'] = 'example.com/unknown'
        payload = json.dumps(manifest).encode()
        record = copy.deepcopy(release)
        for asset in record['assets']:
            asset.pop('digest', None)
        def fetch_bad(url):
            return (hashlib.sha256(payload).hexdigest() + '  powerx-upgrade-manifest.json\n').encode() if url.endswith('.sha256') else payload
        with self.assertRaisesRegex(ValueError, '成对镜像'):
            r.resolve(record, fetch_bad)


if __name__ == '__main__':
    unittest.main()
