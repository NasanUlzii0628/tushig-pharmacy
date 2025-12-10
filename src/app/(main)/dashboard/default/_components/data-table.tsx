"use client";
"use no memo";

import * as React from "react";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@/components/ui/drawer";

import { DataTable as DataTableNew } from "../../../../../components/data-table/data-table";
import { DataTablePagination } from "../../../../../components/data-table/data-table-pagination";
import { DataTableViewOptions } from "../../../../../components/data-table/data-table-view-options";
import { withDndColumn } from "../../../../../components/data-table/table-utils";

import { productColumns } from "./columns";
import type { ProductType } from "@/types/product";

export function DataTable({ data: initialData }: { data: ProductType[] }) {
  const [data, setData] = React.useState<ProductType[]>(() => initialData);
  const [openDrawer, setOpenDrawer] = React.useState(false);

  const columns = withDndColumn(productColumns);

  const table = useDataTableInstance({
    data,
    columns,
    getRowId: (row) => row.id.toString(),
  });

  return (
    <>
      {/* ---------------- RIGHT DRAWER ---------------- */}
      <Drawer direction="right" open={openDrawer} onOpenChange={setOpenDrawer}>
        <DrawerContent className="fixed right-0 top-0 h-full w-[420px] rounded-none border-l bg-background">
          <DrawerHeader>
            <DrawerTitle>Шинэ бүтээгдэхүүн нэмэх</DrawerTitle>
          </DrawerHeader>

          <div className="p-4">
            {/* Place your form fields here */}
            <p className="text-sm text-muted-foreground">
              Энд бүтээгдэхүүний форм тавигдана...
            </p>
          </div>

          <DrawerFooter>
            <Button className="w-full">Хадгалах</Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">Болих</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Tabs defaultValue="outline" className="w-full flex-col justify-start gap-6">
        <div className="flex items-center justify-between">
          <h4>Бүтээгдэхүүн</h4>

          <Label htmlFor="view-selector" className="sr-only">
            View
          </Label>

          <div className="flex items-center gap-2">
            <DataTableViewOptions table={table} />

            <Button variant="outline" size="sm" onClick={() => setOpenDrawer(true)}>
              <Plus />
              <span className="hidden lg:inline">Шинэ бүтээгдэхүүн</span>
            </Button>
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
