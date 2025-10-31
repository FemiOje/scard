pub mod player;
pub mod beast;
pub mod encounter;
pub mod position;

// Re-export commonly used types for convenience
pub use player::{Player, PlayerTrait};
pub use beast::{Beast, BeastEncounter, BeastEncounterTrait};
pub use encounter::{Encounter, CurrentEncounter, CurrentEncounterTrait};
pub use position::{Position, PositionTrait, Vec2, Vec2Trait, Direction};
