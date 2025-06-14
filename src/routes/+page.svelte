<script lang="ts">
  import EpisodeCard from '$lib/components/EpisodeCard.svelte';
  import { episodeListStore } from '$lib/stores/episodeListStore.svelte';
  import { importScript, loadEpisodeProgresses } from '$lib/usecases/episode';
  import Icon from '@iconify/svelte';
  import { onMount } from 'svelte';

  const CHUNK_SIZE = 6;

  let loading = $state(true);
  let fileInput: HTMLInputElement;

  // エラーダイアログ用
  let errorDialog: HTMLDialogElement;
  let dialogMessage = $state('');

  function showErrorDialog(message: string) {
    dialogMessage = message;
    errorDialog.showModal();
  }

  function closeDialog() {
    errorDialog.close();
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

  function handleImport() {
    fileInput.click();
  }

  function onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        try {
          await importScript(text, file.name, CHUNK_SIZE);
        } catch (err) {
          if (err instanceof Error) {
            showErrorDialog(err.message);
          } else {
            showErrorDialog('エピソードのインポートに失敗しました');
          }
        }
      };
      reader.readAsText(file);
    }
    fileInput.value = '';
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
<input
  type="file"
  accept=".txt"
  bind:this={fileInput}
  onchange={onFileChange}
  style="display: none;"
/>
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

<dialog bind:this={errorDialog}>
  <article>
    <header>
      <strong>エラー</strong>
    </header>
    <p>{dialogMessage}</p>
    <footer>
      <button onclick={closeDialog}>閉じる</button>
    </footer>
  </article>
</dialog>

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
