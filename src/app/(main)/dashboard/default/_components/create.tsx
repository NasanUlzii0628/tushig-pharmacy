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

import type { SupplierType } from "@/types/supplier";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { createProdcut } from "@/services/actions/product";
import { X, Upload } from "lucide-react";
import { Label } from "recharts";
import { toast } from "sonner";
import { fileToBase64 } from "@/utils";

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
            {/* Button that opens the drawer */}
            <DrawerTrigger asChild>
                <Button variant="outline">Бүтээгдэхүүн нэмэх +</Button>
            </DrawerTrigger>

            {/* Drawer Content */}
            <DrawerContent className="w-[420px] sm:w-[520px] md:w-[620px]">
                <DrawerHeader className="text-left">
                    <DrawerTitle className="pt-4">Бүтээгдэхүүн нэмэх</DrawerTitle>
                </DrawerHeader>

                {/* The form */}
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
        img: "",
        addi_imgs: [] as string[],
        default_price: 0,
        default_supplier_id: 1,
    });

    // Handle main image
    const handleMainImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        setProduct((prev) => ({ ...prev, img: url }));
    };

    // Handle additional images
    const handleAddiImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        const base64Images = await Promise.all(files.map((file) => fileToBase64(file)));

        setProduct((prev) => ({
            ...prev,
            addi_imgs: [...prev.addi_imgs, ...base64Images],
        }));
    };


    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();

        toast.loading("Бүтээгдэхүүн хадгалж байна...");

        const payload = {
            ...product,
            img: product.img || "",
            addi_imgs: product.addi_imgs,
        };

        const res = await createProdcut(payload);

        if (!res.success) {
            toast.error(res.message || "Алдаа гарлаа");
            return;
        }

        toast.success("Бүтээгдэхүүн амжилттай нэмэгдлээ!");

        closeDrawer();
        await refresh();
    }

    return (
        <form className={cn("grid gap-6", className)} onSubmit={onSubmit}>
            {/* Product Name */}
            <div className="grid gap-2">
                <Label>Бүтээгдэхүүний нэр</Label>
                <Input
                    value={product.name}
                    onChange={(e) =>
                        setProduct((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Жишээ: Нарийн лент"
                    required
                />
            </div>

            {/* Default Price */}
            <div className="grid gap-2">
                <Label>Анхны үнэ (₮)</Label>
                <Input
                    type="number"
                    value={product.default_price === 0 ? "" : product.default_price}
                    onChange={(e) =>
                        setProduct((prev) => ({
                            ...prev,
                            default_price: e.target.value === "" ? 0 : Number(e.target.value),
                        }))
                    }
                    required
                />
            </div>

            {/* Supplier Selection */}
            <div className="grid gap-2">
                <Label>Нийлүүлэгч</Label>
                <Select
                    onValueChange={(value) =>
                        setProduct((prev) => ({
                            ...prev,
                            default_supplier_id: Number(value),
                        }))
                    }
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Нийлүүлэгч сонгох" />
                    </SelectTrigger>

                    <SelectContent>
                        {supplierData.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                {supplier.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Main Image */}
            <div className="grid gap-2">
                <Label>Зураг</Label>

                {product.img ? (
                    <div className="relative w-32 h-32">
                        <img
                            src={product.img}
                            className="w-full h-full rounded-md object-cover border"
                        />
                        <button
                            type="button"
                            className="absolute top-1 right-1 bg-black/60 rounded-full p-1"
                            onClick={() => setProduct((prev) => ({ ...prev, img: "" }))}
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
                <Label>Нэмэлт зургууд</Label>

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
                    {product.addi_imgs.map((src, index) => (
                        <div key={index} className="relative w-20 h-20">
                            <img src={src} className="w-full h-full rounded-md object-cover border" />
                            <button
                                type="button"
                                className="absolute top-1 right-1 bg-black/60 rounded-full p-1"
                                onClick={() =>
                                    setProduct((prev) => ({
                                        ...prev,
                                        addi_imgs: prev.addi_imgs.filter((_, i) => i !== index),
                                    }))
                                }
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

