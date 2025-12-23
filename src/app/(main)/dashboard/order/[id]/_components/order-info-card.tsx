// src/app/(main)/dashboard/order/[id]/_components/order-info-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, User, Calendar, JapaneseYen, ShoppingCart } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { OrderDetailTypes } from "@/types/order";

type OrderInfoCardProps = {
  order: OrderDetailTypes;
  amount: string;
  itemCount: number;
};

export function OrderInfoCard({ order, amount, itemCount }: OrderInfoCardProps) {
  const totalAmount = parseFloat(amount) || 0;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return date.toLocaleString("mn-MN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Захиалгын мэдээлэл
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Supplier and Date Info */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              Нийлүүлэгч
            </p>
            <p className="font-medium">{order.supplier_name}</p>
          </div>

          <div className="space-y-1 text-right">
            <p className="text-muted-foreground flex items-center justify-end gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              Огноо
            </p>
            <p className="font-medium">{formatDate(order.order_date)}</p>
          </div>
        </div>

        <Separator />

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold">Нийт дүн:</span>
            <span className="text-primary text-xl font-bold">{totalAmount.toFixed(2)} ¥</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
