import type { EpisodeProgress } from '$lib/types';

let store = $state([] as EpisodeProgress[]);

export const episodeListStore = {
  get value() {
    return store;
  },

  // 全エピソードをセット
  setEpisodes(episodes: EpisodeProgress[]) {
    store = episodes;
  },

  // 1件追加
  addEpisode(episode: EpisodeProgress) {
    store = [...store, episode];
  },

  // 1件更新（episodeIdで一致するものを置き換え）
  updateEpisode(episode: EpisodeProgress) {
    store = store.map((e) => (e.episodeId === episode.episodeId ? episode : e));
  },

  // 1件削除
  removeEpisode(episodeId: string) {
    store = store.filter((e) => e.episodeId !== episodeId);
  },

  // 全クリア
  clear() {
    store = [];
  },
};
