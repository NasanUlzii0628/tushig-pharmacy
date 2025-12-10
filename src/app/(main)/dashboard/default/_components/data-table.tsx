"use client";
"use no memo";

import * as React from "react";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";

import { DataTable as DataTableNew } from "../../../../../components/data-table/data-table";
import { DataTablePagination } from "../../../../../components/data-table/data-table-pagination";
import { DataTableViewOptions } from "../../../../../components/data-table/data-table-view-options";
import { withDndColumn } from "../../../../../components/data-table/table-utils";

import { productColumns } from "./columns";
import type { ProductType } from "@/types/product";

export function DataTable({ data: initialData }: { data: ProductType[] }) {
  const [data, setData] = React.useState<ProductType[]>(() => initialData);

  const columns = withDndColumn(productColumns);

  const table = useDataTableInstance({
    data,
    columns,
    getRowId: (row) => row.id.toString(),
  });

  return (
    <Tabs defaultValue="outline" className="w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-between">
        <h4>Бүтээгдэхүүн</h4>

        <Label htmlFor="view-selector" className="sr-only">View</Label>

        <div className="flex items-center gap-2">
          <DataTableViewOptions table={table} />

          <Button variant="outline" size="sm">
            <Plus />
            <span className="hidden lg:inline">Add Product</span>
          </Button>
        </div>
      </div>

      <TabsContent value="outline" className="relative flex flex-col gap-4 overflow-auto">
        <div className="overflow-hidden rounded-lg border">
          <DataTableNew
            dndEnabled
            table={table}
            columns={columns}
            onReorder={setData}
          />
        </div>

        <DataTablePagination table={table} />
      </TabsContent>
    </Tabs>
  );
}
