import { addDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase_config";

export type SongVideo = {
  title: string;
  videoId: string;
};

const addSongVideo = async (songVideo: SongVideo) => {
  // console.log("Adding song video:", songVideo);
  try {
    // Check if the song video already exists
    const songVideoQuery = query(
      collection(db, "song-video"),
      where("song", "==", songVideo.title),
      where("videoId", "==", songVideo.videoId),
    );
    const querySnapshot = await getDocs(songVideoQuery);
    if (!querySnapshot.empty) {
      // console.log("Song video already exists:", querySnapshot.docs[0].id);
      return; // Song video already exists, no need to add
    }
    const docRef = await addDoc(collection(db, "song-video"), {
      song: songVideo.title,
      videoId: songVideo.videoId,
      createdAt: new Date(),
    });
    console.log("Song video added with ID: ", docRef.id);
  } catch (error) {
    console.error("Error adding song video:", error);
  }
};
const getRecentSongVideos = async (limit: number) => {
  try {
    const querySnapshot = await getDocs(collection(db, "song-video"));
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

// const updateSongVideo = async (songVideoId, updatedData) => {
//   try {
//     const docRef = doc(db, "song-video", songVideoId);
//     await updateDoc(docRef, updatedData);
//     console.log("Song video updated with ID: ", songVideoId);
//   } catch (error) {
//     console.error("Error updating song video:", error);
//   }
// };

export { addSongVideo, getRecentSongVideos };
