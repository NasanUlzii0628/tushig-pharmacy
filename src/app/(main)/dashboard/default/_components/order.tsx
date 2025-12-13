"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ProductType } from "@/types/product"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: ProductType | null
}

export function OrderDialog({ open, onOpenChange, product }: Props) {
  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Захиалга үүсгэх</DialogTitle>
        </DialogHeader>

        <form className="grid gap-4">
          <div className="grid gap-2">
            <Label>Бүтээгдэхүүн</Label>
            <Input value={product.name} disabled />
          </div>

          <div className="grid gap-2">
            <Label>Үнэ</Label>
            <Input value={`${product.default_price} ₮`} disabled />
          </div>

          <div className="grid gap-2">
            <Label>Тоо ширхэг</Label>
            <Input type="number" min={1} defaultValue={1} />
          </div>

          <Button type="submit" className="w-full">
            Захиалах
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
