#[cfg(test)]
mod tests {
    // Basic tests for model functionality without world integration
    use scard::models::{Direction, PlayerTrait, PositionTrait};

    #[test]
    fn test_position_creation() {
        let position = PositionTrait::new(1, 10, 20);
        assert(position.game_id == 1, 'wrong game_id');
        assert(position.x == 10, 'wrong x');
        assert(position.y == 20, 'wrong y');
    }

    #[test]
    fn test_position_movement() {
        let mut position = PositionTrait::new(1, 10, 10);

        position.move_in_direction(Direction::Right);
        assert(position.x == 11, 'move right failed');
        assert(position.y == 10, 'y should not change');

        position.move_in_direction(Direction::Down);
        assert(position.x == 11, 'x should not change');
        assert(position.y == 11, 'move down failed');

        position.move_in_direction(Direction::Left);
        assert(position.x == 10, 'move left failed');

        position.move_in_direction(Direction::Up);
        assert(position.y == 10, 'move up failed');
    }

    #[test]
    fn test_position_boundary() {
        let mut position = PositionTrait::new(1, 0, 0);

        position.move_in_direction(Direction::Left);
        assert(position.x == 0, 'should not go negative x');

        position.move_in_direction(Direction::Up);
        assert(position.y == 0, 'should not go negative y');
    }

    #[test]
    fn test_player_creation() {
        let player = PlayerTrait::new(1, 100, 20, 10);
        assert(player.game_id == 1, 'wrong game_id');
        assert(player.health == 100, 'wrong health');
        assert(player.attack_points == 20, 'wrong attack');
        assert(player.damage_points == 10, 'wrong damage');
        assert(!player.has_free_flee, 'should not have free flee');
        assert(!player.has_free_attack, 'should not have free attack');
        assert(player.is_alive(), 'player should be alive');
    }

    #[test]
    fn test_player_damage() {
        let mut player = PlayerTrait::new(1, 100, 20, 10);
        player.apply_damage(30);
        assert(player.health == 70, 'health should be 70');
        assert(player.is_alive(), 'player should still be alive');

        player.apply_damage(80);
        assert(player.health == 0, 'health should be 0');
        assert(!player.is_alive(), 'player should be dead');
    }

    #[test]
    fn test_player_heal() {
        let mut player = PlayerTrait::new(1, 50, 20, 10);
        player.heal(20);
        assert(player.health == 70, 'health should be 70');
    }

    #[test]
    fn test_player_abilities() {
        let mut player = PlayerTrait::new(1, 100, 20, 10);
        player.grant_free_flee();
        assert(player.has_free_flee, 'should have free flee');

        player.grant_free_attack();
        assert(player.has_free_attack, 'should have free attack');
    }

    #[test]
    fn test_player_stat_changes() {
        let mut player = PlayerTrait::new(1, 100, 20, 30);

        player.increase_attack(20);
        assert(player.attack_points == 40, 'attack should be 40');

        player.reduce_damage(20);
        assert(player.damage_points == 10, 'damage should be 10');

        player.reduce_damage(50);
        assert(player.damage_points == 0, 'damage should be 0');
    }
}
