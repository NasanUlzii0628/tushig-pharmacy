// src/app/(main)/dashboard/order/_components/data-table.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";

import { DataTable as DataTableNew } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { withDndColumn } from "@/components/data-table/table-utils";

import { orderColumns } from "./columns";
import type { OrderTypes } from "@/types/order";
import { FetchOrderList } from "@/services/actions/order";

type DataTableProps = {
    initialData: OrderTypes[];
};

export function DataTable({ initialData }: DataTableProps) {
    const router = useRouter();
    const [data, setData] = React.useState<OrderTypes[]>(initialData);
    const [loadingMap, setLoadingMap] = React.useState<Record<number, boolean>>({});
    const [isRefreshing, setIsRefreshing] = React.useState(false);

    const handleRefresh = React.useCallback(async () => {
        setIsRefreshing(true);
        const res = await FetchOrderList({ page: 1, size: 10 });
        setData(res.data ?? []);
        setIsRefreshing(false);
    }, []);

    const handleNavigate = React.useCallback((orderId: number) => {
        setLoadingMap((prev) => ({ ...prev, [orderId]: true }));
        router.push(`/dashboard/order/${orderId}`);
    }, [router]);

    const columns = React.useMemo(
        () => withDndColumn(orderColumns(handleRefresh, handleNavigate)),
        [handleRefresh, handleNavigate]
    );

    const table = useDataTableInstance({
        data,
        columns,
        getRowId: (row) => row.id.toString(),
    });

    return (
        <Tabs defaultValue="outline" className="w-full flex-col justify-start gap-6">
            <div className="flex items-center justify-between">
                <h4>Захиалгын жагсаалт</h4>

                <Label htmlFor="view-selector" className="sr-only">
                    View
                </Label>

                <div className="flex items-center gap-2">
                </div>
            </div>

            <TabsContent value="outline" className="relative flex flex-col gap-4 overflow-auto">
                <div className="overflow-hidden rounded-lg border">
                    {isRefreshing ? (
                        <div className="p-6 text-center text-muted-foreground">
                            Шинэчилж байна...
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

                <DataTablePagination table={table} />
            </TabsContent>
        </Tabs>
    );
}