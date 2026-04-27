import { auth } from "../../config/firebase_config";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";

const updatePasswordForUser = async (
  currentPassword: string,
  newPassword: string,
) => {
  try {
    const firebaseUser = auth.currentUser;
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
export { updatePasswordForUser };
