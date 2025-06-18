# MaskOut ver1 技術仕様

**1. はじめに**

このドキュメントは、英語学習アプリケーション「MaskOut ver1」の実装に向けた技術仕様を定義するものです。主な対象読者は開発を担当するAI Agentおよび開発者です。本仕様に基づき、効率的かつ正確な実装を目指します。

**2. 全体アーキテクチャ**

* **フレームワーク:** Tauri 2.x を利用し、LinuxおよびWindows対応のデスクトップアプリケーションとして開発します。
* **フロントエンド:** Svelte (UIフレームワーク) と TypeScript (プログラミング言語) を使用します。UI描画、ユーザーインタラクション、アプリケーションの主要なロジックを担当します。
* **バックエンド (Rust Core):** Rust を使用し、TauriのCoreプロセスとして動作します。主にファイルシステムアクセスとOS標準のText-To-Speech (TTS) 機能の呼び出しを担当します。
* **連携:** フロントエンド (TypeScript) とバックエンド (Rust) は、Tauriの `invoke` (コマンド呼び出し) およびイベントシステムを通じて連携します。

バックエンド (Rust) の役割をフロントエンド (TypeScript) だけでできないことに限定する。

- Rust より学習コストの低い TypeScript で実装することで、実装コストを抑えます。
- 主要な学習ロジック（マスキング戦略、進捗管理など）をフロントエンド (TypeScript) に実装することで、将来的にバックエンドをWeb APIに置き換える際の変更範囲を最小限に抑えます。

**3. ディレクトリ構造案 (Tauri + SvelteKit)**

```
maskout/
├── doc/                      # ドキュメントを格納
├── src/                      # フロントエンド (SvelteKit, TypeScript)
│   ├── app.css               # グローバルスタイル
│   ├── app.html              # アプリケーションエントリーポイント
│   ├── routes/               # SvelteKitページルーティング
│   │   ├── +layout.svelte    # 共通レイアウト（ナビゲーションメニューなど）
│   │   ├── +layout.ts        # レイアウト用データ読み込み
│   │   ├── +page.svelte      # トップページ（エピソード選択画面）
│   │   ├─── learning/        # 学習画面ルート
│   │   │    └── [episodeId]/ # 動的ルート（エピソード別学習）
│   │   │       ├── +page.svelte  # 学習画面
│   │   │       └── +page.ts      # 学習画面ロジック
│   │   └── settings/         # 設定画面ルート
│   │       └── +page.svelte  # 設定画面
│   └── lib/                  # 共通ロジック、型定義、ユーティリティ
│       ├── types.ts          # データ構造の型定義
│       ├── usecases/         # アプリケーションのユースケース
│       │   └── episode.ts    # インポートやロードなどエピソード関係のユースケース
│       ├── infrastructure/   # ファイルシステム等のインフラ層
│       │   ├── api.ts
│       │   ├── file_system.ts
│       │   └── file_system.test.ts
│       ├── services/         # サービス層
│       │   ├── learning.ts
│       │   ├── parse.ts
│       │   └── parse.test.ts
│       ├── stores/           # 状態管理
│       │   └── episodeListStore.svelte.ts
│       └── components/       # 再利用可能なUIコンポーネント
│           ├── EpisodeCard.svelte
│           ├── LearningPanel.svelte
│           └── index.ts
├── src-tauri/                # バックエンド (Rust)
│   ├── src/
│   │   ├── main.rs           # Rustエントリーポイント、Tauriハンドラ設定
│   │   ├── lib.rs            # フロントエンドから呼び出されるコマンド実装
│   │   └── tts.rs            # TTS処理
│   ├── tauri.conf.json       # Tauri設定ファイル
│   ├── Cargo.toml            # Rustクレート定義
│   └── build.rs              # ビルドスクリプト (必要な場合)
├── static/                   # 静的公開ファイル（SvelteKit標準）
└── ...                       # その他設定ファイル (package.json, tsconfig.jsonなど)
```

---

**4. フロントエンド (TypeScript/SvelteKit)**

**4.1. ページルーティング (src/routes/)**

SvelteKitのファイルベースルーティングシステムを活用した画面構成：

* **`+layout.svelte`:**
    * アプリ全体の共通レイアウト。
    * 全画面共通のUI要素を配置。
* **`+page.svelte` (トップページ):**
    * **エピソード選択画面**として機能。
    * 学習可能なエピソードの一覧を表示。
    * 各エピソードの学習進捗（例: 初期学習の周回数、復習対象単語数）を数値やプログレスバーで表示。
    * エピソード選択時は `/learning/[episodeId]` にナビゲート。
    * `EpisodeCard` コンポーネントを使用してエピソード情報を表示。
* **`learning/[episodeId]/+page.svelte`:**
    * **メインの学習画面**。動的ルートでエピソードIDを受け取る。
    * 現在の問題セリフ（一部マスキング済み）を表示。
    * マスキング前の完全なセリフをTTSで再生するボタンを提供。
    * ユーザーが解答を自己判定 (「正解」「不正解」) するためのボタンを提供。
    * 「正解を表示」ボタンでマスクされていた単語を表示。
    * 現在の学習フェーズ（初期学習/復習）、進捗を表示。
    * `LearningPanel`, `TTSButton`, `ProgressBar` コンポーネントを組み合わせて構成。
* **`settings/+page.svelte`:**
    * **設定画面**（初期シンプル版では最小限）。
    * Nの値の確認 (初期は固定値のため表示のみ、将来的に変更可能)。
    * その他アプリケーション設定（例: TTSの音声選択など）。

**4.2. 再利用可能コンポーネント (src/lib/components/)**

各ページで使用される再利用可能なUIコンポーネント：

* **`EpisodeCard.svelte`:**
    * エピソード情報と学習進捗を表示するカードコンポーネント。
* **`LearningPanel.svelte`:**
    * 学習問題（マスキングされたセリフ）を表示するメインパネル。
* **`ProgressBar.svelte`:**
    * 学習進捗を視覚的に表示するプログレスバー。
* **`TTSButton.svelte`:**
    * TTS音声再生ボタン。

**4.3. 状態管理 (src/lib/stores/)**

Svelte Storesを利用して、アプリケーション全体の状態を管理します。

* **`appState.ts`:**
    * 現在の画面状態（ローディング状態など）。
    * グローバルなアプリケーション設定。
    * エラー状態やメッセージの管理。
* **`learningProgressStore.ts`:**
    * 現在学習中のエピソードの進捗データ (`EpisodeProgress` 型、後述「6. データ構造」参照)。
    * 現在の問題に関する情報（表示用セリフ、マスク箇所、正解単語など）。
    * 学習セッションの状態管理。
    * UIコンポーネントはこのストアを購読し、変更に応じてリアクティブに更新されます。
* **`index.ts`:**
    * 各ストアを一元的にエクスポートし、他のファイルからのインポートを簡素化。

**4.4. コアロジック (src/lib/coreLogic.ts)**

* **テキスト処理:**
    * ユーザー提供のスクリプトテキスト（1行1セリフ）をパースし、セリフオブジェクトと単語オブジェクトのリストに変換します。
    * 各単語にはエピソード内でのユニークIDを付与します。
* **チャンク分割:**
    * `splitIntoChunks(words: Word[], chunkSizeN: number): Word[][]`
    * エピソードの全単語リストを、指定されたN単語ずつのチャンクに分割します。最後のチャンクはN単語未満になることもあります。
    * 各チャンクからランダムに1つずつ選択してN周回のどこでマスキング対象とするかを決定します。
* **初期学習フェーズロジック:**
    * N周回の学習を管理します。
    * `Word`オブジェクトの `maskedInInitialLap` プロパティを更新します。
    * ユーザーの自己判定結果 (`isCorrectInitial`) を記録します。
    * **マスキングルール:** 現在の回答対象単語を含むセリフを表示する際、そのセリフ内に今回の周回でのマスク対象単語が他にも存在した場合、全てをマスクして表示した上で**現在の対象となっている単語のみを質問対象**とします。
    * １つのセリフに複数のその周回でのマスク対象が含まれる場合、同じセリフが連続して複数回表示されることになります。
    * 回答対象のマスク部分はそれと分かるように強調表示します。これにより複数のマスク部分があっても、今回の回答対象がどこなのかを分かるようにします。
* **復習フェーズロジック:**
    * 初期学習フェーズで一度でも「不正解だった」単語を復習対象とします (`needsReview` フラグを更新)。
    * 復習対象単語リスト (`EpisodeProgress.reviewPhase.targetWordIds`) を作成・管理します。
    * 復習対象単語が登場するセリフをエピソードの登場順に提示します。
    * ただし次の復習対象単語がN単語より近かった場合、その復習対象単語はスキップします。
    * １つのセリフに復習対象単語が複数ある場合、表示ルールは初期学習フェーズと同様に、全てマスクした上で現在の対象となっている単語のみを質問対象として表示します。
    * ユーザーが「正解だった」と記録するまで、その単語は復習対象として残ります。
* **進捗管理:**
    * 初期学習フェーズの現在の周回数、完了状態。
    * 復習フェーズの対象単語数、完了状態。
    * `EpisodeProgress` オブジェクトを更新し、保存します。

**4.5. Tauri API (invoke) の利用**

Tauriの `invoke` 関数を使用して、Rust側のコマンドを呼び出します。
SvelteKitでは、ページの `load` 関数やコンポーネント内でこれらのAPIを活用します。

```typescript
// src/lib/api.ts - API呼び出しをまとめたユーティリティ
import { invoke } from '@tauri-apps/api/tauri';

export async function speak(text: string): Promise<void> {
  await invoke('text_to_speech', { text });
}
```
---

**5. バックエンド (Rust)**

**5.1. 公開するTauriコマンド (API設計) (src-tauri/src/commands.rs)**

以下の関数をTauriコマンドとしてフロントエンドに公開します (`#[tauri::command]` アトリビュートを使用)。
フロントエンドでは出来ない最低限の処理のみを行い、データのパースなどはフロントエンドに任せます。
また通常ブラウザではできないファイルシステムへのアクセスなども、できる限り Tauri のプラグインとして提供されているものを利用して、フロントエンド側で実装します。

* `async fn text_to_speech(text: String) -> Result<(), String>`:
    * 受け取った `text` をOS標準のTTS機能を使用して読み上げます。
    * プラットフォームごとのTTSライブラリを利用します。TauriのAPIにTTS機能があればそちらを優先検討します。

**5.3. TTS処理 (src-tauri/src/tts.rs)**

* `text_to_speech` コマンドの具体的な実装。
* OSのTTSエンジンとのインターフェース。
* エラーハンドリング (TTSエンジンが利用不可など)。

---


**6. データ構造 (JSONフォーマット および TypeScript型定義)**

フロントエンドで利用するデータ構造です。
TypeScriptでの型定義を以下に示します。この構造でJSONファイルとして保存・読込を行います。
コンテンツ内容を表すデータ (EpisodeContent) と、その学習進捗状況を表すデータ (EpisodeProgress) を分けて管理します。

### エピソードID・タイトルの扱い

- `episodeId` は「エピソードスクリプト内容（タイトル行を含む全体）」のSHA-256ハッシュ値（16進文字列）とする。
- `title` はインポート時にスクリプト先頭行が `# ` で始まる場合、その `# ` を除いた部分をタイトルとして抽出し、`EpisodeContent` に格納する。
- 画面表示には `title` を用い、`episodeId`（ハッシュ値）は内部管理・ファイル名等に利用する。

### 型定義例

```typescript
// src/lib/types.ts

export interface Word {
  id: number; // エピソード全体での単語のユニークID (0始まりインデックス)
  text: string; // 単語の文字列
  sentenceId: number; // この単語が属するセリフのID
  maskedInInitialLap: number; // 初期学習の何周目でマスクするか (1-indexed)
}

// 単語学習状態
export interface WordStatus {
  id: number; // エピソード全体での単語のユニークID (0始まりインデックス)
  isCorrectInitial: boolean | null; // 初期学習フェーズでの自己判定結果 (true: 正解, false: 不正解, null: 未回答)
  isCorrectReview: boolean | null; // 復習フェーズでの自己判定結果 (true: 正解, false: 不正解, null: 未回答/復習対象外)
  needsReview: boolean; // この単語が復習対象かどうか
}

export type SentenceToken =
  | { type: 'word'; wordId: number; text: string }
  | { type: 'char'; text: string };

export interface Sentence {
  id: number; // エピソード全体でのセリフのID (0始まりインデックス)
  originalText: string; // 元のセリフ文字列
  tokens: SentenceToken[]; // このセリフを構成するトークンリスト
}

export interface EpisodeContent {
  episodeId: string; // エピソード識別子（スクリプト全体のSHA-256ハッシュ値、16進文字列）
  title: string; // エピソードタイトル（スクリプト先頭行の `# ` を除いた部分）
  sentences: Sentence[]; // セリフのリスト
  allWords: Word[]; // エピソード内の全単語のフラットなリスト。Sentence内のWordオブジェクトと同一インスタンスを指す。
  importedTimestamp: string; // ISO 8601 形式のインポートされた日時
}

export interface EpisodeProgress {
  episodeId: string; // エピソード識別子（スクリプト全体のSHA-256ハッシュ値）
  title: string; // エピソードタイトル（スクリプト先頭行の `# ` を除いた部分）
  wordStatus: WordStatus[];

  initialLearning: {
    currentLap: number; // 現在の周回数 (1 から N まで、0 は未学習)
    totalLaps: number;  // 全体の周回数 （N）
    isCompleted: boolean; // 初期学習フェーズが完了したか（currentLap が N の周回が終了した際に true になる）
  };

  reviewPhase: {
    targetWordIds: number[]; // 復習対象の word.id のリスト (重複なし、エピソード内での登場順ソート済み)
    currentReviewWordIndex: number; // targetWordIds の現在のインデックス (-1 で未開始/完了)
    // 全ての targetWordIds が isCorrectReview = true になったら完了
  };

  lastLearnedTimestamp?: string; // ISO 8601 形式の最終学習日時
}
```

"Nice to meet you, Yoko." は SentenceToken で以下のように表されます。
このように表すことで、マスク対象のものをマスクしつつセンテンスを表示するのを容易にします。

```json
[
  { "type": "word", "wordId": 0, "text": "Nice" },
  { "type": "char", "text": " " },
  { "type": "word", "wordId": 1, "text": "to" },
  { "type": "char", "text": " " },
  { "type": "word", "wordId": 2, "text": "meet" },
  { "type": "char", "text": " " },
  { "type": "word", "wordId": 3, "text": "you" },
  { "type": "char", "text": "," },
  { "type": "char", "text": " " },
  { "type": "word", "wordId": 4, "text": "Yoko" },
  { "type": "char", "text": "." }
]
```

**JSON保存ファイル例 (`[episodeId].json`):**
上記 `EpisodeContent` および `EpisodeProgress` インターフェースに準拠したJSONオブジェクトとして保存します。

---

**7. ビルドと実行 (補足)**

* Tauriの標準的な開発フローに従います (`npx tauri dev`, `npx tauri build`)。
* RustとNode.jsの開発環境が必要です。
* AI Agentは、指定されたファイルパスに必要なコードを生成・配置することを期待します。
