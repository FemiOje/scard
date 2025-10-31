use scard::models::Direction;

// define the interface
#[starknet::interface]
pub trait IActions<T> {
    fn spawn(ref self: T, game_id: u64);
    fn move(ref self: T, game_id: u64, direction: Direction);
}

// dojo decorator
#[dojo::contract]
pub mod actions {
    use dojo::event::EventStorage;
    use dojo::model::ModelStorage;
    use scard::models::{Position, PositionTrait};
    use super::{Direction, IActions};

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct Moved {
        #[key]
        pub game_id: u64,
        pub direction: Direction,
    }

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct Spawned {
        #[key]
        pub game_id: u64,
        pub x: u32,
        pub y: u32,
    }

    #[abi(embed_v0)]
    impl ActionsImpl of IActions<ContractState> {
        fn spawn(ref self: ContractState, game_id: u64) {
            // Get the default world.
            let mut world = self.world_default();

            // Create a new position for the player at origin
            let position = PositionTrait::new(game_id, 0, 0);

            // Write the new position to the world.
            world.write_model(@position);

            // Emit an event to the world to notify about the spawn.
            world.emit_event(@Spawned { game_id, x: 0, y: 0 });
        }

        // Implementation of the move function for the ContractState struct.
        fn move(ref self: ContractState, game_id: u64, direction: Direction) {
            let mut world = self.world_default();

            // Retrieve the player's current position from the world.
            let mut position: Position = world.read_model(game_id);

            // Move the player in the specified direction
            position.move_in_direction(direction);

            // Write the new position to the world.
            world.write_model(@position);

            // Emit an event to the world to notify about the player's move.
            world.emit_event(@Moved { game_id, direction });
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        /// Use the default namespace "scard". This function is handy since the ByteArray
        /// can't be const.
        fn world_default(self: @ContractState) -> dojo::world::WorldStorage {
            self.world(@"scard")
        }
    }
}
