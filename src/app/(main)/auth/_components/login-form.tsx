"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { loginAction } from "@/lib/auth";
import { useRouter } from "next/navigation";

const FormSchema = z.object({
  username: z.string().min(1, "Хэрэглэгчийн нэр шаардлагатай"),
  password: z.string().min(6, "Нууц үг 6 тэмдэгтээс их байх ёстой"),
});

export function LoginForm() {
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    const res = await loginAction(data.username, data.password);

    if (!res.success) {
      toast.error(res.message || "Нэвтрэхэд алдаа гарлаа");
      return;
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
                <Input
                  id="username"
                  type="text"
                  placeholder="manager"
                  autoComplete="username"
                  {...field}
                />
              </FormControl>
              <FormMessage />
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
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="w-full" type="submit">
          Login
        </Button>
      </form>
    </Form>
  );
}
