import { app, admin } from "../../config/firebase_config";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { UserModel } from "../../schemas/User_schema";

const updatePasswordForUser = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
) => {
  try {
    const foundUser = await UserModel.findById(userId);
    if (!foundUser) {
      return { message: "User not found" };
    }

    const auth = getAuth(app);
    // Verify current password
    await signInWithEmailAndPassword(auth, foundUser.email, currentPassword);

    // Update password using admin SDK
    if (foundUser.uid) {
      await admin.auth().updateUser(foundUser.uid, { password: newPassword });
    } else {
      return { message: "User has no Firebase UID" };
    }
    return { message: "Password updated successfully" };
  } catch (error: Error | any) {
    return { message: error.message };
  }
};



export { updatePasswordForUser };
