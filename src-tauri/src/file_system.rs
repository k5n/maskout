use std::path::{Path, PathBuf};

/// ユーザーのスクリプト保存ディレクトリを取得する関数
pub fn get_script_dir(app_data_dir: &Path) -> Result<PathBuf, String> {
    let mut dir = app_data_dir.to_path_buf();
    dir.push("scripts");
    Ok(dir)
}

/// パース済みエピソード内容と進捗を含むJSONファイルの保存ディレクトリを取得する関数
pub fn get_episode_data_dir(app_data_dir: &Path) -> Result<PathBuf, String> {
    let mut dir = app_data_dir.to_path_buf();
    dir.push("data");
    Ok(dir)
}

/// 指定されたディレクトリが存在しなければ再帰的に作成する関数
pub fn ensure_dir_exists(dir: &Path) -> Result<(), String> {
    if !dir.exists() {
        std::fs::create_dir_all(dir)
            .map_err(|e| format!("failed to create dir '{}': {}", dir.display(), e))?;
    }
    Ok(())
}

/// 指定されたディレクトリをスキャンしてエピソードリストを返す関数
pub fn scan_episode_list(dir: &Path) -> Result<Vec<String>, String> {
    let mut episodes = Vec::new();
    let read_dir = std::fs::read_dir(dir).map_err(|e| format!("failed to read dir: {}", e))?;
    for entry in read_dir {
        let entry = entry.map_err(|e| format!("failed to read entry: {}", e))?;
        let path = entry.path();
        if path.is_file() {
            if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                episodes.push(name.to_string());
            }
        }
    }
    Ok(episodes)
}

/// 指定されたディレクトリとファイル名からスクリプトファイルの内容を読み込む関数
pub fn load_episode_script_file(dir: &Path, episode_id: &str) -> Result<String, String> {
    let mut file_path = dir.to_path_buf();
    file_path.push(episode_id);
    std::fs::read_to_string(&file_path)
        .map_err(|e| format!("failed to read script file '{}': {}", episode_id, e))
}

/// 指定されたディレクトリとエピソードIDからエピソードデータ(JSON)ファイルの内容を読み込む関数
pub fn load_episode_data_file(dir: &Path, episode_id: &str) -> Result<String, String> {
    // episode_id の拡張子有無や種類に関わらず、末尾の拡張子を除去して ".json" を付与
    let json_filename = match episode_id.rfind('.') {
        Some(idx) => format!("{}{}.json", &episode_id[..idx], ""),
        None => format!("{}.json", episode_id),
    };
    let mut file_path = dir.to_path_buf();
    file_path.push(json_filename);
    std::fs::read_to_string(&file_path).map_err(|e| {
        format!(
            "failed to read episode data file '{}': {}",
            file_path.display(),
            e
        )
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    use std::fs::File;
    use std::io::Write;
    use tempfile::tempdir;

    #[test]
    fn test_get_script_dir_returns_expected_path() {
        let app_data_dir = PathBuf::from("/mock/app/data/dir");
        let result = get_script_dir(&app_data_dir);
        assert!(result.is_ok());
        let script_dir = result.unwrap();
        assert_eq!(script_dir, PathBuf::from("/mock/app/data/dir/scripts"));
    }

    #[test]
    fn test_get_episode_data_dir_returns_expected_path() {
        let app_data_dir = PathBuf::from("/mock/app/data/dir");
        let result = get_episode_data_dir(&app_data_dir);
        assert!(result.is_ok());
        let script_dir = result.unwrap();
        assert_eq!(script_dir, PathBuf::from("/mock/app/data/dir/data"));
    }

    #[test]
    fn test_scan_episode_list_with_tempdir() {
        let dir = tempdir().unwrap(); // will be deleted automatically when it goes out of scope
        let filenames = ["episode001.txt", "episode002.txt", "episode003.txt"];
        for name in &filenames {
            let file_path = dir.path().join(name);
            let mut file = File::create(&file_path).unwrap();
            writeln!(file, "dummy content").unwrap();
        }

        let result = scan_episode_list(dir.path());
        assert!(result.is_ok());
        let mut episodes = result.unwrap();
        episodes.sort();
        let mut expected: Vec<String> = filenames.iter().map(|s| s.to_string()).collect();
        expected.sort();
        assert_eq!(episodes, expected);
    }

    #[test]
    fn test_load_episode_script_file_reads_file_content() {
        let dir = tempdir().unwrap();
        let episode_id = "test_episode.txt";
        let file_content = "Hello, this is a test script.";
        let file_path = dir.path().join(&episode_id);
        {
            let mut file = File::create(&file_path).unwrap();
            writeln!(file, "{}", file_content).unwrap();
        }

        // Remove trailing newline added by writeln!
        let expected_content = format!("{}\n", file_content);
        let result = load_episode_script_file(dir.path(), episode_id);
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), expected_content);
    }

    #[test]
    fn test_load_episode_script_file_returns_error_for_missing_file() {
        let dir = tempdir().unwrap();
        let episode_id = "not_exist.txt";
        let result = load_episode_script_file(dir.path(), episode_id);
        assert!(result.is_err());
        let err = result.err().unwrap();
        assert!(err.contains("failed to read script file"));
    }

    #[test]
    fn test_load_episode_data_file_reads_json_with_txt_extension() {
        let dir = tempdir().unwrap();
        let episode_id = "episode01.txt";
        let json_filename = "episode01.json";
        let json_content = r#"{"test":true}"#;
        let file_path = dir.path().join(json_filename);
        {
            let mut file = File::create(&file_path).unwrap();
            write!(file, "{}", json_content).unwrap();
        }
        let result = load_episode_data_file(dir.path(), episode_id);
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), json_content);
    }

    #[test]
    fn test_load_episode_data_file_reads_json_with_no_extension() {
        let dir = tempdir().unwrap();
        let episode_id = "episode01";
        let json_filename = "episode01.json";
        let json_content = r#"{"test":123}"#;
        let file_path = dir.path().join(json_filename);
        {
            let mut file = File::create(&file_path).unwrap();
            write!(file, "{}", json_content).unwrap();
        }
        let result = load_episode_data_file(dir.path(), episode_id);
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), json_content);
    }

    #[test]
    fn test_load_episode_data_file_reads_json_with_custom_extension() {
        let dir = tempdir().unwrap();
        let episode_id = "episode01.custom";
        let json_filename = "episode01.json";
        let json_content = r#"{"foo":"bar"}"#;
        let file_path = dir.path().join(json_filename);
        {
            let mut file = File::create(&file_path).unwrap();
            write!(file, "{}", json_content).unwrap();
        }
        let result = load_episode_data_file(dir.path(), episode_id);
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), json_content);
    }

    #[test]
    fn test_load_episode_data_file_returns_error_for_missing_file() {
        let dir = tempdir().unwrap();
        let episode_id = "not_exist.txt";
        let result = load_episode_data_file(dir.path(), episode_id);
        assert!(result.is_err());
        let err = result.err().unwrap();
        assert!(err.contains("failed to read episode data file"));
    }
}
