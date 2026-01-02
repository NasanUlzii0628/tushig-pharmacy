"use client";
"use no memo";

import * as React from "react";

import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";

import { DataTable as DataTableNew } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { withDndColumn } from "@/components/data-table/table-utils";

import { userColumns } from "./columns";
import type { UserType } from "@/types/user";
import { fetchUser } from "@/services/actions/user";
import { useState } from "react";
import { CreateUserDrawer } from "./create";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

export function DataTable() {
  const [data, setData] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [usernameQuery, setUsernameQuery] = useState("");

  const loadUsers = async (filters?: { username?: string }) => {
    setLoading(true);
    try {
      const res = await fetchUser({
        page: 1,
        size: 10,
        ...(filters?.username && { username: filters.username }),
      });
      setData(res.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadUsers();
  }, []);

  const handleSearch = () => {
    loadUsers({ username: usernameQuery });
  };

  const handleClearFilter = () => {
    setUsernameQuery("");
    loadUsers();
  };

  const columns = withDndColumn(userColumns(loadUsers));

  const table = useDataTableInstance({
    data,
    columns,
    getRowId: (row) => row.id.toString(),
  });

  return (
    <>
      <Tabs defaultValue="outline" className="w-full flex-col justify-start gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h4>Хэрэглэгчид</h4>

          <Label htmlFor="view-selector" className="sr-only">
            View
          </Label>

          <div className="flex items-center gap-2">
            <CreateUserDrawer onCreated={loadUsers} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none c" />
            <Input
              placeholder="Хэрэглэгчийн нэр..."
              className="pl-9 w-[300px]"
              value={usernameQuery}
              onChange={(e) => setUsernameQuery(e.target.value)}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />

          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleSearch}
              disabled={loading}
              size="sm"
            >
              <Search className="h-4 w-4 mr-2" />
              Хайх
            </Button>

            {usernameQuery && (
              <Button
                onClick={handleClearFilter}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <X className="h-4 w-4 mr-2" />
                Цэвэрлэх
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="outline" className="relative flex flex-col gap-4 overflow-auto">
          <div className="overflow-hidden rounded-lg border">
            {loading ? (
              <div className="p-6 text-center text-muted-foreground">Уншиж байна...</div>
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