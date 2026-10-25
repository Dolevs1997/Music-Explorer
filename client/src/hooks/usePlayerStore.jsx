import { create } from "zustand";

export const usePlayerStore = create((set, get) => ({
  queue: [],
  currentIndex: -1,
  sourceId: null,
  isPlaying: false,

  playPlaylist: (songs, index, sourceId) =>
    set({ queue: songs, currentIndex: index, sourceId, isPlaying: true }),

  next: () => {
    const { currentIndex, queue } = get();
    if (currentIndex < queue.length - 1)
      set({ currentIndex: currentIndex + 1 });
  },

  prev: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) set({ currentIndex: currentIndex - 1 });
  },

  setPlaying: (isPlaying) => set({ isPlaying }),
}));
