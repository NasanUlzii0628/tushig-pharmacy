"use client";
"use no memo";

import * as React from "react";
import { useState, useEffect } from "react";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Search, RefreshCcwIcon } from "lucide-react";

import { DataTable as DataTableNew } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { withDndColumn } from "@/components/data-table/table-utils";

import { supplierColumns } from "./columns";
import { FetchSupplier } from "@/services/actions/supplier";
import type { SupplierType } from "@/types/supplier";
import { CreateDrawer } from "./create";
import { useDataTableInstanceClient } from "@/hooks/ise-data-table-instance_client";

export function DataTable() {
  const [data, setData] = useState<SupplierType[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 filters
  const [nameQuery, setNameQuery] = useState("");
  const [wechatQuery, setWechatQuery] = useState("");
  const [contactQuery, setContactQuery] = useState("");

  // 🔹 pagination
  const [pageIndex, setPageIndex] = useState(0); // 0-based
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(0);

  const loadSuppliers = async (
    page = pageIndex,
    size = pageSize,
    filters?: { name?: string; wechat?: string; contact?: string }
  ) => {
    setLoading(true);
    try {
      const res = await FetchSupplier({
        page: page + 1, // API is 1-based
        size,
        ...(filters?.name && { name: filters.name }),
        ...(filters?.wechat && { wechat: filters.wechat }),
        ...(filters?.contact && { contact: filters.contact }),
      });

      setData(res.data ?? []);
      setPageCount(res.pagination?.totalPages ?? 0);
    } finally {
      setLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    loadSuppliers();
  }, []);

  // 🔍 Search
  const handleSearch = () => {
    setPageIndex(0);
    loadSuppliers(0, pageSize, {
      name: nameQuery,
      wechat: wechatQuery,
      contact: contactQuery,
    });
  };

  const handleClearFilters = () => {
    setNameQuery("");
    setWechatQuery("");
    setContactQuery("");
    setPageIndex(0);
    loadSuppliers(0, pageSize);
  };

  // 📄 Pagination change
  const handlePaginationChange = (nextPage: number, nextSize: number) => {
    setPageIndex(nextPage);
    setPageSize(nextSize);
    loadSuppliers(nextPage, nextSize, {
      name: nameQuery || undefined,
      wechat: wechatQuery || undefined,
      contact: contactQuery || undefined,
    });
  };

  const columns = withDndColumn(supplierColumns(() => loadSuppliers()));

  const table = useDataTableInstanceClient({
    data,
    columns,
    pageIndex,
    pageSize,
    pageCount,
    onPaginationChange: handlePaginationChange,
    getRowId: (row) => row.id.toString(),
  });

  const hasActiveFilters = nameQuery || wechatQuery || contactQuery;

  return (
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

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
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
        <Button onClick={handleSearch} size="sm">
          <Search className="h-4 w-4 mr-2" /> Хайх
        </Button>

        {hasActiveFilters && (
          <Button onClick={handleClearFilters} variant="outline" size="sm">
            <RefreshCcwIcon className="h-4 w-4" />
          </Button>
        )}
      </div>

      <TabsContent value="outline" className="flex flex-col gap-4">
        <div className="rounded-lg border overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-muted-foreground">Loading...</div>
          ) : (
            <DataTableNew table={table} columns={columns} />
          )}
        </div>

        {/* 🔹 SERVER PAGINATION */}
        <DataTablePagination table={table} />
      </TabsContent>
    </Tabs>
  );
}
