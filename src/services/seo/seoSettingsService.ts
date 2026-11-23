import {
  SeoSettingsModel,
  type ISeoSettings,
} from "../../models/seo/SeoSettings.ts";

export type UpdateSeoSettingsInput = Partial<
  Omit<ISeoSettings, "key" | "createdAt" | "updatedAt">
>;

/**
 * Retrieve SAM's global SEO settings.
 */
export async function getSeoSettings(): Promise<
  ISeoSettings | null
> {
  return SeoSettingsModel.findOne({
    key: "global",
  }).lean();
}

/**
 * Create or update SAM's global SEO settings.
 */
export async function updateSeoSettings(
  input: UpdateSeoSettingsInput
): Promise<ISeoSettings> {
  const settings = await SeoSettingsModel.findOneAndUpdate(
    { key: "global" },
    {
      $set: input,
      $setOnInsert: {
        key: "global",
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  if (!settings) {
    throw new Error("Failed to update SEO settings.");
  }

  return settings.toObject();
}