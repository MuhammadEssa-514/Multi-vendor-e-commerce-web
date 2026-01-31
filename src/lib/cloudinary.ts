
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Extracts the public_id from a Cloudinary URL
 * Example: https://res.cloudinary.com/cloud/image/upload/v123/folder/name.jpg -> folder/name
 */
export const getPublicIdFromUrl = (url: string): string | null => {
    if (!url || !url.includes("cloudinary.com")) return null;

    try {
        // Find the index of /upload/
        const parts = url.split("/");
        const uploadIndex = parts.indexOf("upload");
        if (uploadIndex === -1) return null;

        // The public ID is everything after the transformation block (if any)
        // Skip 'upload' and the next part if it starts with 'v' followed by numbers (version) or contains transformations (c_fill, etc)
        let startIndex = uploadIndex + 1;
        while (startIndex < parts.length && (parts[startIndex].startsWith('v') || parts[startIndex].includes(','))) {
            startIndex++;
        }

        // Join the remaining parts and remove the extension
        const publicIdWithExtension = parts.slice(startIndex).join("/");
        return publicIdWithExtension.replace(/\.[^/.]+$/, "");
    } catch (error) {
        console.error("Error extracting publicId from URL:", error);
        return null;
    }
};

/**
 * Deletes an image from Cloudinary
 */
export const deleteFromCloudinary = async (url: string) => {
    const publicId = getPublicIdFromUrl(url);
    if (!publicId) return;

    try {
        await cloudinary.uploader.destroy(publicId);
        console.log(`✅ Deleted from Cloudinary: ${publicId}`);
    } catch (error) {
        console.error(`❌ Failed to delete from Cloudinary: ${publicId}`, error);
    }
};

/**
 * Deletes multiple images from Cloudinary
 */
export const deleteManyFromCloudinary = async (urls: string[]) => {
    const publicIds = urls
        .map(url => getPublicIdFromUrl(url))
        .filter((id): id is string => id !== null);

    if (publicIds.length === 0) return;

    try {
        // Cloudinary doesn't have a direct 'destroyMany' in the same way, 
        // but uploader.destroy takes a single ID. 
        // api.delete_resources is better for multiple.
        await cloudinary.api.delete_resources(publicIds);
        console.log(`✅ Deleted multiple from Cloudinary: ${publicIds.length} images`);
    } catch (error) {
        console.error(`❌ Failed to delete multiple from Cloudinary`, error);
    }
};
