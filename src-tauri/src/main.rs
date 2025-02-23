// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod file_watcher;
mod message_handler;
mod system_tray;
mod utils;
mod constants;

use std::sync::OnceLock;
use tauri::AppHandle;

pub static APP_HANDLE: OnceLock<AppHandle> = OnceLock::new();

fn main() {
    let quit = tauri::CustomMenuItem::new("quit", "Quit").accelerator("Cmd+Q");
    let tray_menu = tauri::SystemTrayMenu::new().add_item(quit);

    tauri::Builder::default()
        .setup(|app| {
            file_watcher::init_file_watcher();
            let _ = message_handler::get_recent_codes();
            APP_HANDLE.set(app.handle()).unwrap();
            Ok(app.set_activation_policy(tauri::ActivationPolicy::Accessory))
        })
        .plugin(tauri_plugin_positioner::init())
        .system_tray(tauri::SystemTray::new().with_menu(tray_menu))
        .on_system_tray_event(system_tray::handle_system_tray_event)
        .on_window_event(|event| match event.event() {
            tauri::WindowEvent::Focused(is_focused) => {
                if !is_focused {
                    event.window().hide().unwrap();
                }
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            utils::permission_check,
            utils::open_system_settings,
            message_handler::get_recent_codes
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

