// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{path, thread};

use tauri::{AppHandle, CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, WindowEvent};
use tauri_plugin_positioner::{Position, WindowExt};
use notify::{Watcher, RecursiveMode};
use std::thread::sleep;
use std::path::Path;
use std::fs::File;
use std::io::Read;
use std::env;
use std::sync::LazyLock;


static WAL_PATH: LazyLock<String> = LazyLock::new( || {env::var("HOME").unwrap() + "/Library/Messages/chat.db-wal" });

fn can_access_file(path: &str) -> bool {
    let path = path::Path::new(path);
    // try to read first byte of the file
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
fn permission_check() -> bool {
    if env::var("SKIP_PERMISSION_CHECK").is_ok() {
        println!("Skipping permission check");
        return true;
    }
    can_access_file(&*WAL_PATH)
}

#[tauri::command]
fn init_file_watcher() {
    thread::spawn(move || {
        while !permission_check() {
            println!("Waiting for file access");
            sleep(std::time::Duration::from_secs(1));
        };
        let mut watcher = notify::recommended_watcher(|res| {
            match res {
                Ok(event) => {
                    println!("event: {:?}", event);
                }
                Err(e) => {
                    println!("watch error: {:?}", e);
                }
            }
        }).unwrap();
        watcher.watch(Path::new(&*WAL_PATH), RecursiveMode::NonRecursive).unwrap();
    });
}

#[tauri::command]
fn open_system_settings() {
    let _ = std::process::Command::new("open")
        .arg("x-apple.systempreferences:com.apple.preference.security?Privacy_AllFiles")
        .output();
}

fn handle_system_tray_event(app: &AppHandle, event: SystemTrayEvent) {
    tauri_plugin_positioner::on_tray_event(app, &event);
    match event {
        SystemTrayEvent::LeftClick {
            position: _,
            size: _,
            ..
        } => {
            let window = app.get_window("main").unwrap();
            let _ = window.move_window(Position::TrayCenter);

            if window.is_visible().unwrap() {
                window.hide().unwrap();
            } else {
                window.show().unwrap();
                window.set_focus().unwrap();
            }
        }
        SystemTrayEvent::RightClick {
            position: _,
            size: _,
            ..
        } => {
            println!("system tray received a right click");
        }
        SystemTrayEvent::DoubleClick {
            position: _,
            size: _,
            ..
        } => {
            println!("system tray received a double click");
        }
        SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
            "quit" => {
                std::process::exit(0);
            }
            "hide" => {
                let window = app.get_window("main").unwrap();
                window.hide().unwrap();
            }
            _ => {}
        },
        _ => {}
    }

}

fn main() {
    let quit = CustomMenuItem::new("quit", "Quit").accelerator("Cmd+Q");
    let tray_menu = SystemTrayMenu::new().add_item(quit);
    tauri::Builder::default()
        .setup(|app| {
            Ok(app.set_activation_policy(tauri::ActivationPolicy::Accessory))
        })
        .plugin(tauri_plugin_positioner::init())
        .system_tray(SystemTray::new().with_menu(tray_menu))
        .on_system_tray_event(handle_system_tray_event)
        .on_window_event(|event| match event.event() {
            WindowEvent::Focused(is_focused) => {
                if !is_focused {
                    event.window().hide().unwrap();
                }
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![permission_check, init_file_watcher, open_system_settings])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
