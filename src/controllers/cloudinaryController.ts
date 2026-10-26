import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler.ts";
import {
  listCloudinaryMedia,
  createCloudinaryUploadSignature,
  getCloudinaryAsset,
  deleteCloudinaryMedia,
} from "../services/media/cloudinaryService.ts";
import { ManagedContentModel } from "../models/ManagedContent.ts";

export const getCloudinaryMedia = asyncHandler(
  async (req, res) => {
    const rawLimit = req.query.limit;
    const rawCursor = req.query.nextCursor;

    const limit =
      rawLimit === undefined ? 24 : Number(rawLimit);

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      res.status(400).json({
        success: false,
        message: "Limit must be an integer between 1 and 100.",
      });
      return;
    }

    if (
      rawCursor !== undefined &&
      (typeof rawCursor !== "string" || rawCursor.length > 2048)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid pagination cursor.",
      });
      return;
    }

    const media = await listCloudinaryMedia(
      limit,
      typeof rawCursor === "string"
        ? rawCursor
        : undefined
    );

    const publicIds = media.items.map(
      (item) => item.public_id
    );

    const escapedPublicIds = publicIds.map((publicId) =>
      publicId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    );

    const contentItems =
      publicIds.length > 0
        ? await ManagedContentModel.find({
            $or: [
              { heroImage: { $in: publicIds } },
              ...escapedPublicIds.map(
                (publicId) => ({
                  heroImage: {
                    $regex: `/${publicId}(?:\\.[^/?#]+)?(?:[?#]|$)`,
                    $options: "i",
                  },
                })
              ),
            ],
          })
            .select("_id title slug section category heroImage")
            .lean()
        : [];

    const items = media.items.map((item) => {
      const usedBy = contentItems
        .filter((content) => {
          if (!content.heroImage) {
            return false;
          }

          if (content.heroImage === item.public_id) {
            return true;
          }

          try {
            const imageUrl = new URL(content.heroImage);
            const imagePath = decodeURIComponent(
              imageUrl.pathname
            );

            return (
              imagePath.includes(
                `/${item.public_id}.`
              ) ||
              imagePath.endsWith(
                `/${item.public_id}`
              )
            );
          } catch {
            return false;
          }
        })
        .map((content) => ({
          id: content._id.toString(),
          title: content.title,
          slug: content.slug,
          section: content.section,
          category: content.category,
        }));

      return {
        ...item,
        usedBy,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        ...media,
        items,
      },
    });
  }
);
export function createCloudinaryUploadSignatureController(
  _req: Request,
  res: Response
): void {
  const signature = createCloudinaryUploadSignature();

  res.status(200).json({
    success: true,
    data: signature,
  });
}

export const deleteCloudinaryMediaController = asyncHandler(
  async (req, res) => {
    const publicId: unknown = req.body?.publicId;

    if (
      typeof publicId !== "string" ||
      !publicId.startsWith("sam/") ||
      publicId.length <= 4 ||
      publicId.length > 255 ||
      publicId.includes("..")
    ) {
      res.status(400).json({
        success: false,
        message: "A valid Cloudinary public ID is required.",
      });
      return;
    }

    const asset = await getCloudinaryAsset(publicId);

    if (!asset) {
      res.status(404).json({
        success: false,
        message: "Image not found.",
      });
      return;
    }

    const escapedPublicId = asset.publicId.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const imageUrlPattern = new RegExp(
      `/${escapedPublicId}\\.(?:jpg|jpeg|png|webp|gif|avif|bmp|tif|tiff)(?:$|[?#])`,
      "i"
    );

    const isInUse = await ManagedContentModel.exists({
      heroImage: imageUrlPattern,
    });

    if (isInUse) {
      res.status(409).json({
        success: false,
        message:
          "This image is currently used by managed content. Replace or remove the image reference before deleting it.",
      });
      return;
    }

    const result = await deleteCloudinaryMedia(asset.publicId);

    if (result.result !== "ok") {
      res.status(502).json({
        success: false,
        message: "Cloudinary could not delete the image.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Image deleted successfully.",
      data: {
        publicId: asset.publicId,
      },
    });
  }
);