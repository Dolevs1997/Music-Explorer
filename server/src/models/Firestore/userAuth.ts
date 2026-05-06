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
      throw new Error("User not found");
    }

    const auth = getAuth(app);
    // Verify current password
    console.log("foundUser.email: ", foundUser.email);
    console.log("currentPassword: ", currentPassword);
    const userCredential = await signInWithEmailAndPassword(auth, foundUser.email, currentPassword);
    const userAuth = userCredential.user;
    console.log("userAuth: ", userAuth);
    
    // Update password using admin SDK
    if (foundUser.uid) {
      await admin.auth().updateUser(foundUser.uid, { password: newPassword });
    } else {
      throw new Error("User has no Firebase UID");
    }
    return { message: "Password updated successfully" };
  } catch (error: Error | any) {
    throw error;
  }
};



export { updatePasswordForUser };
