import { loadEpisodeContent, loadEpisodeProgress } from '$lib/infrastructure/file_system';
import type { EpisodeContent, EpisodeProgress } from '$lib/types';
import { error } from '@tauri-apps/plugin-log';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }: { params: { episodeId: string } }) => {
  const episodeId = params.episodeId;
  let content: EpisodeContent | null = null;
  let progress: EpisodeProgress | null = null;
  try {
    content = await loadEpisodeContent(episodeId);
    progress = await loadEpisodeProgress(episodeId);
  } catch (err) {
    error(`Failed to load episode data: ${err}`);
    // TODO: Handle error gracefully, e.g., show a user-friendly message
  }
  return {
    content,
    progress,
  };
};
