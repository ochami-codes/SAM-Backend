import { SeoSettingsModel, type ISeoCategoryConfig } from "../../models/seo/SeoSettings.ts";
import { getMapValue } from "./seoService.ts";

export interface CategorySeoSettingsInput {
  section: string;
  category: string;
  titleTemplate?: string | undefined;
  descriptionTemplate?: string | undefined;
  defaultImage?: string | undefined;
}

function validateSeoKey(value: string, field: string): void {
  const isValid = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);

  if (!isValid) {
    throw new Error(
      `Invalid ${field}. Use lowercase letters, numbers, and hyphens only.`
    );
  }
}

export async function getCategorySeoSettings(
  section: string,
  category: string
): Promise<ISeoCategoryConfig | null> {
  const settings = await SeoSettingsModel.findOne({
    key: "global",
  }).lean();

  if (!settings) {
    return null;
  }

  const sectionSettings = getMapValue<{
    categories?: unknown;
  }>(settings.sections, section);

  const categorySettings = getMapValue<ISeoCategoryConfig>(
    sectionSettings?.categories,
    category
  );

  return categorySettings ?? null;
}

export async function upsertCategorySeoSettings(
  input: CategorySeoSettingsInput
): Promise<ISeoCategoryConfig> {
  validateSeoKey(input.section, "section");
  validateSeoKey(input.category, "category");

  const updateFields: Record<string, string> = {};

  if (input.titleTemplate !== undefined) {
    updateFields[
      `sections.${input.section}.categories.${input.category}.titleTemplate`
    ] = input.titleTemplate;
  }

  if (input.descriptionTemplate !== undefined) {
    updateFields[
      `sections.${input.section}.categories.${input.category}.descriptionTemplate`
    ] = input.descriptionTemplate;
  }

  if (input.defaultImage !== undefined) {
    updateFields[
      `sections.${input.section}.categories.${input.category}.defaultImage`
    ] = input.defaultImage;
  }

  if (Object.keys(updateFields).length === 0) {
    throw new Error("At least one category SEO field must be provided.");
  }

  await SeoSettingsModel.findOneAndUpdate(
    { key: "global" },
    {
      $set: updateFields,
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

  const updatedSettings = await getCategorySeoSettings(
    input.section,
    input.category
  );

  if (!updatedSettings) {
    throw new Error("Failed to update category SEO settings.");
  }

  return updatedSettings;
}

export async function deleteCategorySeoSettings(
  section: string,
  category: string
): Promise<void> {
  validateSeoKey(section, "section");
  validateSeoKey(category, "category");

  await SeoSettingsModel.findOneAndUpdate(
    { key: "global" },
    {
      $unset: {
        [`sections.${section}.categories.${category}`]: "",
      },
    },
    {
      runValidators: true,
    }
  );
}