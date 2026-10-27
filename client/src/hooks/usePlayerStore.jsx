import { create } from "zustand";
function findPlayable(queue, from, step) {
  for (let i = from; i >= 0 && i < queue.length; i += step) {
    if (queue[i]?.videoId) return i;
  }
  return -1; // אין שיר שאפשר לנגן בכיוון הזה
}
export const usePlayerStore = create((set, get) => ({
  queue: [],
  currentIndex: -1,
  source: null,
  isPlaying: false,
  country: "US",
  playPlaylist: (songs, index, source) => {
    if (!songs[index]?.videoId) return;
    set({
      queue: songs,
      currentIndex: index,
      source: source,
      isPlaying: true,
    });
  },

  next: () => {
    const { queue, currentIndex } = get();
    const i = findPlayable(queue, currentIndex + 1, 1);
    if (i === -1) {
      set({ isPlaying: false }); // סוף התור
      return;
    }
    set({ currentIndex: i });
  },

  prev: () => {
    const { queue, currentIndex } = get();
    const i = findPlayable(queue, currentIndex - 1, -1);
    if (i !== -1) set({ currentIndex: i });
  },

  setPlaying: (isPlaying) => set({ isPlaying }),
}));
