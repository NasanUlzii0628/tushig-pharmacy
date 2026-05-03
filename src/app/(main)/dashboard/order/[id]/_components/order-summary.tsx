// src/app/(main)/dashboard/order/[id]/_components/order-summary.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { JapaneseYen } from "lucide-react";

type OrderSummaryProps = {
    amount: string;
    itemCount: number;
};

export function OrderSummary({ amount, itemCount }: OrderSummaryProps) {
    const totalAmount = parseFloat(amount) || 0;

    return (
        <Card className="sticky top-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <JapaneseYen className="h-5 w-5" />
                    Нийт дүн
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Бүтээгдэхүүний тоо:</span>
                        <span className="font-medium">{itemCount}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Дэд дүн:</span>
                        <span className="font-medium">{totalAmount.toFixed(2)} ₮</span>
                    </div>

                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Хөнгөлөлт:</span>
                        <span className="font-medium">0.00 ₮</span>
                    </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Нийт дүн:</span>
                    <span className="text-2xl font-bold text-primary">
                        {totalAmount.toFixed(2)} ₮
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}