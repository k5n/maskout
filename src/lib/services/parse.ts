import type { EpisodeContent, Sentence, SentenceToken, Word } from '../types';

// Utility: Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Tokenize a sentence into SentenceToken[] and collect Word objects
function tokenizeSentence(
  originalText: string,
  sentenceId: number,
  wordIdStart: number
): { tokens: SentenceToken[]; words: Word[] } {
  const tokens: SentenceToken[] = [];
  const words: Word[] = [];
  let wordId = wordIdStart;
  // Regex: match words (alphanum + apostrophe), or single non-word char
  // We'll walk through the string, splitting into word and non-word tokens
  const wordRegex = /[a-zA-Z0-9']+/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = wordRegex.exec(originalText)) !== null) {
    // Add chars before the word as 'char' tokens
    if (match.index > lastIndex) {
      for (let i = lastIndex; i < match.index; i++) {
        tokens.push({ type: 'char', text: originalText[i] });
      }
    }
    // Add the word as a 'word' token
    const wordText = match[0];
    words.push({
      id: wordId,
      text: wordText,
      sentenceId,
      maskedInInitialLap: 0, // placeholder, will set later
    });
    tokens.push({ type: 'word', wordId, text: wordText });
    wordId++;
    lastIndex = match.index + wordText.length;
  }
  // Add any trailing chars after the last word
  if (lastIndex < originalText.length) {
    for (let i = lastIndex; i < originalText.length; i++) {
      tokens.push({ type: 'char', text: originalText[i] });
    }
  }
  return { tokens, words };
}

function extractTitleFromScript(scriptText: string): { title: string; scriptBody: string } {
  const lines = scriptText.split(/\r?\n/);
  let title = '';
  let foundTitle = false;
  const bodyLines: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!foundTitle && trimmed.startsWith('#')) {
      title = trimmed.replace(/^#\s*/, '');
      foundTitle = true;
      continue;
    }
    bodyLines.push(line);
  }
  return { title, scriptBody: bodyLines.join('\n') };
}

export async function parseEpisodeContent(
  text: string,
  episodeId: string,
  chunkSize: number
): Promise<EpisodeContent> {
  const { title, scriptBody } = extractTitleFromScript(text);
  // 1. Split lines, skip comments and blanks
  const lines = scriptBody.split(/\r?\n/);
  const sentences: Sentence[] = [];
  const allWords: Word[] = [];
  let wordIdCounter = 0;
  let sentenceIdCounter = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    // Tokenize and collect words
    const { tokens, words } = tokenizeSentence(trimmed, sentenceIdCounter, wordIdCounter);
    sentences.push({
      id: sentenceIdCounter,
      originalText: trimmed,
      tokens,
    });
    allWords.push(...words);
    wordIdCounter += words.length;
    sentenceIdCounter++;
  }

  // 2. Assign maskedInInitialLap for allWords (chunking)
  // chunkSize = N, split allWords into chunks of N
  let idx = 0;
  while (idx < allWords.length) {
    const chunk = allWords.slice(idx, idx + chunkSize);
    // For this chunk, assign lap numbers 1..chunk.length, shuffled
    const laps = shuffleArray(Array.from({ length: chunk.length }, (_, i) => i + 1));
    for (let i = 0; i < chunk.length; i++) {
      chunk[i].maskedInInitialLap = laps[i];
    }
    idx += chunkSize;
  }

  // 3. Timestamp
  const importedTimestamp = new Date().toISOString();

  return {
    episodeId,
    title,
    sentences,
    allWords,
    importedTimestamp,
  };
}
