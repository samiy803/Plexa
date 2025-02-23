use std::sync::OnceLock;
use std::thread::{self, JoinHandle};
use std::sync::mpsc;
use std::path::Path;
use notify::{Event, RecursiveMode, Result as NotifyResult, Watcher};
use std::thread::sleep;

use crate::utils::permission_check;
use crate::message_handler::get_recent_codes;
use crate::constants::WAL_PATH;

static WATCHER_HANDLE: OnceLock<JoinHandle<()>> = OnceLock::new();

pub fn init_file_watcher() {
    let t: thread::JoinHandle<_> = thread::spawn(move || {
        while !permission_check() {
            println!("Waiting for file access");
            sleep(std::time::Duration::from_secs(1));
        }

        let (tx, rx) = mpsc::channel::<NotifyResult<Event>>();

        let mut watcher = notify::PollWatcher::new(
            move |res| {
                tx.send(res).unwrap();
            },
            notify::Config::default(),
        )
        .unwrap();

        println!("Watching file: {}", &*WAL_PATH);
        watcher
            .watch(Path::new(&*WAL_PATH), RecursiveMode::NonRecursive)
            .unwrap();

        // block until we receive an event
        loop {
            if let Err(e) = watcher.poll() {
                println!("Error polling: {:?}", e);
            }
            match rx.try_recv() {
                Ok(res) => match res {
                    Ok(event) => {
                        println!("Received file event: {:?}", event);
                        if let Err(e) = get_recent_codes() {
                            println!("Error getting recent codes: {:?}", e);
                        }
                    }
                    Err(e) => {
                        println!("Error receiving file event: {:?}", e);
                    }
                },
                Err(mpsc::TryRecvError::Empty) => {
                    // No new events, continue polling
                }
                Err(mpsc::TryRecvError::Disconnected) => {
                    println!("Channel disconnected");
                    break;
                }
            }
        }

        println!("File watcher thread exited");
    });

    if let Err(_) = WATCHER_HANDLE.set(t) {
        println!("Error setting watcher handle");
    }
} 