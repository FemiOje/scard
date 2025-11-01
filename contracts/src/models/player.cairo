#[dojo::model]
#[derive(Copy, Drop, Serde, Debug)]
pub struct Player {
    #[key]
    pub game_id: u64,
    pub health: u32,
    pub damage_points: u32,
    pub attack_points: u32,
    pub has_free_flee: bool,
    pub has_free_attack: bool,
}

#[generate_trait]
pub impl PlayerImpl of PlayerTrait {
    fn new(game_id: u64, health: u32, attack_points: u32, damage_points: u32) -> Player {
        Player {
            game_id,
            health,
            damage_points,
            attack_points,
            has_free_flee: false,
            has_free_attack: false,
        }
    }

    fn is_alive(self: Player) -> bool {
        self.health > 0
    }

    fn grant_free_flee(ref self: Player) {
        self.has_free_flee = true;
    }

    fn grant_free_attack(ref self: Player) {
        self.has_free_attack = true;
    }

    fn apply_damage(ref self: Player, damage: u32) {
        if damage >= self.health {
            self.health = 0;
        } else {
            self.health -= damage;
        }
    }

    fn heal(ref self: Player, amount: u32) {
        self.health += amount;
    }

    fn increase_attack(ref self: Player, amount: u32) {
        self.attack_points += amount;
    }

    fn reduce_damage(ref self: Player, amount: u32) {
        if amount >= self.damage_points {
            self.damage_points = 0;
        } else {
            self.damage_points -= amount;
        }
    }
}

#[cfg(test)]
mod tests {
    use super::PlayerTrait;

    #[test]
    fn test_player_creation() {
        let player = PlayerTrait::new(1, 100, 20, 10);
        assert(player.game_id == 1, 'wrong game_id');
        assert(player.health == 100, 'wrong health');
        assert(player.attack_points == 20, 'wrong attack');
        assert(player.damage_points == 10, 'wrong damage');
        assert(!player.has_free_flee, 'should not have free flee');
        assert(!player.has_free_attack, 'should not have free attack');
    }

    #[test]
    fn test_player_is_alive() {
        let player = PlayerTrait::new(1, 100, 20, 10);
        assert(player.is_alive(), 'player should be alive');

        let mut dead_player = PlayerTrait::new(2, 0, 20, 10);
        assert(!dead_player.is_alive(), 'player should be dead');
    }

    #[test]
    fn test_player_apply_damage() {
        let mut player = PlayerTrait::new(1, 100, 20, 10);
        player.apply_damage(30);
        assert(player.health == 70, 'wrong health after damage');

        player.apply_damage(80);
        assert(player.health == 0, 'health should be 0');
    }

    #[test]
    fn test_player_heal() {
        let mut player = PlayerTrait::new(1, 50, 20, 10);
        player.heal(20);
        assert(player.health == 70, 'wrong health after heal');
    }

    #[test]
    fn test_player_grant_abilities() {
        let mut player = PlayerTrait::new(1, 100, 20, 10);
        player.grant_free_flee();
        assert(player.has_free_flee, 'should have free flee');

        player.grant_free_attack();
        assert(player.has_free_attack, 'should have free attack');
    }

    #[test]
    fn test_player_increase_attack() {
        let mut player = PlayerTrait::new(1, 100, 20, 10);
        player.increase_attack(20);
        assert(player.attack_points == 40, 'wrong attack after increase');
    }

    #[test]
    fn test_player_reduce_damage() {
        let mut player = PlayerTrait::new(1, 100, 20, 30);
        player.reduce_damage(20);
        assert(player.damage_points == 10, 'wrong damage after reduction');

        player.reduce_damage(50);
        assert(player.damage_points == 0, 'damage should be 0');
    }
}

