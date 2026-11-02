#!/usr/bin/env bash
set -euo pipefail

image="${1:?usage: smoke-container.sh IMAGE}"
container="powerxdoc-smoke-$$"
response_dir="$(mktemp -d)"
origin="http://127.0.0.1:8080"
cleanup() {
  docker logs "$container" || true
  docker rm -f "$container" >/dev/null || true
  rm -rf "$response_dir"
}
trap cleanup EXIT

docker run -d --platform linux/amd64 --name "$container" -p 127.0.0.1:8080:80 "$image"
docker exec "$container" nginx -t
curl --retry 15 --retry-all-errors --retry-delay 1 --max-time 5 -fsS \
  "$origin/zh/" --output "$response_dir/home.html"
grep -Fq PowerX "$response_dir/home.html"
for route in zh/overview/ zh/guides/ zh/plugins/ zh/developers/ zh/guides/local-dev.html zh/guides/xdocker.html zh/guides/systemd.html zh/guides/maintenance.html; do
  curl --max-time 10 -fsS "$origin/$route" --output "$response_dir/route.html"
  grep -q '<h1' "$response_dir/route.html"
  grep -Fq "rel=\"canonical\" href=\"https://powerx-doc.artisan-cloud.com/$route\"" "$response_dir/route.html"
  grep -Fq 'name="robots" content="index, follow"' "$response_dir/route.html"
done
curl --max-time 10 -fsS "$origin/zh/guides/local-dev.html" --output "$response_dir/tutorial.html"
grep -Fq '正在从 GitHub 获取最新发布信息' "$response_dir/tutorial.html"
if grep -Fq 'git clone --depth 1 --branch' "$response_dir/tutorial.html"; then
  echo 'The tutorial must resolve the latest PowerX release in the browser.' >&2
  exit 1
fi
curl --max-time 10 -fsS "$origin/downloads/resolve-powerx-release.py" --output "$response_dir/resolver.py"
cmp scripts/tutorials/resolve-release.py "$response_dir/resolver.py"
curl --max-time 10 -fsS "$origin/sitemap.xml" --output "$response_dir/sitemap.xml"
grep -Fq 'https://powerx-doc.artisan-cloud.com/zh/guides/local-dev.html' "$response_dir/sitemap.xml"
curl --max-time 10 -fsS "$origin/robots.txt" --output "$response_dir/robots.txt"
grep -Fq 'Sitemap: https://powerx-doc.artisan-cloud.com/sitemap.xml' "$response_dir/robots.txt"
test "$(curl --max-time 10 -sS -o /dev/null -w '%{http_code}' "$origin/ci-missing-route")" = 404
test "$(curl --max-time 10 -sS -o /dev/null -w '%{http_code}' "$origin/assets/ci-missing.js")" = 404
echo 'Documentation container smoke checks passed.'
