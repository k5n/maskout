// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use tauri::Manager;

mod file_system;

#[tauri::command]
async fn get_episode_list(handle: tauri::AppHandle) -> Result<Vec<String>, String> {
    let app_data_dir = handle
        .path()
        .app_data_dir()
        .map_err(|_| "Could not determine app data directory".to_string())?;
    let script_dir = file_system::get_script_dir(&app_data_dir)?;
    file_system::scan_episode_list(&script_dir)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_episode_list])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
