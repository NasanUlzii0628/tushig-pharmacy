// src/app/(main)/dashboard/order/_components/columns.tsx

import { ColumnDef } from "@tanstack/react-table";
import { EllipsisVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

import type { OrderTypes } from "@/types/order";
import { DeleteOrderDialog } from "./delete";
import { RevertOrderDialog } from "./revert";

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
            cell: ({ row }) => {
                const date = new Date(row.original.order_date);
                const formattedDate = date.toLocaleDateString('en-CA'); // YYYY-MM-DD
                const formattedTime = date.toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit'
                }); // HH:MM
                return (
                    <span>{formattedDate} {formattedTime}</span>
                );
            },
        },

        {
            accessorKey: "amount",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Дүн" />
            ),
            cell: ({ row }) => (
                <span className="font-medium">{row.original.amount} {row.original.currency === "MNT" ? "₮" : "₮"}</span>
            ),
        },

        {
            accessorKey: "currency",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Валют" />
            ),
            cell: ({ row }) => (
                <span className="font-medium">{row.original.currency}</span>
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

                        <DropdownMenuSeparator />

                        <RevertOrderDialog
                            orderId={row.original.id}
                            onReverted={onRefresh}
                        />

                        <DropdownMenuSeparator />

                        <DeleteOrderDialog
                            orderId={row.original.id}
                            onDeleted={onRefresh}
                        />
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
            enableSorting: false,
        },
    ];