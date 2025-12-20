// services/actions/upload/index.ts
"use server";

import { POST } from "@/services/handler";

type UploadFileResponse = {
    originalName: string;
    fileName: string;
    mimeType: string;
    size: number;
    path: string;
    url: string;
};

type BackendUploadResponse = {
    message: string;
    files: UploadFileResponse[];
};

// ✅ Define the return type explicitly
type UploadImagesResult = {
    success: boolean;
    data: string[] | null; // Always return string[] of filenames or null
    message?: string;
    httpStatus?: number;
};

export async function uploadProductImages(files: File[]): Promise<UploadImagesResult> {
    const formData = new FormData();

    files.forEach((file) => {
        formData.append("images", file);
    });


    const response = await POST<BackendUploadResponse>({
        path: "/product/upload",
        payload: formData,
        plainRequest: false,
    });


    // ✅ Extract just the filenames from the response
    if (response.success && response.data?.files) {
        const filenames = response.data.files.map((file) => file.fileName);

        return {
            success: true,
            data: filenames, // Return array of filenames: ["1765717792307-86755504.jpg", ...]
            message: response.data.message,
            httpStatus: response.httpStatus,
        };
    }

    // ✅ Return consistent structure even on failure
    return {
        success: false,
        data: null,
        message: response.message || "Upload failed",
        httpStatus: response.httpStatus,
    };
}