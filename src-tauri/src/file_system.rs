use std::path::{Path, PathBuf};

/// ユーザーのスクリプト保存ディレクトリを取得する関数
pub fn get_script_dir(app_data_dir: &PathBuf) -> Result<PathBuf, String> {
    let mut base = app_data_dir.clone();
    base.push("scripts");
    Ok(base)
}

/// 指定されたディレクトリをスキャンしてエピソードリストを返す関数
pub fn scan_episode_list(dir: &Path) -> Result<Vec<String>, String> {
    // TODO: 実装
    unimplemented!()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_script_dir_returns_expected_path() {
        let app_data_dir = PathBuf::from("/mock/app/data/dir");
        let result = get_script_dir(&app_data_dir);
        assert!(result.is_ok());
        let script_dir = result.unwrap();
        assert_eq!(script_dir, PathBuf::from("/mock/app/data/dir/scripts"));
    }
}
