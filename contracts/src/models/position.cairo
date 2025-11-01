#[dojo::model]
#[derive(IntrospectPacked, Copy, Drop, Serde, Debug)]
pub struct Position {
    #[key]
    pub game_id: u64,
    pub x: u32,
    pub y: u32,
}

#[derive(Copy, Drop, Serde, Debug)]
pub struct Vec2 {
    pub x: u32,
    pub y: u32,
}

#[derive(Serde, Copy, Drop, PartialEq, Debug, Default, Introspect)]
pub enum Direction {
    #[default]
    Left,
    Right,
    Up,
    Down,
}

impl DirectionIntoFelt252 of Into<Direction, felt252> {
    fn into(self: Direction) -> felt252 {
        match self {
            Direction::Left => 1,
            Direction::Right => 2,
            Direction::Up => 3,
            Direction::Down => 4,
        }
    }
}

impl OptionDirectionIntoFelt252 of Into<Option<Direction>, felt252> {
    fn into(self: Option<Direction>) -> felt252 {
        match self {
            Option::None => 0,
            Option::Some(d) => d.into(),
        }
    }
}

#[generate_trait]
pub impl Vec2Impl of Vec2Trait {
    fn is_zero(self: Vec2) -> bool {
        if self.x - self.y == 0 {
            return true;
        }
        false
    }

    fn is_equal(self: Vec2, b: Vec2) -> bool {
        self.x == b.x && self.y == b.y
    }
}

#[generate_trait]
pub impl PositionImpl of PositionTrait {
    fn new(game_id: u64, x: u32, y: u32) -> Position {
        Position { game_id, x, y }
    }

    fn as_vec2(self: Position) -> Vec2 {
        Vec2 { x: self.x, y: self.y }
    }

    fn move_in_direction(ref self: Position, direction: Direction) {
        match direction {
            Direction::Left => { if self.x > 0 {
                self.x -= 1;
            } },
            Direction::Right => { self.x += 1; },
            Direction::Up => { if self.y > 0 {
                self.y -= 1;
            } },
            Direction::Down => { self.y += 1; },
        }
    }
}

#[cfg(test)]
mod tests {
    use super::{Direction, PositionTrait, Vec2, Vec2Trait};

    #[test]
    fn test_vec_is_zero() {
        assert(Vec2Trait::is_zero(Vec2 { x: 0, y: 0 }), 'not zero');
    }

    #[test]
    fn test_vec_is_equal() {
        let position = Vec2 { x: 420, y: 0 };
        assert(position.is_equal(Vec2 { x: 420, y: 0 }), 'not equal');
    }

    #[test]
    fn test_position_creation() {
        let position = PositionTrait::new(1, 10, 20);
        assert(position.game_id == 1, 'wrong game_id');
        assert(position.x == 10, 'wrong x');
        assert(position.y == 20, 'wrong y');
    }

    #[test]
    fn test_move_right() {
        let mut position = PositionTrait::new(1, 10, 10);
        position.move_in_direction(Direction::Right);
        assert(position.x == 11, 'wrong x after move right');
        assert(position.y == 10, 'y should not change');
    }

    #[test]
    fn test_move_left() {
        let mut position = PositionTrait::new(1, 10, 10);
        position.move_in_direction(Direction::Left);
        assert(position.x == 9, 'wrong x after move left');
        assert(position.y == 10, 'y should not change');
    }

    #[test]
    fn test_move_up() {
        let mut position = PositionTrait::new(1, 10, 10);
        position.move_in_direction(Direction::Up);
        assert(position.x == 10, 'x should not change');
        assert(position.y == 9, 'wrong y after move up');
    }

    #[test]
    fn test_move_down() {
        let mut position = PositionTrait::new(1, 10, 10);
        position.move_in_direction(Direction::Down);
        assert(position.x == 10, 'x should not change');
        assert(position.y == 11, 'wrong y after move down');
    }

    #[test]
    fn test_move_left_at_boundary() {
        let mut position = PositionTrait::new(1, 0, 10);
        position.move_in_direction(Direction::Left);
        assert(position.x == 0, 'should stay at 0');
    }

    #[test]
    fn test_move_up_at_boundary() {
        let mut position = PositionTrait::new(1, 10, 0);
        position.move_in_direction(Direction::Up);
        assert(position.y == 0, 'should stay at 0');
    }

    #[test]
    fn test_direction_into_felt252() {
        let left: felt252 = Direction::Left.into();
        let right: felt252 = Direction::Right.into();
        let up: felt252 = Direction::Up.into();
        let down: felt252 = Direction::Down.into();

        assert(left == 1, 'wrong left value');
        assert(right == 2, 'wrong right value');
        assert(up == 3, 'wrong up value');
        assert(down == 4, 'wrong down value');
    }
}

