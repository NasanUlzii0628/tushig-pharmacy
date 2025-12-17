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

import { createUser } from "@/services/actions/user";


const UserCreateSchema = z.object({
  username: z.string().min(1, ""),
  password: z
    .string()
    .min(4, "Нууц үг хамгийн багадаа 4 тэмдэгт байх ёстой"),
});

type UserCreateFormValues = z.infer<typeof UserCreateSchema>;

type Props = {
  onCreated: () => Promise<void>;
};

export function CreateUserDrawer({ onCreated }: Props) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">Шинэ хэрэглэгч үүсгэх +</Button>
      </DrawerTrigger>

      <DrawerContent className="w-[420px]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Хэрэглэгч нэмэх</DrawerTitle>
        </DrawerHeader>

        <UserForm
          className="px-4"
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
          onSuccess={async () => {
            setOpen(false);
            await onCreated();
          }}
        />

        <DrawerFooter className="gap-2">
          <Button
            type="submit"
            form="user-create-form"
            className="w-full"
            disabled={isSubmitting}
          >
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

function UserForm({
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
  const form = useForm<UserCreateFormValues>({
    resolver: zodResolver(UserCreateSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: UserCreateFormValues) => {
    setIsSubmitting(true);

    try {
      await toast.promise(
        createUser(data),
        {
          loading: "Хадгалж байна...",
          success: async (res) => {
            if (!res.success) {
              throw new Error(res.message || "Алдаа гарлаа");
            }

            await onSuccess();
            form.reset();
            return "Хэрэглэгч амжилттай үүслээ!";
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
        id="user-create-form"
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
                <Input placeholder="username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* PASSWORD */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Нууц үг <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
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
