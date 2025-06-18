import {
  loadEpisodeIds,
  loadEpisodeProgress,
  saveEpisodeContent,
  saveEpisodeProgress,
} from '$lib/infrastructure/file_system';
import { sha256Hex } from '$lib/services/hash';
import { initializeEpisodeProgress } from '$lib/services/learning';
import { parseEpisodeContent } from '$lib/services/parse';
import { episodeListStore } from '$lib/stores/episodeListStore.svelte';
import type { EpisodeProgress } from '$lib/types';
import { error, trace } from '@tauri-apps/plugin-log';

/**
 * スクリプトテキストをインポートし、EpisodeProgressを返す。
 * - 先頭行が `# ` で始まる場合はタイトルとして抽出。
 * - ハッシュ値をepisodeIdとして利用。
 */
export async function importScript(scriptText: string, chunkSize: number): Promise<void> {
  const episodeId = await sha256Hex(scriptText);
  // 重複チェック
  const existingIds = await loadEpisodeIds();
  if (existingIds.includes(episodeId)) {
    throw new Error('同じ内容のエピソードは既にインポートされています');
  }
  const parsedContent = await parseEpisodeContent(scriptText, episodeId, chunkSize);
  await saveEpisodeContent(parsedContent);
  const progress = initializeEpisodeProgress(parsedContent);
  await saveEpisodeProgress(progress);
  episodeListStore.addEpisode(progress);
}

export async function loadEpisodeProgresses(): Promise<void> {
  trace('Loading all episode progresses...');
  const episodes = await loadEpisodeIds();
  const progresses: EpisodeProgress[] = [];
  for (const episodeId of episodes) {
    try {
      const progress = await loadEpisodeProgress(episodeId);
      progresses.push(progress);
    } catch (err) {
      error(`Failed to load progress for episode ${episodeId}: ${err}`);
    }
  }
  episodeListStore.setEpisodes(progresses);
}
