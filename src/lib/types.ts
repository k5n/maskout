// src/lib/types.ts

/** 単語を表す型 */
export interface Word {
  /** エピソード全体での単語のユニークID (0始まりインデックス) */
  id: number;
  /** 単語の文字列 */
  text: string;
  /** この単語が属するセリフのID */
  sentenceId: number;
  /** 初期学習の何周目でマスクするか (1-indexed) */
  maskedInInitialLap: number;
}

/** 単語の学習状態を表す型 */
export interface WordStatus {
  /** エピソード全体での単語のユニークID (0始まりインデックス) */
  id: number;
  /** 初期学習フェーズでの自己判定結果 (true: 正解, false: 不正解, null: 未回答) */
  isCorrectInitial: boolean | null;
  /** 復習フェーズでの自己判定結果 (true: 正解, false: 不正解, null: 未回答/復習対象外) */
  isCorrectReview: boolean | null;
  /** この単語が復習対象かどうか */
  needsReview: boolean;
}

/** セリフを構成するトークンの型 */
export type SentenceToken =
  | {
      /** 単語トークンの場合 */
      type: 'word';
      /** 対応する単語ID */
      wordId: number;
      /** トークン文字列 */
      text: string;
    }
  | {
      /** 文字トークンの場合 */
      type: 'char';
      /** トークン文字列 */
      text: string;
    };

/** １つのセリフ（複数文、もしくは文の一部もありえる） */
export interface Sentence {
  /** エピソード全体でのセリフのID (0始まりインデックス) */
  id: number;
  /** 元のセリフ文字列 */
  originalText: string;
  /** このセリフを構成するトークンリスト */
  tokens: SentenceToken[];
}

/** エピソードのパース後の内容 */
export interface EpisodeContent {
  /** エピソード識別子 (例: "friends_s01e01.txt") */
  episodeId: string;
  /** セリフのリスト */
  sentences: Sentence[];
  /** エピソード内の全単語のフラットなリスト。Sentence内のWordオブジェクトと同一インスタンスを指す。 */
  allWords: Word[];
  /** ISO 8601 形式のインポートされた日時 */
  importedTimestamp: string;
}

/** エピソードの学習進捗状態 */
export interface EpisodeProgress {
  /** エピソード識別子 (例: "friends_s01e01.txt") */
  episodeId: string;

  /** 各単語の学習状態 */
  wordStatus: WordStatus[];

  initialLearning: {
    /** 現在の周回数 (1 から N まで、0 は未学習) */
    currentLap: number;
    /** 全体の周回数 (N) */
    totalLaps: number;
    /** 初期学習フェーズが完了したか（currentLap が N の周回が終了した際に true になる） */
    isCompleted: boolean;
  };

  reviewPhase: {
    /** 復習対象の word.id のリスト (重複なし、エピソード内での登場順ソート済み) */
    targetWordIds: number[];
    /** targetWordIds の現在のインデックス (-1 や null で未開始/完了) */
    currentReviewWordIndex: number;
    // 全ての targetWordIds が isCorrectReview = true になったら完了
  };

  /** ISO 8601 形式の最終学習日時 */
  lastLearnedTimestamp?: string;
}
