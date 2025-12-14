// lib/image-utils.ts
export function getImageUrl(filename: string): string {
    if (!filename) return "";

    // Use environment variable for flexibility
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    return `${baseUrl}/uploads/products/${filename}`;
}

// Optional: Helper for multiple images
export function getImageUrls(filenames: string[]): string[] {
    return filenames.map(getImageUrl);
}