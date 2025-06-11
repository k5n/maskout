use std::path::{Path, PathBuf};

/// ユーザーのスクリプト保存ディレクトリを取得する関数
pub fn get_script_dir(app_data_dir: &PathBuf) -> Result<PathBuf, String> {
    let mut dir = app_data_dir.clone();
    dir.push("scripts");
    Ok(dir)
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
}
