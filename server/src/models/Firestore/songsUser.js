import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  deleteDoc,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../../config/firebase_config.js";

const addSongsUser = async (songUser, userRef) => {
  const existingSong = await getSongUser(songUser.videoId, userRef);
  if (existingSong) {
    return existingSong; // Return the existing song if it already exists
  }
  try {
    const docRef = await addDoc(collection(db, "songs-user"), {
      song: songUser.song,
      videoId: songUser.videoId,
      user: userRef, // Store the user reference
    });

    // console.log("New song added to user:", {
    //   id: docRef.id,
    //   artist: songUser.artist,
    //   title: songUser.title,
    //   user: userRef,
    // });

    return docRef;
  } catch (error) {
    console.error("Error adding songs user:", error);
  }
};

const getSongUser = async (videoId, userRef) => {
  // console.log("Getting song for videoId:", videoId, "and userRef:", userRef);
  try {
    const songQuery = query(
      collection(db, "songs-user"),
      where("videoId", "==", videoId),
      where("user", "==", userRef) // Query to find song by name, artist, and user ID
    );
    const querySnapshot = await getDocs(songQuery);
    if (querySnapshot.empty) {
      console.log("No song found with this videoId for the user:", videoId);
      return null; // Return null if no song is found
    }
    // console.log("Query snapshot:", querySnapshot);
    // const existingSongRef = querySnapshot.docs[0].ref; // Get the first document reference
    // console.log("Found song in Firestore:", existingSongRef);
    // return existingSongRef; // Return the document reference of the existing song

    let songData = null;
    querySnapshot.forEach((doc) => {
      songData = { id: doc.id, ...doc.data() };
    });
    const songDocRef = doc(db, "songs-user", songData.id);
    return songDocRef;
  } catch (error) {
    console.error("Error getting song user:", error);
    return { error: "Error getting song user" };
  }
};

const deleteSongUser = async (song, playlistRef, userRef) => {
  try {
    const songRef = await getSongUser(song.videoId, userRef);
    if (!songRef) {
      console.log("Song not found for deletion:", song);
      return;
    }

    const playlistDocRef = doc(db, "playlists-user", playlistRef.id);
    // console.log("Playlist doc ref for deletion:", playlistDocRef);

    // Remove the song reference from the playlist's songs array
    await updateDoc(playlistDocRef, {
      songs: arrayRemove(songRef),
    });

    console.log("Removed song from playlist:", song.videoId);

    //checking if the song is in other playlists of the user
    const songQuery = query(
      collection(db, "playlists-user"),
      where("songs", "array-contains", songRef),
      where("user", "==", userRef)
    );
    const querySnapshot = await getDocs(songQuery);
    console.log("Song found in other playlists count:", querySnapshot.size);
    if (querySnapshot.empty) {
      // If the song is not in any other playlists, delete it from songs-user
      await deleteDoc(songRef);
      console.log("Deleted song from user songs:", song.videoId);
    }

    return songRef;
  } catch (error) {
    console.error("Error deleting song user:", error);
  }
};

export { addSongsUser, getSongUser, deleteSongUser };
