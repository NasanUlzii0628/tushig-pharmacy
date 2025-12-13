"use client"

import * as React from "react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createSupplier } from "@/services/actions/supplier"


type Props = {
  onCreated: () => Promise<void>
}

export function CreateDrawer({ onCreated }: Props) {
  const [open, setOpen] = React.useState(false)

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
          onSuccess={async () => {
            setOpen(false)
            await onCreated()
          }}
        />

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function SupplierForm({
  className,
  onSuccess,
}: React.ComponentProps<"form"> & { onSuccess: () => Promise<void> }) {
  const [form, setForm] = React.useState({
    name: "",
    contact: "",
    wechat: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  await toast.promise(
    createSupplier(form),
    {
      loading: "Хадгалж байна...",
      success: async (res) => {
        if (!res.success) {
          throw new Error(res.message || "Алдаа гарлаа")
        }

        await onSuccess()
        return "Нийлүүлэгч амжилттай нэмэгдлээ!"
      },
      error: (err) => err.message || "Серверийн алдаа",
    }
  )
}


  return (
    <form onSubmit={handleSubmit} className={cn("grid gap-4", className)}>
      <div className="grid gap-2">
        <Label>Нэр</Label>
        <Input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Нэр"
          required
        />
      </div>

      <div className="grid gap-2">
        <Label>Имэйл</Label>
        <Input
          value={form.contact}
          onChange={(e) => setForm({ ...form, contact: e.target.value })}
          placeholder="Имэйл"
        />
      </div>

      <div className="grid gap-2">
        <Label>Wechat</Label>
        <Input
          value={form.wechat}
          onChange={(e) => setForm({ ...form, wechat: e.target.value })}
          placeholder="WeChat дугаар"
        />
      </div>

      <Button type="submit" className="w-full">
        Нэмэх
      </Button>
    </form>
  )
}

