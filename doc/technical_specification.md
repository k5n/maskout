# MaskOut ver1 技術仕様

**1. はじめに**

このドキュメントは、英語学習アプリケーション「MaskOut ver1」の実装に向けた技術仕様を定義するものです。主な対象読者は開発を担当するAI Agentおよび開発者です。本仕様に基づき、効率的かつ正確な実装を目指します。

**2. 全体アーキテクチャ**

* **フレームワーク:** Tauri 2.0 を利用し、LinuxおよびWindows対応のデスクトップアプリケーションとして開発します。
* **フロントエンド:** Svelte (UIフレームワーク) と TypeScript (プログラミング言語) を使用します。UI描画、ユーザーインタラクション、アプリケーションの主要なロジックを担当します。
* **バックエンド (Rust Core):** Rust を使用し、TauriのCoreプロセスとして動作します。主にファイルシステムアクセスとOS標準のText-To-Speech (TTS) 機能の呼び出しを担当します。
* **連携:** フロントエンド (TypeScript) とバックエンド (Rust) は、Tauriの `invoke` (コマンド呼び出し) およびイベントシステムを通じて連携します。

**将来のWebアプリ化への考慮:**
バックエンド (Rust) の役割をファイルアクセスとTTSに限定し、主要な学習ロジック（マスキング戦略、進捗管理など）をフロントエンド (TypeScript) に実装することで、将来的にバックエンドをWeb APIに置き換える際の変更範囲を最小限に抑えます。

**3. ディレクトリ構造案 (Tauri + SvelteKit)**

```
maskout/
├── src/                      # フロントエンド (SvelteKit, TypeScript)
│   ├── app.html              # アプリケーションエントリーポイント
│   ├── routes/               # SvelteKitページルーティング
│   │   ├── +layout.svelte    # 共通レイアウト（ナビゲーションメニューなど）
│   │   ├── +layout.ts        # レイアウト用データ読み込み
│   │   ├── +page.svelte      # トップページ（エピソード選択画面）
│   │   ├── learning/         # 学習画面ルート
│   │   │   └── [episodeId]/  # 動的ルート（エピソード別学習）
│   │   │       └── +page.svelte  # 学習画面
│   │   └── settings/         # 設定画面ルート
│   │       └── +page.svelte  # 設定画面
│   ├── lib/                  # 共通ロジック、型定義、ユーティリティ
│   │   ├── types.ts          # データ構造の型定義
│   │   ├── coreLogic.ts      # マスキング、進捗管理などのコアロジック
│   │   ├── stores/           # 状態管理 (Svelte Stores)
│   │   │   ├── appState.ts
│   │   │   ├── learningProgressStore.ts
│   │   │   └── index.ts      # ストアのエクスポート
│   │   └── components/       # 再利用可能なUIコンポーネント
│   │       ├── EpisodeCard.svelte      # エピソード情報表示カード
│   │       ├── LearningPanel.svelte    # 学習問題表示パネル
│   │       ├── ProgressBar.svelte      # 進捗表示バー
│   │       ├── TTSButton.svelte        # 音声再生ボタン
│   │       └── index.ts      # コンポーネントのエクスポート
│   └── assets/               # 静的アセット（画像、スタイルなど）
├── src-tauri/                # バックエンド (Rust)
│   ├── src/
│   │   ├── main.rs           # Rustエントリーポイント、Tauriハンドラ設定
│   │   ├── lib.rs            # フロントエンドから呼び出されるコマンド実装
│   │   ├── commands.rs       # Tauriコマンド実装
│   │   ├── file_system.rs    # ファイルアクセス処理
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
    * 現在学習中のエピソードの全データ (`EpisodeData` 型、後述「6. データ構造」参照)。
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
    * 復習対象単語リスト (`EpisodeData.reviewPhase.targetWordIds`) を作成・管理します。
    * 復習対象単語が登場するセリフをエピソードの登場順に提示します。
    * ただし次の復習対象単語がN単語より近かった場合、その復習対象単語はスキップします。
    * １つのセリフに復習対象単語が複数ある場合、表示ルールは初期学習フェーズと同様に、全てマスクした上で現在の対象となっている単語のみを質問対象として表示します。
    * ユーザーが「正解だった」と記録するまで、その単語は復習対象として残ります。
* **進捗管理:**
    * 初期学習フェーズの現在の周回数、完了状態。
    * 復習フェーズの対象単語数、完了状態。
    * `EpisodeData` オブジェクトを更新し、適宜Rust側に保存を依頼します。

**4.5. Tauri API (invoke) の利用**

Tauriの `invoke` 関数を使用して、Rust側のコマンドを呼び出します。
SvelteKitでは、ページの `load` 関数やコンポーネント内でこれらのAPIを活用します。

```typescript
// src/lib/api.ts - API呼び出しをまとめたユーティリティ
import { invoke } from '@tauri-apps/api/tauri';
import type { EpisodeData } from './types';

export async function loadEpisodes(): Promise<string[]> {
  return await invoke('get_episode_list');
}

export async function loadEpisodeScript(episodeId: string): Promise<string> {
  return await invoke('load_episode_script', { episodeId });
}

export async function loadEpisodeProgress(episodeId: string): Promise<string> {
  return await invoke('load_episode_progress', { episodeId });
}

export async function saveEpisodeProgress(episodeData: EpisodeData): Promise<void> {
  await invoke('save_episode_data', { episodeData });
}

export async function speak(text: string): Promise<void> {
  await invoke('text_to_speech', { text });
}
```
---

**5. バックエンド (Rust)**

**5.1. 公開するTauriコマンド (API設計) (src-tauri/src/commands.rs)**

以下の関数をTauriコマンドとしてフロントエンドに公開します (`#[tauri::command]` アトリビュートを使用)。
フロントエンドでは出来ない最低限のI/O処理のみを行い、データのパースなどはフロントエンドに任せます。

* `async fn get_episode_list() -> Result<Vec<String>, String>`:
    * ユーザーがスクリプトを保存するディレクトリ（場所は固定または設定可能にする、初期はアプリのデータディレクトリ内の特定フォルダを想定）をスキャンし、テキストファイル（`.txt`など）のリスト（ファイル名）を返します。これがエピソードリストとなります。
* `async fn load_episode_script(episode_id: String) -> Result<String, String>`:
    * 指定された `episode_id` (ファイル名) に対応するスクリプトテキストファイルを読み込みます。
    * スクリプトのパースは行わず、テキスト内容をそのまま返します。
* `async fn load_episode_progress(episode_id: String) -> Result<String, String>`:
    * 指定された `episode_id` (ファイル名) に対応する学習進捗JSONファイル（存在する場合）を読み込みます。
    * スクリプトをパースは行わず、テキスト内容をそのまま返します。進捗ファイルが存在しない場合は、空文字列を返します。
* `async fn save_episode_data(episode_data: String) -> Result<(), String>`:
    * フロントエンドから受け取った `episode_data` を、対応する `episode_id` のJSONファイルとしてローカルストレージに保存します。ファイル名は `episode_id` (例: `episode_01.txt` なら `episode_01.json`) に基づいて決定します。
    * この関数は `episode_data` の内容がJSONかどうかは感知せず、単に文字列を保存するだけです。
* `async fn text_to_speech(text: String) -> Result<(), String>`:
    * 受け取った `text` をOS標準のTTS機能を使用して読み上げます。
    * プラットフォームごとのTTSライブラリを利用します。TauriのAPIにTTS機能があればそちらを優先検討します。

**5.2. ファイルアクセス処理 (src-tauri/src/file_system.rs)**

* テキストファイル (スクリプト) の読み込み。
* JSONファイル (学習進捗データ) の読み込みと書き込み。（内容がJSONであってもRust側では単なるテキストとして扱う）
* ディレクトリ内のファイル一覧取得。
* エラーハンドリング (ファイルが見つからない、アクセス権限がない等)。
* データ保存場所: Tauriの `app_data_dir()` などを利用してプラットフォームに適した場所に保存します。

**5.3. TTS処理 (src-tauri/src/tts.rs)**

* `text_to_speech` コマンドの具体的な実装。
* OSのTTSエンジンとのインターフェース。
* エラーハンドリング (TTSエンジンが利用不可など)。

---

**6. データ構造 (JSONフォーマット および TypeScript型定義)**

フロントエンドで利用するデータ構造です。
TypeScriptでの型定義を以下に示します。この構造でJSONファイルとして保存・読込を行います。

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
  sentences: Sentence[]; // セリフのリスト
  allWords: Word[]; // エピソード内の全単語のフラットなリスト。Sentence内のWordオブジェクトと同一インスタンスを指す。
}

export interface EpisodeProgress {
  wordStatus: WordStatus[];

  initialLearning: {
    currentLap: number; // 現在の周回数 (1 から N まで)
    isCompleted: boolean; // 初期学習フェーズが完了したか（currentLap が N の周回が終了した際に true になる）
  };

  reviewPhase: {
    targetWordIds: number[]; // 復習対象の word.id のリスト (重複なし、エピソード内での登場順ソート済み)
    currentReviewWordIndex: number; // targetWordIds の現在のインデックス (-1 や null で未開始/完了)
    // 全ての targetWordIds が isCorrectReview = true になったら完了
  };

  lastLearnedTimestamp?: string; // ISO 8601 形式の最終学習日時
}

export interface EpisodeData {
  episodeId: string; // エピソード識別子 (例: "friends_s01e01.txt")
  content: EpisodeContent; // エピソードの内容
  progress: EpisodeProgress; // エピソードの学習進捗状態
}
```

"Nice to meet you, Yoko."
は SentenceToken で以下のように表されます。
このように表すことで、マスク対象のものをマスク表示しつつセンテンスを表示するのを容易にします。

```json
[
  { type: 'word', wordId: 0, text: 'Nice' },
  { type: 'char', text: ' ' },
  { type: 'word', wordId: 1, text: 'to' },
  { type: 'char', text: ' ' },
  { type: 'word', wordId: 2, text: 'meet' },
  { type: 'char', text: ' ' },
  { type: 'word', wordId: 3, text: 'you' },
  { type: 'char', text: ',' },
  { type: 'char', text: ' ' },
  { type: 'word', wordId: 4, text: 'Yoko' },
  { type: 'char', text: '.' }
]
```

**JSON保存ファイル例 (`[episodeId].json`):**
上記 `EpisodeData` インターフェースに準拠したJSONオブジェクトとして保存します。

---

**7. ビルドと実行 (補足)**

* Tauriの標準的な開発フローに従います (`npx tauri dev`, `npx tauri build`)。
* RustとNode.jsの開発環境が必要です。
* AI Agentは、指定されたファイルパスに必要なコードを生成・配置することを期待します。
