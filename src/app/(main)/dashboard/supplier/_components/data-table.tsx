"use client";
"use no memo";

import * as React from "react";

import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";

import { DataTable as DataTableNew } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { withDndColumn } from "@/components/data-table/table-utils";

import { supplierColumns } from "./columns";
import type { SupplierType } from "@/types/supplier";
import { FetchSupplier } from "@/services/actions/supplier";
import { useState } from "react";
import { CreateDrawer } from "./create";

export function DataTable() {
  const [data, setData] = useState<SupplierType[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSuppliers = async () => {
    setLoading(true);
    const res = await FetchSupplier({ page: 1, size: 10 });
    setData(res.data ?? []);
    setLoading(false);
  };

  React.useEffect(() => {
    loadSuppliers();
  }, []);

 const columns = withDndColumn(supplierColumns(loadSuppliers))


  const table = useDataTableInstance({
    data,
    columns,
    getRowId: (row) => row.id.toString(),
  });

  return (
    <>
      <Tabs defaultValue="outline" className="w-full flex-col justify-start gap-6">
        <div className="flex items-center justify-between">
          <h4>Нийлүүлэгчид</h4>

          <Label htmlFor="view-selector" className="sr-only">
            View
          </Label>

          <div className="flex items-center gap-2">
            <DataTableViewOptions table={table} />
            <CreateDrawer onCreated={loadSuppliers} />
          </div>
        </div>

        <TabsContent value="outline" className="relative flex flex-col gap-4 overflow-auto">
          <div className="overflow-hidden rounded-lg border">
            {loading ? (
              <div className="p-6 text-center text-muted-foreground">Loading...</div>
            ) : (
              <DataTableNew
                dndEnabled
                table={table}
                columns={columns}
                onReorder={setData}
              />
            )}
          </div>

          <DataTablePagination table={table} />
        </TabsContent>
      </Tabs>
    </>
  );
}
