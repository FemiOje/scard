# Scar'd Game Delivery Plan

## Overview

Scar'd is a 5×5 Halloween dungeon crawler on Starknet using Dojo 1.7 and the embeddable game NFT standard. Goal: stand up end-to-end gameplay (chain logic + client) and submit before the 3-day jam deadline.

## Core Architecture

- World layout in `contracts/` with Dojo models for `Player`, `Tile`, `Encounter`, `Session`, and `Inventory` to track position, health, attacks, and rewards.
- Systems: `MovementSystem` (grid validation, turn seed), `EncounterSystem` (seed → event mapping), `CombatSystem` (turn-based exchange + flee penalties), `RewardSystem` (gift/health updates), and `EmbeddableSystem` (state packing to NFT metadata).
- Randomness via deterministic PRNG seeded from world block data + session salt to preserve reproducibility for session NFTs.
- Client in `client/` consuming Dojo RPC, providing movement, combat decisions, and session export UI.

## Implementation Steps

1. Environment Setup: update `.tool-versions`, initialize Scarb/Dojo configs, scaffold world manifest, ensure local Katana + Torii run scripts.
2. Data Modeling: define models with components (health, attack, defense, position, encounter state, inventory, session metadata) and write migrations.
3. Movement Flow: implement movement system enforcing grid bounds, energy costs, and turn seed generation, plus events for client syncing.
4. Encounter Resolution: map random seeds to outcomes (werewolf, vampire, heal, empty) storing encounter entities with stats and cooldown rules.
5. Combat Mechanics: create combat loop callable by player actions, handle attack vs flee branches, health deductions, death handling, and XP/reward hooks.
6. Rewards & Progression: implement gift pickup, health bonuses, victory detection on tile (4,4), and session completion state.
7. Embeddable Game Integration: conform to standard interfaces, package session state, mint/burn/transfer logic, and metadata serialization.
8. Testing & Verification: write unit/system tests (combat, flee, rewards), fuzz encounter seed distribution, and end-to-end script to simulate full runs.
9. Client Implementation: wire UI to Dojo systems, render grid, show encounters, drive combat choices, enable session export/import.
10. Polish & Delivery: analytics/logging, docs in `README.md`, final demo video, deploy world to testnet, prepare submission bundle.

## 3-Day Timeline

- Day 1 (Setup & Core State): Steps 1-3. Deliverable: movement with deterministic seed generation tested locally.
- Day 2 (Gameplay & NFT): Steps 4-8. Deliverable: full combat loop, encounter variety, passing test suite, embeddable standard compliance.
- Day 3 (Client & Ship): Steps 9-10. Deliverable: playable client, session NFT export demo, submission-ready documentation and build.

## Risk Mitigation & Buffers

- Allocate 3-4 hour buffer nightly for debugging random encounters and embeddable integration.
- Maintain stub implementations early to unblock client while systems evolve.
- Use scripted simulations to validate balance quickly before final polish.