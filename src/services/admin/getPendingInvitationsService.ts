import { AdminInvitationModel } from "../../models/AdminInvitation.ts";

export async function getPendingInvitations() {
  return AdminInvitationModel.find({
    expiresAt: { $gt: new Date() },
  })
    .select("-tokenHash")
    .populate("invitedBy", "fullName email")
    .sort({ createdAt: -1 })
    .lean();
}