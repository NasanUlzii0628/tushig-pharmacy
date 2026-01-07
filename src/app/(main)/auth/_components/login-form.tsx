"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { loginAction } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect } from "react";

const FormSchema = z.object({
  username: z.string().min(1, "Хэрэглэгчийн нэр шаардлагатай"),
  password: z.string().min(1, "Нууц үг шаардлагатай"),
  remember: z.boolean().optional(),
});

export function LoginForm() {
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
      password: "",
      remember: false,
    },
  });

  // Load saved credentials on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem("rememberedUsername");
    const savedPassword = localStorage.getItem("rememberedPassword");
    if (savedUsername && savedPassword) {
      form.setValue("username", savedUsername);
      form.setValue("password", savedPassword);
      form.setValue("remember", true);
    }
  }, [form]);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    const res = await loginAction(data.username, data.password);

    if (!res.success) {
      toast.error(res.message || "Нэвтрэхэд алдаа гарлаа");
      return;
    }

    if (data.remember) {
      localStorage.setItem("rememberedUsername", data.username);
      localStorage.setItem("rememberedPassword", data.password);
    } else {
      localStorage.removeItem("rememberedUsername");
      localStorage.removeItem("rememberedPassword");
    }

    toast.success("Амжилттай нэвтэрлээ!");
    router.push("/dashboard/default");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Хэрэглэгчийн нэр</FormLabel>
              <FormControl>
                <Input id="username" type="text" autoComplete="username" className="text-base"  {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Нууц үг</FormLabel>
              <FormControl>
                <Input id="password" type="password" autoComplete="current-password" className="text-base"  {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="remember"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center">
              <FormControl>
                <Checkbox
                  id="login-remember"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="size-4"
                />
              </FormControl>
              <FormLabel htmlFor="login-remember" className="text-muted-foreground ml-1 text-sm font-medium">
                Намайг санах
              </FormLabel>
            </FormItem>
          )}
        />
        <div className="pt-2">
          <Button className="w-full" type="submit">
            Нэвтрэх
          </Button>
        </div>
      </form>
    </Form>
  );
}