pub fn DEFAULT_NS() -> ByteArray {
    "scard"
}

// Encounter gift amounts
pub const ENCOUNTER_FREE_HEALTH_AMOUNT: u32 = 20;
pub const ENCOUNTER_ATTACK_BONUS: u32 = 20;
pub const ENCOUNTER_DAMAGE_REDUCTION: u32 = 20;

// Default player stats
pub const DEFAULT_PLAYER_HEALTH: u32 = 100;
pub const DEFAULT_PLAYER_ATTACK: u32 = 20;
pub const DEFAULT_PLAYER_DAMAGE: u32 = 10;

// Beast stats ranges (can be used for random generation)
pub const WEREWOLF_MIN_ATTACK: u32 = 20;
pub const WEREWOLF_MAX_ATTACK: u32 = 30;
pub const WEREWOLF_MIN_DAMAGE: u32 = 10;
pub const WEREWOLF_MAX_DAMAGE: u32 = 20;

pub const VAMPIRE_MIN_ATTACK: u32 = 25;
pub const VAMPIRE_MAX_ATTACK: u32 = 35;
pub const VAMPIRE_MIN_DAMAGE: u32 = 15;
pub const VAMPIRE_MAX_DAMAGE: u32 = 25;
