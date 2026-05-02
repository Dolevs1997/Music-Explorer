import { app } from "../../config/firebase_config";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  getAuth,
  deleteUser,
} from "firebase/auth";

const updatePasswordForUser = async (
  currentPassword: string,
  newPassword: string,
) => {
  try {
    const auth = getAuth(app);
    const firebaseUser = auth.currentUser;
    console.log("firebaseUser: ", firebaseUser);
    if (!firebaseUser || !firebaseUser.email) {
      throw new Error("No authenticated user found");
    }
    const credential = EmailAuthProvider.credential(
      firebaseUser.email,
      currentPassword,
    );
    await reauthenticateWithCredential(firebaseUser, credential);
    await updatePassword(firebaseUser, newPassword);
  } catch (error: Error | any) {
    console.error("Error updating password:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

const deleteAccountForUser = async (currentPassword: string) => {
  try {
    const auth = getAuth(app);
    console.log("auth: ", auth);
    const firebaseUser = auth.currentUser;
    console.log("firebaseUser: ", firebaseUser);
    if (!firebaseUser || !firebaseUser.email) {
      throw new Error("No authenticated user found");
    }
    const credential = EmailAuthProvider.credential(
      firebaseUser.email,
      currentPassword,
    );
    await reauthenticateWithCredential(firebaseUser, credential);
    await deleteUser(firebaseUser);
  } catch (error: Error | any) {
    console.error("Error deleting account:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

export { updatePasswordForUser, deleteAccountForUser };
