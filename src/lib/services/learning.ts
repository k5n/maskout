import type { EpisodeContent, EpisodeProgress, WordStatus } from '$lib/types';

export function initializeEpisodeProgress(episodeContent: EpisodeContent): EpisodeProgress {
  const wordStatus: WordStatus[] = episodeContent.allWords.map((word) => ({
    id: word.id,
    isCorrectInitial: null, // 初期学習では未回答
    isCorrectReview: null, // 復習フェーズでは未回答
    needsReview: false, // 初期状態では復習対象外
  }));

  // totalLaps: allWords の maskedInInitialLap の最大値
  const totalLaps = episodeContent.allWords.reduce(
    (max, word) => Math.max(max, word.maskedInInitialLap),
    1
  );

  return {
    episodeId: episodeContent.episodeId,
    wordStatus,
    initialLearning: {
      currentLap: 0,
      totalLaps,
      isCompleted: false,
    },
    reviewPhase: {
      targetWordIds: [],
      currentReviewWordIndex: -1,
    },
    lastLearnedTimestamp: undefined,
  };
}
