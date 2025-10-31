#!/usr/bin/env bash
set -euo pipefail

# This script builds TypeScript bindings using the Sepolia profile
# and copies the generated bindings into the scard client.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "[info] Project root: ${PROJECT_ROOT}"

pushd "${PROJECT_ROOT}" >/dev/null

echo "[info] Building contracts (profile: sepolia) and generating TypeScript bindings..."
sozo -P sepolia build --typescript

# Detect the output directory produced by sozo for TypeScript bindings.
POSSIBLE_SOURCES=(
  "${PROJECT_ROOT}/bindings/ts"
  "${PROJECT_ROOT}/bindings/typescript"
  "${PROJECT_ROOT}/target/typescript"
)

SRC_DIR=""
for candidate in "${POSSIBLE_SOURCES[@]}"; do
  if [[ -d "${candidate}" ]]; then
    SRC_DIR="${candidate}"
    break
  fi
done

if [[ -z "${SRC_DIR}" ]]; then
  echo "[error] Could not locate generated TypeScript bindings directory after build." >&2
  echo "[error] Checked: ${POSSIBLE_SOURCES[*]}" >&2
  exit 1
fi

echo "[info] Found TypeScript bindings at: ${SRC_DIR}"

DEST_DIR="/workspace/scard/client/src/typescript"
echo "[info] Preparing destination directory: ${DEST_DIR}"
mkdir -p "${DEST_DIR}"
rm -rf "${DEST_DIR:?}"/*

echo "[info] Copying bindings to client..."
cp -R "${SRC_DIR}/." "${DEST_DIR}/"

popd >/dev/null

echo "[success] TypeScript bindings copied to: ${DEST_DIR}"

