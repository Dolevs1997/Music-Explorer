// import {
//   addDoc,
//   collection,
//   arrayUnion,
//   query,
//   where,
//   getDoc,
//   getDocs,
// } from "firebase/firestore";
// import { db } from "../../config/firebase_config.js";
// import { addSongsUser } from "./songsUser.js"; // Import the function to add songs user
// const addPlaylistsUser = async (newPlaylist, newSong, userRef) => {
//   try {
//     // Check if the user reference is valid
//     if (!userRef || !userRef.id) {
//       console.error("Invalid user reference provided:", userRef);
//       return { error: "Invalid user reference" };
//     }

//     // adding the song to the user's songs collection
//     const newSongRef = await addSongsUser(newSong, userRef);
//     const docSnap = await getDoc(newSongRef);
//     if (!docSnap.exists()) {
//       console.error("No such song exists in Firestore:", newSongRef);
//       return { error: "Song does not exist in Firestore" };
//     }

//     // // Log the new song reference for debugging
//     // console.log("New song reference:", newSongRef.id);
//     // console.log("New song data:", docSnap.data());

//     // console.log("Adding song to playlist:", {
//     //   song: newSongRef.song,
//     //   user: userRef,
//     // });
//     const docRef = await addDoc(collection(db, "playlists-user"), {
//       name: newPlaylist.name,
//       user: userRef,
//       songs: arrayUnion(newSongRef),
//     });

//     return docRef; // Return the document reference or ID
//   } catch (error) {
//     console.error("Error adding playlist user:", error);
//   }
// };

// const getPlaylistUser = async (playlistName, userRef) => {
//   try {
//     const playlistRef = collection(db, "playlists-user");
//     const playlistQuery = query(
//       playlistRef,
//       where("name", "==", playlistName),
//       where("user", "==", userRef)
//     );

//     // console.log("Firestore playlist query:", playlistQuery);
//     const querySnapshot = await getDocs(playlistQuery);
//     if (querySnapshot.empty) {
//       return null; // Return null if no playlist is found
//     }
//     let playlistData = null;
//     querySnapshot.forEach((doc) => {
//       playlistData = { id: doc.id, ...doc.data() };
//     });
//     return playlistData;
//   } catch (error) {
//     console.error("Error getting playlist user:", error);
//     return { error: "Error getting playlist user" };
//   }
// };

// export { addPlaylistsUser, getPlaylistUser };
