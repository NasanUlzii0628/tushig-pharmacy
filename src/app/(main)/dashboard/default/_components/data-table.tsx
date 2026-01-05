// DataTable component
"use client";
"use no memo";
import { useState, useEffect } from "react";
import React from "react";
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


type DataTableProps = {
  initialData: ProductType[];
  initialTotalPages?: number;
  supplierData: SupplierType[];
};

export function DataTable({ initialData, initialTotalPages = 1, supplierData = [] }: DataTableProps) {
  const [data, setData] = useState<ProductType[]>(initialData);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [totalPages, setTotalPages] = useState(initialTotalPages);

  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const refreshProducts = React.useCallback(async (): Promise<void> => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);

      const res = await fetchCustomers({
        page: pagination.pageIndex + 1,
        size: pagination.pageSize,
        name: searchQuery || undefined,
        supplier_id: selectedSupplier || undefined,
      });

      setData(res.data ?? []);
      setTotalPages(res.totalPages ?? 1);

      setIsLoading(false);
    };

    load();
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    searchQuery,
    selectedSupplier,
    refreshKey,
  ]);


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
    refreshProducts();
  };

  const handleSearch = () => {
    refreshProducts();
  };


  const columns = withDndColumn(
    productColumns(
      openOrder,
      refreshProducts,
      supplierData,
      pagination.pageIndex,
      pagination.pageSize
    )
  );

  const table = useDataTableInstance({
    data,
    columns,
    pagination,
    pageCount: totalPages,
    onPaginationChange: setPagination,
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

            {(searchQuery || selectedSupplier) && (
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
            <div className="rounded-lg border overflow-hidden">
              {isLoading ? (
                <div className="p-6 text-center text-muted-foreground">Уншиж байна...</div>
              ) : (
                <DataTableNew dndEnabled table={table} columns={columns} onReorder={setData} />
              )}
            </div>
          </div>

          <DataTablePagination table={table} />
        </TabsContent>
      </Tabs>
    </>
  );
}
