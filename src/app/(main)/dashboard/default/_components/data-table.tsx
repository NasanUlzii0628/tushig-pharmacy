// DataTable component
"use client";
"use no memo";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";

import { DataTable as DataTableNew } from "../../../../../components/data-table/data-table";
import { DataTablePagination } from "../../../../../components/data-table/data-table-pagination";
import { DataTableViewOptions } from "../../../../../components/data-table/data-table-view-options";
import { withDndColumn } from "../../../../../components/data-table/table-utils";

import { productColumns } from "./columns";
import type { ProductType } from "@/types/product";
import { CreateDrawer } from "./create";
import { SupplierType } from "@/types/supplier";
import { fetchCustomers } from "@/services/actions/product";
import { OrderDialog } from "./order";

export function DataTable({ data: initialData, supplier: supplierData }: {
  data: ProductType[],
  supplier: SupplierType[]
}) {
  const [data, setData] = React.useState<ProductType[]>(initialData);
  const [openDrawer, setOpenDrawer] = React.useState(false);
  const [orderOpen, setOrderOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<ProductType | null>(null);

  const refreshProducts = React.useCallback(async () => {
    const res = await fetchCustomers({ page: 1, size: 10 });
    setData(res.data ?? []);
  }, []);

  const openOrder = (product: ProductType) => {
    setSelectedProduct(product);
    setOrderOpen(true);
  };

  const columns = withDndColumn(
    productColumns(openOrder, refreshProducts)
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
            <DataTableViewOptions table={table} />
            <CreateDrawer
              supplierData={supplierData}
              open={openDrawer}
              setOpen={setOpenDrawer}
              refresh={refreshProducts}
            />
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