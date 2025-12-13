"use client";

export async function uploadProductImages(files: File[]): Promise<string[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    const res = await fetch(`http://localhost:3000/api/product/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
    });

    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.data; // e.g. ["7890b752-2ee0-4877-b4f6-f87c18f9ceb4.jpg"]
}