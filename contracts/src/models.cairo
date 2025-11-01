pub mod beast;
pub mod encounter;
pub mod game_state;
pub mod player;
pub mod position;
pub use beast::{Beast, BeastEncounter, BeastEncounterTrait};
pub use encounter::{CurrentEncounter, CurrentEncounterTrait, Encounter};
pub use game_state::{GameState, GameStateTrait, GameStatus};

// Re-export commonly used types for convenience
pub use player::{Player, PlayerTrait};
pub use position::{Direction, Position, PositionTrait, Vec2, Vec2Trait};
