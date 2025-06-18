<script lang="ts">
  export let open: boolean;
  export let message: string;
  export let onClose: () => void;
</script>

{#if open}
<dialog open>
  <article>
    <header>
      <strong>エラー</strong>
    </header>
    <p>{message}</p>
    <footer>
      <button on:click={onClose}>閉じる</button>
    </footer>
  </article>
</dialog>
{/if}

<style>
dialog {
  z-index: 1000;
}
article {
  min-width: 240px;
}
</style>
