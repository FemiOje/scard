use scard::models::{Direction, Position};

#[starknet::interface]
pub trait IGameSystems<T> {
    fn create_game(ref self: T, game_id: u64);
    fn move(ref self: T, game_id: u64, direction: Direction);
    fn fight(ref self: T, game_id: u64);
    fn flee(ref self: T, game_id: u64);
    fn get_position(self: @T, game_id: u64) -> Position;
}

#[dojo::contract]
mod game_systems {
    use dojo::event::EventStorage;
    use dojo::model::ModelStorage;
    use scard::constants::{
        DEFAULT_NS, DEFAULT_PLAYER_ATTACK, DEFAULT_PLAYER_DAMAGE, DEFAULT_PLAYER_HEALTH,
    };
    use scard::libs::encounter::{
        apply_encounter_effects, generate_beast_stats, generate_encounter_hash,
        select_encounter_from_hash,
    };
    use scard::models::{
        Beast, BeastEncounter, BeastEncounterTrait, CurrentEncounterTrait, Direction, Encounter,
        GameStateTrait, Player, PlayerTrait, Position, PositionTrait,
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

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct GameWon {
        #[key]
        pub game_id: u64,
        pub final_x: u32,
        pub final_y: u32,
    }

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct CombatEvent {
        #[key]
        pub game_id: u64,
        pub beast_type: u8,
        pub player_damage_dealt: u32,
        pub beast_damage_dealt: u32,
        pub player_health_after: u32,
        pub beast_defeated: bool,
        pub player_died: bool,
    }

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct FledEvent {
        #[key]
        pub game_id: u64,
        pub beast_type: u8,
        pub flee_successful: bool,
        pub player_damage_taken: u32,
        pub player_health_after: u32,
        pub player_died: bool,
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
                game_id, DEFAULT_PLAYER_HEALTH, DEFAULT_PLAYER_ATTACK, DEFAULT_PLAYER_DAMAGE,
            );
            world.write_model(@player);

            // Initialize position at origin
            let position = PositionTrait::new(game_id, 0, 0);
            world.write_model(@position);

            // Initialize with FreeRoam encounter
            let encounter = CurrentEncounterTrait::new(game_id, Encounter::FreeRoam);
            world.write_model(@encounter);

            // Initialize game state as InProgress
            let game_state = GameStateTrait::new(game_id);
            world.write_model(@game_state);

            // Emit game created event
            world
                .emit_event(
                    @GameCreated {
                        game_id,
                        player_health: DEFAULT_PLAYER_HEALTH,
                        start_x: position.x,
                        start_y: position.y,
                    },
                );
        }

        fn move(ref self: ContractState, game_id: u64, direction: Direction) {
            let mut world = self.world(@DEFAULT_NS());

            // Check if game is already won or lost - don't allow movement
            let mut game_state: scard::models::GameState = world.read_model(game_id);
            assert(game_state.is_in_progress(), 'game is not in progress');

            let mut position: Position = world.read_model(game_id);
            position.move_in_direction(direction);

            world.write_model(@position);

            // Check win condition: bottom-right cell is (4, 4) for 5x5 grid
            if position.x == 4 && position.y == 4 {
                game_state.set_won();
                world.write_model(@game_state);

                world.emit_event(@GameWon { game_id, final_x: position.x, final_y: position.y });
            }

            // Emit moved event
            world.emit_event(@Moved { game_id, direction, new_x: position.x, new_y: position.y });

            // Only generate encounter if game is still in progress (not won/lost)
            if game_state.is_in_progress() {
                let encounter_hash = generate_encounter_hash(
                    game_id, position.x, position.y, direction,
                );

                let encounter_type = select_encounter_from_hash(encounter_hash);

                // Handle each encounter type explicitly for frontend UX
                match encounter_type {
                    // Beast encounters - create BeastEncounter model with stats
                    Encounter::Werewolf => {
                        let (attack, damage) = generate_beast_stats(
                            encounter_hash, Beast::Werewolf,
                        );
                        let beast_encounter = BeastEncounterTrait::new(
                            game_id, Beast::Werewolf, attack, damage,
                        );
                        world.write_model(@beast_encounter);
                        // Frontend will show combat popup with fight/flee options
                    },
                    Encounter::Vampire => {
                        let (attack, damage) = generate_beast_stats(encounter_hash, Beast::Vampire);
                        let beast_encounter = BeastEncounterTrait::new(
                            game_id, Beast::Vampire, attack, damage,
                        );
                        world.write_model(@beast_encounter);
                        // Frontend will show combat popup with fight/flee options
                    },
                    // Gift encounters - apply immediate effects to player using library function
                    Encounter::FreeHealth | Encounter::AttackPoints | Encounter::ReducedDamage |
                    Encounter::FreeAttack | Encounter::FreeFlee |
                    Encounter::FreeRoam => {
                        let mut player: Player = world.read_model(game_id);
                        apply_encounter_effects(ref player, encounter_type);
                        world.write_model(@player);
                        
                        // Clear BeastEncounter model by overwriting with empty values
                        // This ensures only beast encounters have valid BeastEncounter models
                        let empty_beast = BeastEncounterTrait::new(game_id, Beast::None, 0, 0);
                        world.write_model(@empty_beast);
                    },
                }

                // Update CurrentEncounter model
                let current_encounter = CurrentEncounterTrait::new(game_id, encounter_type);
                world.write_model(@current_encounter);

                // Emit encounter generated event
                world
                    .emit_event(
                        @EncounterGenerated { game_id, encounter_type: encounter_type.into() },
                    );
            }
        }

        fn fight(ref self: ContractState, game_id: u64) {
            let mut world = self.world(@DEFAULT_NS());
            // Validate game is in progress
            let mut game_state: scard::models::GameState = world.read_model(game_id);
            assert(game_state.is_in_progress(), 'game is not in progress');

            // Validate player is in a beast encounter
            let current_encounter: scard::models::CurrentEncounter = world.read_model(game_id);
            assert(current_encounter.is_beast_encounter(), 'not in beast encounter');

            // Read BeastEncounter model (must exist for beast encounters)
            let beast_encounter: BeastEncounter = world.read_model(game_id);

            // Read Player model
            let mut player: Player = world.read_model(game_id);

            // ------------------------------------------ //
            // ---------------- Combat ----------------- //
            // ------------------------------------------ //

            // Get combat stats
            let beast_damage: u32 = beast_encounter.damage_points;
            let player_damage: u32 = player.damage_points;

            // Apply beast damage to player (safely guards against underflow)
            PlayerTrait::apply_damage(ref player, beast_damage);

            // Get player health after damage
            let player_health_after: u32 = player.health;

            // Check if player died (health = 0)
            let player_died: bool = !player.is_alive();

            // Beast is automatically defeated (one-hit kill)
            let beast_defeated: bool = true;

            // ------------------------------------------ //
            // ---------------- State Updates ----------- //
            // ------------------------------------------ //

            // If player died, set game state to Lost
            if player_died {
                game_state.set_lost();
                world.write_model(@game_state);
            }

            // Consume free attack ability if used
            if player.has_free_attack {
                player.has_free_attack = false;
            }

            // Update encounter to FreeRoam (beast defeated)
            let encounter = CurrentEncounterTrait::new(game_id, Encounter::FreeRoam);
            world.write_model(@encounter);

            // Clear BeastEncounter model by overwriting with empty values
            // This prevents stale beast data from persisting
            let empty_beast = BeastEncounterTrait::new(game_id, Beast::None, 0, 0);
            world.write_model(@empty_beast);

            // Write updated player model
            world.write_model(@player);

            // ------------------------------------------ //
            // ---------------- Events ------------------ //
            // ------------------------------------------ //

            // Emit combat event with all combat results
            world
                .emit_event(
                    @CombatEvent {
                        game_id,
                        beast_type: beast_encounter.beast_type,
                        player_damage_dealt: player_damage,
                        beast_damage_dealt: beast_damage,
                        player_health_after,
                        beast_defeated,
                        player_died,
                    },
                );
        }

        fn flee(ref self: ContractState, game_id: u64) {
            let mut world = self.world(@DEFAULT_NS());

            // ------------------------------------------ //
            // ---------------- Validation -------------- //
            // ------------------------------------------ //

            // Validate game is in progress
            let mut game_state: scard::models::GameState = world.read_model(game_id);
            assert(game_state.is_in_progress(), 'game is not in progress');

            // Validate player is in a beast encounter
            let current_encounter: scard::models::CurrentEncounter = world.read_model(game_id);
            assert(current_encounter.is_beast_encounter(), 'not in beast encounter');

            // Read BeastEncounter model (must exist for beast encounters)
            let beast_encounter: BeastEncounter = world.read_model(game_id);

            // Read Player model
            let mut player: Player = world.read_model(game_id);

            // ------------------------------------------ //
            // ---------------- Flee Logic --------------- //
            // ------------------------------------------ //

            // Simple flee logic: beast always attacks first
            // If player survives the damage, flee succeeds
            // If player dies, flee fails and game ends

            let beast_damage: u32 = beast_encounter.damage_points;

            // Check if player has free flee ability (skip damage)
            let has_free_flee: bool = player.has_free_flee;
            let player_damage_taken: u32 = if has_free_flee {
                // Free flee: no damage taken
                0
            } else {
                // Normal flee: beast attacks, apply damage
                PlayerTrait::apply_damage(ref player, beast_damage);
                beast_damage
            };

            // Get player health after damage (if any)
            let player_health_after: u32 = player.health;

            let player_died: bool = !player.is_alive();

            // Determine flee success: if player survived, flee succeeds
            let flee_successful: bool = !player_died;

            // Consume free flee ability if used
            if has_free_flee {
                player.has_free_flee = false;
            }

            // ------------------------------------------ //
            // ---------------- State Updates ----------- //
            // ------------------------------------------ //

            if player_died {
                // Player died: set game state to Lost
                game_state.set_lost();
                world.write_model(@game_state);
                // Encounter remains as beast (player died during flee)
            } else {
                // Player survived: flee successful, end encounter
                let encounter = CurrentEncounterTrait::new(game_id, Encounter::FreeRoam);
                world.write_model(@encounter);
                
                // Clear BeastEncounter model by overwriting with empty values
                // This prevents stale beast data from persisting
                let empty_beast = BeastEncounterTrait::new(game_id, Beast::None, 0, 0);
                world.write_model(@empty_beast);
            }

            // Write updated player model
            world.write_model(@player);

            // ------------------------------------------ //
            // ---------------- Events ------------------ //
            // ------------------------------------------ //

            // Emit flee event with results
            world
                .emit_event(
                    @FledEvent {
                        game_id,
                        beast_type: beast_encounter.beast_type,
                        flee_successful,
                        player_damage_taken,
                        player_health_after,
                        player_died,
                    },
                );
        }

        fn get_position(self: @ContractState, game_id: u64) -> Position {
            let world = self.world(@DEFAULT_NS());
            world.read_model(game_id)
        }
    }
}
