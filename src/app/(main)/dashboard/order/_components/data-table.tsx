// src/app/(main)/dashboard/order/_components/data-table.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

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
import { SupplierType } from "@/types/supplier";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Search, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange } from "react-day-picker";

type DataTableProps = {
    initialData: OrderTypes[];
    initialTotalPages?: number;
    suppliers: SupplierType[];
};

export function DataTable({ initialData, initialTotalPages = 1, suppliers = [] }: DataTableProps) {
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

    const [date, setDate] = React.useState<DateRange | undefined>(undefined);
    const [supplierId, setSupplierId] = React.useState<string>("");

    const [activeDate, setActiveDate] = React.useState<DateRange | undefined>(undefined);
    const [activeSupplierId, setActiveSupplierId] = React.useState<string>("");

    const fetchData = React.useCallback(async (pageIndex: number, pageSize: number) => {
        setIsRefreshing(true);
        try {
            const res = await FetchOrderList({
                page: pageIndex + 1,
                size: pageSize,
                start_date: activeDate?.from ? format(activeDate.from, "yyyy-MM-dd") : undefined,
                end_date: activeDate?.to ? format(activeDate.to, "yyyy-MM-dd") : undefined,
                supplier_id: activeSupplierId || undefined,
            });
            setData(res.data ?? []);
            const totalElements = res.totalElements ?? 0;
            const calculatedTotalPages = Math.ceil(totalElements / pageSize) || 1;
            setTotalPages(calculatedTotalPages);
        } finally {
            setIsRefreshing(false);
        }
    }, [activeDate, activeSupplierId]);

    const handleApplyFilters = () => {
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
        setActiveDate(date);
        setActiveSupplierId(supplierId);

    };

    const handleResetFilters = () => {
        setDate(undefined);
        setSupplierId("");
        setActiveDate(undefined);
        setActiveSupplierId("");
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    };

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
        manualPagination: true,
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h4>Захиалгын жагсаалт</h4>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal sm:w-[300px]",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date?.from ? (
                                date.to ? (
                                    <>
                                        {format(date.from, "LLL dd, y")} -{" "}
                                        {format(date.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(date.from, "LLL dd, y")
                                )
                            ) : (
                                <span>Огноо сонгоно уу</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={setDate}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>

                <Select value={supplierId} onValueChange={setSupplierId}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Нийлүүлэгч" />
                    </SelectTrigger>
                    <SelectContent>
                        {suppliers.map((sup) => (
                            <SelectItem key={sup.id} value={sup.id.toString()}>
                                {sup.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {(date || supplierId) && (
                    <Button
                        variant="ghost"
                        onClick={handleResetFilters}
                    >
                        Цэвэрлэх
                        <X className="ml-2 h-4 w-4" />
                    </Button>
                )}

                <Button onClick={handleApplyFilters}>
                    <Search className="mr-2 h-4 w-4" />
                    Хайх
                </Button>
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
