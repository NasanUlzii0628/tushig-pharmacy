"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { BucketList } from "@/types/order";
import { Search, RefreshCcw, Pencil, Trash } from "lucide-react";
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
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { orderBucketList, fetchBucketList, updateBucketItem, deleteBucketList } from "@/services/actions/order";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SupplierType } from "@/types/supplier";

const currencyOptions = {
  CNY: "ЮАНЬ",
  MNT: "ТӨГРӨГ",
} as const;

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
  const [selectedCurrency, setSelectedCurrency] = useState<string>("CNY");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Edit modal state
  const [editItem, setEditItem] = useState<BucketList | null>(null);
  const [editUnitPrice, setEditUnitPrice] = useState("");
  const [editQuantity, setEditQuantity] = useState(0);

  const [editSupplierId, setEditSupplierId] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Delete modal state
  const [deleteItem, setDeleteItem] = useState<BucketList | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();
  const canOrder = userRole !== "STAFF";

  const handleCheckboxChange = (id: number, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((itemId) => itemId !== id)
    );
  };

  const openEditDialog = (item: BucketList) => {
    setEditItem(item);
    setEditUnitPrice(item.unit_price?.toString() || "");
    setEditSupplierId(item.supplier_id?.toString() || "");
    setEditQuantity(item.quantity || 0);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (item: BucketList) => {
    setDeleteItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteSubmit = async () => {
    if (!deleteItem) return;

    setIsDeleting(true);
    try {
      const result = await deleteBucketList(deleteItem.product_id);
      if (result.success) {
        toast.success("Амжилттай устгагдлаа");
        setIsDeleteDialogOpen(false);
        await handleSearch();
      } else {
        toast.error(result.message || "Устгахэд алдаа гарлаа");
      }
    } catch {
      toast.error("Устгахэд алдаа гарлаа");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!editItem) return;

    setIsUpdating(true);
    try {
      const result = await updateBucketItem(
        editItem.product_id,
        Number(editUnitPrice),
        Number(editSupplierId),
        Number(editQuantity)
      );

      if (result.success) {
        toast.success("Амжилттай шинэчлэгдлээ");
        setIsEditDialogOpen(false);
        // Refresh the list
        await handleSearch();
      } else {
        toast.error(result.message || "Шинэчлэхэд алдаа гарлаа");
      }
    } catch {
      toast.error("Шинэчлэхэд алдаа гарлаа");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSearch = async (currency?: string) => {
    setIsLoading(true);
    try {
      const result = await fetchBucketList({
        name: searchQuery || undefined,
        currency: currency || selectedCurrency,
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

  const handleCurrencyChange = async (currency: string) => {
    setSelectedCurrency(currency);
    setSelectedIds([]);
    await handleSearch(currency);
  };

  const handleClearFilters = async () => {
    setSearchQuery("");
    setSelectedSupplier("");
    setIsLoading(true);

    try {
      const result = await fetchBucketList({ currency: selectedCurrency });
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
        await handleSearch();
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
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                          Та захиалга хийхдээ итгэлтэй байна уу?
                        </p>
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

          <Tabs value={selectedCurrency} onValueChange={handleCurrencyChange} className="mb-4">
            <TabsList className="grid w-full max-w-[400px] grid-cols-2">
              {Object.entries(currencyOptions).map(([key, label]) => (
                <TabsTrigger key={key} value={key} disabled={isLoading}>
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="w-full pl-9 sm:w-[300px] text-base"
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
              <SelectTrigger className="w-full sm:w-[250px]">
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

            <div className="flex gap-2 w-full sm:w-auto">
              <Button size="sm" onClick={() => handleSearch()} disabled={isLoading} className="flex-1 sm:flex-none">
                <Search className="mr-2 h-4 w-4" />
                Хайх
              </Button>

              {hasActiveFilters && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleClearFilters}
                  disabled={isLoading}
                  className="flex-1 sm:flex-none"
                >
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              )}
            </div>


          </div>

          {/* Select All */}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-bold sm:text-base">
              Нийт: {selectedIds.reduce((total, id) => total + Number(items.find((i) => i.id === id)?.unit_price || 0) * Number(items.find((i) => i.id === id)?.quantity || 0), 0).toLocaleString()} {selectedCurrency === "CNY" ? "¥" : "₮"}
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
                  className={`group flex flex-col gap-3 p-3 transition sm:flex-row sm:items-center sm:gap-4 sm:p-4
                    hover:bg-muted/50
                    ${selectedIds.includes(item.id)
                      ? "bg-primary/5 border-l-2 border-l-primary"
                      : ""
                    }`}
                >
                  {item.product_img && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-muted cursor-pointer sm:h-20 sm:w-20">
                          <img
                            src={`https://cdn.tushig.online/${item.product_img}`}
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
                          src={`https://cdn.tushig.online/${item.product_img}`}
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
                          {Number(item.unit_price).toLocaleString()} {item.currency === "CNY" ? "¥" : "₮"}
                        </span>
                      )}
                      <span className="text-primary">
                        Нийт:{" "}
                        {(Number(item.unit_price) * item.quantity).toLocaleString()} {item.currency === "CNY" ? "¥" : "₮"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-primary"
                      onClick={() => openDeleteDialog(item)}
                    >
                      <Trash className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-primary"
                      onClick={() => openEditDialog(item)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Checkbox
                      className="size-5 sm:size-6"
                      checked={selectedIds.includes(item.id)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(item.id, checked as boolean)
                      }
                    />
                  </div>
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Бүтээгдэхүүн засах</DialogTitle>
            <DialogDescription>
              {editItem?.product_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Нэгж үнэ (¥)</label>
              <Input
                className="text-base"
                type="number"
                placeholder="Нэгж үнэ оруулах..."
                value={editUnitPrice}
                onChange={(e) => setEditUnitPrice(e.target.value)}
                disabled={isUpdating}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Тоо ширхэг</label>
              <Input
                type="number"
                placeholder="Тоо ширхэг"
                value={editQuantity === 0 ? '' : editQuantity}
                onChange={(e) => {
                  setEditQuantity(parseInt(e.target.value, 10) || 0)
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Нийлүүлэгч</label>
              <Select
                value={editSupplierId}
                onValueChange={setEditSupplierId}
                disabled={isUpdating}
              >
                <SelectTrigger className="w-full">
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
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isUpdating}
            >
              Болих
            </Button>
            <Button
              onClick={handleEditSubmit}
              disabled={isUpdating || !editUnitPrice || !editSupplierId}
            >
              {isUpdating ? "Хадгалж байна..." : "Хадгалах"}
            </Button>
          </DialogFooter>


        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Бүтээгдэхүүн хасах</DialogTitle>
            <DialogDescription>
              {deleteItem?.product_name} бүтээгдэхүүнийг хасахдаа итгэлтэй байна уу?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Болих
            </Button>
            <Button
              onClick={handleDeleteSubmit}
              disabled={isDeleting}
            >
              {isDeleting ? "Устгаж байна..." : "Устгах"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}