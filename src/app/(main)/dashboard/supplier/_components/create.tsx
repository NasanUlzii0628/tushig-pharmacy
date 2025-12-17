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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { createSupplier } from "@/services/actions/supplier";

const SupplierFormSchema = z.object({
  name: z.string().min(1, ""),
  wechat: z.string().min(1, ""),
  contact: z
    .string()
    .optional()
    .refine((val) => !val || val.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: "Зөв имэйл оруулна уу",
    }),
});

type SupplierFormValues = z.infer<typeof SupplierFormSchema>;

type Props = {
  onCreated: () => Promise<void>;
};

export function CreateDrawer({ onCreated }: Props) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">Нийлүүлэгч нэмэх +</Button>
      </DrawerTrigger>

      <DrawerContent className="w-[420px]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Нийлүүлэгч нэмэх</DrawerTitle>
        </DrawerHeader>

        <SupplierForm
          className="px-4"
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
          onSuccess={async () => {
            setOpen(false);
            await onCreated();
          }}
        />

        <DrawerFooter className="gap-2">
          <Button type="submit" form="supplier-create-form" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Хадгалж байна..." : "Нэмэх"}
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

function SupplierForm({
  className,
  onSuccess,
  isSubmitting,
  setIsSubmitting,
}: {
  className?: string;
  onSuccess: () => Promise<void>;
  isSubmitting: boolean;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(SupplierFormSchema),
    defaultValues: {
      name: "",
      wechat: "",
      contact: "",
    },
  });

  const onSubmit = async (data: SupplierFormValues) => {
    const payload = {
      ...data,
      contact: data.contact ?? "",
    };

    await toast.promise(createSupplier(payload), {
      loading: "Хадгалж байна...",
      success: async (res) => {
        if (!res.success) {
          throw new Error(res.message || "Алдаа гарлаа");
        }

        await onSuccess();
        form.reset();
        return "Нийлүүлэгч амжилттай нэмэгдлээ!";
      },
      error: (err) => err.message || "Серверийн алдаа",
    });
  };

  return (
    <Form {...form}>
      <form id="supplier-create-form" onSubmit={form.handleSubmit(onSubmit)} className={cn("grid gap-4", className)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Нэр <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Нэр" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="wechat"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                WeChat <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="WeChat дугаар" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Имэйл</FormLabel>
              <FormControl>
                <Input placeholder="Имэйл" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
