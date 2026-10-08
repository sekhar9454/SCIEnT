#!/usr/bin/env bash
# Builds deploy/scient/ – a clean copy of the committed repo for FTP/SFTP upload.
# Only tracked files from HEAD are included (no node_modules, build output or
# local .env files), minus the paths listed in .ftpignore. Commit first.
set -euo pipefail

root="$(git rev-parse --show-toplevel)"
cd "$root"

if ! git diff --quiet HEAD; then
  echo "warning: uncommitted changes are NOT included in the bundle" >&2
fi

out="$root/deploy/scient"
rm -rf "$out"
mkdir -p "$out"

git archive --format=tar HEAD | tar -x -C "$out"

# Drop excluded paths that are tracked (secrets/node_modules are never tracked)
rm -rf "$out/server/data/backup" "$out/BPCL" "$out/.gitignore" "$out/.ftpignore" \
       "$out/scripts/make-deploy-bundle.sh"
rmdir "$out/scripts" 2>/dev/null || true

# Guard: nothing secret should have slipped in
if find "$out" \( -name '.env' -o -name '.env.*' ! -name '*.example' -o -name '*serviceAccount*.json' \) | grep -q .; then
  echo "error: secret file found in bundle" >&2
  exit 1
fi
if grep -rqs -- '-----BEGIN PRIVATE KEY-----' "$out" --exclude='*.example'; then
  echo "error: private key found in bundle" >&2
  exit 1
fi

echo "Bundle ready: $out ($(du -sh "$out" | cut -f1))"
echo "Upload its contents to the server directory (e.g. /opt/scient), then follow DEPLOY.md."
