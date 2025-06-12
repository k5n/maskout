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
    log::debug!("Scanning script directory: {:?}", script_dir);
    file_system::ensure_dir_exists(&script_dir)?;
    file_system::scan_episode_list(&script_dir)
}

#[tauri::command]
async fn load_episode_script(
    handle: tauri::AppHandle,
    episode_id: String,
) -> Result<String, String> {
    let app_data_dir = handle
        .path()
        .app_data_dir()
        .map_err(|_| "Could not determine app data directory".to_string())?;
    let script_dir = file_system::get_script_dir(&app_data_dir)?;
    file_system::ensure_dir_exists(&script_dir)?;
    file_system::load_episode_script_file(&script_dir, &episode_id)
}

#[tauri::command]
async fn load_episode_data(handle: tauri::AppHandle, episode_id: String) -> Result<String, String> {
    let app_data_dir = handle
        .path()
        .app_data_dir()
        .map_err(|_| "Could not determine app data directory".to_string())?;
    let data_dir = file_system::get_episode_data_dir(&app_data_dir)?;
    file_system::ensure_dir_exists(&data_dir)?;
    file_system::load_episode_data_file(&data_dir, &episode_id)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_episode_list,
            load_episode_script,
            load_episode_data
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
