import { describe, expect, it } from 'vitest';
import type { SentenceToken } from '../types';
import { parseEpisodeContent } from './parse';

const sampleScript = `# Sample Anime Episode Script - Episode 001
# Character: Sakura, Takeshi

Hello, my name is Sakura.
Nice to meet you, Takeshi. How are you today?
I am fine, thank you.

This is a beautiful day.
Would you like to go shopping?
Yes, let's go to the mall.
What do you want to buy?
I need some new clothes.
The weather is really nice today.`;

describe('parseEpisodeContent', () => {
  it('parses script text into EpisodeContent structure', async () => {
    const episodeId = 'sample_episode.txt';
    const chunkSize = 6;
    const result = await parseEpisodeContent(sampleScript, episodeId, chunkSize);

    expect(result).toBeDefined();
    expect(result.episodeId).toBe(episodeId);
    expect(result.title).toBe('Sample Anime Episode Script - Episode 001');
    expect(Array.isArray(result.sentences)).toBe(true);
    expect(Array.isArray(result.allWords)).toBe(true);
    expect(typeof result.importedTimestamp).toBe('string');

    // Check number of sentences (should skip comment lines and blank lines)
    expect(result.sentences.length).toBe(9);

    // Check that allWords is a flat list and each word has correct properties
    expect(result.allWords.length).toBeGreaterThan(0);
    for (const word of result.allWords) {
      expect(typeof word.id).toBe('number');
      expect(typeof word.text).toBe('string');
      expect(typeof word.sentenceId).toBe('number');
      expect(typeof word.maskedInInitialLap).toBe('number');
    }

    // Check that tokens in the first sentence are correct (full detail)
    const firstSentence = result.sentences[0];
    expect(firstSentence.originalText).toBe('Hello, my name is Sakura.');
    expect(Array.isArray(firstSentence.tokens)).toBe(true);
    const expectedTokens: SentenceToken[] = [
      { type: 'word', wordId: 0, text: 'Hello' },
      { type: 'char', text: ',' },
      { type: 'char', text: ' ' },
      { type: 'word', wordId: 1, text: 'my' },
      { type: 'char', text: ' ' },
      { type: 'word', wordId: 2, text: 'name' },
      { type: 'char', text: ' ' },
      { type: 'word', wordId: 3, text: 'is' },
      { type: 'char', text: ' ' },
      { type: 'word', wordId: 4, text: 'Sakura' },
      { type: 'char', text: '.' },
    ];
    expect(firstSentence.tokens.length).toBe(expectedTokens.length);
    for (let i = 0; i < expectedTokens.length; i++) {
      expect(firstSentence.tokens[i]).toEqual(expectedTokens[i]);
    }
  });
});
