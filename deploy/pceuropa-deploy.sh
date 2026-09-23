#!/usr/bin/env bash
# Installed at /usr/local/bin/pceuropa-deploy on the VPS and bound to the CI deploy
# key via authorized_keys `command=`. Reads a GHCR token on stdin and the image tag
# (a full commit SHA) from SSH_ORIGINAL_COMMAND.
set -euo pipefail

tag="${SSH_ORIGINAL_COMMAND:-}"
[[ "$tag" =~ ^[0-9a-f]{40}$ ]] || { echo "refusing tag: $tag" >&2; exit 1; }

image=ghcr.io/dzekuza/pceuropa

docker login ghcr.io -u github-actions --password-stdin
trap 'docker logout ghcr.io' EXIT

docker pull "$image:$tag"
docker tag "$image:$tag" "$image:latest"

cd /opt/pceuropa-app
docker compose up -d --force-recreate --no-build app
docker image prune -f
