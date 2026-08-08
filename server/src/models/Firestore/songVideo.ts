// import { deleteDoc, doc } from "firebase/firestore";
// import { db } from "../../config/firebase_config";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { adminDb } from "../../config/firebase_config";
export type SongVideo = {
  title: string;
  videoId: string;
};

const addSongVideo = async (userId: string, songVideo: SongVideo) => {
  try {
    const col = adminDb.collection(`users/${userId}/song-video`);
    const snapshot = await col
      .where("song", "==", songVideo.title)
      .where("videoId", "==", songVideo.videoId)
      .get();
    if (!snapshot.empty) {
      return; // Song video already exists, no need to add
    }

    const docRef = await col.add({
      song: songVideo.title,
      videoId: songVideo.videoId,
      createdAt: FieldValue.serverTimestamp(),
    });
    console.log("Song video added with ID: ", docRef.id);
  } catch (error) {
    console.error("Error adding song video:", error);
  }
};
const getRecentSongVideos = async (userId: string, limit: number) => {
  try {
    const col = adminDb.collection(`users/${userId}/song-video`);
    const querySnapshot = await col
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const allSongs: SongVideo[] = querySnapshot.docs.map((doc: any) => ({
      title: doc.data().song,
      videoId: doc.data().videoId,
    }));
    // Fisher-Yates shuffle — different result on every call
    for (let i = allSongs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allSongs[i], allSongs[j]] = [allSongs[j], allSongs[i]];
    }

    return allSongs.slice(0, limit);
  } catch (error) {
    console.error("Error retrieving recent song videos:", error);
    return [];
  }
};

const deleteAllSongs = async (userId: string) => {
  const col = adminDb.collection(`users/${userId}/song-video`);
  const querySnapshot = await col.get();
  for (const song of querySnapshot.docs) {
    await song.ref.delete(); // admin SDK method
  }
};

export { addSongVideo, getRecentSongVideos, deleteAllSongs };
