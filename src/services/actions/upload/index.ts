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

type UploadImagesResult = {
    success: boolean;
    data: string[] | null;
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


    if (response.success && response.data?.files) {
        const filenames = response.data.files.map((file) => file.url);

        return {
            success: true,
            data: filenames,
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