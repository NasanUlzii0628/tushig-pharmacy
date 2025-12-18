// DataTable component
"use client";
"use no memo";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";

import { DataTable as DataTableNew } from "../../../../../components/data-table/data-table";
import { DataTablePagination } from "../../../../../components/data-table/data-table-pagination";
import { withDndColumn } from "../../../../../components/data-table/table-utils";

import { productColumns } from "./columns";
import type { ProductType } from "@/types/product";
import { CreateDrawer } from "./create";
import { SupplierType } from "@/types/supplier";
import { fetchCustomers } from "@/services/actions/product";
import { OrderDialog } from "./order";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { SelectTrigger, SelectValue, SelectContent, SelectItem, Select } from "@/components/ui/select";

export function DataTable({ data: initialData, supplier: supplierData }: {
  data: ProductType[],
  supplier: SupplierType[]
}) {
  const [data, setData] = React.useState<ProductType[]>(initialData);
  const [openDrawer, setOpenDrawer] = React.useState(false);
  const [orderOpen, setOrderOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<ProductType | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedSupplier, setSelectedSupplier] = React.useState<string>("all");
  const [isLoading, setIsLoading] = React.useState(false);

  const refreshProducts = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchCustomers({
        page: 1,
        size: 10,
        name: searchQuery || undefined,
        supplier_id: selectedSupplier !== "all" ? selectedSupplier : undefined,
      });
      setData(res.data ?? []);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedSupplier]);

  // Debounced search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      refreshProducts();
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, selectedSupplier, refreshProducts]);

  const openOrder = (product: ProductType) => {
    setSelectedProduct(product);
    setOrderOpen(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSupplierChange = (value: string) => {
    setSelectedSupplier(value);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedSupplier("all");
  };

  const columns = withDndColumn(
    productColumns(openOrder, refreshProducts, supplierData)
  );

  const table = useDataTableInstance({
    data,
    columns,
    getRowId: (row) => row.id.toString(),
  });

  return (
    <>
      <OrderDialog
        open={orderOpen}
        onOpenChange={setOrderOpen}
        product={selectedProduct}
      />

      <Tabs defaultValue="outline" className="w-full flex-col justify-start gap-6">
        <div className="flex items-center justify-between">
          <h4>Бүтээгдэхүүн</h4>
          <Label htmlFor="view-selector" className="sr-only">
            View
          </Label>
          <div className="flex items-center gap-2">
            <CreateDrawer
              supplierData={supplierData}
              open={openDrawer}
              setOpen={setOpenDrawer}
              refresh={refreshProducts}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Бүтээгдэхүүн хайх..."
              className="pl-9 w-[300px]"
              value={searchQuery}
              onChange={handleSearchChange}
              disabled={isLoading}
            />
          </div>

          <Select
            value={selectedSupplier}
            onValueChange={handleSupplierChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Нийлүүлэгч сонгох" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Бүгд</SelectItem>
              {supplierData.map((s) => (
                <SelectItem key={s.id} value={s.id.toString()}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(searchQuery || selectedSupplier !== "all") && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-muted-foreground hover:text-foreground underline"
              disabled={isLoading}
            >
              Цэвэрлэх
            </button>
          )}
        </div>

        <TabsContent value="outline" className="relative flex flex-col gap-4 overflow-auto">
          <div className="overflow-hidden rounded-lg border">
            <DataTableNew dndEnabled table={table} columns={columns} onReorder={setData} />
          </div>

          <DataTablePagination table={table} />
        </TabsContent>
      </Tabs>
    </>
  );
}