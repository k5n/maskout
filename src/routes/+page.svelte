<script lang="ts">
  import EpisodeCard from '$lib/components/EpisodeCard.svelte';
  import ErrorDialog from '$lib/components/ErrorDialog.svelte';
  import FileImportButton from '$lib/components/FileImportButton.svelte';
  import { episodeListStore } from '$lib/stores/episodeListStore.svelte';
  import { importScript, loadEpisodeProgresses } from '$lib/usecases/episode';
  import { onMount } from 'svelte';

  const CHUNK_SIZE = 6;

  let loading = $state(true);
  let errorDialogOpen = $state(false);
  let dialogMessage = $state('');

  function showErrorDialog(message: string) {
    dialogMessage = message;
    errorDialogOpen = true;
  }

  function closeDialog() {
    errorDialogOpen = false;
  }
  
  async function fetchEpisodes() {
    loading = true;
    try {
      await loadEpisodeProgresses();
    } catch (e) {
      showErrorDialog('エピソード一覧の取得に失敗しました');
    } finally {
      loading = false;
    }
  }

  async function handleFileImport(text: string) {
    try {
      await importScript(text, CHUNK_SIZE);
    } catch (err) {
      if (err instanceof Error) {
        showErrorDialog(err.message);
      } else {
        showErrorDialog('エピソードのインポートに失敗しました');
      }
    }
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
  <FileImportButton onImport={handleFileImport} label="新規エピソードをインポート" />
</header>

{#if loading}
  <p>読み込み中...</p>
{:else if episodeListStore.value.length === 0}
  <p>エピソードはまだありません。</p>
{:else}
  <div class="grid">
    {#each episodeListStore.value as episode}
      <EpisodeCard progress={episode} />
    {/each}
  </div>
{/if}

<ErrorDialog open={errorDialogOpen} message={dialogMessage} onClose={closeDialog} />

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
</style>
