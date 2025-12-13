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

import { updateSupplier } from "@/services/actions/supplier"
import type { SupplierType } from "@/types/supplier"

type Props = {
  supplier: SupplierType
  onUpdated: () => Promise<void>
}

export function UpdateDrawer({ supplier, onUpdated }: Props) {
  const [open, setOpen] = React.useState(false)

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="sm">Засах</Button>
      </DrawerTrigger>

      <DrawerContent className="w-[420px]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Нийлүүлэгч засах</DrawerTitle>
        </DrawerHeader>

        <SupplierForm
          supplier={supplier}
          className="px-4"
          onSuccess={async () => {
            setOpen(false)
            await onUpdated()
          }}
        />

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Болих</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function SupplierForm({
  className,
  supplier,
  onSuccess,
}: React.ComponentProps<"form"> & {
  supplier: SupplierType
  onSuccess: () => Promise<void>
}) {
  const [form, setForm] = React.useState({
    name: supplier.name,
    contact: supplier.contact ?? "",
    wechat: supplier.wechat ?? "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await toast.promise(
      updateSupplier({
        id: supplier.id,
        ...form,
      }),
      {
        loading: "Шинэчилж байна...",
        success: async (res) => {
          if (!res.success) {
            throw new Error(res.message || "Алдаа гарлаа")
          }
          await onSuccess()
          return "Нийлүүлэгч амжилттай шинэчлэгдлээ!"
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
          required
        />
      </div>

      <div className="grid gap-2">
        <Label>Имэйл</Label>
        <Input
          value={form.contact}
          onChange={(e) => setForm({ ...form, contact: e.target.value })}
        />
      </div>

      <div className="grid gap-2">
        <Label>Wechat</Label>
        <Input
          value={form.wechat}
          onChange={(e) => setForm({ ...form, wechat: e.target.value })}
        />
      </div>

      <Button type="submit" className="w-full">
        Шинэчлэх
      </Button>
    </form>
  )
}
