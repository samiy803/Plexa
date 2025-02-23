use std::fs::File;
use std::io::Read;
use std::path;
use chrono::{Duration, Utc};
use imessage_database::util::dates::{get_offset, TIMESTAMP_FACTOR};
use crate::constants::WAL_PATH;

#[tauri::command]
pub fn permission_check() -> bool {
    if std::env::var("SKIP_PERMISSION_CHECK").is_ok() {
        println!("Skipping permission check");
        return true;
    }
    can_access_file(&*WAL_PATH)
}

pub fn can_access_file(path: &str) -> bool {
    let path = path::Path::new(path);
    match File::open(path) {
        Ok(mut file) => {
            let mut buffer = [0; 1];
            match file.read(&mut buffer) {
                Ok(_) => true,
                Err(e) => {
                    println!("Error reading file: {:?}", e);
                    false
                }
            }
        }
        Err(e) => {
            println!("Error opening file: {:?}", e);
            false
        }
    }
}

#[tauri::command]
pub fn open_system_settings() {
    let _ = std::process::Command::new("open")
        .arg("x-apple.systempreferences:com.apple.preference.security?Privacy_AllFiles")
        .output();
}

pub fn offset_hours_from_now(offset_hours: i64) -> Option<i64> {
    let now = Utc::now();
    let past_time = now - Duration::hours(offset_hours);
    let stamp = past_time.timestamp_nanos_opt();

    match stamp {
        Some(stamp) => Some(stamp - (get_offset() * TIMESTAMP_FACTOR)),
        None => None,
    }
} 