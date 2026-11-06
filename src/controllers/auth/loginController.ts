import type { Response } from "express";
import { loginUser } from "../../services/auth/authService.ts";
import type { AuthenticatedRequest } from "../../middleware/authenticate.ts";
import { AppError } from "../../errors/AppError.ts";


export async function login(
req: AuthenticatedRequest,
res: Response
): Promise<void> {
const { email, password } = req.body;

if (!email || !password) {
throw new AppError(
"Email and password are required",
400,
"VALIDATION_ERROR"
);
}

const result = await loginUser(
{
email,
password,
},
{
ipAddress: req.ip,
userAgent: req.get("user-agent") ?? undefined,
}
);

res.cookie("refreshToken", result.refreshToken, {
httpOnly: true,
secure: process.env.NODE_ENV === "production",
sameSite: "lax",
maxAge: 7 * 24 * 60 * 60 * 1000,
});

res.status(200).json({
success: true,
message: "Login successful",
user: result.user,
accessToken: result.accessToken,
});
}

