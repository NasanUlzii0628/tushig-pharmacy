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

import { updateUser } from "@/services/actions/user";
import type { UserType } from "@/types/user";


const UserUpdateSchema = z.object({
  username: z.string().min(3, ""),
  password: z.string().optional(),
});

type UserUpdateFormValues = z.infer<typeof UserUpdateSchema>;

type Props = {
  user: UserType;
  onUpdated: () => Promise<void>;
};

/* =========================
   DRAWER
========================= */

export function UpdateUserDrawer({ user, onUpdated }: Props) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="sm">
          Засах
        </Button>
      </DrawerTrigger>

      <DrawerContent className="w-[420px]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Хэрэглэгч засах</DrawerTitle>
        </DrawerHeader>

        <UserForm
          user={user}
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
          <Button
            type="submit"
            form="user-update-form"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Шинэчилж байна..." : "Шинэчлэх"}
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

/* =========================
   FORM
========================= */

function UserForm({
  className,
  user,
  onSuccess,
  isSubmitting,
  setIsSubmitting,
}: {
  className?: string;
  user: UserType;
  onSuccess: () => Promise<void>;
  isSubmitting: boolean;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const form = useForm<UserUpdateFormValues>({
    resolver: zodResolver(UserUpdateSchema),
    defaultValues: {
      username: user.username,
      password: "",
    },
  });

  const onSubmit = async (data: UserUpdateFormValues) => {
    const payload = {
      id: user.id,
      username: data.username,
      ...(data.password && data.password.length > 0
        ? { password: data.password }
        : {}),
    };

    setIsSubmitting(true);

    try {
      await toast.promise(
        updateUser(payload),
        {
          loading: "Шинэчилж байна...",
          success: async (res) => {
            if (!res.success) {
              throw new Error(res.message || "Алдаа гарлаа");
            }

            await onSuccess();
            return "Хэрэглэгч амжилттай шинэчлэгдлээ!";
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
        id="user-update-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("grid gap-4", className)}
      >
        {/* USERNAME */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Хэрэглэгчийн нэр <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* PASSWORD (OPTIONAL) */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Шинэ нууц үг</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Хоосон орхивол өөрчлөгдөхгүй"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
