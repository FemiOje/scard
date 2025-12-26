// SPDX-License-Identifier: MIT

#[dojo::contract]
mod game_token_systems {
    use dojo::model::ModelStorage;
    use dojo::world::{WorldStorage};
    use game_components_minigame::interface::IMinigameTokenData;
    use game_components_minigame::minigame::MinigameComponent;
    use openzeppelin_introspection::src5::SRC5Component;
    use scard::constants::DEFAULT_NS;
    use scard::models::Player;
    use starknet::ContractAddress;

    // Components
    component!(path: MinigameComponent, storage: minigame, event: MinigameEvent);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);

    #[abi(embed_v0)]
    impl MinigameImpl = MinigameComponent::MinigameImpl<ContractState>;
    impl MinigameInternalImpl = MinigameComponent::InternalImpl<ContractState>;

    #[abi(embed_v0)]
    impl SRC5Impl = SRC5Component::SRC5Impl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        minigame: MinigameComponent::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        MinigameEvent: MinigameComponent::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
    }

    /// @title Dojo Init
    /// @notice Initializes the game token contract
    /// @dev This is the constructor for the contract. It is called once when the contract is
    /// deployed.
    ///
    /// @param creator_address: the address of the creator of the game
    /// @param denshokan_address: the address of the denshokan contract
    /// @param renderer_address: optional renderer address, defaults to 'renderer_systems' if None
    fn dojo_init(
        ref self: ContractState,
        creator_address: ContractAddress,
        denshokan_address: ContractAddress,
        renderer_address: Option<ContractAddress>,
    ) {
        let mut _world: WorldStorage = self.world(@DEFAULT_NS());

        // Use provided renderer address or default to 'renderer_systems'
        // let final_renderer_address = match renderer_address {
        //     Option::Some(addr) => addr,
        //     Option::None => {
        //         let (default_renderer, _) = world.dns(@"renderer_systems").unwrap();
        //         default_renderer
        //     },
        // };

        self
            .minigame
            .initializer(
                creator_address,
                "Scar'd", // name
                "Game jam submission for Dojo Game Jam Spooky Edition", // description
                "jinius", // by
                "jinius", // publisher
                "Dungeon crawler", // genre
                "https://scard.gg/favicon.png", // image
                Option::Some("#FFFFFF"), // color
                Option::None, // client_url
                Option::None, // renderer
                Option::None, // settings_address
                Option::None, // objectives_address
                denshokan_address,
            );
    }

    // ------------------------------------------ //
    // ------------ Minigame Component ---------- //
    // ------------------------------------------ //
    #[abi(embed_v0)]
    impl GameTokenDataImpl of IMinigameTokenData<ContractState> {
        fn score(self: @ContractState, token_id: u64) -> u32 {
            let world = self.world(@DEFAULT_NS());
            let player: Player = world.read_model(token_id);

            player.health
        }

        fn game_over(self: @ContractState, token_id: u64) -> bool {
            let world = self.world(@DEFAULT_NS());
            let player: Player = world.read_model(token_id);

            player.health == 0
        }
    }
}
