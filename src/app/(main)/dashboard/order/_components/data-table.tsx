// src/app/(main)/dashboard/order/_components/data-table.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
    PaginationState,
} from "@tanstack/react-table";

import { DataTable as DataTableNew } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { withDndColumn } from "@/components/data-table/table-utils";

import { orderColumns } from "./columns";
import type { OrderTypes } from "@/types/order";
import { FetchOrderList } from "@/services/actions/order";

type DataTableProps = {
    initialData: OrderTypes[];
    initialTotalPages?: number;
};

export function DataTable({ initialData, initialTotalPages = 1 }: DataTableProps) {
    const router = useRouter();
    const [data, setData] = React.useState<OrderTypes[]>(initialData);
    const [loadingMap, setLoadingMap] = React.useState<Record<number, boolean>>({});
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    const [totalPages, setTotalPages] = React.useState(initialTotalPages);

    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: 5,
    });

    const [rowSelection, setRowSelection] = React.useState({});
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = React.useState<SortingState>([]);

    const fetchData = React.useCallback(async (pageIndex: number, pageSize: number) => {
        setIsRefreshing(true);
        try {
            const res = await FetchOrderList({
                page: pageIndex + 1,
                size: pageSize
            });
            setData(res.data ?? []);
            const totalElements = res.totalElements ?? 0;
            const calculatedTotalPages = Math.ceil(totalElements / pageSize) || 1;
            setTotalPages(calculatedTotalPages);
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    React.useEffect(() => {
        fetchData(pagination.pageIndex, pagination.pageSize);
    }, [pagination.pageIndex, pagination.pageSize, fetchData]);

    const handleRefresh = React.useCallback(async () => {
        await fetchData(pagination.pageIndex, pagination.pageSize);
    }, [fetchData, pagination.pageIndex, pagination.pageSize]);

    const handleNavigate = React.useCallback((orderId: number) => {
        setLoadingMap((prev) => ({ ...prev, [orderId]: true }));
        router.push(`/dashboard/order/${orderId}`);
    }, [router]);

    const columns = React.useMemo(
        () => withDndColumn(orderColumns(handleRefresh, handleNavigate)),
        [handleRefresh, handleNavigate]
    );

    const table = useReactTable({
        data,
        columns,
        pageCount: totalPages,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            pagination,
        },
        manualPagination: true, // Enable server-side pagination
        enableRowSelection: true,
        getRowId: (row) => row.id.toString(),
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
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
