import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { admin, db } from "../../config/firebase_config";
export type SongVideo = {
  title: string;
  videoId: string;
};

const addSongVideo = async (userId: string, songVideo: SongVideo) => {
  try {
    const col = admin.firestore().collection(`users/${userId}/song-video`);
    const snapshot = await col
      .where("song", "==", songVideo.title)
      .where("videoId", "==", songVideo.videoId)
      .get();
    if (!snapshot.empty) {
      return; // Song video already exists, no need to add
    }
    // // Check if the song video already exists
    // const songVideoQuery = query(
    //   collection(db, `users/${userId}/song-video`),
    //   where("song", "==", songVideo.title),
    //   where("videoId", "==", songVideo.videoId),
    // );
    // const querySnapshot = await getDocs(songVideoQuery);
    // console.log("Query snapshot size: ", querySnapshot.size);
    // if (!querySnapshot.empty) {
    //   // console.log("Song video already exists:", querySnapshot.docs[0].id);
    //   return; // Song video already exists, no need to add
    // }
    const docRef = await col.add({
      song: songVideo.title,
      videoId: songVideo.videoId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log("Song video added with ID: ", docRef.id);
  } catch (error) {
    console.error("Error adding song video:", error);
  }
};
const getRecentSongVideos = async (userId: string, limit: number) => {
  try {
    const col = admin.firestore().collection(`users/${userId}/song-video`);
    const querySnapshot = await col
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();
    // const querySnapshot = await getDocs(
    //   collection(db, `users/${userId}/song-video`),
    // );
    const allSongs: SongVideo[] = querySnapshot.docs.map((doc) => ({
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
  const col = admin.firestore().collection(`users/${userId}/song-video`);
  const querySnapshot = await col.get();
  // const querySnapshot = await getDocs(
  //   collection(db, `users/${userId}/song-video`),
  // );
  for (const song of querySnapshot.docs) {
    await deleteDoc(doc(db, `users/${userId}/song-video`, song.id));
  }
};

export { addSongVideo, getRecentSongVideos, deleteAllSongs };
