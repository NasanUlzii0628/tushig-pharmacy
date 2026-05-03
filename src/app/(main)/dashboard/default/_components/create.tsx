// components/CreateDrawer.tsx - Updated ProductForm with logging
"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { X, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import type { SupplierType } from "@/types/supplier";
import { createProdcut } from "@/services/actions/product";
import { uploadProductImages } from "@/services/actions/upload";

const MAX_FILE_SIZE = 40 * 1024 * 1024;
const MAX_ADDITIONAL_FILE_SIZE = 80 * 1024 * 1024;
const MAX_ADDITIONAL_IMAGES = 2;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const currency = {
  MNT: "ТӨГРӨГ",
};

const ProductCreateSchema = z.object({
  name: z.string().min(1, ""),
  currency: z.string().min(1, ""),
  default_price: z.coerce.number().min(1, ""),
  default_supplier_id: z.coerce.number().min(1, ""),
});

type ProductCreateFormValues = z.infer<typeof ProductCreateSchema>;

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
        <Button>Бүтээгдэхүүн бүртгэх +</Button>
      </DrawerTrigger>

      <DrawerContent className="w-[420px] sm:w-[520px] md:w-[620px]">
        <DrawerHeader className="text-left">
          <DrawerTitle className="pt-4">Бүтээгдэхүүн бүртгэх</DrawerTitle>
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
              "Бүртгэх"
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
  const form = useForm<ProductCreateFormValues>({
    resolver: zodResolver(ProductCreateSchema),
    defaultValues: {
      name: "",
      currency: "MNT",
      default_price: 0,
      default_supplier_id: undefined as unknown as number,
    },
  });

  const [mainImage, setMainImage] = React.useState<File | null>(null);
  const [addiImages, setAddiImages] = React.useState<File[]>([]);
  const [previewMain, setPreviewMain] = React.useState<string>("");
  const [previewAddi, setPreviewAddi] = React.useState<string[]>([]);

  const validateFile = (file: File, maxSize: number = MAX_FILE_SIZE): boolean => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error(`${file.name}: Зөвхөн зураг файл байх ёстой (JPG, PNG, WEBP)`);
      return false;
    }
    if (file.size > maxSize) {
      toast.error(`${file.name}: Файлын хэмжээ ${maxSize / (1024 * 1024)}MB-аас бага байх ёстой`);
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
    const files = Array.from(e.target.files || []).filter((f) => validateFile(f, MAX_ADDITIONAL_FILE_SIZE));

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

  const onSubmit = async (data: ProductCreateFormValues) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Хадгалж байна...");

    try {
      let imgName: string | null = null;

      if (mainImage) {
        toast.loading("Зураг байршуулж байна...", { id: toastId });
        const mainUploadRes = await uploadProductImages([mainImage]);

        if (!mainUploadRes.success || !mainUploadRes.data || mainUploadRes.data.length === 0) {
          throw new Error(mainUploadRes.message || "Үндсэн зураг байршуулахад алдаа гарлаа");
        }

        imgName = mainUploadRes.data[0];
      }

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
        name: data.name,
        img: imgName || "",
        addi_imgs: addiImgNames,
        currency: data.currency,
        default_price: data.default_price,
        default_supplier_id: data.default_supplier_id,
      };

      const res = await createProdcut(payload);

      if (!res.success) {
        throw new Error(res.message || "Бүтээгдэхүүн хадгалахад алдаа гарлаа");
      }

      toast.success("Бүтээгдэхүүн амжилттай нэмэгдлээ!", { id: toastId });
      closeDrawer();
      refresh();
    } catch (err) {
      toast.error((err as Error).message || "Алдаа гарлаа!", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        id="create-product-form"
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
                  placeholder=""
                  {...field}
                  value={field.value ?? ""}
                  className="text-base"
                  disabled={isSubmitting}
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
                Үнэ (₮) <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  placeholder=""
                  value={field.value === 0 || field.value === undefined ? "" : field.value}
                  onChange={(e) => {
                    const v = e.target.value;
                    field.onChange(v === "" ? 0 : Number(v));
                  }}
                  className="text-base"
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Валют <span className="text-destructive">*</span>
              </FormLabel>
              <Select
                value={field.value ?? ""}
                onValueChange={field.onChange}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Сонгох" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(currency).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                value={field.value ? String(field.value) : ""}
                onValueChange={(v) => field.onChange(v ? Number(v) : undefined)}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Сонгох" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {supplierData.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <div className="grid gap-2">
          <label className="text-sm font-medium">
            Үндсэн зураг
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
              <span className="text-muted-foreground text-xs">Зураг оруулах</span>
              <span className="text-muted-foreground text-xs">JPG, PNG эсвэл WEBP (max 5mb)</span>
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
            <span className="text-muted-foreground text-xs">Нэмэлт зураг оруулах</span>
            <span className="text-muted-foreground text-xs">JPG, PNG эсвэл WEBP (max 5mb)</span>
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
    </Form>
  );
}
