<script lang="ts">
  export let onImport: (text: string) => void;
  export let disabled: boolean = false;
  export let label: string = "ファイルをインポート";
  let fileInput: HTMLInputElement;

  function handleClick() {
    fileInput.click();
  }

  function handleChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onImport(reader.result);
      }
    };
    reader.readAsText(file);
    input.value = ""; // 同じファイルを連続で選択できるように
  }
</script>

<button on:click={handleClick} disabled={disabled}>
  {label}
</button>
<input
  bind:this={fileInput}
  type="file"
  style="display: none"
  on:change={handleChange}
/>
