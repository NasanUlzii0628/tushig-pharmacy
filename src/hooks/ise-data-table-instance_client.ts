"use no memo";
import * as React from "react";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";

type UseDataTableInstanceProps<TData, TValue> = {
    data: TData[];
    columns: ColumnDef<TData, TValue>[];
    pageIndex: number;
    pageSize: number;
    pageCount: number; // 👈 from backend
    onPaginationChange: (pageIndex: number, pageSize: number) => void;
    getRowId?: (row: TData, index: number) => string;
};

export function useDataTableInstanceClient<TData, TValue>({
    data,
    columns,
    pageIndex,
    pageSize,
    pageCount,
    onPaginationChange,
    getRowId,
}: UseDataTableInstanceProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
            columnFilters,
            pagination: {
                pageIndex,
                pageSize,
            },
        },

        manualPagination: true,
        pageCount,

        onPaginationChange: (updater) => {
            const next =
                typeof updater === "function"
                    ? updater({ pageIndex, pageSize })
                    : updater;

            onPaginationChange(next.pageIndex, next.pageSize);
        },

        getRowId: getRowId ?? ((row) => (row as any).id.toString()),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,

        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return table;
}
