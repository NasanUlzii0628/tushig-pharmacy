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
import { X, Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import type { SupplierType } from "@/types/supplier";
import { createProdcut } from "@/services/actions/product";
import { uploadProductImages } from "@/services/actions/upload";

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
        default_supplier_id: 1,
    });
    const [mainImage, setMainImage] = React.useState<File | null>(null);
    const [addiImages, setAddiImages] = React.useState<File[]>([]);
    const [previewMain, setPreviewMain] = React.useState<string>("");
    const [previewAddi, setPreviewAddi] = React.useState<string[]>([]);

    const handleMainImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setMainImage(file);
        setPreviewMain(URL.createObjectURL(file));
    };

    const handleAddiImages = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setAddiImages((prev) => [...prev, ...files]);
        const newPreviews = files.map((f) => URL.createObjectURL(f));
        setPreviewAddi((prev) => [...prev, ...newPreviews]);
    };

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        toast.loading("Зураг байршуулж байна...");

        try {
            let imgName = "";
            let addiImgNames: string[] = [];

            if (mainImage) {
                const [uploaded] = await uploadProductImages([mainImage]);
                imgName = uploaded;
            }

            if (addiImages.length > 0) {
                addiImgNames = await uploadProductImages(addiImages);
            }

            toast.loading("Бүтээгдэхүүн хадгалж байна...");

            const payload = {
                name: product.name,
                img: imgName,
                addi_imgs: addiImgNames,
                default_price: product.default_price,
                default_supplier_id: product.default_supplier_id,
            };

            const res = await createProdcut(payload);

            if (!res.success) {
                toast.error(res.message || "Алдаа гарлаа");
                return;
            }

            toast.success("Бүтээгдэхүүн амжилттай нэмэгдлээ!");
            closeDrawer();
            await refresh();
        } catch (err) {
            console.error(err);
            toast.error("Алдаа гарлаа!");
        }
    }

    return (
        <form className={cn("grid gap-6", className)} onSubmit={onSubmit}>
            {/* Product Name */}
            <div className="grid gap-2">
                <label>Бүтээгдэхүүний нэр</label>
                <Input
                    value={product.name}
                    onChange={(e) => setProduct((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Жишээ: Нарийн лент"
                    required
                />
            </div>

            {/* Default Price */}
            <div className="grid gap-2">
                <label>Үнэ (¥)</label>
                <Input
                    type="number"
                    placeholder="Үнэ"
                    value={product.default_price === 0 ? "" : product.default_price}
                    onChange={(e) =>
                        setProduct((p) => ({
                            ...p,
                            default_price: e.target.value === "" ? 0 : Number(e.target.value),
                        }))
                    }
                    required
                />
            </div>

            {/* Supplier Selection */}
            <div className="grid gap-2">
                <label>Нийлүүлэгч</label>
                <Select
                    onValueChange={(value) =>
                        setProduct((p) => ({ ...p, default_supplier_id: Number(value) }))
                    }
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
                <label>Зураг</label>
                {previewMain ? (
                    <div className="relative w-32 h-32">
                        <img
                            src={previewMain}
                            className="w-full h-full rounded-md object-cover border"
                        />
                        <button
                            type="button"
                            className="absolute top-1 right-1 bg-black/60 rounded-full p-1"
                            onClick={() => {
                                setMainImage(null);
                                setPreviewMain("");
                            }}
                        >
                            <X className="w-4 h-4 text-white" />
                        </button>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center h-32 border rounded-md cursor-pointer hover:bg-accent">
                        <Upload className="w-6 h-6 mb-2" />
                        <span className="text-sm text-muted-foreground">Зураг сонгох</span>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleMainImage}
                        />
                    </label>
                )}
            </div>

            {/* Additional Images */}
            <div className="grid gap-2">
                <label>Нэмэлт зургууд</label>
                <label className="flex flex-col items-center justify-center h-24 border rounded-md cursor-pointer hover:bg-accent">
                    <Upload className="w-5 h-5 mb-1" />
                    <span className="text-xs text-muted-foreground">Файлууд нэмэх</span>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleAddiImages}
                    />
                </label>

                <div className="flex gap-2 flex-wrap">
                    {previewAddi.map((src, i) => (
                        <div key={i} className="relative w-20 h-20">
                            <img src={src} className="w-full h-full rounded-md object-cover border" />
                            <button
                                type="button"
                                className="absolute top-1 right-1 bg-black/60 rounded-full p-1"
                                onClick={() => {
                                    setAddiImages((prev) => prev.filter((_, idx) => idx !== i));
                                    setPreviewAddi((prev) => prev.filter((_, idx) => idx !== i));
                                }}
                            >
                                <X className="w-3 h-3 text-white" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <Button type="submit" className="w-full mt-2">
                Хадгалах
            </Button>
        </form>
    );
}
