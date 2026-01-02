// src/app/(main)/dashboard/order/[id]/_components/order-items-table.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getImageUrl } from "@/utils/image";
import { ShoppingCart } from "lucide-react";

type OrderItem = {
    product_id: number;
    product_name: string;
    product_image: string | null;
    quantity: number;
    unit_price: string | null;
    total_price: string;
};

type OrderItemsTableProps = {
    items: OrderItem[];
};

export function OrderItemsTable({ items }: OrderItemsTableProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Захиалсан бүтээгдэхүүн ({items.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="max-h-[400px] overflow-auto rounded-md border">
                    <Table className="min-w-[600px]">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Зураг</TableHead>
                                <TableHead>Бүтээгдэхүүн</TableHead>
                                <TableHead className="text-right">Тоо ширхэг</TableHead>
                                <TableHead className="text-right">Нэгж үнэ</TableHead>
                                <TableHead className="text-right">Нийт үнэ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-center text-muted-foreground h-24"
                                    >
                                        Бүтээгдэхүүн байхгүй байна
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.map((item) => {
                                    const imageUrl = item.product_image
                                        ? getImageUrl(item.product_image)
                                        : null;

                                    return (
                                        <TableRow key={item.product_id}>
                                            <TableCell>
                                                {imageUrl ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt={item.product_name}
                                                        className="h-12 w-12 rounded-md object-cover border"
                                                    />
                                                ) : (
                                                    <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center border">
                                                        <span className="text-xs text-muted-foreground">
                                                            No img
                                                        </span>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {item.product_name}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {item.quantity}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {item.unit_price ? `${item.unit_price} ¥` : "-"}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {item.total_price} ¥
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}