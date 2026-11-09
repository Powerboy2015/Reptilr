// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

//Tells us which files to add.
mod entities;
mod interface;
mod infrastructure;
mod application;

use std::fs;
use std::str::FromStr;
use std::sync::Arc;
use sqlx::sqlite::{SqliteConnectOptions, SqlitePoolOptions};
use sqlx::SqlitePool;
use tauri::{App, Manager};

// tells which functions should be used.
use crate::application::ReptileService;
use crate::infrastructure::SqliteReptileRepository;
use crate::interface::{get_growth_entries, get_reptile_list, add_reptile};

struct Ctx{
    reptile_service: application::ReptileService,
}

// Main entry point
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {

    tauri::Builder::default()
        .setup(|app| {
            tauri::async_runtime::block_on(async {
                let db_url = get_db_url(app);
                let db = setup_database(&db_url).await;

                let repo = SqliteReptileRepository::new(db.clone());
                let service = ReptileService::new(Arc::new(repo));

                let ctx = Ctx{ reptile_service: service };

                app.manage(ctx);
            });
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_reptile_list, get_growth_entries, add_reptile])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


/// Uses the tauri app object to get the database directory and returns it.
fn get_db_url(app: &mut App) -> String {
    let mut path = app.path().app_data_dir().unwrap();

    fs::create_dir_all(&path).unwrap();

    path.push("reptilebase.db");

    format!("sqlite:{}", path.to_string_lossy())
}


/// Connects to a sqlite database based on the given db_path
/// and migrates all changes.
/// return the pool that's connected to said database
async fn setup_database(db_path: &str) -> SqlitePool {
    let options = SqliteConnectOptions::from_str(db_path)
        .unwrap()
        .create_if_missing(true);

    let pool = SqlitePoolOptions::new()
        .connect_with(options)
        .await
        .unwrap();

    sqlx::migrate!("../src-tauri/migrations").run(&pool).await.unwrap();

    pool
}