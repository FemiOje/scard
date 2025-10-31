#!/bin/bash

# Script to grant writer permissions for Sepolia deployment
# Run this after deploying your world

# World address from manifest_sepolia.json
WORLD_ADDRESS="0x626a357a9e415e7f16f3ef0bdd406a2536323462e328d3e4604cef106434216"

echo "Granting writer permissions for SCARD on Sepolia..."
echo "World Address: $WORLD_ADDRESS"
echo ""

# Grant writer permission to actions contract for all models
# This allows the actions contract to modify Position, Moves, etc.

echo "Granting permissions for actions contract..."
sozo -P sepolia auth grant --world $WORLD_ADDRESS --wait writer \
  scard,scard-actions \
  scard-Moves,scard-actions \
  scard-DirectionsAvailable,scard-actions \
  scard-PositionCount,scard-actions 

echo ""
echo "✅ Writer permissions granted successfully!"
echo ""
echo "You can now:"
echo "  - Spawn players"
echo "  - Move players"
echo "  - Update game state"

