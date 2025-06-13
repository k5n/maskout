import { trace, error } from '@tauri-apps/plugin-log';
import { exists, BaseDirectory, mkdir, readDir } from '@tauri-apps/plugin-fs';
import type { EpisodeProgress, EpisodeContent } from '$lib/types';

const DATA_DIR = 'data';

export async function loadEpisodes(): Promise<string[]> {
  trace('Loading episode list...');
  try {
    await ensureDirExists(DATA_DIR, BaseDirectory.AppLocalData);
    const episodes = await scanEpisodeList(BaseDirectory.AppLocalData);
    trace(`Loaded episodes: ${episodes.length}`);
    return episodes;
  } catch (err) {
    error(`Failed to load episodes: ${err}`);
    throw new Error('Could not load episodes. Please try again later.');
  }
}

export async function loadEpisodeContent(episodeId: string): Promise<EpisodeContent> {
  trace(`Loading script for episode: ${episodeId}`);
  try {
    throw new Error('Not implemented');
  } catch (err) {
    error(`Failed to load episode script (${episodeId}): ${err}`);
    throw new Error('Could not load episode script. Please try again later.');
  }
}

export async function saveEpisodeContent(episodeContent: EpisodeContent): Promise<void> {
  trace(`Saving parsed script content for episode: ${episodeContent.episodeId}`);
  try {
    throw new Error('Not implemented');
  } catch (err) {
    error(`Failed to save episode content (${episodeContent.episodeId}): ${err}`);
    throw new Error('Could not save episode content. Please try again later.');
  }
}

export async function loadEpisodeProgress(episodeId: string): Promise<EpisodeProgress> {
  trace(`Loading progress for episode: ${episodeId}`);
  try {
    throw new Error('Not implemented');
  } catch (err) {
    error(`Failed to load episode progress (${episodeId}): ${err}`);
    throw new Error('Could not load episode progress. Please try again later.');
  }
}

export async function saveEpisodeProgress(episodeProgress: EpisodeProgress): Promise<void> {
  trace(`Saving progress for episode: ${episodeProgress.episodeId}`);
  try {
    throw new Error('Not implemented');
  } catch (err) {
    error(`Failed to save episode progress (${episodeProgress.episodeId}): ${err}`);
    throw new Error('Could not save episode progress. Please try again later.');
  }
}

export async function speak(text: string): Promise<void> {
  trace('Starting text-to-speech...');
  try {
    throw new Error('Not implemented');
  } catch (err) {
    error(`Text-to-speech failed: ${err}`);
    throw new Error('Text-to-speech failed. Please try again later.');
  }
}

// /**
//  * ユーザーのスクリプト保存ディレクトリのパスを取得
//  */
// export async function getScriptDir(baseDir: BaseDirectory): Promise<string>;

// /**
//  * パース済みエピソード内容と進捗を含むJSONファイルの保存ディレクトリのパスを取得
//  */
// export async function getEpisodeDataDir(baseDir: BaseDirectory): Promise<string>;

/**
 * 指定されたディレクトリが存在しなければ再帰的に作成
 */
export async function ensureDirExists(
  dirPath: string,
  baseDir = BaseDirectory.AppLocalData
): Promise<void> {
  if (!(await exists(dirPath, { baseDir }))) {
    trace(`Directory does not exist, creating: ${dirPath}`);
    await mkdir(dirPath, { recursive: true, baseDir });
  }
}

/**
 * ディレクトリをスキャンしてエピソードリストを返す
 */
export async function scanEpisodeList(baseDir = BaseDirectory.AppLocalData): Promise<string[]> {
  const dirPath = DATA_DIR;
  // ディレクトリが存在しなければ空配列を返す
  if (!(await exists(dirPath, { baseDir }))) {
    return [];
  }
  const entries = await readDir(dirPath, { baseDir });
  // ファイルのみを抽出し、ファイル名を返す
  const episodes = entries
    .filter((entry) => entry.isFile)
    .map((entry) => entry.name)
    .filter((name): name is string => typeof name === 'string');
  return episodes;
}

// /**
//  * 指定されたディレクトリとファイル名からスクリプトファイルの内容を読み込む
//  */
// export async function loadEpisodeScriptFile(
//   dirPath: string,
//   episodeId: string,
//   baseDir?: BaseDirectory
// ): Promise<string>;

// /**
//  * 指定されたディレクトリとエピソードIDからエピソードデータ(JSON)ファイルの内容を読み込む
//  */
// export async function loadEpisodeDataFile(
//   dirPath: string,
//   episodeId: string,
//   baseDir = BaseDirectory.AppLocalData
// ): Promise<string>;
