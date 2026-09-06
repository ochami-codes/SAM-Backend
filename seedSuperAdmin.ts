import dotenv from "dotenv";
import path from "node:path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

import { connectDatabase } from "./src/config/database.ts";
import { UserModel } from "./src/models/User.ts";
import { hashPassword } from "./src/utils/password.ts";

async function seedSuperAdmin(): Promise<void> {
  try {
    await connectDatabase();

    const email = process.env.SUPER_ADMIN_EMAIL;
    const password = process.env.SUPER_ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error(
        "SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be defined in .env"
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check whether a super admin already exists
    const existingUser = await UserModel.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      console.log("Super admin already exists. Nothing to do.");
      return;
    }

    // Hash the initial password
    const passwordHash = await hashPassword(password);

    // Create the super admin
    const user = await UserModel.create({
      email: normalizedEmail,
      passwordHash,
      role: "super_admin",
      isActive: true,
      mustChangePassword: true,
    });

    console.log("Super admin created successfully.");
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log("Initial password must be changed after first login.");
  } catch (error) {
    console.error("Failed to seed super admin:", error);
    process.exitCode = 1;
  }
}

seedSuperAdmin();