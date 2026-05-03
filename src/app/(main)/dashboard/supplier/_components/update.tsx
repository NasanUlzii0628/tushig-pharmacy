"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { updateSupplier } from "@/services/actions/supplier";
import type { SupplierType } from "@/types/supplier";


const SupplierFormSchema = z.object({
  name: z.string().min(1, ""),
  wechat: z.string().min(1, ""),
  contact: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val || val.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      { message: "Зөв имэйл оруулна уу" }
    ),
});

type SupplierFormValues = z.infer<typeof SupplierFormSchema>;

type Props = {
  supplier: SupplierType;
  onUpdated: () => Promise<void>;
};

/* =========================
   DRAWER
========================= */

export function UpdateDrawer({ supplier, onUpdated }: Props) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="sm">Шинэчлэх</Button>
      </DrawerTrigger>

      <DrawerContent className="w-[420px]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Нийлүүлэгчийн мэдээлэл шинэчлэх</DrawerTitle>
        </DrawerHeader>

        <SupplierForm
          supplier={supplier}
          className="px-4"
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
          onSuccess={async () => {
            setOpen(false);
            await onUpdated();
          }}
        />

        {/* FOOTER BUTTONS */}
        <DrawerFooter className="gap-2">
          {/* SUBMIT */}
          <Button
            type="submit"
            form="supplier-update-form"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Шинэчилж байна..." : "Шинэчлэх"}
          </Button>

          {/* CANCEL */}
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

/* =========================
   FORM
========================= */

function SupplierForm({
  className,
  supplier,
  onSuccess,
  isSubmitting,
  setIsSubmitting,
}: {
  className?: string;
  supplier: SupplierType;
  onSuccess: () => Promise<void>;
  isSubmitting: boolean;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(SupplierFormSchema),
    defaultValues: {
      name: supplier.name,
      wechat: supplier.wechat ?? "",
      contact: supplier.contact ?? "",
    },
  });

  const onSubmit = async (data: SupplierFormValues) => {
    const payload = {
      id: supplier.id,
      ...data,
      contact: data.contact ?? "",
    };

    setIsSubmitting(true);

    try {

      await toast.promise(
        updateSupplier(payload),
        {
          loading: "Шинэчилж байна...",
          success: async (res) => {
            if (!res.success) {
              throw new Error(res.message || "Алдаа гарлаа");
            }

            await onSuccess();
            return "Нийлүүлэгч амжилттай шинэчлэгдлээ!";
          },
          error: (err) => err.message || "Серверийн алдаа",
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        id="supplier-update-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("grid gap-4", className)}
      >
        {/* NAME */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Нэр <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} className="text-base" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* WECHAT */}
        <FormField
          control={form.control}
          name="wechat"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Утасны дугаар <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} className="text-base" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* CONTACT */}
        <FormField
          control={form.control}
          name="contact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Цахим шуудангийн хаяг</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} className="text-base" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
