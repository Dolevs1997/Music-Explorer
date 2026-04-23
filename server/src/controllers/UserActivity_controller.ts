import { Request, Response } from "express";
import { UserModel } from "../schemas/User_schema";

const update = async (req: Request, res: Response) => {
  const userId = req.query.id as string;
  console.log("user id: ", userId);
  const { activity } = req.body;
  console.log("activity", activity);
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }
  if (!activity) {
    return res.status(400).json({ message: "Activity data is required" });
  }
  try {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { activity },
      { new: true },
    );
    console.log("user: ", user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res
      .status(200)
      .json({ message: "User activity updated successfully", user });
  } catch (error) {
    console.error("Error updating user activity:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default { update };
