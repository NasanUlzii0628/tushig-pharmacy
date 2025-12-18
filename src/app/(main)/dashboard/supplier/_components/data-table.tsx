"use client";
"use no memo";

import * as React from "react";

import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";

import { DataTable as DataTableNew } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { withDndColumn } from "@/components/data-table/table-utils";

import { supplierColumns } from "./columns";
import type { SupplierType } from "@/types/supplier";
import { FetchSupplier } from "@/services/actions/supplier";
import { useState } from "react";
import { CreateDrawer } from "./create";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

export function DataTable() {
  const [data, setData] = useState<SupplierType[]>([]);
  const [loading, setLoading] = useState(true);

  const [nameQuery, setNameQuery] = useState("");
  const [wechatQuery, setWechatQuery] = useState("");
  const [contactQuery, setContactQuery] = useState("");

  const loadSuppliers = async (filters?: {
    name?: string;
    wechat?: string;
    contact?: string;
  }) => {
    setLoading(true);
    try {
      const res = await FetchSupplier({
        page: 1,
        size: 10,
        ...(filters?.name && { name: filters.name }),
        ...(filters?.wechat && { wechat: filters.wechat }),
        ...(filters?.contact && { contact: filters.contact }),
      });
      setData(res.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadSuppliers();
  }, []);

  const handleSearch = () => {
    loadSuppliers({
      name: nameQuery,
      wechat: wechatQuery,
      contact: contactQuery,
    });
  };

  const handleClearFilters = () => {
    setNameQuery("");
    setWechatQuery("");
    setContactQuery("");
    loadSuppliers();
  };

  const hasActiveFilters = nameQuery || wechatQuery || contactQuery;

  const columns = withDndColumn(supplierColumns(loadSuppliers));

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
            <CreateDrawer onCreated={loadSuppliers} />
          </div>
        </div>

        <div className="grid grid-cols-[300px_300px_300px_80px_80px] gap-4 items-end">
          {/* Name */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Нэрээр хайх"
              className="pl-9 w-[300px]"
              value={nameQuery}
              onChange={(e) => setNameQuery(e.target.value)}
              disabled={loading}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>

          {/* WeChat */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="WeChat-ээр хайх"
              className="pl-9 w-[300px]"
              value={wechatQuery}
              onChange={(e) => setWechatQuery(e.target.value)}
              disabled={loading}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>

          {/* Contact */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Имэйл-ээр хайх"
              className="pl-9 w-[300px]"
              value={contactQuery}
              onChange={(e) => setContactQuery(e.target.value)}
              disabled={loading}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>

          {/* Search button */}
          <Button
            onClick={handleSearch}
            disabled={loading}
            size="sm"
            className="w-[80px]"
          >
            <Search className="h-4 w-4 mr-1" />
            Хайх
          </Button>

          {/* Clear button */}
          {hasActiveFilters && (
            <Button
              onClick={handleClearFilters}
              disabled={loading}
              variant="outline"
              size="sm"
              className="w-[120px]"
            >
              <X className="h-4 w-4 mr-1" />
              Цэвэрлэх
            </Button>
          )}
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