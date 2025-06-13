// src/lib/api.ts
import { invoke } from '@tauri-apps/api/core';
import { trace, error } from '@tauri-apps/plugin-log';

export async function loadEpisodes(): Promise<string[]> {
  trace('Loading episode list...');
  try {
    return await invoke('get_episode_list');
  } catch (err) {
    error(`Failed to load episodes: ${err}`);
    throw new Error('Could not load episodes. Please try again later.');
  }
}

export async function loadEpisodeScript(episodeId: string): Promise<string> {
  trace(`Loading script for episode: ${episodeId}`);
  try {
    return await invoke('load_episode_script', { episodeId });
  } catch (err) {
    error(`Failed to load episode script (${episodeId}): ${err}`);
    throw new Error('Could not load episode script. Please try again later.');
  }
}

export async function loadEpisodeProgress(episodeId: string): Promise<string> {
  trace(`Loading progress for episode: ${episodeId}`);
  try {
    return await invoke('load_episode_data', { episodeId });
  } catch (err) {
    error(`Failed to load episode progress (${episodeId}): ${err}`);
    throw new Error('Could not load episode progress. Please try again later.');
  }
}

export async function saveEpisodeProgress(episodeId: string, episodeData: string): Promise<void> {
  trace(`Saving progress for episode: ${episodeId}`);
  try {
    await invoke('save_episode_data', { episodeId, episodeData });
  } catch (err) {
    error(`Failed to save episode progress (${episodeId}): ${err}`);
    throw new Error('Could not save episode progress. Please try again later.');
  }
}

export async function speak(text: string): Promise<void> {
  trace('Starting text-to-speech...');
  try {
    await invoke('text_to_speech', { text });
  } catch (err) {
    error(`Text-to-speech failed: ${err}`);
    throw new Error('Text-to-speech failed. Please try again later.');
  }
}
