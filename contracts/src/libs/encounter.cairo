// SPDX-License-Identifier: UNLICENSED

use core::array::ArrayTrait;
use core::poseidon::poseidon_hash_span;
use scard::constants::{
    ENCOUNTER_ATTACK_BONUS, ENCOUNTER_DAMAGE_REDUCTION, ENCOUNTER_FREE_HEALTH_AMOUNT, PROB_WEREWOLF,
    THRESHOLD_BEAST_START, THRESHOLD_FREEROAM, THRESHOLD_GIFT_START, VAMPIRE_MAX_ATTACK,
    VAMPIRE_MAX_DAMAGE, VAMPIRE_MIN_ATTACK, VAMPIRE_MIN_DAMAGE, WEREWOLF_MAX_ATTACK,
    WEREWOLF_MAX_DAMAGE, WEREWOLF_MIN_ATTACK, WEREWOLF_MIN_DAMAGE,
};
use scard::models::{Beast, Direction, Encounter, Player, PlayerTrait};

/// Generate deterministic encounter hash from game state
/// Uses Poseidon hash of [game_id, x, y, direction] to create unique seed
pub fn generate_encounter_hash(game_id: u64, x: u32, y: u32, direction: Direction) -> felt252 {
    // Convert inputs to felt252
    let game_id_felt: felt252 = game_id.into();
    let x_felt: felt252 = x.into();
    let y_felt: felt252 = y.into();
    let direction_felt: felt252 = direction.into();

    // Create array with hash inputs
    let mut hash_span = ArrayTrait::new();
    hash_span.append(game_id_felt);
    hash_span.append(x_felt);
    hash_span.append(y_felt);
    hash_span.append(direction_felt);

    // Generate Poseidon hash
    poseidon_hash_span(hash_span.span()).into()
}

/// Select encounter type from hash using weighted probabilities
/// Uses hash % 100 to get roll (0-99), then maps to encounter types
pub fn select_encounter_from_hash(hash: felt252) -> Encounter {
    let hash_u256: u256 = hash.into();

    let hash_mod_u256: u256 = hash_u256 % 100_u256;

    let hash_mod_u8: u8 = hash_mod_u256.low.try_into().unwrap(); // Safe: 0-99 < 256

    let roll: u8 = hash_mod_u8;

    // Check FreeRoam (0-39)
    if roll < THRESHOLD_FREEROAM {
        return Encounter::FreeRoam;
    }

    // Check Gift encounters (40-74)
    if roll < THRESHOLD_BEAST_START {
        // Safe subtraction: roll >= THRESHOLD_GIFT_START (40) by definition
        // because we're in the gift range (roll >= 40 and roll < 75)
        assert(roll >= THRESHOLD_GIFT_START, 'gift_roll underflow');
        let gift_roll: u8 = roll - THRESHOLD_GIFT_START; // Safe: 0-34

        match gift_roll % 5 {
            0 => Encounter::FreeHealth,
            1 => Encounter::AttackPoints,
            2 => Encounter::ReducedDamage,
            3 => Encounter::FreeAttack,
            _ => Encounter::FreeFlee,
        }
    } else {
        // Check Beast encounters (75-99)
        // Safe subtraction: roll >= THRESHOLD_BEAST_START (75) by definition
        assert(roll >= THRESHOLD_BEAST_START, 'beast_roll underflow');
        let beast_roll: u8 = roll - THRESHOLD_BEAST_START; // Safe: 0-24

        // Distribute between Werewolf and Vampire
        if beast_roll < PROB_WEREWOLF {
            Encounter::Werewolf
        } else {
            Encounter::Vampire
        }
    }
}

/// Generate beast stats from hash deterministically
/// Returns (attack_points, damage_points)
pub fn generate_beast_stats(hash: felt252, beast_type: Beast) -> (u32, u32) {
    // Use different hash derivations for attack and damage to avoid correlation

    match beast_type {
        Beast::None => {
            // No beast - return zero stats
            (0, 0)
        },
        Beast::Werewolf => {
            // Werewolf: attack 20-30 (range 11), damage 10-20 (range 11)
            let attack_range: u32 = WEREWOLF_MAX_ATTACK - WEREWOLF_MIN_ATTACK + 1; // 11
            let damage_range: u32 = WEREWOLF_MAX_DAMAGE - WEREWOLF_MIN_DAMAGE + 1; // 11

            let hash_u256: u256 = hash.into();
            let attack_range_u256: u256 = attack_range.into();
            let damage_range_u256: u256 = damage_range.into();

            let hash_plus_1_u256: u256 = hash_u256 + 1;
            let hash_plus_2_u256: u256 = hash_u256 + 2;
            let attack_hash_u256: u256 = hash_plus_1_u256 % attack_range_u256; // 0-10
            let damage_hash_u256: u256 = hash_plus_2_u256 % damage_range_u256; // 0-10

            // Convert u256 low part to u32 directly (since modulo range results in 0-10, it fits)
            // Since modulo range results in 0-10, it fits in u256.low (which is u128, max 2^128-1)
            let attack_mod_u128: u128 = attack_hash_u256.low;
            let damage_mod_u128: u128 = damage_hash_u256.low;

            // Safe conversion: hash_mod is < 11, so definitely fits in u32
            let attack_mod: u32 = attack_mod_u128.try_into().unwrap(); // Safe: 0-10 < u32::MAX
            let damage_mod: u32 = damage_mod_u128.try_into().unwrap(); // Safe: 0-10 < u32::MAX

            // Calculate within range (no overflow: max 10 + 20 = 30 < u32::MAX)
            let attack_points: u32 = WEREWOLF_MIN_ATTACK + attack_mod; // 20-30
            let damage_points: u32 = WEREWOLF_MIN_DAMAGE + damage_mod; // 10-20

            (attack_points, damage_points)
        },
        Beast::Vampire => {
            // Vampire: attack 25-35 (range 11), damage 15-25 (range 11)
            let attack_range: u32 = VAMPIRE_MAX_ATTACK - VAMPIRE_MIN_ATTACK + 1; // 11
            let damage_range: u32 = VAMPIRE_MAX_DAMAGE - VAMPIRE_MIN_DAMAGE + 1; // 11

            // Convert to u256 for modulo operation (felt252 doesn't support Rem trait directly)
            let hash_u256: u256 = hash.into();
            let attack_range_u256: u256 = attack_range.into();
            let damage_range_u256: u256 = damage_range.into();

            let hash_plus_1_u256: u256 = hash_u256 + 1;
            let hash_plus_2_u256: u256 = hash_u256 + 2;
            let attack_hash_u256: u256 = hash_plus_1_u256 % attack_range_u256; // 0-10
            let damage_hash_u256: u256 = hash_plus_2_u256 % damage_range_u256; // 0-10

            // Convert u256 low part to u32 directly (since modulo range results in 0-10, it fits)
            // Since modulo range results in 0-10, it fits in u256.low (which is u128, max 2^128-1)
            let attack_mod_u128: u128 = attack_hash_u256.low;
            let damage_mod_u128: u128 = damage_hash_u256.low;

            // Safe conversion: hash_mod is < 11, so definitely fits in u32
            let attack_mod: u32 = attack_mod_u128.try_into().unwrap(); // Safe: 0-10 < u32::MAX
            let damage_mod: u32 = damage_mod_u128.try_into().unwrap(); // Safe: 0-10 < u32::MAX

            // Calculate within range (no overflow: max 10 + 25 = 35 < u32::MAX)
            let attack_points: u32 = VAMPIRE_MIN_ATTACK + attack_mod; // 25-35
            let damage_points: u32 = VAMPIRE_MIN_DAMAGE + damage_mod; // 15-25

            (attack_points, damage_points)
        },
    }
}

/// Apply encounter effects to player based on encounter type
/// This function handles all gift encounter types and updates the player model
pub fn apply_encounter_effects(ref player: Player, encounter_type: Encounter) {
    match encounter_type {
        // Gift encounters - apply immediate effects to player
        Encounter::FreeHealth => { PlayerTrait::heal(ref player, ENCOUNTER_FREE_HEALTH_AMOUNT); },
        Encounter::AttackPoints => {
            PlayerTrait::increase_attack(ref player, ENCOUNTER_ATTACK_BONUS);
        },
        Encounter::ReducedDamage => {
            PlayerTrait::reduce_damage(ref player, ENCOUNTER_DAMAGE_REDUCTION);
        },
        Encounter::FreeAttack => { PlayerTrait::grant_free_attack(ref player); },
        Encounter::FreeFlee => { PlayerTrait::grant_free_flee(ref player); },
        // Beast encounters and FreeRoam don't apply effects here
        // Beast encounters create BeastEncounter models in the contract
        // FreeRoam has no effect
        Encounter::Werewolf | Encounter::Vampire |
        Encounter::FreeRoam => { // No player effects for these encounter types
        },
    }
}
/// Calculate flee success probability deterministically
/// Returns true if flee succeeds, false otherwise
/// Uses hash of [game_id, player_attack, beast_attack] for deterministic result
// pub fn calculate_flee_success(game_id: u64, player_attack: u32, beast_attack: u32) -> bool {
//     // Convert inputs to felt252
//     let game_id_felt: felt252 = game_id.into();
//     let player_attack_felt: felt252 = player_attack.into();
//     let beast_attack_felt: felt252 = beast_attack.into();

//     // Create array with hash inputs
//     let mut hash_span = ArrayTrait::new();
//     hash_span.append(game_id_felt);
//     hash_span.append(player_attack_felt);
//     hash_span.append(beast_attack_felt);

//     // Generate Poseidon hash
//     let hash: felt252 = poseidon_hash_span(hash_span.span()).into();

//     // Convert hash to u256 for modulo operation
//     let hash_u256: u256 = hash.into();
//     let hash_mod_u256: u256 = hash_u256 % 100_u256;
//     let hash_mod_u8: u8 = hash_mod_u256.low.try_into().unwrap(); // Safe: 0-99 < 256
//     let roll: u8 = hash_mod_u8;

//     // Determine flee success rate based on player attack vs beast attack
//     let success_rate: u8 = if player_attack >= beast_attack {
//         FLEE_SUCCESS_RATE_STRONGER // 70% when player is stronger
//     } else {
//         FLEE_SUCCESS_RATE_WEAKER // 30% when player is weaker
//     };

//     // Roll against success rate (0-99, succeed if roll < success_rate)
//     roll < success_rate
// }


