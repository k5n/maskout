<script lang="ts">
  import { onMount } from 'svelte';
  import { loadEpisodes } from '../lib/api';

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

  function handleSelect(episodeId: string) {
    // TODO: エピソード選択時の遷移や処理（現状は空）
  }

  onMount(fetchEpisodes);
</script>

<svelte:head>
  <title>エピソード選択</title>
</svelte:head>

<main>
  <h1>エピソード選択</h1>
  {#if loading}
    <p>読み込み中...</p>
  {:else if error}
    <p style="color:red">{error}</p>
  {:else if episodes.length === 0}
    <p>エピソードはまだありません。</p>
  {:else}
    <div class="episode-list">
      {#each episodes as episode}
        <button onclick={() => handleSelect(episode)} class="episode-item">
          {episode}
        </button>
      {/each}
    </div>
  {/if}
</main>

<style>
</style>
