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
import { Search, RefreshCcwIcon } from "lucide-react";

export function DataTable() {
  const [data, setData] = useState<SupplierType[]>([]);
  const [loading, setLoading] = useState(true);

  const [nameQuery, setNameQuery] = useState("");
  const [wechatQuery, setWechatQuery] = useState("");
  const [contactQuery, setContactQuery] = useState("");

  const loadSuppliers = async (filters?: { name?: string; wechat?: string; contact?: string }) => {
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h4>Нийлүүлэгчид</h4>

          <Label htmlFor="view-selector" className="sr-only">
            View
          </Label>

          <div className="flex items-center gap-2">
            <CreateDrawer onCreated={loadSuppliers} />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          {/* Name */}
          <div className="relative w-full sm:w-auto">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Нийлүүлэгчийн нэр..."
              className="w-full pl-9 sm:w-[300px] text-base"
              value={nameQuery}
              onChange={(e) => setNameQuery(e.target.value)}
              disabled={loading}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>

          {/* WeChat */}
          <div className="relative w-full sm:w-auto">

            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="WeChat..."
              className="w-full pl-9 sm:w-[300px] text-base"
              value={wechatQuery}
              onChange={(e) => setWechatQuery(e.target.value)}
              disabled={loading}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>


          {/* Contact */}
          <div className="relative w-full sm:w-auto">

            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Имэйл..."
              className="w-full pl-9 sm:w-[300px] text-base"
              value={contactQuery}
              onChange={(e) => setContactQuery(e.target.value)}
              disabled={loading}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>


          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleSearch} disabled={loading} size="sm" className="flex-1 sm:w-[100px] sm:flex-none">
              <Search className="mr-2 h-4 w-4" />
              Хайх
            </Button>

            {hasActiveFilters && (
              <Button
                onClick={handleClearFilters}
                disabled={loading}
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
            {loading ? (
              <div className="text-muted-foreground p-6 text-center">Loading...</div>
            ) : (
              <DataTableNew dndEnabled table={table} columns={columns} onReorder={setData} />
            )}
          </div>

          <DataTablePagination table={table} />
        </TabsContent>
      </Tabs>
    </>
  );
}
