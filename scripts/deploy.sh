#!/usr/bin/env bash
# Build the site and publish it to GitHub Pages (gh-pages branch).
#
# Usage: npm run deploy
#   BASE_PATH       URL path the site is served under (default: /scout-lantern)
#   REMOTE          git remote to push to (default: origin)
set -euo pipefail

cd "$(dirname "$0")/.."

BASE_PATH="${BASE_PATH:-/scout-lantern}"
REMOTE="${REMOTE:-origin}"
REMOTE_URL="$(git remote get-url "$REMOTE")"

if [ ! -f static/data/cards.json ]; then
	echo "static/data/cards.json is missing; the site would have no cards." >&2
	exit 1
fi

echo "==> Building (base path $BASE_PATH)"
[ -d node_modules ] || npm ci
BASE_PATH="$BASE_PATH" npm run build

echo "==> Publishing build/ to the gh-pages branch of $REMOTE_URL"
# Publish from a throwaway repo, so gh-pages holds exactly one commit with the
# current build and main never sees build output.
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
cp -R build/. "$tmp"
git -C "$tmp" init -q -b gh-pages
git -C "$tmp" add -A
git -C "$tmp" -c user.name="$(git config user.name)" -c user.email="$(git config user.email)" \
	commit -q -m "Deploy $(git rev-parse --short HEAD)"
git -C "$tmp" push -q -f "$REMOTE_URL" gh-pages

owner_repo="$(echo "$REMOTE_URL" | sed -E 's#^.*github\.com[:/]##; s#\.git$##')"
echo "Deployed. Open https://${owner_repo%%/*}.github.io/${owner_repo#*/}/"
