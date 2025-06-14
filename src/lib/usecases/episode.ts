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

// SHA-256ハッシュ値を16進文字列で返す
async function sha256Hex(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * スクリプトテキストをインポートし、EpisodeProgressを返す。
 * - 先頭行が `# ` で始まる場合はタイトルとして抽出。
 * - ハッシュ値をepisodeIdとして利用。
 */
export async function importScript(
  scriptText: string,
  _fileName: string, // 互換のため残すが使わない
  chunkSize: number
): Promise<EpisodeProgress> {
  // タイトル抽出
  const lines = scriptText.split(/\r?\n/);
  let title = '';
  let scriptBody = '';
  if (lines.length > 0 && lines[0].trim().startsWith('# ')) {
    title = lines[0].trim().slice(2).trim();
    scriptBody = lines.slice(1).join('\n');
  } else {
    title = '';
    scriptBody = scriptText;
  }
  // episodeId生成（タイトル行も含めた全体でハッシュ）
  const episodeId = await sha256Hex(scriptText);
  trace(`Importing script for episode: ${episodeId} (title: ${title})`);
  // parseEpisodeContentにtitleを渡す必要があるので、引数を変更する
  const parsedContent = await parseEpisodeContent(scriptBody, episodeId, chunkSize, title);
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
