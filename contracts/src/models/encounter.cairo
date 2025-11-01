#[derive(Serde, Copy, Drop, PartialEq, Debug)]
pub enum Encounter {
    Werewolf,
    Vampire,
    FreeHealth,
    AttackPoints,
    ReducedDamage,
    FreeAttack,
    FreeFlee,
    FreeRoam,
}

#[dojo::model]
#[derive(Copy, Drop, Serde, Debug)]
pub struct CurrentEncounter {
    #[key]
    pub game_id: u64,
    pub encounter_type: u8 // Stored as u8, converted to/from Encounter enum
}

#[generate_trait]
pub impl CurrentEncounterImpl of CurrentEncounterTrait {
    fn new(game_id: u64, encounter: Encounter) -> CurrentEncounter {
        CurrentEncounter { game_id, encounter_type: encounter.into() }
    }

    fn get_encounter(self: CurrentEncounter) -> Encounter {
        self.encounter_type.into()
    }

    fn is_beast_encounter(self: CurrentEncounter) -> bool {
        let encounter: Encounter = self.encounter_type.into();
        match encounter {
            Encounter::Werewolf | Encounter::Vampire => true,
            _ => false,
        }
    }

    fn is_gift_encounter(self: CurrentEncounter) -> bool {
        let encounter: Encounter = self.encounter_type.into();
        match encounter {
            Encounter::FreeHealth | Encounter::AttackPoints | Encounter::ReducedDamage |
            Encounter::FreeAttack | Encounter::FreeFlee => true,
            _ => false,
        }
    }

    fn is_free_roam(self: CurrentEncounter) -> bool {
        let encounter: Encounter = self.encounter_type.into();
        match encounter {
            Encounter::FreeRoam => true,
            _ => false,
        }
    }

    fn is_werewolf(self: CurrentEncounter) -> bool {
        self.encounter_type == 1
    }

    fn is_vampire(self: CurrentEncounter) -> bool {
        self.encounter_type == 2
    }
}

impl EncounterIntoU8 of Into<Encounter, u8> {
    fn into(self: Encounter) -> u8 {
        match self {
            Encounter::Werewolf => 1,
            Encounter::Vampire => 2,
            Encounter::FreeHealth => 3,
            Encounter::AttackPoints => 4,
            Encounter::ReducedDamage => 5,
            Encounter::FreeAttack => 6,
            Encounter::FreeFlee => 7,
            Encounter::FreeRoam => 8,
        }
    }
}

impl U8IntoEncounter of Into<u8, Encounter> {
    fn into(self: u8) -> Encounter {
        if self == 1 {
            Encounter::Werewolf
        } else if self == 2 {
            Encounter::Vampire
        } else if self == 3 {
            Encounter::FreeHealth
        } else if self == 4 {
            Encounter::AttackPoints
        } else if self == 5 {
            Encounter::ReducedDamage
        } else if self == 6 {
            Encounter::FreeAttack
        } else if self == 7 {
            Encounter::FreeFlee
        } else {
            Encounter::FreeRoam
        }
    }
}

#[cfg(test)]
mod tests {
    use super::{CurrentEncounterTrait, Encounter};

    #[test]
    fn test_encounter_werewolf() {
        let encounter = CurrentEncounterTrait::new(1, Encounter::Werewolf);
        assert(encounter.is_beast_encounter(), 'should be beast encounter');
        assert(!encounter.is_gift_encounter(), 'should not be gift');
        assert(!encounter.is_free_roam(), 'should not be free roam');
        assert(encounter.is_werewolf(), 'should be werewolf');
        assert(!encounter.is_vampire(), 'should not be vampire');
    }

    #[test]
    fn test_encounter_vampire() {
        let encounter = CurrentEncounterTrait::new(2, Encounter::Vampire);
        assert(encounter.is_beast_encounter(), 'should be beast encounter');
        assert(!encounter.is_gift_encounter(), 'should not be gift');
        assert(!encounter.is_free_roam(), 'should not be free roam');
        assert(!encounter.is_werewolf(), 'should not be werewolf');
        assert(encounter.is_vampire(), 'should be vampire');
    }

    #[test]
    fn test_encounter_gift() {
        let encounter = CurrentEncounterTrait::new(3, Encounter::FreeHealth);
        assert(!encounter.is_beast_encounter(), 'should not be beast');
        assert(encounter.is_gift_encounter(), 'should be gift encounter');
        assert(!encounter.is_free_roam(), 'should not be free roam');
        assert(encounter.get_encounter() == Encounter::FreeHealth, 'should be free health');
    }

    #[test]
    fn test_encounter_free_roam() {
        let encounter = CurrentEncounterTrait::new(4, Encounter::FreeRoam);
        assert(!encounter.is_beast_encounter(), 'should not be beast');
        assert(!encounter.is_gift_encounter(), 'should not be gift');
        assert(encounter.is_free_roam(), 'should be free roam');
    }

    #[test]
    fn test_encounter_conversions() {
        let werewolf: u8 = Encounter::Werewolf.into();
        let vampire: u8 = Encounter::Vampire.into();
        let health: u8 = Encounter::FreeHealth.into();
        let attack: u8 = Encounter::AttackPoints.into();
        let damage: u8 = Encounter::ReducedDamage.into();
        let free_attack: u8 = Encounter::FreeAttack.into();
        let free_flee: u8 = Encounter::FreeFlee.into();
        let free_roam: u8 = Encounter::FreeRoam.into();

        assert(werewolf == 1, 'wrong werewolf value');
        assert(vampire == 2, 'wrong vampire value');
        assert(health == 3, 'wrong free health value');
        assert(attack == 4, 'wrong attack points value');
        assert(damage == 5, 'wrong reduced damage value');
        assert(free_attack == 6, 'wrong free attack value');
        assert(free_flee == 7, 'wrong free flee value');
        assert(free_roam == 8, 'wrong free roam value');

        // Test round-trip conversion
        let encounter_back: Encounter = werewolf.into();
        assert(encounter_back == Encounter::Werewolf, 'conversion failed');
    }
}
