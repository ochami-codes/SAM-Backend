import mongoose, { type HydratedDocument } from "mongoose";

import { type IManagedContent } from "../../models/ManagedContent.ts";

/* -------------------- Types -------------------- */
export type ManagedContent =
  mongoose.HydratedDocument<IManagedContent>;
 export type ManagedContentLeanDocument =
  IManagedContent & {
    _id: mongoose.Types.ObjectId;
  };

export interface ManagedContentListItem {
  id: string;
  title: string;
  slug: string;
  section: IManagedContent["section"];
  category?: string;
  description?: string;
  heroImage?: string;
  order?: number;
  status: IManagedContent["status"];
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ManagedContentData {
  id: string;
  title: string;
  slug: string;
  section: IManagedContent["section"];
  category?: string;
  content: string;
  description?: string;
  heroImage?: string;
  order?: number;
  status: IManagedContent["status"];
  createdBy: string;
  updatedBy: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type ManagedContentDocument = HydratedDocument<IManagedContent>;
export { listPublishedManagedContent } from "./managedContent/listPublishedManagedContent.ts";
export { getPublishedManagedContent } from "./managedContent/getPublishedManagedContent.ts";
export { listManagedContent } from "./managedContent/listManagedContent.ts";
export { getManagedContent } from "./managedContent/getManagedContent.ts";
export { createManagedContent } from "./managedContent/createManagedContent.ts";
export { updateManagedContent } from "./managedContent/updateManagedContent.ts";
export { deleteManagedContent } from "./managedContent/deleteManagedContent.ts";
export { publishManagedContent } from "./managedContent/publishManagedContent.ts";
export { unpublishManagedContent } from "./managedContent/unpublishManagedContent.ts";