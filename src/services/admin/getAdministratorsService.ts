import { UserModel } from "../../models/User.ts";

export async function getAdministrators() {
  return UserModel.find({
    role: "admin",
  })
    .select("fullName email role isActive createdAt")
    .sort({ createdAt: -1 })
    .lean();
}