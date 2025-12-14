// src/app/(main)/dashboard/order/[id]/_components/order-info-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, User, Calendar } from "lucide-react";
import type { OrderDetailTypes } from "@/types/order";

type OrderInfoCardProps = {
    order: OrderDetailTypes;
};

export function OrderInfoCard({ order }: OrderInfoCardProps) {

    // ✅ Safe date formatting
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return dateString;
            }
            return date.toLocaleString('mn-MN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
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
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Нийлүүлэгч
                        </p>
                        <p className="font-medium">{order.supplier_name}</p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Огноо
                        </p>
                        <p className="font-medium">
                            {formatDate(order.order_date)}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}