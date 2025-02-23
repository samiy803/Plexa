use std::sync::LazyLock;

pub static WAL_PATH: LazyLock<String> = LazyLock::new(|| std::env::var("HOME").unwrap() + "/Library/Messages/chat.db-wal"); 