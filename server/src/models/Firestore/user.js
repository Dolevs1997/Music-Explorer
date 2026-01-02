import {
  addDoc,
  collection,
  getDocs,
  getDoc,
  query,
  where,
  updateDoc,
  doc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../../config/firebase_config.js"; // Import the Firestore database instance
import { addPlaylistsUser, getPlaylistUser } from "./playlistsUser.js"; // Import the function to add playlists user
import { addSongsUser } from "./songsUser.js"; // Import the function to add songs user

const addUser = async (email) => {
  try {
    const existingUser = await getUser(email); // Check if the user already exists
    if (existingUser) {
      console.log("User already exists with this email:", email);
      return { error: "User already exists with this email" };
    }
    const docRef = await addDoc(collection(db, "user"), {
      createdAt: new Date(),
      email: email,
      playlists: [],
    });
    // console.log("docRef", docRef);
    return docRef; // Return the document reference or ID
  } catch (error) {
    console.error("Error adding user:", error);
  }
};

const getUser = async (email) => {
  try {
    const userQuery = query(
      collection(db, "user"),
      where("email", "==", email)
    );
    const querySnapshot = await getDocs(userQuery);
    if (querySnapshot.empty) {
      // console.log("No user found with this email:", email);
      return null;
    }
    let userData = null;
    querySnapshot.forEach((doc) => {
      userData = { id: doc.id, ...doc.data() };
    });
    const userDocRef = doc(db, "user", userData.id);
    return userDocRef;
  } catch (error) {
    console.error("Error getting user:", error);
    return { error: "Error getting user" };
  }
};
const updateUser = async (email, newPlaylist, newSong) => {
  const user = await getUser(email);
  console.log("newSong in updateUser:", newSong);
  if (!user) {
    return { error: "User not found" };
  }
  try {
    const userRef = doc(db, "user", user.id);
    // get playlist if it exists
    const existingPlaylist = await getPlaylistUser(newPlaylist.name, userRef);
    // If the playlist already exists, add the song to the existing playlist
    if (existingPlaylist) {
      // If the playlist already exists, add the song to the existing playlist
      const newSongRef = await addSongsUser(newSong, userRef); // Add the new song to Firestore
      await updateDoc(doc(db, "playlists-user", existingPlaylist.id), {
        songs: arrayUnion(newSongRef), // Add the new song reference to the existing playlist
      });

      return { success: true };
    }
    // If the playlist does not exist, create a new one
    const newPlaylistRef = await addPlaylistsUser(
      newPlaylist,
      newSong,
      userRef
    );
    if (newPlaylistRef.error) {
      console.error(
        "Error adding playlist user in user.js:",
        newPlaylistRef.error
      );
      return { error: "Error adding playlist user" };
    }
    // Update the user's playlists with the new playlist reference
    await updateDoc(userRef, {
      playlists: arrayUnion(newPlaylistRef), // Add the new playlist reference to the user's playlists
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error);
    return { error: "Error updating user" };
  }
};

const deleteUser = async (email) => {
  // Implement the logic to delete a user by email from Firestore
  // This is a placeholder function
};

export { addUser, getUser, updateUser, deleteUser }; // Export the functions for use in other parts of the application
