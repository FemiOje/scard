#!/bin/bash

# Load env vars for Sepolia if present
set -a
[ -f ".env.sepolia" ] && . ./.env.sepolia
set +a

# Namespace variables for easier maintenance
SCARD_NAMESPACE="scard"

#-----------------
# build
#
echo "------------------------------------------------------------------------------"
echo "Cleaning..."
sozo clean -P sepolia
echo "Building..."
sozo build -P sepolia

#-----------------
# migrate
#
echo ">>> Migrate"
sozo migrate -P sepolia \
  ${RPC_URL:+--rpc-url "$RPC_URL"} \
  ${ACCOUNT_ADDRESS:+--account-address "$ACCOUNT_ADDRESS"} \
  ${KEYSTORE:+--keystore "$KEYSTORE"}
echo "👍"

#-----------------
# get deployed addresses
#

export MANIFEST_FILE_PATH="./manifest_sepolia.json"

get_contract_address () {
  local TAG=$1
  local RESULT=$(cat $MANIFEST_FILE_PATH | jq -r ".contracts[] | select(.tag == \"$TAG\" ).address")
  if [[ -z "$RESULT" ]]; then
    >&2 echo "get_contract_address($TAG) not found! 👎"
  fi
  echo $RESULT
}

export GAME_SYSTEM_ADDRESS=$(get_contract_address "${SCARD_NAMESPACE}-game_systems")
export GAME_TOKEN_SYSTEM_ADDRESS=$(get_contract_address "${SCARD_NAMESPACE}-game_token_systems")

echo "GAME SYSTEMS ADDRESS: $GAME_SYSTEM_ADDRESS"
echo "GAME TOKEN SYSTEM ADDRESS: $GAME_TOKEN_SYSTEM_ADDRESS"