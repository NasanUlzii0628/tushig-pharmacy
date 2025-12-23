"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { BucketList } from "@/types/order";
import { Search, RefreshCcw } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { orderBucketList, fetchBucketList } from "@/services/actions/order";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SupplierType } from "@/types/supplier";
import { getImageUrl } from "@/utils/image";

interface BucketListClientProps {
  items: BucketList[];
  userRole?: string;
  suppliers: SupplierType[];
}

export function BucketListClient({
  items: initialItems,
  userRole,
  suppliers,
}: BucketListClientProps) {
  const [items, setItems] = useState<BucketList[]>(initialItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const canOrder = userRole !== "STAFF";

  const handleCheckboxChange = (id: number, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((itemId) => itemId !== id)
    );
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const result = await fetchBucketList({
        name: searchQuery || undefined,
        supplier_id:
          selectedSupplier && selectedSupplier !== ""
            ? selectedSupplier
            : undefined,
      });

      const fetchedItems: BucketList[] = Array.isArray(result.data?.data)
        ? result.data.data
        : result.data?.data
        ? [result.data.data]
        : [];

      setItems(fetchedItems);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = async () => {
    setSearchQuery("");
    setSelectedSupplier("");
    setIsLoading(true);

    try {
      const result = await fetchBucketList();
      const fetchedItems: BucketList[] = Array.isArray(result.data?.data)
        ? result.data.data
        : result.data?.data
        ? [result.data.data]
        : [];

      setItems(fetchedItems);
    } finally {
      setIsLoading(false);
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
    } catch {
      toast.error("Захиалга үүсгэхэд алдаа гарлаа");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedItemNames = items
    .filter((item) => selectedIds.includes(item.id))
    .map((item) => item.product_name);

  const hasActiveFilters = searchQuery || selectedSupplier;

  const totalPrice = items.reduce(
    (sum, item) =>
      sum + (Number(item.unit_price) || 0) * item.quantity,
    0
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Захиалгын хүсэлт</CardTitle>

            {canOrder && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    disabled={selectedIds.length === 0 || isLoading}
                  >
                    Захиалах
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Захиалга баталгаажуулах
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                      <div className="space-y-2">
                        <p>
                          Та дараах {selectedIds.length} бүтээгдэхүүнийг
                          захиалахдаа итгэлтэй байна уу?
                        </p>
                        <div className="text-sm">
                          {selectedItemNames.map((name, i) => (
                            <div key={i}>• {name}</div>
                          ))}
                        </div>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter>
                    <AlertDialogCancel>Болих</AlertDialogCancel>
                    <AlertDialogAction onClick={handleOrder}>
                      Тийм, захиалах
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          {/* Filters */}
          <div className="mt-4 flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="w-[300px] pl-9"
                placeholder="Бүтээгдэхүүн хайх..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                disabled={isLoading}
              />
            </div>

            <Select
              value={selectedSupplier}
              onValueChange={setSelectedSupplier}
              disabled={isLoading}
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Нийлүүлэгч сонгох" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={s.id.toString()}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button size="sm" onClick={handleSearch} disabled={isLoading}>
              <Search className="mr-2 h-4 w-4" />
              Хайх
            </Button>

            {hasActiveFilters && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleClearFilters}
                disabled={isLoading}
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Select All */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-md font-bold">
              Нийт бүтээгдэхүүний үнэ: {totalPrice.toLocaleString()} ¥ 
            </p>

            <div className="flex items-center gap-2">
              <Checkbox
                className="size-5"
                checked={
                  items.length > 0 &&
                  items.every((i) => selectedIds.includes(i.id))
                }
                onCheckedChange={(checked) =>
                  setSelectedIds(
                    checked ? items.map((i) => i.id) : []
                  )
                }
              />
              <span className="text-sm font-medium">Бүгдийг сонгох</span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className={items.length >= 5 ? "max-h-[600px] overflow-y-auto pr-2" : ""}>
            <ul className="divide-y rounded-lg border">
              {items.map((item) => (
                <li
                  key={item.id}
                  className={`group flex items-center gap-4 p-4 transition
                    hover:bg-muted/50
                    ${
                      selectedIds.includes(item.id)
                        ? "bg-primary/5 border-l-4 border-primary"
                        : ""
                    }`}
                >
                  {item.product_img && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border bg-muted cursor-pointer">
                          <img
                            src={getImageUrl(item.product_img)}
                            alt={item.product_name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogTitle className="sr-only">
                          {item.product_name}
                        </DialogTitle>
                        <img
                          src={getImageUrl(item.product_img)}
                          alt={item.product_name}
                          className="max-h-[85vh] w-full rounded-xl object-contain"
                        />
                      </DialogContent>
                    </Dialog>
                  )}

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold">
                        {item.product_name}
                      </h4>
                      <Badge variant="secondary">
                        {item.quantity} ширхэг
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Нийлүүлэгч:{" "}
                      <span className="font-medium text-foreground">
                        {item.supplier_name || "Тодорхойгүй"}
                      </span>
                    </p>

                    <div className="flex gap-4 text-xs font-medium">
                      {item.unit_price && (
                        <span>
                          Нэгж:{" "}
                          {Number(item.unit_price).toLocaleString()} ¥
                        </span>
                      )}
                      <span className="text-primary">
                        Нийт:{" "}
                        {(Number(item.unit_price) * item.quantity).toLocaleString()} ¥
                      </span>
                    </div>
                  </div>

                  <Checkbox
                    className="size-6"
                    checked={selectedIds.includes(item.id)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(item.id, checked as boolean)
                    }
                  />
                </li>
              ))}

              {items.length === 0 && (
                <li className="py-6 text-center text-sm text-muted-foreground">
                  {hasActiveFilters
                    ? "Хайлтад тохирох бүтээгдэхүүн олдсонгүй"
                    : "Сагс хоосон байна"}
                </li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}