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
import { Search, RefreshCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectTrigger, SelectValue, SelectContent, SelectItem, Select } from "@/components/ui/select";

export function DataTable({
  data: initialData,
  supplier: supplierData,
}: {
  data: ProductType[];
  supplier: SupplierType[];
}) {
  const [data, setData] = React.useState<ProductType[]>(initialData);
  const [openDrawer, setOpenDrawer] = React.useState(false);
  const [orderOpen, setOrderOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<ProductType | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedSupplier, setSelectedSupplier] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(false);

  const refreshProducts = React.useCallback(async (params?: { search?: string; supplier?: string }) => {
    setIsLoading(true);
    try {
      const name = params?.search ?? searchQuery;
      const supplier = params?.supplier !== undefined ? params.supplier : selectedSupplier;

      const res = await fetchCustomers({
        page: 1,
        size: 10,
        name: name || undefined,
        supplier_id: supplier && supplier !== "" ? supplier : undefined,
      });
      setData(res.data ?? []);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedSupplier]);


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
    setSelectedSupplier("");
    refreshProducts({ search: "", supplier: "" });
  };

  // Trigger search manually
  const handleSearch = () => {
    refreshProducts();
  };

  const columns = withDndColumn(productColumns(openOrder, refreshProducts, supplierData));

  const table = useDataTableInstance({
    data,
    columns,
    getRowId: (row) => row.id.toString(),
  });

  return (
    <>
      <OrderDialog open={orderOpen} onOpenChange={setOrderOpen} product={selectedProduct} />

      <Tabs defaultValue="outline" className="w-full flex-col justify-start gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <div className="relative w-full sm:w-auto">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              placeholder="Бүтээгдэхүүн хайх..."
              className="w-full pl-9 sm:w-[300px] text-base"
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
            <SelectTrigger className="w-full sm:w-[250px]">
              <SelectValue placeholder="Нийлүүлэгч сонгох" />
            </SelectTrigger>
            <SelectContent>
              {supplierData.map((s) => (
                <SelectItem key={s.id} value={s.id.toString()}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>


          <div className="flex gap-2">
            <Button onClick={handleSearch} disabled={isLoading} size="sm" className="flex-1 sm:w-[100px] sm:flex-none">
              <Search className="mr-2 h-4 w-4" />
              Хайх
            </Button>

            {searchQuery || selectedSupplier && (
              <Button
                onClick={handleClearFilters}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="flex-1 sm:w-[50px] sm:flex-none"
              >
                <RefreshCcwIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
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
