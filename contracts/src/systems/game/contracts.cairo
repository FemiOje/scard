use scard::models::Direction;

#[starknet::interface]
pub trait IGameSystems<T> {
    fn create_game(ref self: T, game_id: u64);
    fn move(ref self: T, game_id: u64, direction: Direction);
    fn fight(ref self: T, game_id: u64);
    fn flee(ref self: T, game_id: u64);
}

#[dojo::contract]
mod game_systems {
    use dojo::model::ModelStorage;
    use dojo::event::EventStorage;
    use scard::models::{
        PlayerTrait, Position, PositionTrait, Direction, Encounter, CurrentEncounterTrait
    };
    use scard::constants::{
        DEFAULT_PLAYER_HEALTH, DEFAULT_PLAYER_ATTACK, DEFAULT_PLAYER_DAMAGE, DEFAULT_NS
    };

    // ------------------------------------------ //
    // ---------------- Events ------------------ //
    // ------------------------------------------ //

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct GameCreated {
        #[key]
        pub game_id: u64,
        pub player_health: u32,
        pub start_x: u32,
        pub start_y: u32,
    }

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct Moved {
        #[key]
        pub game_id: u64,
        pub direction: Direction,
        pub new_x: u32,
        pub new_y: u32,
    }

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct EncounterGenerated {
        #[key]
        pub game_id: u64,
        pub encounter_type: u8,
    }

    // ------------------------------------------ //
    // ------------ External Functions ---------- //
    // ------------------------------------------ //

    #[abi(embed_v0)]
    impl GameSystemsImpl of super::IGameSystems<ContractState> {
        fn create_game(ref self: ContractState, game_id: u64) {
            let mut world = self.world(@DEFAULT_NS());

            // Initialize player with default stats
            let player = PlayerTrait::new(
                game_id, DEFAULT_PLAYER_HEALTH, DEFAULT_PLAYER_ATTACK, DEFAULT_PLAYER_DAMAGE
            );
            world.write_model(@player);

            // Initialize position at origin
            let position = PositionTrait::new(game_id, 0, 0);
            world.write_model(@position);

            // Initialize with FreeRoam encounter
            let encounter = CurrentEncounterTrait::new(game_id, Encounter::FreeRoam);
            world.write_model(@encounter);

            // Emit game created event
            world
                .emit_event(
                    @GameCreated {
                        game_id, player_health: DEFAULT_PLAYER_HEALTH, start_x: position.x, start_y: position.y,
                    }
                );
        }

        fn move(ref self: ContractState, game_id: u64, direction: Direction) {
            let mut world = self.world(@DEFAULT_NS());

            // Read current position
            let mut position: Position = world.read_model(game_id);

            // Move in the specified direction
            // The move_in_direction method only moves one step and handles boundaries
            position.move_in_direction(direction);

            // Write updated position
            world.write_model(@position);

            // Generate new encounter (for now, FreeRoam - later add randomization)
            let encounter = CurrentEncounterTrait::new(game_id, Encounter::FreeRoam);
            world.write_model(@encounter);

            // Emit moved event
            world
                .emit_event(
                    @Moved { game_id, direction, new_x: position.x, new_y: position.y, }
                );

            // Emit encounter generated event
            world.emit_event(@EncounterGenerated { game_id, encounter_type: 8 }); // 8 = FreeRoam
        }

        fn fight(ref self: ContractState, game_id: u64) {
            let mut _world = self.world(@DEFAULT_NS());

            // TODO: Implement fight logic
            // - Validate player is in beast encounter
            // - Calculate combat results
            // - Update health/stats
            // - Emit combat event
        }

        fn flee(ref self: ContractState, game_id: u64) {
            let mut _world = self.world(@DEFAULT_NS());

            // TODO: Implement flee logic
            // - Validate player is in combat
            // - Check if player has free flee ability
            // - Calculate flee success/failure
            // - Update player state
            // - Emit flee event
        }
    }

    // ------------------------------------------ //
    // ---------------- Tests ------------------- //
    // ------------------------------------------ //
    // Note: Integration tests for game_systems require full world setup
    // See /tests/test_world.cairo for model-level unit tests

    #[cfg(test)]
    mod tests {
        use super::super::{IGameSystemsDispatcher, IGameSystemsDispatcherTrait};
        use dojo::model::ModelStorage;
        use dojo::world::WorldStorageTrait;
        use dojo_snf_test::{
            spawn_test_world, NamespaceDef, TestResource, ContractDefTrait, ContractDef,
            WorldStorageTestTrait
        };
        use scard::models::{Player, Position, CurrentEncounter, Direction};
        use scard::constants::{
            DEFAULT_PLAYER_HEALTH, DEFAULT_PLAYER_ATTACK, DEFAULT_PLAYER_DAMAGE, DEFAULT_NS
        };

        fn namespace_def() -> NamespaceDef {
            let ndef = NamespaceDef {
                namespace: DEFAULT_NS(),
                resources: [
                    TestResource::Model("Player"),
                    TestResource::Model("Position"),
                    TestResource::Model("CurrentEncounter"),
                    TestResource::Event("GameCreated"),
                    TestResource::Event("Moved"),
                    TestResource::Event("EncounterGenerated"),
                    TestResource::Contract("game_systems"),
                ].span()
            };
            ndef
        }

        fn contract_defs() -> Span<ContractDef> {
            [
                ContractDefTrait::new(@DEFAULT_NS(), @"game_systems")
                    .with_writer_of([dojo::utils::bytearray_hash(@DEFAULT_NS())].span())
            ].span()
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
        #[available_gas(l1_gas: 0, l1_data_gas: 10000, l2_gas: 25000000)]
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
    }
}
