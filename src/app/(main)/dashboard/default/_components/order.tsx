"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { ProductType } from "@/types/product"
import { checkOrder, createOrder } from "@/services/actions/order"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: ProductType | null
}

export function OrderDialog({ open, onOpenChange, product }: Props) {
  const [existsMessage, setExistsMessage] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(0)
  const [quantityError, setQuantityError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function checkProductExists() {
      if (open && product) {
        const result = await checkOrder(product.id)
        const data = result.data?.data
        setQuantity(data?.quantity || 0)
        if (result.success && data?.exists) {
          setExistsMessage(`Энэ бүтээгдэхүүн аль хэдийн захиалгын хүсэлтэд ${data.quantity} ширхэг нэмэгдсэн байна.`)
        } else {
          setExistsMessage(null)
        }
      } else {
        setExistsMessage(null)
      }
    }
    checkProductExists()
  }, [open, product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return

    if (!quantity || quantity <= 0) {
      setQuantityError("Тоо ширхэг оруулна уу")
      return
    }
    setQuantityError(null)

    setLoading(true)
    try {
      const result = await createOrder({
        product_id: product.id,
        quantity: quantity || 1,
      })
      if (result.success) {
        toast.success("Захиалгын хүсэлтэд нэмэгдлээ")
        onOpenChange(false)
        setQuantity(0)
      } else {
        toast.error(result.message || "Бараа захиалахад алдаа гарлаа")
      }
    } catch {
      toast.error("Бараа захиалахад алдаа гарлаа")
    } finally {
      setLoading(false)
    }
  }

  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Захиалгын хүсэлтэд нэмэх</DialogTitle>
        </DialogHeader>

        {existsMessage && (
          <Alert variant="destructive">
            <AlertDescription>{existsMessage}</AlertDescription>
          </Alert>
        )}

        <form className="grid gap-4 mt-2" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label>Бүтээгдэхүүний нэр</Label>
            <Input value={product.name} disabled className="text-sm" />
          </div>

          <div className="grid gap-2">
            <Label>Тоо ширхэг</Label>
            <Input
              type="number"
              placeholder="Тоо ширхэг"
              value={quantity === 0 ? '' : quantity}
              onChange={(e) => {
                setQuantity(parseInt(e.target.value, 10) || 0)
                setQuantityError(null)
              }}
              className={quantityError ? "border-red-500 text-sm" : ""}
            />
            {quantityError && (
              <p className="text-sm text-red-500">{quantityError}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Уншиж байна..." : "Захиалах"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
