import {
  loadEpisodeIds,
  loadEpisodeProgress,
  saveEpisodeContent,
  saveEpisodeProgress,
} from '$lib/services/file_system';
import { initializeEpisodeProgress } from '$lib/services/learning';
import { parseEpisodeContent } from '$lib/services/parse';
import type { EpisodeProgress } from '$lib/types';
import { error, trace } from '@tauri-apps/plugin-log';

export async function importScript(
  scriptText: string,
  episodeId: string,
  chunkSize: number
): Promise<EpisodeProgress> {
  trace(`Importing script for episode: ${episodeId}`);
  const parsedContent = await parseEpisodeContent(scriptText, episodeId, chunkSize);
  await saveEpisodeContent(parsedContent);
  const progress = initializeEpisodeProgress(parsedContent);
  await saveEpisodeProgress(progress);
  return progress;
}

export async function loadEpisodeProgresses(): Promise<EpisodeProgress[]> {
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
  return progresses;
}
