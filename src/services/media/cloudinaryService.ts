import cloudinary from "../../config/cloudinary.ts";

export interface CloudinaryUploadSignature {
  timestamp: number;
  signature: string;
  cloudName: string;
  apiKey: string;
  folder: string;
  uploadPreset?: never;
}

export interface CloudinaryMediaItem {
  asset_id: string;
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
  resource_type: string;
}

export interface CloudinaryMediaPage {
  items: CloudinaryMediaItem[];
  nextCursor: string | null;
}

export function createCloudinaryUploadSignature(): CloudinaryUploadSignature {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary environment variables are not configured.");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "sam";

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder,
    },
    apiSecret
  );

  return {
    timestamp,
    signature,
    cloudName,
    apiKey,
    folder,
  };
}

export async function listCloudinaryMedia(
  limit = 24,
  nextCursor?: string
): Promise<CloudinaryMediaPage> {
  const safeLimit = Math.min(Math.max(Math.floor(limit), 1), 100);

  const search = cloudinary.search
    .expression('resource_type:image AND folder:"sam"')
    .sort_by("created_at", "desc")
    .max_results(safeLimit);

  if (nextCursor) {
    search.next_cursor(nextCursor);
  }

  const result = await search.execute();

  const items: CloudinaryMediaItem[] = result.resources.map(
    (resource: CloudinaryMediaItem) => ({
      asset_id: resource.asset_id,
      public_id: resource.public_id,
      secure_url: resource.secure_url,
      format: resource.format,
      width: resource.width,
      height: resource.height,
      bytes: resource.bytes,
      created_at: resource.created_at,
      resource_type: resource.resource_type,
    })
  );

  return {
    items,
    nextCursor: result.next_cursor ?? null,
  };
}