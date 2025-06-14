<script lang="ts">
  import type { EpisodeProgress } from '../types';
  export let progress: EpisodeProgress;

  const totalLaps = progress.initialLearning.totalLaps;
  const currentLap = progress.initialLearning.currentLap;
  const isInitialCompleted = progress.initialLearning.isCompleted;
  const reviewCount = progress.reviewPhase.targetWordIds.length;

  // ステータス判定
  let status: 'new' | 'in-progress' | 'review' | 'completed';
  if (currentLap === 0) {
    status = 'new';
  } else if (!isInitialCompleted) {
    status = 'in-progress';
  } else if (isInitialCompleted && reviewCount > 0) {
    status = 'review';
  } else {
    status = 'completed';
  }

  // ステータス表示
  const statusMap = {
    new: { label: '未学習', class: 'new' },
    'in-progress': { label: '学習中', class: 'in-progress' },
    review: { label: '復習中', class: 'review' },
    completed: { label: '完了', class: 'completed' },
  };

  // プログレスバー表示値
  let progressValue = isInitialCompleted ? totalLaps : Math.max(0, currentLap - 1);
  let progressLabel = '';
  if (status === 'new') {
    progressLabel = `初期学習進捗: - / ${totalLaps} 周`;
  } else if (status === 'completed') {
    progressLabel = `初期学習進捗: ${currentLap} / ${totalLaps} 周 (完了)`;
  } else {
    progressLabel =
      `初期学習進捗: ${progressValue} / ${totalLaps} 周` + (isInitialCompleted ? ' (完了)' : '');
  }

  // 復習対象単語数
  let reviewLabel = '';
  let reviewCountClass = '';
  if (status === 'new') {
    reviewLabel = '- 件';
    reviewCountClass = 'zero';
  } else if (reviewCount === 0) {
    reviewLabel = '0 件';
    reviewCountClass = 'zero';
  } else {
    reviewLabel = `${reviewCount} 件`;
    reviewCountClass = '';
  }

  // ボタン
  let buttonText = '';
  let buttonClass = '';
  let buttonDisabled = false;
  if (status === 'new') {
    buttonText = '学習開始';
  } else if (status === 'in-progress') {
    buttonText = '学習再開';
  } else if (status === 'review') {
    buttonText = '復習開始';
    buttonClass = 'review-action';
  } else {
    buttonText = '学習完了';
    buttonDisabled = true;
  }

  function handleClick() {
    // TODO: Implement episode selection logic
  }
</script>

<article>
  <header>
    <h2>{progress.title}</h2>
    <span class={'status-badge ' + statusMap[status].class}>{statusMap[status].label}</span>
  </header>
  <div class="progress-section">
    <label class="progress-label">{progressLabel}</label>
    <progress
      value={progressValue}
      max={totalLaps}
      class:completed-bar={status === 'completed' || isInitialCompleted}
    ></progress>
  </div>
  <div class="review-section">
    <p class="review-label">復習対象単語数:</p>
    <p class={'review-count ' + reviewCountClass}>{reviewLabel}</p>
  </div>
  <footer>
    <button class={buttonClass} on:click={handleClick} disabled={buttonDisabled}>
      {buttonText}
    </button>
  </footer>
</article>

<style>
  /* 各エピソードカードのヘッダー */
  article header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  article header h2 {
    font-size: 1.25rem;
    margin-bottom: 0;
  }

  /* ステータスバッジ */
  .status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: var(--pico-border-radius);
    font-size: 0.75rem;
    font-weight: 500;
    color: #fff;
    white-space: nowrap;
  }

  .status-badge.new {
    background-color: #90a4ae;
  }
  .status-badge.in-progress {
    background-color: #29b6f6;
  }
  .status-badge.review {
    background-color: #ffa726;
  }
  .status-badge.completed {
    background-color: #66bb6a;
  }

  /* カード内のセクション */
  .progress-section,
  .review-section {
    font-size: 0.875rem;
  }

  .progress-label,
  .review-label {
    margin-bottom: 0.25rem;
    color: var(--pico-secondary);
  }

  /* 完了したプログレスバーの色 */
  progress.completed-bar::-webkit-progress-value {
    background-color: #66bb6a;
  }
  progress.completed-bar::-moz-progress-bar {
    background-color: #66bb6a;
  }
  progress.completed-bar {
    color: #66bb6a;
  }

  .review-count.zero {
    color: var(--pico-secondary);
  }

  /* 復習ボタンの色 */
  .review-action {
    --pico-background-color: #f57c00;
    --pico-border-color: #f57c00;
    --pico-color: #fff;
  }
  .review-action:hover,
  .review-action:focus {
    --pico-background-color: #e65100;
    --pico-border-color: #e65100;
  }
</style>
