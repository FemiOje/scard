pub mod systems {
    pub mod game {
        pub mod contracts;
        pub mod tests;
    }
    pub mod game_token {
        pub mod contracts;
        pub mod tests;
    }
    pub mod renderer {
        pub mod contracts;
        pub mod tests;
    }
}

pub mod constants;

pub mod libs {
    pub mod encounter;
}

pub mod models;

pub mod tests {
    mod test_world;
}
