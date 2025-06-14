import type { EpisodeContent, EpisodeProgress } from '$lib/types';
import {
  BaseDirectory,
  exists,
  mkdir,
  readDir,
  readTextFile,
  writeTextFile,
} from '@tauri-apps/plugin-fs';
import { error, trace } from '@tauri-apps/plugin-log';

const EPISODE_DIR = 'episodes';
const PROGRESS_DIR = 'progress';

export async function loadEpisodeIds(): Promise<string[]> {
  trace('Loading episode list...');
  try {
    await ensureDirExists(EPISODE_DIR, BaseDirectory.AppLocalData);
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
    await ensureDirExists(EPISODE_DIR, BaseDirectory.AppLocalData);
    const filePath = getContentJsonFilePath(episodeContent.episodeId);
    const json = JSON.stringify(episodeContent, null, 2);
    await writeTextFile(filePath, json, { baseDir: BaseDirectory.AppLocalData });
  } catch (err) {
    error(`Failed to save episode content (${episodeContent.episodeId}): ${err}`);
    throw new Error('Could not save episode content. Please try again later.');
  }
}

export async function loadEpisodeProgress(episodeId: string): Promise<EpisodeProgress> {
  trace(`Loading progress for episode: ${episodeId}`);
  try {
    const filePath = getProgressJsonFilePath(episodeId);
    const existsFile = await exists(filePath, { baseDir: BaseDirectory.AppLocalData });
    if (!existsFile) {
      throw new Error('Progress file not found');
    }
    const json = await readTextFile(filePath, { baseDir: BaseDirectory.AppLocalData });
    return JSON.parse(json) as EpisodeProgress;
  } catch (err) {
    error(`Failed to load episode progress (${episodeId}): ${err}`);
    throw new Error('Could not load episode progress. Please try again later.');
  }
}

export async function saveEpisodeProgress(episodeProgress: EpisodeProgress): Promise<void> {
  trace(`Saving progress for episode: ${episodeProgress.episodeId}`);
  try {
    await ensureDirExists(PROGRESS_DIR, BaseDirectory.AppLocalData);
    const filePath = getProgressJsonFilePath(episodeProgress.episodeId);
    const json = JSON.stringify(episodeProgress, null, 2);
    await writeTextFile(filePath, json, { baseDir: BaseDirectory.AppLocalData });
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

/**
 * エピソードIDから保存用JSONファイル名を生成
 * 例: "friends_s01e01.txt" → "friends_s01e01.json"
 */
function getJsonFileName(episodeId: string): string {
  const idx = episodeId.lastIndexOf('.');
  if (idx !== -1) {
    return episodeId.substring(0, idx) + '.json';
  } else {
    return episodeId + '.json';
  }
}

function getContentJsonFilePath(episodeId: string): string {
  const fileName = getJsonFileName(episodeId);
  return `${EPISODE_DIR}/${fileName}`;
}

function getProgressJsonFilePath(episodeId: string): string {
  const fileName = getJsonFileName(episodeId);
  return `${PROGRESS_DIR}/${fileName}`;
}

/**
 * 指定されたディレクトリが存在しなければ再帰的に作成
 */
async function ensureDirExists(
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
async function scanEpisodeList(baseDir = BaseDirectory.AppLocalData): Promise<string[]> {
  const dirPath = EPISODE_DIR;
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
