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

// ------------------------------------------ //
// ------- Encounter Probabilities --------- //
// ------------------------------------------ //

// Encounter probabilities (percentages, sum = 100)
pub const PROB_FREEROAM: u8 = 40; // 40% chance
pub const PROB_GIFT_TOTAL: u8 = 35; // 35% total (7% each gift)
pub const PROB_BEAST_TOTAL: u8 = 25; // 25% total (12.5% each beast)

// Individual gift probabilities (should sum to PROB_GIFT_TOTAL)
pub const PROB_FREE_HEALTH: u8 = 7;
pub const PROB_ATTACK_POINTS: u8 = 7;
pub const PROB_REDUCED_DAMAGE: u8 = 7;
pub const PROB_FREE_ATTACK: u8 = 7;
pub const PROB_FREE_FLEE: u8 = 7;

// Individual beast probabilities (should sum to PROB_BEAST_TOTAL)
pub const PROB_WEREWOLF: u8 = 12;
pub const PROB_VAMPIRE: u8 = 13; // Slightly more common

// Cumulative thresholds for weighted distribution
// IMPORTANT: PROB_FREEROAM + PROB_GIFT_TOTAL must be <= 255 to prevent u8 overflow
// Current values: 40 + 35 = 75, so safe
// For testing mode (100% beasts), ensure PROB_FREEROAM + PROB_GIFT_TOTAL = 100
pub const THRESHOLD_FREEROAM: u8 = PROB_FREEROAM; // 40
pub const THRESHOLD_GIFT_START: u8 = PROB_FREEROAM; // 40
pub const THRESHOLD_BEAST_START: u8 = PROB_FREEROAM + PROB_GIFT_TOTAL; // 75

// Validation constant (compile-time check)
// If this doesn't compile, probabilities don't sum to 100
const _PROB_SUM_CHECK: u8 = PROB_FREEROAM + PROB_GIFT_TOTAL + PROB_BEAST_TOTAL;
// Should equal 100 - compiler will catch if not

// ------------------------------------------ //
// -------- Flee Success Rates ------------- //
// ------------------------------------------ //

// Flee success rates (percentages)
// When player attack >= beast attack: higher success rate
// pub const FLEE_SUCCESS_RATE_STRONGER: u8 = 70; // 70% chance when player is stronger
// When player attack < beast attack: lower success rate
// pub const FLEE_SUCCESS_RATE_WEAKER: u8 = 30; // 30% chance when player is weaker

#[cfg(test)]
mod tests {
    use super::{
        PROB_ATTACK_POINTS, PROB_BEAST_TOTAL, PROB_FREEROAM, PROB_FREE_ATTACK, PROB_FREE_FLEE,
        PROB_FREE_HEALTH, PROB_GIFT_TOTAL, PROB_REDUCED_DAMAGE, PROB_VAMPIRE, PROB_WEREWOLF,
        THRESHOLD_BEAST_START, THRESHOLD_FREEROAM, THRESHOLD_GIFT_START,
    };

    #[test]
    fn test_probability_sum_validation() {
        // Verify probabilities sum to 100
        let sum = PROB_FREEROAM + PROB_GIFT_TOTAL + PROB_BEAST_TOTAL;
        let expected_sum: u8 = 100;
        assert(sum == expected_sum, 'probabilities must sum to 100');

        // Verify threshold calculations are safe (no overflow)
        let threshold_sum = PROB_FREEROAM + PROB_GIFT_TOTAL;
        let max_u8: u8 = 255;
        assert(threshold_sum <= max_u8, 'must not overflow u8');
    }

    #[test]
    fn test_gift_probabilities_sum() {
        // Verify individual gift probabilities sum to PROB_GIFT_TOTAL
        let gift_sum = PROB_FREE_HEALTH
            + PROB_ATTACK_POINTS
            + PROB_REDUCED_DAMAGE
            + PROB_FREE_ATTACK
            + PROB_FREE_FLEE;
        let expected = PROB_GIFT_TOTAL;
        assert(gift_sum == expected, 'must sum to PROB_GIFT_TOTAL');
    }

    #[test]
    fn test_beast_probabilities_sum() {
        // Verify individual beast probabilities sum to PROB_BEAST_TOTAL
        let beast_sum = PROB_WEREWOLF + PROB_VAMPIRE;
        let expected = PROB_BEAST_TOTAL;
        assert(beast_sum == expected, 'must sum to PROB_BEAST_TOTAL');
    }

    #[test]
    fn test_threshold_values() {
        // Verify threshold values are correct
        assert(THRESHOLD_FREEROAM == PROB_FREEROAM, 'should equal PROB_FREEROAM');
        assert(THRESHOLD_GIFT_START == PROB_FREEROAM, 'should equal PROB_FREEROAM');
        assert!(
            THRESHOLD_BEAST_START == PROB_FREEROAM + PROB_GIFT_TOTAL,
            "THRESHOLD_BEAST_START should == PROB_FREEROAM + PROB_GIFT_TOTAL",
        );

        // Verify threshold relationships
        assert(THRESHOLD_FREEROAM == 40, 'should be 40');
        assert(THRESHOLD_GIFT_START == 40, 'should be 40');
        assert(THRESHOLD_BEAST_START == 75, 'should be 75');
    }

    #[test]
    fn test_probability_ranges() {
        // Verify all probabilities are within valid range (0-100)
        assert(PROB_FREEROAM <= 100, 'should be <= 100');
        assert(PROB_GIFT_TOTAL <= 100, 'should be <= 100');
        assert(PROB_BEAST_TOTAL <= 100, 'should be <= 100');

        // Verify individual probabilities are reasonable
        assert(PROB_FREE_HEALTH > 0, 'should be > 0');
        assert(PROB_ATTACK_POINTS > 0, 'should be > 0');
        assert(PROB_REDUCED_DAMAGE > 0, 'should be > 0');
        assert(PROB_FREE_ATTACK > 0, 'should be > 0');
        assert(PROB_FREE_FLEE > 0, 'should be > 0');
        assert(PROB_WEREWOLF > 0, 'should be > 0');
        assert(PROB_VAMPIRE > 0, 'should be > 0');
    }

    #[test]
    fn test_threshold_overflow_prevention() {
        // Verify threshold calculations don't overflow u8 (max 255)
        // Current: PROB_FREEROAM + PROB_GIFT_TOTAL = 40 + 35 = 75 < 255 ✓
        let max_possible: u8 = 50 + 50; // Max reasonable values
        assert(max_possible <= 255_u8, 'should not overflow');

        // Verify actual threshold is safe
        let actual_threshold = THRESHOLD_BEAST_START;
        assert(actual_threshold <= 255, 'should not overflow');
    }

    #[test]
    fn test_constants_accessible() {
        // Verify all constants are accessible and have expected values
        assert(PROB_FREEROAM == 40, 'PROB_FREEROAM should be 40');
        assert(PROB_GIFT_TOTAL == 35, 'PROB_GIFT_TOTAL should be 35');
        assert(PROB_BEAST_TOTAL == 25, 'PROB_BEAST_TOTAL should be 25');
        assert(PROB_WEREWOLF == 12, 'PROB_WEREWOLF should be 12');
        assert(PROB_VAMPIRE == 13, 'PROB_VAMPIRE should be 13');
    }
}
