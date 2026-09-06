import { UserModel } from "../../models/User.ts";
import { AppError } from "../../errors/AppError.ts";

interface CurrentUser {
  id: string;
  email: string;
  role: "super_admin" | "admin";
  mustChangePassword: boolean;
}

export async function getCurrentUser(
  userId: string
): Promise<CurrentUser> {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new AppError(
      "User not found",
      404,
      "USER_NOT_FOUND"
    );
  }

  if (!user.isActive) {
    throw new AppError(
      "Account is inactive",
      403,
      "ACCOUNT_INACTIVE"
    );
  }

  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
  };
}