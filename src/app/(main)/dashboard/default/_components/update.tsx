"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

import type { ProductType } from "@/types/product";
import type { SupplierType } from "@/types/supplier";
import { updateProduct } from "@/services/actions/product";
import { uploadProductImages } from "@/services/actions/upload";

const MAX_FILE_SIZE = 40 * 1024 * 1024;
const MAX_ADDITIONAL_FILE_SIZE = 80 * 1024 * 1024;
const MAX_ADDITIONAL_IMAGES = 2;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const ProductUpdateSchema = z.object({
  name: z.string().min(1, ""),
  default_price: z.coerce.number().min(1, ""),
  default_supplier_id: z.coerce.number().min(1, ""),
});

type ProductUpdateFormValues = z.infer<typeof ProductUpdateSchema>;

type Props = {
  open: boolean;
  setOpen: (v: boolean) => void;
  product: ProductType;
  supplierData: SupplierType[];
  refresh: () => Promise<void>;
};

export function UpdateProductDrawer({ open, setOpen, product, supplierData, refresh }: Props) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerContent className="w-[420px] sm:w-[520px] md:w-[620px]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Бүтээгдэхүүний мэдээлэл шинэчлэх</DrawerTitle>
        </DrawerHeader>

        <UpdateProductForm
          product={product}
          supplierData={supplierData}
          className="px-4 pt-2"
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
          onSuccess={async () => {
            setOpen(false);
            await refresh();
          }}
        />

        <DrawerFooter className="gap-2 pt-2">
          <Button type="submit" form="update-product-form" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Шинэчилж байна...
              </>
            ) : (
              "Шинэчлэх"
            )}
          </Button>

          <DrawerClose asChild>
            <Button variant="outline" className="w-full" disabled={isSubmitting}>
              Болих
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}


function UpdateProductForm({
  className,
  product,
  supplierData,
  isSubmitting,
  setIsSubmitting,
  onSuccess,
}: {
  className?: string;
  product: ProductType;
  supplierData: SupplierType[];
  isSubmitting: boolean;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  onSuccess: () => Promise<void>;
}) {
  const resolvedSupplierId = product.default_supplier?.id ?? product.default_supplier_id ?? undefined;

  const form = useForm<ProductUpdateFormValues>({
    resolver: zodResolver(ProductUpdateSchema),
    defaultValues: {
      name: product.name ?? "",
      default_price: product.default_price != null ? Number(product.default_price) : 0,
      default_supplier_id: resolvedSupplierId,
    },
  });

  const [mainImage, setMainImage] = React.useState<File | null>(null);
  const [addiImages, setAddiImages] = React.useState<File[]>([]);

  const validAddiImgs = React.useMemo(() => {
    if (!Array.isArray(product.addi_imgs)) return [];
    return product.addi_imgs.filter((img) => img && img.trim() !== "");
  }, [product.addi_imgs]);

  const [existingAddiImages, setExistingAddiImages] = React.useState<string[]>(validAddiImgs);
  const [previewMain, setPreviewMain] = React.useState<string>(product.img);
  const [mainImageError, setMainImageError] = React.useState(false);
  const [previewAddi, setPreviewAddi] = React.useState<string[]>(
    validAddiImgs.filter((url) => url && !url.includes("placeholder")),
  );

  React.useEffect(() => {
    form.reset({
      name: product.name ?? "",
      default_price: product.default_price != null ? Number(product.default_price) : 0,
      default_supplier_id: product.default_supplier?.id ?? product.default_supplier_id ?? undefined,
    });
    setMainImage(null);
    setAddiImages([]);
    setExistingAddiImages(validAddiImgs);
    setPreviewMain(product.img);
    setMainImageError(false);
    setPreviewAddi(validAddiImgs.filter((url) => url && !url.includes("placeholder")));
  }, [product, validAddiImgs, form]);

  const validateFile = (file: File, maxSize: number = MAX_FILE_SIZE) => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Зөвхөн зураг файл (JPG, PNG, WEBP)");
      return false;
    }
    if (file.size > maxSize) {
      toast.error(`Файл ${maxSize / (1024 * 1024)}MB-аас бага байх ёстой`);
      return false;
    }
    return true;
  };

  const handleMainImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !validateFile(file)) return;

    setMainImage(file);
    setPreviewMain(URL.createObjectURL(file));
    setMainImageError(false);
  };

  const handleAddiImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((f) => validateFile(f, MAX_ADDITIONAL_FILE_SIZE));
    if (!files.length) return;

    const currentCount = existingAddiImages.length + addiImages.length;
    const remainingSlots = MAX_ADDITIONAL_IMAGES - currentCount;

    if (remainingSlots <= 0) {
      toast.error(`Хамгийн ихдээ ${MAX_ADDITIONAL_IMAGES} нэмэлт зураг байж болно`, {
        richColors: true,
      });
      e.target.value = "";
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      toast.error(`Зөвхөн ${remainingSlots} зураг нэмж болно`, {
        richColors: true,
      });
    }

    setAddiImages((prev) => [...prev, ...filesToAdd]);
    setPreviewAddi((prev) => [
      ...prev,
      ...filesToAdd.map((f) => URL.createObjectURL(f)),
    ]);

    e.target.value = "";
  };


  const removeAddiImage = (index: number) => {
    const url = previewAddi[index];

    if (url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
      const blobIndex = previewAddi.slice(0, index).filter((u) => u.startsWith("blob:")).length;
      setAddiImages((prev) => prev.filter((_, i) => i !== blobIndex));
    } else {
      const existingIndex = previewAddi.slice(0, index).filter((u) => !u.startsWith("blob:")).length;
      setExistingAddiImages((prev) => prev.filter((_, i) => i !== existingIndex));
    }

    setPreviewAddi((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductUpdateFormValues) => {
    setIsSubmitting(true);

    try {
      let img = product.img;
      let addi_imgs: string[] = [...existingAddiImages];

      if (mainImage) {
        const res = await uploadProductImages([mainImage]);
        if (res.data && res.data.length > 0) {
          img = res.data[0];
        }
      }

      if (addiImages.length > 0) {
        const res = await uploadProductImages(addiImages);
        addi_imgs = [...addi_imgs, ...(res.data || [])];
      }

      const payload = {
        id: product.id,
        name: data.name,
        img,
        addi_imgs,
        default_price: data.default_price,
        default_supplier_id: data.default_supplier_id,
        currency: "MNT"
      };

      await toast.promise(updateProduct(payload), {
        richColors: true,
        loading: "Шинэчилж байна...",
        success: async (res) => {
          if (!res.success) {
            throw new Error(res.message || "Алдаа гарлаа");
          }
          await onSuccess();
          return "Амжилттай шинэчлэгдлээ";
        },
        error: (err) => err.message || "Серверийн алдаа",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        id="update-product-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("grid max-h-[calc(100vh-200px)] gap-6 overflow-y-auto", className)}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Бүтээгдэхүүний нэр <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Бүтээгдэхүүний нэр"
                  {...field}
                  value={field.value ?? ""}
                  className="text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="default_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Үнэ (₮)<span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === "" ? 0 : Number(value));
                  }}
                  className="text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="default_supplier_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Нийлүүлэгч <span className="text-destructive">*</span>
              </FormLabel>
              <Select
                value={
                  field.value !== undefined && field.value !== null
                    ? String(field.value)
                    : ""
                }
                onValueChange={(v) => field.onChange(v ? Number(v) : null)}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Нийлүүлэгч сонгох" />
                  </SelectTrigger>
                </FormControl>

                <SelectContent>
                  {supplierData.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Үндсэн зураг</FormLabel>
          <label className="hover:bg-accent mt-2 flex h-32 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed">
            {!previewMain ? (
              <>
                <Upload className="text-muted-foreground mb-2 h-6 w-6" />
                <span className="text-muted-foreground text-xs">Зураг оруулах</span>
                <span className="text-muted-foreground text-xs">JPG, PNG эсвэл WEBP (max 5mb)</span>
              </>
            ) : mainImageError ? (
              <>
                <ImageIcon className="text-muted-foreground mb-2 h-6 w-6" />
                <span className="text-muted-foreground text-xs">Зураг уншихад алдаа гарлаа!</span>
              </>
            ) : (
              <img
                src={previewMain.startsWith('blob:') ? previewMain : `https://cdn.tushig.online/${previewMain}`}
                alt="Main product"
                className="h-full w-full rounded-md object-cover"
                onError={() => setMainImageError(true)}
              />
            )}
            <input type="file" hidden onChange={handleMainImage} accept="image/*" />
          </label>
        </div>

        <div>
          <FormLabel>Нэмэлт зургууд</FormLabel>
          <label className="hover:bg-accent mt-2 flex h-24 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed">
            <Upload className="text-muted-foreground mb-1 h-5 w-5" />
            <span className="text-muted-foreground text-xs">Нэмэлт зураг оруулах</span>
            <span className="text-muted-foreground text-xs">JPG, PNG, WEBP (max 5mb)</span>
            <input type="file" multiple hidden onChange={handleAddiImages} accept="image/*" />
          </label>
        </div>

        {previewAddi.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {previewAddi.map((src, i) => (
              <div key={i} className="relative h-20 w-20">
                <img
                  src={src.startsWith('blob:') ? src : `https://cdn.tushig.online/${src}`}
                  alt={`Additional ${i + 1}`}
                  className="h-full w-full rounded-md border object-cover"
                />
                <button
                  type="button"
                  className="absolute top-1 right-1 rounded-full bg-black/60 p-1 hover:bg-black/80"
                  onClick={() => removeAddiImage(i)}
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </form>
    </Form>
  );
}