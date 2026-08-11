#!/usr/bin/env bash
# Generates the deployer + oracle wallets and the cron secret for the
# HoodOptions mainnet pilot. Writes them to .env.deploy.local (gitignored).
# Run once:  bash scripts/gen-wallets.sh
set -euo pipefail
cd "$(dirname "$0")/.."

CAST="${CAST:-$HOME/.foundry/bin/cast}"
OUT=".env.deploy.local"

if [ -f "$OUT" ]; then
  echo "$OUT already exists — refusing to overwrite. Delete it first to regenerate."
  exit 1
fi

deployer_json=$("$CAST" wallet new --json)
oracle_json=$("$CAST" wallet new --json)

deployer_addr=$(printf '%s' "$deployer_json" | python3 -c "import json,sys;print(json.load(sys.stdin)[0]['address'])")
deployer_key=$(printf '%s' "$deployer_json" | python3 -c "import json,sys;print(json.load(sys.stdin)[0]['private_key'])")
oracle_addr=$(printf '%s' "$oracle_json" | python3 -c "import json,sys;print(json.load(sys.stdin)[0]['address'])")
oracle_key=$(printf '%s' "$oracle_json" | python3 -c "import json,sys;print(json.load(sys.stdin)[0]['private_key'])")
cron_secret=$(openssl rand -hex 24)

umask 177
{
  printf 'DEPLOYER_KEY=%s\n' "$deployer_key"
  printf 'ORACLE_PRIVATE_KEY=%s\n' "$oracle_key"
  printf 'CRON_SECRET=%s\n' "$cron_secret"
  printf 'DEPLOYER_ADDRESS=%s\n' "$deployer_addr"
  printf 'ORACLE_ADDRESS=%s\n' "$oracle_addr"
} > "$OUT"

echo "Wrote $OUT (mode 600). Keys never leave this machine."
echo
echo "Fund these two addresses with ETH on Robinhood Chain (id 4663):"
echo "  deployer: $deployer_addr   (~0.01 ETH — deploys contracts)"
echo "  oracle:   $oracle_addr     (~0.02 ETH — posts prices continuously)"
