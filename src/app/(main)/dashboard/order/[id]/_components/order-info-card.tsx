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
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Package className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
          Захиалгын мэдээлэл
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="space-y-1">
            <p className="text-muted-foreground flex items-center gap-2 text-xs sm:text-sm">
              <User className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              Нийлүүлэгч
            </p>
            <p className="font-medium text-sm sm:text-base break-words">{order.supplier_name}</p>
          </div>

          <div className="space-y-1 sm:text-right">
            <p className="text-muted-foreground flex items-center gap-2 text-xs sm:text-sm sm:justify-end">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              Захиалга хийсэн огноо
            </p>
            <p className="font-medium text-sm sm:text-base">{formatDate(order.order_date)}</p>
          </div>
        </div>

        <Separator />

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 sm:justify-between">
            <span className="text-sm sm:text-base font-semibold">Нийт дүн:</span>
            <span className="text-primary text-lg sm:text-xl font-bold">{totalAmount.toFixed(2)} {order.currency === "MNT" ? "₮" : "₮"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
