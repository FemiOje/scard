#[derive(Serde, Copy, Drop, PartialEq, Debug)]
pub enum Beast {
    Werewolf,
    Vampire,
}

#[dojo::model]
#[derive(Copy, Drop, Serde, Debug)]
pub struct BeastEncounter {
    #[key]
    pub game_id: u64,
    pub beast_type: u8, // Stored as u8, converted to/from Beast enum
    pub attack_points: u32,
    pub damage_points: u32,
}

#[generate_trait]
pub impl BeastEncounterImpl of BeastEncounterTrait {
    fn new(game_id: u64, beast_type: Beast, attack_points: u32, damage_points: u32) -> BeastEncounter {
        BeastEncounter {
            game_id,
            beast_type: beast_type.into(),
            attack_points,
            damage_points,
        }
    }

    fn get_beast_type(self: BeastEncounter) -> Beast {
        self.beast_type.into()
    }

    fn is_werewolf(self: BeastEncounter) -> bool {
        self.beast_type == 1
    }

    fn is_vampire(self: BeastEncounter) -> bool {
        self.beast_type == 2
    }
}

impl BeastIntoU8 of Into<Beast, u8> {
    fn into(self: Beast) -> u8 {
        match self {
            Beast::Werewolf => 1,
            Beast::Vampire => 2,
        }
    }
}

impl U8IntoBeast of Into<u8, Beast> {
    fn into(self: u8) -> Beast {
        if self == 1 {
            Beast::Werewolf
        } else {
            Beast::Vampire
        }
    }
}

#[cfg(test)]
mod tests {
    use super::{Beast, BeastEncounterTrait};

    #[test]
    fn test_beast_encounter_werewolf() {
        let encounter = BeastEncounterTrait::new(1, Beast::Werewolf, 25, 15);
        assert(encounter.game_id == 1, 'wrong game_id');
        assert(encounter.is_werewolf(), 'should be werewolf');
        assert(!encounter.is_vampire(), 'should not be vampire');
        assert(encounter.attack_points == 25, 'wrong attack');
        assert(encounter.damage_points == 15, 'wrong damage');
        assert(encounter.get_beast_type() == Beast::Werewolf, 'wrong beast type');
    }

    #[test]
    fn test_beast_encounter_vampire() {
        let encounter = BeastEncounterTrait::new(2, Beast::Vampire, 30, 20);
        assert(encounter.game_id == 2, 'wrong game_id');
        assert(!encounter.is_werewolf(), 'should not be werewolf');
        assert(encounter.is_vampire(), 'should be vampire');
        assert(encounter.attack_points == 30, 'wrong attack');
        assert(encounter.damage_points == 20, 'wrong damage');
        assert(encounter.get_beast_type() == Beast::Vampire, 'wrong beast type');
    }

    #[test]
    fn test_beast_conversions() {
        let werewolf: u8 = Beast::Werewolf.into();
        let vampire: u8 = Beast::Vampire.into();
        assert(werewolf == 1, 'wrong werewolf value');
        assert(vampire == 2, 'wrong vampire value');

        // Test round-trip conversion
        let beast_back: Beast = werewolf.into();
        assert(beast_back == Beast::Werewolf, 'conversion failed');
    }
}
