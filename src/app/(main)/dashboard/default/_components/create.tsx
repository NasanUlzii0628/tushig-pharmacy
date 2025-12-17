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

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_ADDITIONAL_IMAGES = 2;
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
  const [isSubmitting, setIsSubmitting] = React.useState(false);
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
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
        />

        <DrawerFooter className="gap-2 pt-2">
          {/* SUBMIT BUTTON */}
          <Button type="submit" form="create-product-form" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Хадгалж байна...
              </>
            ) : (
              "Хадгалах"
            )}
          </Button>

          {/* CANCEL BUTTON */}
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Болих
            </Button>
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
  isSubmitting,
  setIsSubmitting,
}: {
  className?: string;
  supplierData: SupplierType[];
  closeDrawer: () => void;
  refresh: () => void;
  isSubmitting: boolean;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
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

  const validateFile = (file: File): boolean => {
 

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error(`${file.name}: Зөвхөн зураг файл байх ёстой (JPG, PNG, WEBP)`);
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`${file.name}: Файлын хэмжээ 5MB-аас бага байх ёстой`);
      return false;
    }

    return true;
  };

  const handleMainImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    if (!validateFile(file)) {
      e.target.value = "";
      return;
    }

    setMainImage(file);
    setPreviewMain(URL.createObjectURL(file));
  };

  const handleAddiImages = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []).filter(validateFile);

  if (!files.length) return;

  const remainingSlots = MAX_ADDITIONAL_IMAGES - addiImages.length;

  if (remainingSlots <= 0) {
    toast.error(`Хамгийн ихдээ ${MAX_ADDITIONAL_IMAGES} нэмэлт зураг оруулах боломжтой`);
    e.target.value = "";
    return;
  }

  const filesToAdd = files.slice(0, remainingSlots);

  if (files.length > remainingSlots) {
    toast.error(`Зөвхөн ${remainingSlots} зураг нэмж болно`);
  }

  setAddiImages((prev) => [...prev, ...filesToAdd]);
  setPreviewAddi((prev) => [
    ...prev,
    ...filesToAdd.map((f) => URL.createObjectURL(f)),
  ]);

  e.target.value = "";
};

  const removeMainImage = () => {
    if (previewMain) {
      URL.revokeObjectURL(previewMain);
    }
    setMainImage(null);
    setPreviewMain("");
  };

  const removeAddiImage = (index: number) => {
    if (previewAddi[index]) {
      URL.revokeObjectURL(previewAddi[index]);
    }
    setAddiImages((prev) => prev.filter((_, idx) => idx !== index));
    setPreviewAddi((prev) => prev.filter((_, idx) => idx !== index));
  };

  React.useEffect(() => {
    return () => {
      if (previewMain) URL.revokeObjectURL(previewMain);
      previewAddi.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!mainImage) {
      toast.error("Үндсэн зураг заавал оруулна уу!");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Зураг байршуулж байна...");

    try {

      const mainUploadRes = await uploadProductImages([mainImage]);

      if (!mainUploadRes.success || !mainUploadRes.data || mainUploadRes.data.length === 0) {
        throw new Error(mainUploadRes.message || "Үндсэн зураг байршуулахад алдаа гарлаа");
      }

      const imgName = mainUploadRes.data[0];

      let addiImgNames: string[] = [];
      if (addiImages.length > 0) {
        toast.loading("Нэмэлт зургууд байршуулж байна...", { id: toastId });

        const addiRes = await uploadProductImages(addiImages);


        if (!addiRes.success || !addiRes.data) {
          throw new Error(addiRes.message || "Нэмэлт зургууд байршуулахад алдаа гарлаа");
        }

        addiImgNames = addiRes.data;
      }

      toast.loading("Бүтээгдэхүүн хадгалж байна...", { id: toastId });

      const payload = {
        name: product.name,
        img: imgName,
        addi_imgs: addiImgNames,
        default_price: product.default_price,
        default_supplier_id: product.default_supplier_id,
      };

      const res = await createProdcut(payload);

      if (!res.success) {
        throw new Error(res.message || "Бүтээгдэхүүн хадгалахад алдаа гарлаа");
      }

      toast.success("Бүтээгдэхүүн амжилттай нэмэгдлээ!", { id: toastId });
      closeDrawer();
      await refresh();
    } catch (err) {
      toast.error((err as Error).message || "Алдаа гарлаа!", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      id="create-product-form"
      className={cn("grid max-h-[calc(100vh-200px)] gap-6 overflow-y-auto", className)}
      onSubmit={onSubmit}
    >
      <div className="grid gap-2">
        <label className="text-sm font-medium">
          Бүтээгдэхүүний нэр <span className="text-red-500">*</span>
        </label>
        <Input
          value={product.name}
          onChange={(e) => {
            setProduct((p) => ({ ...p, name: e.target.value }));
          }}
          placeholder="Жишээ: Нарийн лент"
          required
          disabled={isSubmitting}
        />
      </div>

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
            setProduct((p) => ({
              ...p,
              default_price: newPrice,
            }));
          }}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">
          Нийлүүлэгч <span className="text-red-500">*</span>
        </label>
        <Select
          value={product.default_supplier_id.toString()}
          onValueChange={(value) => {
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

      <div className="grid gap-2">
        <label className="text-sm font-medium">
          Үндсэн зураг <span className="text-red-500">*</span>
        </label>
        {previewMain ? (
          <div className="relative h-32 w-32">
            <img src={previewMain} alt="Preview" className="h-full w-full rounded-md border object-cover" />
            <button
              type="button"
              className="absolute top-1 right-1 rounded-full bg-black/60 p-1 transition-colors hover:bg-black/80"
              onClick={removeMainImage}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        ) : (
          <label className="hover:bg-accent flex h-32 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed transition-colors">
            <Upload className="text-muted-foreground mb-2 h-6 w-6" />
            <span className="text-muted-foreground text-sm">Зураг сонгох</span>
            <span className="text-muted-foreground mt-1 text-xs">JPG, PNG эсвэл WEBP (max 5MB)</span>
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

      <div className="grid gap-2">
        <label className="text-sm font-medium">Нэмэлт зургууд</label>
        <label className="hover:bg-accent flex h-24 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed transition-colors">
          <Upload className="text-muted-foreground mb-1 h-5 w-5" />
          <span className="text-muted-foreground text-xs">Файлууд нэмэх</span>
          <span className="text-muted-foreground text-xs">JPG, PNG эсвэл WEBP (max 5MB)</span>
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
          <div className="flex flex-wrap gap-2">
            {previewAddi.map((src, i) => (
              <div key={i} className="relative h-20 w-20">
                <img src={src} alt={`Additional ${i + 1}`} className="h-full w-full rounded-md border object-cover" />
                <button
                  type="button"
                  className="absolute top-1 right-1 rounded-full bg-black/60 p-1 transition-colors hover:bg-black/80"
                  onClick={() => removeAddiImage(i)}
                  disabled={isSubmitting}
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </form>
  );
}
