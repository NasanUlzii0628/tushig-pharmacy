"use client";
"use no memo";

import * as React from "react";
import { useEffect, useState } from "react";

import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { DataTable as DataTableNew } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { withDndColumn } from "@/components/data-table/table-utils";

import { userColumns } from "./columns";
import type { UserType } from "@/types/user";
import { fetchUser } from "@/services/actions/user";
import { CreateUserDrawer } from "./create";

import { Search, X } from "lucide-react";
import { useDataTableInstanceClient } from "@/hooks/ise-data-table-instance_client";

export function DataTable() {
  const [data, setData] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔎 filter
  const [usernameQuery, setUsernameQuery] = useState("");

  // 📄 pagination (SERVER)
  const [pageIndex, setPageIndex] = useState(0); // 0-based
  const [pageSize, setPageSize] = useState(30);
  const [pageCount, setPageCount] = useState(0);

  const loadUsers = async (
    page = pageIndex,
    size = pageSize,
    filters?: { username?: string }
  ) => {
    setLoading(true);
    try {
      const res = await fetchUser({
        page: page + 1, // API is 1-based
        size,
        ...(filters?.username && { username: filters.username }),
      });

      setData(res.data ?? []);
      setPageCount(res.pagination?.totalPages ?? 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSearch = () => {
    setPageIndex(0);
    loadUsers(0, pageSize, { username: usernameQuery });
  };

  const handleClearFilter = () => {
    setUsernameQuery("");
    setPageIndex(0);
    loadUsers(0, pageSize);
  };

  const handlePaginationChange = (nextPage: number, nextSize: number) => {
    setPageIndex(nextPage);
    setPageSize(nextSize);

    loadUsers(nextPage, nextSize, {
      username: usernameQuery || undefined,
    });
  };

  const columns = withDndColumn(userColumns(() => loadUsers()));

  const table = useDataTableInstanceClient({
    data,
    columns,
    pageIndex,
    pageSize,
    pageCount,
    onPaginationChange: handlePaginationChange,
    getRowId: (row) => row.id.toString(),
  });

  return (
    <Tabs defaultValue="outline" className="w-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <h4>Хэрэглэгчдийн жагсаалт</h4>
        <CreateUserDrawer onCreated={() => loadUsers()} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Хэрэглэгчийн нэр..."
            className="pl-9 w-[300px]"
            value={usernameQuery}
            onChange={(e) => setUsernameQuery(e.target.value)}
            disabled={loading}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>

        <Button onClick={handleSearch} disabled={loading} size="sm">
          <Search className="h-4 w-4 mr-2" />
          Хайх
        </Button>

        {usernameQuery && (
          <Button onClick={handleClearFilter} variant="outline" size="sm">
            <X className="h-4 w-4 mr-2" />
            Цэвэрлэх
          </Button>
        )}
      </div>

      <TabsContent value="outline" className="flex flex-col gap-4">
        <div className="rounded-lg border overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-muted-foreground">
              Уншиж байна...
            </div>
          ) : (
            <DataTableNew
              dndEnabled
              table={table}
              columns={columns}
              onReorder={setData}
            />
          )}
        </div>

        {/* <DataTablePagination table={table} /> */}
      </TabsContent>
    </Tabs>
  );
}
