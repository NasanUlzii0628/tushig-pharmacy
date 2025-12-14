// components/CreateDrawer.tsx - Updated ProductForm with logging
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { X, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import type { SupplierType } from "@/types/supplier";
import { createProdcut } from "@/services/actions/product";
import { uploadProductImages } from "@/services/actions/upload";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function CreateDrawer({
    supplierData,
    open,
    setOpen,
    refresh,
}: {
    supplierData: SupplierType[];
    open: boolean;
    setOpen: (v: boolean) => void;
    refresh: () => void;
}) {
    return (
        <Drawer direction="right" open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button variant="outline">Бүтээгдэхүүн нэмэх +</Button>
            </DrawerTrigger>

            <DrawerContent className="w-[420px] sm:w-[520px] md:w-[620px]">
                <DrawerHeader className="text-left">
                    <DrawerTitle className="pt-4">Бүтээгдэхүүн нэмэх</DrawerTitle>
                </DrawerHeader>

                <ProductForm
                    className="px-4 pt-2"
                    supplierData={supplierData}
                    closeDrawer={() => setOpen(false)}
                    refresh={refresh}
                />

                <DrawerFooter className="pt-2">
                    <DrawerClose asChild>
                        <Button variant="outline">Болих</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

export function ProductForm({
    className,
    supplierData,
    closeDrawer,
    refresh,
}: {
    className?: string;
    supplierData: SupplierType[];
    closeDrawer: () => void;
    refresh: () => void;
}) {
    const [product, setProduct] = React.useState({
        name: "",
        default_price: 0,
        default_supplier_id: supplierData[0]?.id || 1,
    });
    const [mainImage, setMainImage] = React.useState<File | null>(null);
    const [addiImages, setAddiImages] = React.useState<File[]>([]);
    const [previewMain, setPreviewMain] = React.useState<string>("");
    const [previewAddi, setPreviewAddi] = React.useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const validateFile = (file: File): boolean => {
        console.log("📋 Validating file:", {
            name: file.name,
            type: file.type,
            size: file.size,
            sizeInMB: (file.size / 1024 / 1024).toFixed(2) + " MB"
        });

        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
            console.error("❌ Invalid file type:", file.type);
            toast.error(`${file.name}: Зөвхөн зураг файл байх ёстой (JPG, PNG, WEBP)`);
            return false;
        }
        if (file.size > MAX_FILE_SIZE) {
            console.error("❌ File too large:", (file.size / 1024 / 1024).toFixed(2) + " MB");
            toast.error(`${file.name}: Файлын хэмжээ 5MB-аас бага байх ёстой`);
            return false;
        }

        console.log("✅ File validation passed");
        return true;
    };

    const handleMainImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("🖼️ Main image selected");
        const file = e.target.files?.[0];
        if (!file) {
            console.log("⚠️ No file selected");
            return;
        }

        console.log("📁 Main image file:", {
            name: file.name,
            type: file.type,
            size: file.size
        });

        if (!validateFile(file)) {
            e.target.value = ""; // Reset input
            return;
        }

        setMainImage(file);
        setPreviewMain(URL.createObjectURL(file));
        console.log("✅ Main image set successfully");
    };

    const handleAddiImages = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("🖼️ Additional images selected");
        const files = Array.from(e.target.files || []);
        console.log(`📁 Selected ${files.length} additional files`);

        const validFiles = files.filter(validateFile);
        console.log(`✅ Valid files: ${validFiles.length}/${files.length}`);

        if (validFiles.length === 0) {
            e.target.value = ""; // Reset input
            console.log("⚠️ No valid files to add");
            return;
        }

        setAddiImages((prev) => {
            const newImages = [...prev, ...validFiles];
            console.log(`📊 Total additional images: ${newImages.length}`);
            return newImages;
        });

        const newPreviews = validFiles.map((f) => URL.createObjectURL(f));
        setPreviewAddi((prev) => [...prev, ...newPreviews]);

        e.target.value = ""; // Reset input to allow re-selecting same file
    };

    const removeMainImage = () => {
        console.log("🗑️ Removing main image");
        if (previewMain) {
            URL.revokeObjectURL(previewMain);
        }
        setMainImage(null);
        setPreviewMain("");
    };

    const removeAddiImage = (index: number) => {
        console.log(`🗑️ Removing additional image at index ${index}`);
        if (previewAddi[index]) {
            URL.revokeObjectURL(previewAddi[index]);
        }
        setAddiImages((prev) => prev.filter((_, idx) => idx !== index));
        setPreviewAddi((prev) => prev.filter((_, idx) => idx !== index));
    };

    // Cleanup previews on unmount
    React.useEffect(() => {
        return () => {
            console.log("🧹 Cleaning up preview URLs");
            if (previewMain) URL.revokeObjectURL(previewMain);
            previewAddi.forEach((url) => URL.revokeObjectURL(url));
        };
    }, []);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        console.log("\n=================================");
        console.log("🚀 FORM SUBMISSION STARTED");
        console.log("=================================");

        if (!mainImage) {
            console.error("❌ No main image provided");
            toast.error("Үндсэн зураг заавал оруулна уу!");
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading("Зураг байршуулж байна...");

        try {
            // Upload main image
            console.log("\n📤 Step 1: Uploading main image...");

            const mainUploadRes = await uploadProductImages([mainImage]);

            console.log("\n📥 Main image upload response:", mainUploadRes);

            // ✅ Simplified - data is always string[] or null
            if (!mainUploadRes.success || !mainUploadRes.data || mainUploadRes.data.length === 0) {
                throw new Error(mainUploadRes.message || "Үндсэн зураг байршуулахад алдаа гарлаа");
            }

            const imgName = mainUploadRes.data[0];
            console.log("✅ Main image filename:", imgName);

            // Upload additional images
            let addiImgNames: string[] = [];
            if (addiImages.length > 0) {
                console.log(`\n📤 Step 2: Uploading ${addiImages.length} additional images...`);
                toast.loading("Нэмэлт зургууд байршуулж байна...", { id: toastId });

                const addiRes = await uploadProductImages(addiImages);

                console.log("\n📥 Additional images upload response:", addiRes);

                if (!addiRes.success || !addiRes.data) {
                    throw new Error(addiRes.message || "Нэмэлт зургууд байршуулахад алдаа гарлаа");
                }

                addiImgNames = addiRes.data;
                console.log("✅ Additional images filenames:", addiImgNames);
            }

            // Create product
            console.log("\n📤 Step 3: Creating product...");
            toast.loading("Бүтээгдэхүүн хадгалж байна...", { id: toastId });

            const payload = {
                name: product.name,
                img: imgName,
                addi_imgs: addiImgNames,
                default_price: product.default_price,
                default_supplier_id: product.default_supplier_id,
            };

            console.log("\n📦 Product payload:", JSON.stringify(payload, null, 2));

            const res = await createProdcut(payload);

            console.log("\n📥 Product creation response:", res);

            if (!res.success) {
                throw new Error(res.message || "Бүтээгдэхүүн хадгалахад алдаа гарлаа");
            }

            console.log("\n✅ ✅ ✅ SUCCESS! Product created successfully!");
            console.log("=================================\n");

            toast.success("Бүтээгдэхүүн амжилттай нэмэгдлээ!", { id: toastId });
            closeDrawer();
            await refresh();
        } catch (err) {
            console.error("\n❌ ❌ ❌ ERROR OCCURRED!");
            console.error("Error details:", err);
            console.error("Error message:", (err as Error).message);
            console.error("Error stack:", (err as Error).stack);
            console.log("=================================\n");

            toast.error((err as Error).message || "Алдаа гарлаа!", { id: toastId });
        } finally {
            setIsSubmitting(false);
            console.log("🏁 Form submission finished");
        }
    }

    return (
        <form className={cn("grid gap-6 overflow-y-auto max-h-[calc(100vh-200px)]", className)} onSubmit={onSubmit}>
            {/* Product Name */}
            <div className="grid gap-2">
                <label className="text-sm font-medium">
                    Бүтээгдэхүүний нэр <span className="text-red-500">*</span>
                </label>
                <Input
                    value={product.name}
                    onChange={(e) => {
                        console.log("📝 Product name changed:", e.target.value);
                        setProduct((p) => ({ ...p, name: e.target.value }));
                    }}
                    placeholder="Жишээ: Нарийн лент"
                    required
                    disabled={isSubmitting}
                />
            </div>

            {/* Default Price */}
            <div className="grid gap-2">
                <label className="text-sm font-medium">
                    Үнэ (¥) <span className="text-red-500">*</span>
                </label>
                <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Үнэ"
                    value={product.default_price === 0 ? "" : product.default_price}
                    onChange={(e) => {
                        const newPrice = e.target.value === "" ? 0 : Number(e.target.value);
                        console.log("💰 Price changed:", newPrice);
                        setProduct((p) => ({
                            ...p,
                            default_price: newPrice,
                        }));
                    }}
                    required
                    disabled={isSubmitting}
                />
            </div>

            {/* Supplier Selection */}
            <div className="grid gap-2">
                <label className="text-sm font-medium">
                    Нийлүүлэгч <span className="text-red-500">*</span>
                </label>
                <Select
                    value={product.default_supplier_id.toString()}
                    onValueChange={(value) => {
                        console.log("🏭 Supplier changed:", value);
                        setProduct((p) => ({ ...p, default_supplier_id: Number(value) }));
                    }}
                    disabled={isSubmitting}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Нийлүүлэгч сонгох" />
                    </SelectTrigger>
                    <SelectContent>
                        {supplierData.map((s) => (
                            <SelectItem key={s.id} value={s.id.toString()}>
                                {s.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Main Image */}
            <div className="grid gap-2">
                <label className="text-sm font-medium">
                    Үндсэн зураг <span className="text-red-500">*</span>
                </label>
                {previewMain ? (
                    <div className="relative w-32 h-32">
                        <img
                            src={previewMain}
                            alt="Preview"
                            className="w-full h-full rounded-md object-cover border"
                        />
                        <button
                            type="button"
                            className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 rounded-full p-1 transition-colors"
                            onClick={removeMainImage}
                            disabled={isSubmitting}
                        >
                            <X className="w-4 h-4 text-white" />
                        </button>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-md cursor-pointer hover:bg-accent transition-colors">
                        <Upload className="w-6 h-6 mb-2 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Зураг сонгох</span>
                        <span className="text-xs text-muted-foreground mt-1">JPG, PNG эсвэл WEBP (max 5MB)</span>
                        <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            className="hidden"
                            onChange={handleMainImage}
                            disabled={isSubmitting}
                        />
                    </label>
                )}
            </div>

            {/* Additional Images */}
            <div className="grid gap-2">
                <label className="text-sm font-medium">Нэмэлт зургууд</label>
                <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-md cursor-pointer hover:bg-accent transition-colors">
                    <Upload className="w-5 h-5 mb-1 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Файлууд нэмэх</span>
                    <span className="text-xs text-muted-foreground">JPG, PNG эсвэл WEBP (max 5MB)</span>
                    <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={handleAddiImages}
                        disabled={isSubmitting}
                    />
                </label>

                {previewAddi.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                        {previewAddi.map((src, i) => (
                            <div key={i} className="relative w-20 h-20">
                                <img
                                    src={src}
                                    alt={`Additional ${i + 1}`}
                                    className="w-full h-full rounded-md object-cover border"
                                />
                                <button
                                    type="button"
                                    className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 rounded-full p-1 transition-colors"
                                    onClick={() => removeAddiImage(i)}
                                    disabled={isSubmitting}
                                >
                                    <X className="w-3 h-3 text-white" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Хадгалж байна...
                    </>
                ) : (
                    "Хадгалах"
                )}
            </Button>
        </form>
    );
}