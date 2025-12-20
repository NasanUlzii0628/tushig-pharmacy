"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { BucketList } from "@/types/order";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { orderBucketList } from "@/services/actions/order";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface BucketListClientProps {
    items: BucketList[];
}

export function BucketListClient({ items }: BucketListClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleCheckboxChange = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedIds((prev) => [...prev, id]);
        } else {
            setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
        }
    };

    const handleOrder = async () => {
        setIsLoading(true);
        try {
            const result = await orderBucketList(selectedIds);
            if (result.success) {
                setSelectedIds([]);
                toast.success("Захиалга амжилттай үүсгэгдсэн");
                router.refresh();
            } else {
                toast.error(result.message || "Захиалга үүсгэхэд алдаа гарлаа");
            }
        } catch (error) {
            alert("Захиалга үүсгэхэд алдаа гарлаа");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredItems = items.filter((item) =>
        item.product_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedItemNames = items
        .filter((item) => selectedIds.includes(item.id))
        .map((item) => item.product_name);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Захиалгын хүсэлт</CardTitle>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button disabled={selectedIds.length === 0 || isLoading}>
                                {isLoading ? "Уншиж байна..." : "Захиалах"}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Захиалга баталгаажуулах</AlertDialogTitle>
                                <AlertDialogDescription asChild>
                                    <div>
                                        Та дараах {selectedIds.length} бүтээгдэхүүнийг захиалахдаа итгэлтэй байна уу?
                                        <div className="mt-2 space-y-1 text-sm">
                                            {selectedItemNames.map((name, index) => (
                                                <div key={index}>• {name}</div>
                                            ))}
                                        </div>
                                    </div>
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Болих</AlertDialogCancel>
                                <AlertDialogAction onClick={handleOrder}>Тийм, захиалах</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
                <div className="flex items-center justify-between mt-2">

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Бүтээгдэхүүн хайх..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 w-[300px]"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            className="size-5"
                            checked={filteredItems.length > 0 && filteredItems.every(item => selectedIds.includes(item.id))}
                            onCheckedChange={(checked) => {
                                if (checked) {
                                    setSelectedIds(filteredItems.map(item => item.id));
                                } else {
                                    setSelectedIds([]);
                                }
                            }}
                        />
                        <span className="text-sm text-muted-foreground">Бүгдийг сонгох</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2.5">
                    {filteredItems.map((item) => (
                        <li key={item.id} className="flex items-center justify-between gap-4 rounded-md border px-3 py-2">
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{item.product_name}</span>
                                    <span className="text-sm font-medium text-muted-foreground">
                                        <Badge >{item.quantity} ширхэг</Badge>
                                    </span>
                                </div>
                                <div className="text-muted-foreground text-xs font-medium">
                                    {item.supplier_name || "Нийлүүлэгч нэр олдсрнгүй"}
                                </div>
                                {item.unit_price && (
                                    <div className="text-xs font-medium">
                                        Нэгж үнэ: {item.unit_price}¥
                                    </div>
                                )}
                                <div className="text-muted-foreground text-xs">
                                    {new Date(item.createdAt).toISOString().slice(0, 10)}
                                </div>
                            </div>
                            <Checkbox
                                className="size-6"
                                checked={selectedIds.includes(item.id)}
                                onCheckedChange={(checked) => handleCheckboxChange(item.id, checked as boolean)}
                            />
                        </li>
                    ))}
                    {filteredItems.length === 0 && (
                        <li className="text-muted-foreground text-sm text-center py-4">
                            {searchQuery ? "Хайлтад тохирох бүтээгдэхүүн олдсонгүй" : "Сагс хоосон байна"}
                        </li>
                    )}
                </ul>
            </CardContent>
        </Card>
    );
}
