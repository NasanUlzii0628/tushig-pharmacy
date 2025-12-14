// src/app/(main)/dashboard/order/_components/columns.tsx

import { ColumnDef } from "@tanstack/react-table";
import { EllipsisVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

import type { OrderTypes } from "@/types/order";

export const orderColumns = (
    onRefresh: () => void,
    handleNavigate: (orderId: number) => void
): ColumnDef<OrderTypes>[] => [
        {
            id: "index",
            header: () => <span>#</span>,
            cell: ({ row }) => <span>{row.index + 1}</span>,
            enableSorting: false,
        },

        {
            accessorKey: "order_date",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Огноо" />
            ),
            cell: ({ row }) => (
                <span>{new Date(row.original.order_date).toISOString().slice(0, 10)}</span>
            ),
        },

        {
            accessorKey: "amount",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Дүн" />
            ),
            cell: ({ row }) => (
                <span className="font-medium">{row.original.amount} ¥</span>
            ),
        },

        {
            accessorKey: "supplier_name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Нийлүүлэгч" />
            ),
            cell: ({ row }) => (
                <span className="text-muted-foreground">
                    {row.original.supplier_name || "Тодорхойгүй"}
                </span>
            ),
        },

        {
            id: "actions",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Үйлдэл" />
            ),
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <EllipsisVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem onClick={() => handleNavigate(row.original.id)}>
                            Дэлгэрэнгүй
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
            enableSorting: false,
        },
    ];