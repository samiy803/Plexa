use imessage_database::{
    tables::{
        messages::Message,
        table::{get_connection, Table},
    },
    util::{
        query_context::QueryContext,
        dirs::default_db_path,
    },
};
use regex::Regex;

use crate::utils::offset_hours_from_now;

#[tauri::command]
pub fn get_recent_codes() -> Result<Vec<String>, String> {
    let mut codes = Vec::new();
    let db = get_connection(&default_db_path()).map_err(|e| e.to_string())?;

    let mut context = QueryContext::default();
    context.start = offset_hours_from_now(24);

    println!("Getting messages from last 24 hours");
    let message_stream_res = Message::stream_rows(&db, &context);

    let mut statement = match message_stream_res {
        Ok(message_stream) => message_stream,
        Err(e) => {
            println!("Error getting message stream: {:?}", e);
            return Ok(codes);
        }
    };

    let messages_result = statement.query_map([], |row| Ok(Message::from_row(row)));

    let messages = match messages_result {
        Ok(messages) => messages,
        Err(e) => {
            println!("Error getting messages: {:?}", e);
            return Ok(codes);
        }
    };

    println!("Got messages, checking for codes");

    // re for 5,6,7 digit codes
    let re = Regex::new(r"\b\d{5,7}\b").unwrap();

    for message in messages {
        let mut msg = Message::extract(message).map_err(|e| e.to_string())?;

        if !msg.is_from_me() {
            let res = msg.generate_text(&db);
            match res {
                Ok(_) => {}
                Err(_) => {
                    println!("Found unserializable message, probably doesn't contain text");
                    continue;
                }
            }
            let text_option = msg.text;
            let text = match text_option {
                Some(text) => text,
                None => {
                    println!("Message doesn't contain text");
                    continue;
                }
            };
            let mut found = false;
            for code in re.find_iter(&text) {
                codes.push(
                    code.as_str().to_string() + "," + msg.handle_id.unwrap().to_string().as_str(),
                );
                found = true;
            }
            if found {
                println!("Found code: {}, {}", text, msg.handle_id.unwrap());
            }
        }
    }
    Ok(codes)
} 