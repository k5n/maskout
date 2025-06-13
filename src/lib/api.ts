// src/lib/api.ts
import { invoke } from '@tauri-apps/api/core';
import { trace, error } from '@tauri-apps/plugin-log';

export async function speak(text: string): Promise<void> {
  trace('Starting text-to-speech...');
  try {
    await invoke('text_to_speech', { text });
  } catch (err) {
    error(`Text-to-speech failed: ${err}`);
    throw new Error('Text-to-speech failed. Please try again later.');
  }
}
