<script lang="ts">
  import { onMount } from 'svelte';
  import { loadEpisodes } from '../lib/logic/file_system';
  import Icon from '@iconify/svelte';

  let episodes: string[] = $state([]);
  let loading = $state(true);
  let error: string | null = $state(null);

  async function fetchEpisodes() {
    loading = true;
    error = null;
    try {
      episodes = await loadEpisodes();
    } catch (e) {
      error = 'エピソード一覧の取得に失敗しました';
    } finally {
      loading = false;
    }
  }

  function handleImport() {
    // TODO: 新規エピソードのインポート処理（現状は空）
  }

  function handleSelect(episodeId: string) {
    // TODO: エピソード選択時の遷移や処理（現状は空）
  }

  onMount(fetchEpisodes);
</script>

<svelte:head>
  <title>エピソード選択</title>
</svelte:head>

<header class="app-header">
  <h1>エピソード選択</h1>
  <button class="secondary import-button" onclick={handleImport}>
    <Icon icon="lucide:upload" width="24" height="24" />
    新規エピソードをインポート
  </button>
</header>

{#if loading}
  <p>読み込み中...</p>
{:else if error}
  <p style="color:red">{error}</p>
{:else if episodes.length === 0}
  <p>エピソードはまだありません。</p>
{:else}
  <div class="grid">
    {#each episodes as episode}
      <!-- TODO: エピソードカードコンポーネントを使用 -->
      <p>未実装</p>
    {/each}
  </div>
{/if}

<style>
  @media (min-width: 768px) {
    .grid {
      grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
    }
  }

  /* アプリケーションヘッダー */
  .app-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap; /* 画面幅が狭い場合に備える */
    gap: 1rem;
    text-align: center;
    border-bottom: var(--pico-border-width) solid var(--pico-muted-border-color);
    padding-bottom: 1rem;
    margin-bottom: 2rem;
  }

  .app-header h1 {
    margin-bottom: 0; /* flexアイテムになったのでマージンを調整 */
  }

  /* 新規インポートボタン */
  .import-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>
