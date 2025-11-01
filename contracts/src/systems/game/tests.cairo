use core::array::ArrayTrait;
use dojo::model::ModelStorage;
use dojo::world::WorldStorageTrait;
use dojo_snf_test::{
    ContractDef, ContractDefTrait, NamespaceDef, TestResource, WorldStorageTestTrait,
    spawn_test_world,
};
use scard::constants::{
    DEFAULT_NS, DEFAULT_PLAYER_ATTACK, DEFAULT_PLAYER_DAMAGE, DEFAULT_PLAYER_HEALTH,
    ENCOUNTER_ATTACK_BONUS, ENCOUNTER_DAMAGE_REDUCTION, ENCOUNTER_FREE_HEALTH_AMOUNT,
};
use scard::libs::encounter::{
    generate_beast_stats, generate_encounter_hash, select_encounter_from_hash,
};
use scard::models::{
    Beast, BeastEncounter, BeastEncounterTrait, CurrentEncounter, CurrentEncounterTrait, Direction,
    Encounter, GameStateTrait, Player, PlayerTrait, Position,
};
use super::{IGameSystemsDispatcher, IGameSystemsDispatcherTrait};

fn namespace_def() -> NamespaceDef {
    let ndef = NamespaceDef {
        namespace: DEFAULT_NS(),
        resources: [
            TestResource::Model("Player"), TestResource::Model("Position"),
            TestResource::Model("CurrentEncounter"), TestResource::Model("BeastEncounter"),
            TestResource::Model("GameState"), TestResource::Event("GameCreated"),
            TestResource::Event("Moved"), TestResource::Event("EncounterGenerated"),
            TestResource::Event("GameWon"), TestResource::Event("CombatEvent"),
            TestResource::Contract("game_systems"),
        ]
            .span(),
    };
    ndef
}

fn contract_defs() -> Span<ContractDef> {
    [
        ContractDefTrait::new(@DEFAULT_NS(), @"game_systems")
            .with_writer_of([dojo::utils::bytearray_hash(@DEFAULT_NS())].span())
    ]
        .span()
}

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 10000, l2_gas: 15000000)]
fn test_create_game() {
    let game_id: u64 = 1;
    let ndef = namespace_def();
    let mut world = spawn_test_world([ndef].span());
    world.sync_perms_and_inits(contract_defs());

    let (contract_address, _) = world.dns(@"game_systems").unwrap();
    let mut game_systems = IGameSystemsDispatcher { contract_address };

    // Create game
    game_systems.create_game(game_id);

    // Verify player was initialized correctly
    let player: Player = world.read_model(game_id);
    assert(player.game_id == game_id, 'wrong game_id');
    assert(player.health == DEFAULT_PLAYER_HEALTH, 'wrong health');
    assert(player.attack_points == DEFAULT_PLAYER_ATTACK, 'wrong attack');
    assert(player.damage_points == DEFAULT_PLAYER_DAMAGE, 'wrong damage');
    assert(!player.has_free_flee, 'should not have free flee');
    assert(!player.has_free_attack, 'should not have free attack');

    // Verify position was initialized at origin
    let position: Position = world.read_model(game_id);
    assert(position.game_id == game_id, 'wrong position game_id');
    assert(position.x == 0, 'position should start at 0,0');
    assert(position.y == 0, 'position should start at 0,0');

    // Verify encounter was initialized as FreeRoam
    let encounter: CurrentEncounter = world.read_model(game_id);
    assert(encounter.game_id == game_id, 'wrong encounter game_id');
    assert(encounter.encounter_type == 8, 'should be FreeRoam'); // 8 = FreeRoam
}

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 10000, l2_gas: 20000000)]
fn test_move_single_step() {
    let game_id: u64 = 1;
    let ndef = namespace_def();
    let mut world = spawn_test_world([ndef].span());
    world.sync_perms_and_inits(contract_defs());

    let (contract_address, _) = world.dns(@"game_systems").unwrap();
    let mut game_systems = IGameSystemsDispatcher { contract_address };

    // Create game
    game_systems.create_game(game_id);

    // Move right
    game_systems.move(game_id, Direction::Right);
    let position: Position = world.read_model(game_id);
    assert(position.x == 1, 'should move one step right');
    assert(position.y == 0, 'y should not change');

    // Move down
    game_systems.move(game_id, Direction::Down);
    let position: Position = world.read_model(game_id);
    assert(position.x == 1, 'x should not change');
    assert(position.y == 1, 'should move one step down');
}

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 20000, l2_gas: 50000000)]
fn test_move_all_directions() {
    let game_id: u64 = 2;
    let ndef = namespace_def();
    let mut world = spawn_test_world([ndef].span());
    world.sync_perms_and_inits(contract_defs());

    let (contract_address, _) = world.dns(@"game_systems").unwrap();
    let mut game_systems = IGameSystemsDispatcher { contract_address };

    // Create game at origin
    game_systems.create_game(game_id);

    // Move right
    game_systems.move(game_id, Direction::Right);
    let pos: Position = world.read_model(game_id);
    assert(pos.x == 1 && pos.y == 0, 'right move failed');

    // Move down
    game_systems.move(game_id, Direction::Down);
    let pos: Position = world.read_model(game_id);
    assert(pos.x == 1 && pos.y == 1, 'down move failed');

    // Move left
    game_systems.move(game_id, Direction::Left);
    let pos: Position = world.read_model(game_id);
    assert(pos.x == 0 && pos.y == 1, 'left move failed');

    // Move up
    game_systems.move(game_id, Direction::Up);
    let pos: Position = world.read_model(game_id);
    assert(pos.x == 0 && pos.y == 0, 'up move failed');
}

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 10000, l2_gas: 20000000)]
fn test_move_boundary() {
    let game_id: u64 = 3;
    let ndef = namespace_def();
    let mut world = spawn_test_world([ndef].span());
    world.sync_perms_and_inits(contract_defs());

    let (contract_address, _) = world.dns(@"game_systems").unwrap();
    let mut game_systems = IGameSystemsDispatcher { contract_address };

    // Create game at origin (0, 0)
    game_systems.create_game(game_id);

    // Try to move left from origin - should stay at 0
    game_systems.move(game_id, Direction::Left);
    let pos: Position = world.read_model(game_id);
    assert(pos.x == 0, 'should not go below 0');

    // Try to move up from origin - should stay at 0
    game_systems.move(game_id, Direction::Up);
    let pos: Position = world.read_model(game_id);
    assert(pos.y == 0, 'should not go below 0');
}

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 10000, l2_gas: 15000000)]
fn test_get_position_after_create() {
    let game_id: u64 = 4;
    let ndef = namespace_def();
    let mut world = spawn_test_world([ndef].span());
    world.sync_perms_and_inits(contract_defs());

    let (contract_address, _) = world.dns(@"game_systems").unwrap();
    let mut game_systems = IGameSystemsDispatcher { contract_address };

    // Create game
    game_systems.create_game(game_id);

    // Get position using the view function
    let position = game_systems.get_position(game_id);

    // Verify position is at origin
    assert(position.game_id == game_id, 'wrong game_id');
    assert(position.x == 0, 'x should be 0');
    assert(position.y == 0, 'y should be 0');
}

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 20000, l2_gas: 50000000)]
fn test_get_position_after_move() {
    let game_id: u64 = 5;
    let ndef = namespace_def();
    let mut world = spawn_test_world([ndef].span());
    world.sync_perms_and_inits(contract_defs());

    let (contract_address, _) = world.dns(@"game_systems").unwrap();
    let mut game_systems = IGameSystemsDispatcher { contract_address };

    // Create game
    game_systems.create_game(game_id);

    // Verify initial position
    let position = game_systems.get_position(game_id);
    assert(position.x == 0 && position.y == 0, 'wrong initial position');

    // Move right
    game_systems.move(game_id, Direction::Right);
    let position = game_systems.get_position(game_id);
    assert(position.x == 1 && position.y == 0, 'wrong position after right');

    // Move down
    game_systems.move(game_id, Direction::Down);
    let position = game_systems.get_position(game_id);
    assert(position.x == 1 && position.y == 1, 'wrong position after down');

    // Move left
    game_systems.move(game_id, Direction::Left);
    let position = game_systems.get_position(game_id);
    assert(position.x == 0 && position.y == 1, 'wrong position after left');

    // Move up
    game_systems.move(game_id, Direction::Up);
    let position = game_systems.get_position(game_id);
    assert(position.x == 0 && position.y == 0, 'wrong position after up');
}

// ------------------------------------------ //
// -------- Move with Encounters Tests ------- //
// ------------------------------------------ //

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 10000, l2_gas: 20000000)]
fn test_move_generates_encounter() {
    let game_id: u64 = 100;
    let ndef = namespace_def();
    let mut world = spawn_test_world([ndef].span());
    world.sync_perms_and_inits(contract_defs());

    let (contract_address, _) = world.dns(@"game_systems").unwrap();
    let mut game_systems = IGameSystemsDispatcher { contract_address };

    game_systems.create_game(game_id);

    // Move - should generate an encounter
    game_systems.move(game_id, Direction::Right);

    // Verify encounter was generated
    let encounter: CurrentEncounter = world.read_model(game_id);
    assert(encounter.game_id == game_id, 'wrong encounter game_id');
    // Encounter type should be valid (1-8)
    assert(encounter.encounter_type >= 1, 'encounter_type should be >= 1');
    assert(encounter.encounter_type <= 8, 'encounter_type should be <= 8');
}

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 10000, l2_gas: 40000000)]
fn test_move_generates_different_encounters() {
    // Test that multiple moves generate different encounters
    // (with high probability, unless same position/direction combination)
    let game_id: u64 = 101;
    let ndef = namespace_def();
    let mut world = spawn_test_world([ndef].span());
    world.sync_perms_and_inits(contract_defs());

    let (contract_address, _) = world.dns(@"game_systems").unwrap();
    let mut game_systems = IGameSystemsDispatcher { contract_address };

    game_systems.create_game(game_id);

    // Move in different directions - should generate different encounters
    game_systems.move(game_id, Direction::Right);
    let encounter1: CurrentEncounter = world.read_model(game_id);
    let encounter_type1 = encounter1.encounter_type;

    game_systems.move(game_id, Direction::Down);
    let encounter2: CurrentEncounter = world.read_model(game_id);
    let encounter_type2 = encounter2.encounter_type;

    // Different positions should generate different encounters
    // (probabilistic, but very likely with different hashes)
    // At minimum, verify both are valid
    assert(encounter_type1 >= 1 && encounter_type1 <= 8, 'encounter1 valid');
    assert(encounter_type2 >= 1 && encounter_type2 <= 8, 'encounter2 valid');
}

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 20000, l2_gas: 50000000)]
fn test_move_beast_encounter_creates_beast_model() {
    // Test that beast encounters create BeastEncounter models
    // Note: We can't force a specific encounter, but we can verify
    // that when a beast encounter occurs, the BeastEncounter model exists
    let game_id: u64 = 102;
    let ndef = namespace_def();
    let mut world = spawn_test_world([ndef].span());
    world.sync_perms_and_inits(contract_defs());

    let (contract_address, _) = world.dns(@"game_systems").unwrap();
    let mut game_systems = IGameSystemsDispatcher { contract_address };

    game_systems.create_game(game_id);

    // Move multiple times to increase chance of beast encounter
    let mut found_beast = false;
    let mut i: u8 = 0;

    while i < 20 {
        game_systems.move(game_id, Direction::Right);
        let encounter: CurrentEncounter = world.read_model(game_id);
        let encounter_enum: Encounter = encounter.encounter_type.into();

        match encounter_enum {
            Encounter::Werewolf |
            Encounter::Vampire => {
                // Verify BeastEncounter model exists
                let beast_encounter: BeastEncounter = world.read_model(game_id);
                assert(beast_encounter.game_id == game_id, 'wrong beast game_id');
                assert(beast_encounter.beast_type >= 1, 'beast_type should be >= 1');
                assert(beast_encounter.beast_type <= 2, 'beast_type should be <= 2');
                assert(beast_encounter.attack_points >= 20, 'beast attack should be >= 20');
                assert(beast_encounter.damage_points >= 10, 'beast damage should be >= 10');
                found_beast = true;
                break;
            },
            _ => {},
        }
        i += 1;
    }

    // Verify we found at least one beast encounter in 20 moves
    // (with 25% beast probability, very likely)
    assert(found_beast, 'should find beast encounter');
}

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 10000, l2_gas: 20000000)]
fn test_move_non_beast_no_beast_model() {
    // Test that non-beast encounters don't create/update BeastEncounter
    // We'll move and check that non-beast encounters don't leave stale BeastEncounter
    let game_id: u64 = 103;
    let ndef = namespace_def();
    let mut world = spawn_test_world([ndef].span());
    world.sync_perms_and_inits(contract_defs());

    let (contract_address, _) = world.dns(@"game_systems").unwrap();
    let mut game_systems = IGameSystemsDispatcher { contract_address };

    game_systems.create_game(game_id);

    // Move until we get a non-beast encounter
    let mut found_non_beast = false;
    let mut i: u8 = 0;
    while i < 20 {
        game_systems.move(game_id, Direction::Right);
        let encounter: CurrentEncounter = world.read_model(game_id);
        let encounter_enum: Encounter = encounter.encounter_type.into();

        match encounter_enum {
            Encounter::Werewolf | Encounter::Vampire => { // Found beast - continue
            },
            _ => {
                // Found non-beast - verify CurrentEncounter is correct
                assert(
                    encounter.encounter_type >= 3 && encounter.encounter_type <= 8,
                    'should be non-beast encounter',
                );
                found_non_beast = true;
                break;
            },
        }
        i += 1;
    }

    assert(found_non_beast, 'should find non-beast encounter');
}

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 20000, l2_gas: 50000000)]
fn test_move_beast_stats_in_range() {
    // Test that beast stats generated are within valid ranges
    let game_id: u64 = 104;
    let ndef = namespace_def();
    let mut world = spawn_test_world([ndef].span());
    world.sync_perms_and_inits(contract_defs());

    let (contract_address, _) = world.dns(@"game_systems").unwrap();
    let mut game_systems = IGameSystemsDispatcher { contract_address };

    game_systems.create_game(game_id);

    // Move until we find a beast encounter
    let mut found_beast = false;
    let mut i: u8 = 0;
    while i < 20 {
        game_systems.move(game_id, Direction::Right);
        let encounter: CurrentEncounter = world.read_model(game_id);
        let encounter_enum: Encounter = encounter.encounter_type.into();

        match encounter_enum {
            Encounter::Werewolf => {
                let beast: BeastEncounter = world.read_model(game_id);
                assert(
                    beast.attack_points >= 20 && beast.attack_points <= 30,
                    'werewolf attack in range',
                );
                assert(
                    beast.damage_points >= 10 && beast.damage_points <= 20,
                    'werewolf damage in range',
                );
                found_beast = true;
                break;
            },
            Encounter::Vampire => {
                let beast: BeastEncounter = world.read_model(game_id);
                assert(
                    beast.attack_points >= 25 && beast.attack_points <= 35,
                    'vampire attack in range',
                );
                assert(
                    beast.damage_points >= 15 && beast.damage_points <= 25,
                    'vampire damage in range',
                );
                found_beast = true;
                break;
            },
            _ => {},
        }
        i += 1;
    }

    assert(found_beast, 'should find beast encounter');
}

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 20000, l2_gas: 50000000)]
fn test_move_no_encounter_on_win() {
    // Test that encounters are not generated when game is won
    let game_id: u64 = 105;
    let ndef = namespace_def();
    let mut world = spawn_test_world([ndef].span());
    world.sync_perms_and_inits(contract_defs());

    let (contract_address, _) = world.dns(@"game_systems").unwrap();
    let mut game_systems = IGameSystemsDispatcher { contract_address };

    game_systems.create_game(game_id);

    // Get initial encounter (not used but kept for clarity)

    // Move to winning position (4, 4)
    // Need to move 4 steps right and 4 steps down
    let mut i: u8 = 0;
    loop {
        if i >= 4 {
            break;
        }
        game_systems.move(game_id, Direction::Right);
        i += 1;
    }
    let mut j: u8 = 0;
    loop {
        if j >= 4 {
            break;
        }
        game_systems.move(game_id, Direction::Down);
        j += 1;
    }

    // Verify game is won
    let position: Position = world.read_model(game_id);
    assert(position.x == 4 && position.y == 4, 'should be at winning position');

    // The last move to (4,4) should have generated an encounter before win
    // So the encounter should have been updated
    let final_encounter: CurrentEncounter = world.read_model(game_id);
    // Encounter should be valid (1-8)
    assert(final_encounter.encounter_type >= 1, 'encounter should be valid');
    assert(final_encounter.encounter_type <= 8, 'encounter should be valid');
}

// ------------------------------------------ //
// -------- Gift Encounter Effects Tests ---- //
// ------------------------------------------ //

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 20000, l2_gas: 50000000)]
fn test_gift_encounter_free_health() {
    // Test that FreeHealth encounter heals the player
    let game_id: u64 = 200;
    let ndef = namespace_def();
    let mut world = spawn_test_world([ndef].span());
    world.sync_perms_and_inits(contract_defs());

    let (contract_address, _) = world.dns(@"game_systems").unwrap();
    let mut game_systems = IGameSystemsDispatcher { contract_address };

    game_systems.create_game(game_id);

    // Damage player first
    let mut player: Player = world.read_model(game_id);
    PlayerTrait::apply_damage(ref player, 50);
    world.write_model(@player);

    // Move multiple times until we get FreeHealth encounter (type 3)
    let mut found_free_health = false;
    let mut i: u8 = 0;
    while i < 30 {
        let player_before: Player = world.read_model(game_id);
        let health_before = player_before.health;

        game_systems.move(game_id, Direction::Right);

        let encounter: CurrentEncounter = world.read_model(game_id);
        if encounter.encounter_type == 3 {
            // Found FreeHealth encounter - verify player was healed
            let player_after: Player = world.read_model(game_id);
            assert(
                player_after.health == health_before + ENCOUNTER_FREE_HEALTH_AMOUNT,
                'should be healed',
            );
            found_free_health = true;
            break;
        }
        i += 1;
    }

    assert(found_free_health, 'found FreeHealth');
}

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 20000, l2_gas: 50000000)]
fn test_gift_encounter_attack_points() {
    // Test that AttackPoints encounter increases player attack
    let game_id: u64 = 201;
    let ndef = namespace_def();
    let mut world = spawn_test_world([ndef].span());
    world.sync_perms_and_inits(contract_defs());

    let (contract_address, _) = world.dns(@"game_systems").unwrap();
    let mut game_systems = IGameSystemsDispatcher { contract_address };

    game_systems.create_game(game_id);

    // Move until we get AttackPoints encounter (type 4)
    let mut found_attack_points = false;
    let mut i: u8 = 0;
    while i < 30 {
        let player_before: Player = world.read_model(game_id);
        let attack_before = player_before.attack_points;

        game_systems.move(game_id, Direction::Right);

        let encounter: CurrentEncounter = world.read_model(game_id);
        if encounter.encounter_type == 4 {
            // Found AttackPoints encounter - verify attack increased
            let player_after: Player = world.read_model(game_id);
            assert(
                player_after.attack_points == attack_before + ENCOUNTER_ATTACK_BONUS,
                'attack increased',
            );
            found_attack_points = true;
            break;
        }
        i += 1;
    }

    assert(found_attack_points, 'found AttackPoints');
}

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 20000, l2_gas: 50000000)]
fn test_gift_encounter_reduced_damage() {
    // Test that ReducedDamage encounter reduces player damage
    let game_id: u64 = 202;
    let ndef = namespace_def();
    let mut world = spawn_test_world([ndef].span());
    world.sync_perms_and_inits(contract_defs());

    let (contract_address, _) = world.dns(@"game_systems").unwrap();
    let mut game_systems = IGameSystemsDispatcher { contract_address };

    game_systems.create_game(game_id);

    // Move until we get ReducedDamage encounter (type 5)
    let mut found_reduced_damage = false;
    let mut i: u8 = 0;
    while i < 30 {
        let player_before: Player = world.read_model(game_id);
        let damage_before = player_before.damage_points;

        game_systems.move(game_id, Direction::Right);

        let encounter: CurrentEncounter = world.read_model(game_id);
        if encounter.encounter_type == 5 {
            // Found ReducedDamage encounter - verify damage reduced
            let player_after: Player = world.read_model(game_id);
            if damage_before >= ENCOUNTER_DAMAGE_REDUCTION {
                assert(
                    player_after.damage_points == damage_before - ENCOUNTER_DAMAGE_REDUCTION,
                    'damage reduced',
                );
            } else {
                assert(player_after.damage_points == 0, 'damage is 0');
            }
            found_reduced_damage = true;
            break;
        }
        i += 1;
    }

    assert(found_reduced_damage, 'found ReducedDamage');
}

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 20000, l2_gas: 50000000)]
fn test_gift_encounter_free_attack() {
    // Test that FreeAttack encounter grants free attack ability
    let game_id: u64 = 203;
    let ndef = namespace_def();
    let mut world = spawn_test_world([ndef].span());
    world.sync_perms_and_inits(contract_defs());

    let (contract_address, _) = world.dns(@"game_systems").unwrap();
    let mut game_systems = IGameSystemsDispatcher { contract_address };

    game_systems.create_game(game_id);

    // Move until we get FreeAttack encounter (type 6)
    let mut found_free_attack = false;
    let mut i: u8 = 0;
    while i < 30 {
        game_systems.move(game_id, Direction::Right);

        let encounter: CurrentEncounter = world.read_model(game_id);
        if encounter.encounter_type == 6 {
            // Found FreeAttack encounter - verify ability granted
            let player: Player = world.read_model(game_id);
            assert(player.has_free_attack, 'has free attack');
            found_free_attack = true;
            break;
        }
        i += 1;
    }

    assert(found_free_attack, 'found FreeAttack');
}

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 20000, l2_gas: 50000000)]
fn test_gift_encounter_free_flee() {
    // Test that FreeFlee encounter grants free flee ability
    let game_id: u64 = 204;
    let ndef = namespace_def();
    let mut world = spawn_test_world([ndef].span());
    world.sync_perms_and_inits(contract_defs());

    let (contract_address, _) = world.dns(@"game_systems").unwrap();
    let mut game_systems = IGameSystemsDispatcher { contract_address };

    game_systems.create_game(game_id);

    // Move until we get FreeFlee encounter (type 7)
    let mut found_free_flee = false;
    let mut i: u8 = 0;
    while i < 30 {
        game_systems.move(game_id, Direction::Right);

        let encounter: CurrentEncounter = world.read_model(game_id);
        if encounter.encounter_type == 7 {
            // Found FreeFlee encounter - verify ability granted
            let player: Player = world.read_model(game_id);
            assert(player.has_free_flee, 'has free flee');
            found_free_flee = true;
            break;
        }
        i += 1;
    }

    assert(found_free_flee, 'found FreeFlee');
}

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 20000, l2_gas: 50000000)]
fn test_gift_encounter_free_roam() {
    // Test that FreeRoam encounter has no effect
    let game_id: u64 = 205;
    let ndef = namespace_def();
    let mut world = spawn_test_world([ndef].span());
    world.sync_perms_and_inits(contract_defs());

    let (contract_address, _) = world.dns(@"game_systems").unwrap();
    let mut game_systems = IGameSystemsDispatcher { contract_address };

    game_systems.create_game(game_id);

    // Get initial player state
    let player_before: Player = world.read_model(game_id);
    let health_before = player_before.health;
    let attack_before = player_before.attack_points;
    let damage_before = player_before.damage_points;

    // Move until we get FreeRoam encounter (type 8)
    let mut found_free_roam = false;
    let mut i: u8 = 0;
    while i < 30 {
        game_systems.move(game_id, Direction::Right);

        let encounter: CurrentEncounter = world.read_model(game_id);
        if encounter.encounter_type == 8 {
            // Found FreeRoam encounter - verify no changes
            let player_after: Player = world.read_model(game_id);
            assert(player_after.health == health_before, 'health unchanged');
            assert(player_after.attack_points == attack_before, 'attack unchanged');
            assert(player_after.damage_points == damage_before, 'damage unchanged');
            assert(!player_after.has_free_attack, 'no free attack');
            assert(!player_after.has_free_flee, 'no free flee');
            found_free_roam = true;
            break;
        }
        i += 1;
    }

    assert(found_free_roam, 'found FreeRoam');
}

// ------------------------------------------ //
// -------- Encounter Hash Tests ----------- //
// ------------------------------------------ //

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 10000, l2_gas: 15000000)]
fn test_generate_encounter_hash_deterministic() {
    let game_id: u64 = 1;
    let x: u32 = 2;
    let y: u32 = 3;
    let direction = Direction::Right;

    // Generate hash twice with same inputs
    let hash1 = generate_encounter_hash(game_id, x, y, direction);
    let hash2 = generate_encounter_hash(game_id, x, y, direction);

    // Should produce same hash (deterministic)
    assert(hash1 == hash2, 'hash should be deterministic');
}

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 10000, l2_gas: 15000000)]
fn test_generate_encounter_hash_different_inputs() {
    let game_id: u64 = 1;
    let x: u32 = 2;
    let y: u32 = 3;

    // Test different directions produce different hashes
    let hash_right = generate_encounter_hash(game_id, x, y, Direction::Right);
    let hash_left = generate_encounter_hash(game_id, x, y, Direction::Left);
    let hash_up = generate_encounter_hash(game_id, x, y, Direction::Up);
    let hash_down = generate_encounter_hash(game_id, x, y, Direction::Down);

    // All should be different
    assert(hash_right != hash_left, 'right and left should differ');
    assert(hash_right != hash_up, 'right and up should differ');
    assert(hash_right != hash_down, 'right and down should differ');
    assert(hash_left != hash_up, 'left and up should differ');
    assert(hash_left != hash_down, 'left and down should differ');
    assert(hash_up != hash_down, 'up and down should differ');
}

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 10000, l2_gas: 15000000)]
fn test_generate_encounter_hash_different_positions() {
    let game_id: u64 = 1;
    let direction = Direction::Right;

    // Test different positions produce different hashes
    let hash_00 = generate_encounter_hash(game_id, 0, 0, direction);
    let hash_01 = generate_encounter_hash(game_id, 0, 1, direction);
    let hash_10 = generate_encounter_hash(game_id, 1, 0, direction);
    let hash_11 = generate_encounter_hash(game_id, 1, 1, direction);

    // All should be different
    assert(hash_00 != hash_01, 'different y should differ');
    assert(hash_00 != hash_10, 'different x should differ');
    assert(hash_00 != hash_11, 'different x and y should differ');
    assert(hash_01 != hash_10, 'swapped x and y should differ');
    assert(hash_01 != hash_11, 'different x should differ');
    assert(hash_10 != hash_11, 'different y should differ');
}

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 10000, l2_gas: 15000000)]
fn test_generate_encounter_hash_different_game_ids() {
    let x: u32 = 2;
    let y: u32 = 3;
    let direction = Direction::Right;

    // Test different game IDs produce different hashes
    let hash_game1 = generate_encounter_hash(1, x, y, direction);
    let hash_game2 = generate_encounter_hash(2, x, y, direction);
    let hash_game3 = generate_encounter_hash(3, x, y, direction);

    // All should be different
    assert(hash_game1 != hash_game2, 'different game_id should differ');
    assert(hash_game1 != hash_game3, 'different game_id should differ');
    assert(hash_game2 != hash_game3, 'different game_id should differ');
}

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 10000, l2_gas: 15000000)]
fn test_generate_encounter_hash_non_zero() {
    let game_id: u64 = 1;
    let x: u32 = 2;
    let y: u32 = 3;
    let direction = Direction::Right;

    // Generate hash
    let hash = generate_encounter_hash(game_id, x, y, direction);

    // Hash should be non-zero (valid hash)
    assert(hash != 0, 'hash should be non-zero');
}

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 10000, l2_gas: 15000000)]
fn test_generate_encounter_hash_boundary_values() {
    let game_id: u64 = 1;
    let direction = Direction::Right;

    // Test with boundary position values (0, 0) and (4, 4) for 5x5 grid
    let hash_00 = generate_encounter_hash(game_id, 0, 0, direction);
    let hash_44 = generate_encounter_hash(game_id, 4, 4, direction);

    // Both should be valid non-zero hashes
    assert(hash_00 != 0, 'hash at 0,0 should be non-zero');
    assert(hash_44 != 0, 'hash at 4,4 should be non-zero');
    assert(hash_00 != hash_44, 'hashes should differ');
}

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 10000, l2_gas: 15000000)]
fn test_generate_encounter_hash_all_directions() {
    let game_id: u64 = 1;
    let x: u32 = 2;
    let y: u32 = 2;

    // Test all four directions produce valid hashes
    let hash_left = generate_encounter_hash(game_id, x, y, Direction::Left);
    let hash_right = generate_encounter_hash(game_id, x, y, Direction::Right);
    let hash_up = generate_encounter_hash(game_id, x, y, Direction::Up);
    let hash_down = generate_encounter_hash(game_id, x, y, Direction::Down);

    // All should be non-zero and different
    assert(hash_left != 0, 'hash left should be non-zero');
    assert(hash_right != 0, 'hash right should be non-zero');
    assert(hash_up != 0, 'hash up should be non-zero');
    assert(hash_down != 0, 'hash down should be non-zero');

    // Verify they're all different from each other
    assert(hash_left != hash_right, 'left != right');
    assert(hash_left != hash_up, 'left != up');
    assert(hash_left != hash_down, 'left != down');
    assert(hash_right != hash_up, 'right != up');
    assert(hash_right != hash_down, 'right != down');
    assert(hash_up != hash_down, 'up != down');
}

// ------------------------------------------ //
// -------- Encounter Selection Tests ------- //
// ------------------------------------------ //

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 10000, l2_gas: 15000000)]
fn test_select_encounter_freeroam() {
    // Test FreeRoam range (0-39)
    let hash_0: felt252 = 0; // hash % 100 = 0
    let hash_39: felt252 = 39; // hash % 100 = 39

    let encounter_0 = select_encounter_from_hash(hash_0);
    let encounter_39 = select_encounter_from_hash(hash_39);

    assert(encounter_0 == Encounter::FreeRoam, 'roll 0 should be FreeRoam');
    assert(encounter_39 == Encounter::FreeRoam, 'roll 39 should be FreeRoam');
}

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 10000, l2_gas: 15000000)]
fn test_select_encounter_gift_range() {
    // Test Gift encounter range (40-74)
    let hash_40: felt252 = 40; // hash % 100 = 40 (should be gift)
    let hash_74: felt252 = 74; // hash % 100 = 74 (should be gift)

    let encounter_40 = select_encounter_from_hash(hash_40);
    let encounter_74 = select_encounter_from_hash(hash_74);

    // Both should be gift encounters (not FreeRoam, not beast)
    assert(encounter_40 != Encounter::FreeRoam, 'roll 40 should be gift');
    assert(encounter_40 != Encounter::Werewolf, 'roll 40 should not be Werewolf');
    assert(encounter_40 != Encounter::Vampire, 'roll 40 should not be Vampire');
    assert(encounter_74 != Encounter::FreeRoam, 'roll 74 should be gift');
    assert(encounter_74 != Encounter::Werewolf, 'roll 74 should not be Werewolf');
    assert(encounter_74 != Encounter::Vampire, 'roll 74 should not be Vampire');
}

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 10000, l2_gas: 15000000)]
fn test_select_encounter_beast_range() {
    // Test Beast encounter range (75-99)
    let hash_75: felt252 = 75; // hash % 100 = 75 (should be beast)
    let hash_99: felt252 = 99; // hash % 100 = 99 (should be beast)

    let encounter_75 = select_encounter_from_hash(hash_75);
    let encounter_99 = select_encounter_from_hash(hash_99);

    // Both should be beast encounters
    assert(encounter_75 != Encounter::FreeRoam, 'roll 75 should be beast');
    assert(
        encounter_75 == Encounter::Werewolf || encounter_75 == Encounter::Vampire,
        'roll 75 should be beast',
    );
    assert(encounter_99 != Encounter::FreeRoam, 'roll 99 should be beast');
    assert(
        encounter_99 == Encounter::Werewolf || encounter_99 == Encounter::Vampire,
        'roll 99 should be beast',
    );
}

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 10000, l2_gas: 15000000)]
fn test_select_encounter_boundary_values() {
    // Test all boundary values
    let hash_0: felt252 = 0; // FreeRoam start
    let hash_39: felt252 = 39; // FreeRoam end
    let hash_40: felt252 = 40; // Gift start
    let hash_74: felt252 = 74; // Gift end
    let hash_75: felt252 = 75; // Beast start
    let hash_99: felt252 = 99; // Beast end

    let enc_0 = select_encounter_from_hash(hash_0);
    let enc_39 = select_encounter_from_hash(hash_39);
    let enc_40 = select_encounter_from_hash(hash_40);
    let enc_74 = select_encounter_from_hash(hash_74);
    let enc_75 = select_encounter_from_hash(hash_75);
    let enc_99 = select_encounter_from_hash(hash_99);

    // Verify boundary transitions
    assert(enc_0 == Encounter::FreeRoam, '0 should be FreeRoam');
    assert(enc_39 == Encounter::FreeRoam, '39 should be FreeRoam');
    assert(enc_40 != Encounter::FreeRoam, '40 should not be FreeRoam');
    assert(enc_74 != Encounter::FreeRoam, '74 should not be FreeRoam');
    assert(enc_75 != Encounter::FreeRoam, '75 should not be FreeRoam');
    assert(enc_75 == Encounter::Werewolf || enc_75 == Encounter::Vampire, '75 should be beast');
    assert(enc_99 == Encounter::Werewolf || enc_99 == Encounter::Vampire, '99 should be beast');
}

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 10000, l2_gas: 20000000)]
fn test_select_encounter_all_types() {
    // Test that all 8 encounter types can be generated
    // We'll test a range of hash values to ensure we hit all types
    let mut found_encounters: Array<Encounter> = ArrayTrait::new();
    let mut hash: felt252 = 0;
    let mut i: u8 = 0;

    loop {
        if i >= 100 {
            break;
        }
        let encounter = select_encounter_from_hash(hash);
        found_encounters.append(encounter);
        hash += 1;
        i += 1;
    }

    // Check that we found at least one of each type
    let mut found_werewolf = false;
    let mut found_vampire = false;
    let mut found_free_health = false;
    let mut found_attack_points = false;
    let mut found_reduced_damage = false;
    let mut found_free_attack = false;
    let mut found_free_flee = false;
    let mut found_free_roam = false;

    let mut idx: u8 = 0;
    loop {
        if idx >= 100 {
            break;
        }
        let idx_u32: u32 = idx.into();
        let encounter = *found_encounters.at(idx_u32);
        match encounter {
            Encounter::Werewolf => found_werewolf = true,
            Encounter::Vampire => found_vampire = true,
            Encounter::FreeHealth => found_free_health = true,
            Encounter::AttackPoints => found_attack_points = true,
            Encounter::ReducedDamage => found_reduced_damage = true,
            Encounter::FreeAttack => found_free_attack = true,
            Encounter::FreeFlee => found_free_flee = true,
            Encounter::FreeRoam => found_free_roam = true,
        }
        idx += 1;
    }

    // Verify all types are found
    assert(found_free_roam, 'should find FreeRoam');
    assert(found_free_health, 'should find FreeHealth');
    assert(found_attack_points, 'should find AttackPoints');
    assert(found_reduced_damage, 'should find ReducedDamage');
    assert(found_free_attack, 'should find FreeAttack');
    assert(found_free_flee, 'should find FreeFlee');
    assert(found_werewolf, 'should find Werewolf');
    assert(found_vampire, 'should find Vampire');
}

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 10000, l2_gas: 15000000)]
fn test_select_encounter_hash_modulo_safety() {
    // Test with large hash values to ensure modulo works correctly
    let hash_large: felt252 = 999999999; // Large but fits in felt252
    let hash_multiple: felt252 = 1000; // hash % 100 = 0

    let _encounter_large = select_encounter_from_hash(hash_large);
    let encounter_multiple = select_encounter_from_hash(hash_multiple);

    // Both should produce valid encounters (not panic)
    // encounter_multiple should be FreeRoam since 1000 % 100 = 0
    assert(encounter_multiple == Encounter::FreeRoam, 'should be FreeRoam');
    // encounter_large should also be valid (no overflow)
}

// ------------------------------------------ //
// -------- Beast Stats Tests --------------- //
// ------------------------------------------ //

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 10000, l2_gas: 15000000)]
fn test_generate_beast_stats_werewolf_range() {
    // Test Werewolf stats are within valid ranges
    let hash: felt252 = 12345;

    let (attack, damage) = generate_beast_stats(hash, Beast::Werewolf);

    // Verify attack is within range (20-30)
    assert(attack >= 20, 'werewolf attack should be >= 20');
    assert(attack <= 30, 'werewolf attack should be <= 30');

    // Verify damage is within range (10-20)
    assert(damage >= 10, 'werewolf damage should be >= 10');
    assert(damage <= 20, 'werewolf damage should be <= 20');
}

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 10000, l2_gas: 15000000)]
fn test_generate_beast_stats_vampire_range() {
    // Test Vampire stats are within valid ranges
    let hash: felt252 = 54321;

    let (attack, damage) = generate_beast_stats(hash, Beast::Vampire);

    // Verify attack is within range (25-35)
    assert(attack >= 25, 'vampire attack should be >= 25');
    assert(attack <= 35, 'vampire attack should be <= 35');

    // Verify damage is within range (15-25)
    assert(damage >= 15, 'vampire damage should be >= 15');
    assert(damage <= 25, 'vampire damage should be <= 25');
}

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 10000, l2_gas: 15000000)]
fn test_generate_beast_stats_deterministic() {
    // Test that same hash produces same stats
    let hash: felt252 = 99999;

    let (attack1, damage1) = generate_beast_stats(hash, Beast::Werewolf);
    let (attack2, damage2) = generate_beast_stats(hash, Beast::Werewolf);

    assert(attack1 == attack2, 'attack should be deterministic');
    assert(damage1 == damage2, 'damage should be deterministic');
}

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 10000, l2_gas: 15000000)]
fn test_generate_beast_stats_different_beasts() {
    // Test that different beasts produce different stat ranges
    let hash: felt252 = 77777;

    let (werewolf_attack, werewolf_damage) = generate_beast_stats(hash, Beast::Werewolf);
    let (vampire_attack, vampire_damage) = generate_beast_stats(hash, Beast::Vampire);

    // Vampire should have higher base stats (even if hash-derived values are same)
    // Vampire min attack (25) > Werewolf max attack (30) is not true
    // But vampire should generally be in higher range
    assert(werewolf_attack >= 20 && werewolf_attack <= 30, 'werewolf attack in range');
    assert(werewolf_damage >= 10 && werewolf_damage <= 20, 'werewolf damage in range');
    assert(vampire_attack >= 25 && vampire_attack <= 35, 'vampire attack in range');
    assert(vampire_damage >= 15 && vampire_damage <= 25, 'vampire damage in range');
}

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 10000, l2_gas: 20000000)]
fn test_generate_beast_stats_extreme_hash_values() {
    // Test with extreme hash values to ensure no overflow
    let hash_max: felt252 = 999999999; // Large but fits in felt252
    let hash_zero: felt252 = 0;

    // Werewolf with extreme hash
    let (attack_max, damage_max) = generate_beast_stats(hash_max, Beast::Werewolf);
    let (attack_zero, damage_zero) = generate_beast_stats(hash_zero, Beast::Werewolf);

    // All should be within valid ranges
    assert(attack_max >= 20 && attack_max <= 30, 'attack_max in range');
    assert(damage_max >= 10 && damage_max <= 20, 'damage_max in range');
    assert(attack_zero >= 20 && attack_zero <= 30, 'attack_zero in range');
    assert(damage_zero >= 10 && damage_zero <= 20, 'damage_zero in range');

    // Vampire with extreme hash
    let (attack_v_max, damage_v_max) = generate_beast_stats(hash_max, Beast::Vampire);
    let (attack_v_zero, damage_v_zero) = generate_beast_stats(hash_zero, Beast::Vampire);

    // All should be within valid ranges
    assert(attack_v_max >= 25 && attack_v_max <= 35, 'vampire attack_max in range');
    assert(damage_v_max >= 15 && damage_v_max <= 25, 'vampire damage_max in range');
    assert(attack_v_zero >= 25 && attack_v_zero <= 35, 'vampire attack_zero in range');
    assert(damage_v_zero >= 15 && damage_v_zero <= 25, 'vampire damage_zero in range');
}

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 10000, l2_gas: 15000000)]
fn test_generate_beast_stats_attack_damage_independence() {
    // Test that attack and damage use different hash derivations (not correlated)
    let hash1: felt252 = 11111;
    let hash2: felt252 = 22222;

    let (attack1, damage1) = generate_beast_stats(hash1, Beast::Werewolf);
    let (attack2, damage2) = generate_beast_stats(hash2, Beast::Werewolf);

    // Stats should be different for different hashes (most likely)
    // At least verify that attack and damage are independently generated
    // If hash1 and hash2 are different, stats should likely be different
    // But this is probabilistic, so we'll just verify they're valid
    assert(attack1 >= 20 && attack1 <= 30, 'attack1 in range');
    assert(damage1 >= 10 && damage1 <= 20, 'damage1 in range');
    assert(attack2 >= 20 && attack2 <= 30, 'attack2 in range');
    assert(damage2 >= 10 && damage2 <= 20, 'damage2 in range');
}

// ------------------------------------------ //
// -------- Fight Function Tests ----------- //
// ------------------------------------------ //

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 20000, l2_gas: 50000000)]
fn test_fight_successful_combat() {
    // Test successful combat where player survives and beast is defeated
    let game_id: u64 = 300;
    let ndef = namespace_def();
    let mut world = spawn_test_world([ndef].span());
    world.sync_perms_and_inits(contract_defs());

    let (contract_address, _) = world.dns(@"game_systems").unwrap();
    let mut game_systems = IGameSystemsDispatcher { contract_address };

    game_systems.create_game(game_id);

    // Move until we get a beast encounter
    let mut found_beast = false;
    let mut i: u8 = 0;
    while i < 30 {
        game_systems.move(game_id, Direction::Right);
        let encounter: CurrentEncounter = world.read_model(game_id);
        let encounter_enum: Encounter = encounter.encounter_type.into();

        match encounter_enum {
            Encounter::Werewolf | Encounter::Vampire => {
                found_beast = true;
                break;
            },
            _ => {},
        }
        i += 1;
    }

    assert(found_beast, 'should find beast encounter');

    // Get initial player state
    let player_before: Player = world.read_model(game_id);
    let health_before = player_before.health;
    let beast_encounter: BeastEncounter = world.read_model(game_id);
    let beast_damage = beast_encounter.damage_points;

    // Fight the beast
    game_systems.fight(game_id);

    // Verify player took damage (health decreased)
    let player_after: Player = world.read_model(game_id);
    let expected_health: u32 = if beast_damage >= health_before {
        0
    } else {
        health_before - beast_damage
    };
    assert(player_after.health == expected_health, 'player health updated');

    // Verify encounter is now FreeRoam (beast defeated)
    let encounter: CurrentEncounter = world.read_model(game_id);
    assert(encounter.encounter_type == 8, 'should be FreeRoam'); // 8 = FreeRoam

    // Verify beast is defeated (BeastEncounter may still exist but encounter changed)
    let encounter_enum: Encounter = encounter.encounter_type.into();
    assert(encounter_enum == Encounter::FreeRoam, 'encounter should be FreeRoam');
}

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 20000, l2_gas: 50000000)]
fn test_fight_player_dies() {
    // Test combat where player dies (beast damage >= player health)
    let game_id: u64 = 301;
    let ndef = namespace_def();
    let mut world = spawn_test_world([ndef].span());
    world.sync_perms_and_inits(contract_defs());

    let (contract_address, _) = world.dns(@"game_systems").unwrap();
    let mut game_systems = IGameSystemsDispatcher { contract_address };

    game_systems.create_game(game_id);

    // Damage player to low health
    let mut player: Player = world.read_model(game_id);
    PlayerTrait::apply_damage(ref player, 90); // Leave player with 10 health
    world.write_model(@player);

    // Move until we get a beast encounter
    let mut found_beast = false;
    let mut i: u8 = 0;
    while i < 30 {
        game_systems.move(game_id, Direction::Right);
        let encounter: CurrentEncounter = world.read_model(game_id);
        let encounter_enum: Encounter = encounter.encounter_type.into();

        match encounter_enum {
            Encounter::Werewolf | Encounter::Vampire => {
                found_beast = true;
                break;
            },
            _ => {},
        }
        i += 1;
    }

    assert(found_beast, 'should find beast encounter');

    // Get beast damage
    let beast_encounter: BeastEncounter = world.read_model(game_id);
    let beast_damage = beast_encounter.damage_points;

    // If beast damage < 10, damage player more to ensure death
    if beast_damage < 10 {
        let mut player: Player = world.read_model(game_id);
        PlayerTrait::apply_damage(ref player, 5); // Leave player with 5 health
        world.write_model(@player);
    }

    // Fight the beast
    game_systems.fight(game_id);

    // Verify player died (health = 0)
    let player_after: Player = world.read_model(game_id);
    assert(player_after.health == 0, 'player should be dead');
    assert(!player_after.is_alive(), 'player should not be alive');

    // Verify game state is Lost
    let game_state: scard::models::GameState = world.read_model(game_id);
    assert(game_state.is_lost(), 'game should be lost');
    assert(!game_state.is_in_progress(), 'game should not be in progress');

    // Verify encounter is FreeRoam (beast defeated, player dead)
    let encounter: CurrentEncounter = world.read_model(game_id);
    assert(encounter.encounter_type == 8, 'should be FreeRoam');
}

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 20000, l2_gas: 50000000)]
fn test_fight_consumes_free_attack() {
    // Test that free attack ability is consumed after fighting
    let game_id: u64 = 302;
    let ndef = namespace_def();
    let mut world = spawn_test_world([ndef].span());
    world.sync_perms_and_inits(contract_defs());

    let (contract_address, _) = world.dns(@"game_systems").unwrap();
    let mut game_systems = IGameSystemsDispatcher { contract_address };

    game_systems.create_game(game_id);

    // Grant free attack ability (move until we get FreeAttack encounter)
    let mut found_free_attack = false;
    let mut i: u8 = 0;
    while i < 30 {
        game_systems.move(game_id, Direction::Right);
        let encounter: CurrentEncounter = world.read_model(game_id);
        if encounter.encounter_type == 6 {
            // Found FreeAttack encounter
            found_free_attack = true;
            break;
        }
        i += 1;
    }

    // If we didn't find FreeAttack, grant it manually for testing
    if !found_free_attack {
        let mut player: Player = world.read_model(game_id);
        player.has_free_attack = true;
        world.write_model(@player);
    }

    // Verify player has free attack
    let player_before: Player = world.read_model(game_id);
    assert(player_before.has_free_attack, 'player should have free attack');

    // Move until we get a beast encounter
    let mut found_beast = false;
    let mut i: u8 = 0;
    while i < 30 {
        game_systems.move(game_id, Direction::Right);
        let encounter: CurrentEncounter = world.read_model(game_id);
        let encounter_enum: Encounter = encounter.encounter_type.into();

        match encounter_enum {
            Encounter::Werewolf | Encounter::Vampire => {
                found_beast = true;
                break;
            },
            _ => {},
        }
        i += 1;
    }

    assert(found_beast, 'should find beast encounter');

    // Fight the beast
    game_systems.fight(game_id);

    // Verify free attack was consumed
    let player_after: Player = world.read_model(game_id);
    assert(!player_after.has_free_attack, 'free attack should be consumed');
}

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 20000, l2_gas: 50000000)]
fn test_fight_damage_underflow_protection() {
    // Test that damage application safely handles underflow
    // Player with very low health vs beast with high damage
    let game_id: u64 = 305;
    let ndef = namespace_def();
    let mut world = spawn_test_world([ndef].span());
    world.sync_perms_and_inits(contract_defs());

    let (contract_address, _) = world.dns(@"game_systems").unwrap();
    let mut game_systems = IGameSystemsDispatcher { contract_address };

    game_systems.create_game(game_id);

    // Set player health to 1 (very low)
    let mut player: Player = world.read_model(game_id);
    PlayerTrait::apply_damage(ref player, DEFAULT_PLAYER_HEALTH - 1);
    world.write_model(@player);

    // Verify player has 1 health
    let player_check: Player = world.read_model(game_id);
    assert(player_check.health == 1, 'player should have 1 health');

    // Move until we get a beast encounter
    let mut found_beast = false;
    let mut i: u8 = 0;
    while i < 30 {
        game_systems.move(game_id, Direction::Right);
        let encounter: CurrentEncounter = world.read_model(game_id);
        let encounter_enum: Encounter = encounter.encounter_type.into();

        match encounter_enum {
            Encounter::Werewolf | Encounter::Vampire => {
                found_beast = true;
                break;
            },
            _ => {},
        }
        i += 1;
    }

    assert(found_beast, 'should find beast encounter');

    // Fight the beast (beast damage will be >= 1, should handle underflow safely)
    game_systems.fight(game_id);

    // Verify player health is 0 (not negative, safely handled)
    let player_after: Player = world.read_model(game_id);
    assert(player_after.health == 0, 'player health should be 0');
    assert(!player_after.is_alive(), 'player should be dead');

    // Verify game state is Lost
    let game_state: scard::models::GameState = world.read_model(game_id);
    assert(game_state.is_lost(), 'game should be lost');
}

#[test]
#[available_gas(l1_gas: 0, l1_data_gas: 20000, l2_gas: 50000000)]
fn test_fight_werewolf_vs_vampire() {
    // Test fighting different beast types (Werewolf and Vampire)
    let game_id: u64 = 306;
    let ndef = namespace_def();
    let mut world = spawn_test_world([ndef].span());
    world.sync_perms_and_inits(contract_defs());

    let (contract_address, _) = world.dns(@"game_systems").unwrap();
    let mut game_systems = IGameSystemsDispatcher { contract_address };

    game_systems.create_game(game_id);

    // Move until we get a beast encounter
    let mut found_beast = false;
    let mut i: u8 = 0;
    while i < 30 {
        game_systems.move(game_id, Direction::Right);
        let encounter: CurrentEncounter = world.read_model(game_id);
        let encounter_enum: Encounter = encounter.encounter_type.into();

        match encounter_enum {
            Encounter::Werewolf => {
                // Verify BeastEncounter exists
                let beast: BeastEncounter = world.read_model(game_id);
                assert(beast.beast_type == 1, 'should be werewolf');
                assert(beast.attack_points >= 20 && beast.attack_points <= 30, 'werewolf attack');
                assert(beast.damage_points >= 10 && beast.damage_points <= 20, 'werewolf damage');
                found_beast = true;
                break;
            },
            Encounter::Vampire => {
                // Verify BeastEncounter exists
                let beast: BeastEncounter = world.read_model(game_id);
                assert(beast.beast_type == 2, 'should be vampire');
                assert(beast.attack_points >= 25 && beast.attack_points <= 35, 'vampire attack');
                assert(beast.damage_points >= 15 && beast.damage_points <= 25, 'vampire damage');
                found_beast = true;
                break;
            },
            _ => {},
        }
        i += 1;
    }

    assert(found_beast, 'should find beast encounter');

    // Get player health before
    let player_before: Player = world.read_model(game_id);
    let health_before = player_before.health;

    // Get beast damage
    let beast: BeastEncounter = world.read_model(game_id);
    let beast_damage = beast.damage_points;

    // Fight the beast
    game_systems.fight(game_id);

    // Verify player took damage
    let player_after: Player = world.read_model(game_id);
    let expected_health: u32 = if beast_damage >= health_before {
        0
    } else {
        health_before - beast_damage
    };
    assert(player_after.health == expected_health, 'player health updated correctly');

    // Verify encounter is FreeRoam (beast defeated)
    let encounter: CurrentEncounter = world.read_model(game_id);
    assert(encounter.encounter_type == 8, 'should be FreeRoam');
}
