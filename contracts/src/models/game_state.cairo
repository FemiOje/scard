use super::{BeastEncounter, CurrentEncounter, Player, Position};

#[derive(Serde, Copy, Drop, PartialEq, Debug)]
pub enum GameStatus {
    InProgress,
    Won,
    Lost,
}

#[dojo::model]
#[derive(Copy, Drop, Serde, Debug)]
pub struct GameState {
    #[key]
    pub game_id: u64,
    pub status: u8 // Stored as u8, converted to/from GameStatus enum
}

#[generate_trait]
pub impl GameStateImpl of GameStateTrait {
    fn new(game_id: u64) -> GameState {
        GameState { game_id, status: GameStatus::InProgress.into() }
    }

    fn get_status(self: GameState) -> GameStatus {
        self.status.into()
    }

    fn is_won(self: GameState) -> bool {
        self.status == GameStatus::Won.into()
    }

    fn is_lost(self: GameState) -> bool {
        self.status == GameStatus::Lost.into()
    }

    fn is_in_progress(self: GameState) -> bool {
        self.status == GameStatus::InProgress.into()
    }

    fn set_won(ref self: GameState) {
        self.status = GameStatus::Won.into();
    }

    fn set_lost(ref self: GameState) {
        self.status = GameStatus::Lost.into();
    }
}

impl GameStatusIntoU8 of Into<GameStatus, u8> {
    fn into(self: GameStatus) -> u8 {
        match self {
            GameStatus::InProgress => 0,
            GameStatus::Won => 1,
            GameStatus::Lost => 2,
        }
    }
}

// Constants to ensure u8-to-enum conversion stays in sync with enum-to-u8 conversion
// These values MUST match the values in GameStatusIntoU8 implementation above
const STATUS_IN_PROGRESS: u8 = 0;
const STATUS_WON: u8 = 1;
const STATUS_LOST: u8 = 2;

impl U8IntoGameStatus of Into<u8, GameStatus> {
    fn into(self: u8) -> GameStatus {
        if self == STATUS_WON {
            GameStatus::Won
        } else if self == STATUS_LOST {
            GameStatus::Lost
        } else if self == STATUS_IN_PROGRESS {
            GameStatus::InProgress
        } else {
            GameStatus::InProgress
        }
    }
}

/// Complete game state returned by get_game_state view function
/// Packages all game data for efficient frontend retrieval
#[derive(Copy, Drop, Serde, Debug)]
pub struct CompleteGameState {
    pub player: Player,
    pub position: Position,
    pub game_state: GameState,
    pub current_encounter: CurrentEncounter,
    pub beast_encounter: BeastEncounter,
    pub has_beast: bool // Flag to indicate if beast_encounter is valid
}

#[cfg(test)]
mod tests {
    use super::{GameStateTrait, GameStatus};

    #[test]
    fn test_game_state_creation() {
        let game_state = GameStateTrait::new(1);
        assert(game_state.game_id == 1, 'wrong game_id');
        assert(game_state.is_in_progress(), 'should be in progress');
        assert(game_state.get_status() == GameStatus::InProgress, 'status should be InProgress');
    }

    #[test]
    fn test_game_state_won() {
        let mut game_state = GameStateTrait::new(1);
        game_state.set_won();
        assert(game_state.is_won(), 'should be won');
        assert(!game_state.is_in_progress(), 'should not be in progress');
        assert(!game_state.is_lost(), 'should not be lost');
        assert(game_state.get_status() == GameStatus::Won, 'status should be Won');
    }

    #[test]
    fn test_game_state_lost() {
        let mut game_state = GameStateTrait::new(1);
        game_state.set_lost();
        assert(game_state.is_lost(), 'should be lost');
        assert(!game_state.is_in_progress(), 'should not be in progress');
        assert(!game_state.is_won(), 'should not be won');
        assert(game_state.get_status() == GameStatus::Lost, 'status should be Lost');
    }

    #[test]
    fn test_game_status_conversions() {
        let in_progress: u8 = GameStatus::InProgress.into();
        let won: u8 = GameStatus::Won.into();
        let lost: u8 = GameStatus::Lost.into();

        assert(in_progress == 0, 'wrong InProgress value');
        assert(won == 1, 'wrong Won value');
        assert(lost == 2, 'wrong Lost value');

        // Test round-trip conversion
        let status_back: GameStatus = in_progress.into();
        assert(status_back == GameStatus::InProgress, 'conversion failed');
    }
}

