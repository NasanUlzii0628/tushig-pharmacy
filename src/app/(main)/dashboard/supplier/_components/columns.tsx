import { ColumnDef } from "@tanstack/react-table"
import { EllipsisVertical } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import type { SupplierType } from "@/types/supplier"
import { UpdateDrawer } from "./update"
import { DeleteSupplierDialog } from "./delete"

export const supplierColumns = (
  onUpdated: () => Promise<void>
): ColumnDef<SupplierType>[] => [
    {
      id: "index",
      header: () => <span>#</span>,
      cell: ({ row }) => <span>{row.index + 1}</span>,
      enableSorting: false,
    },

    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Нийлүүлэгчийн нэр" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },

    {
      accessorKey: "contact",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Имэйл" />
      ),
      cell: ({ row }) => <span>{row.original.contact}</span>,
    },

    {
      accessorKey: "wechat",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="WeChat" />
      ),
      cell: ({ row }) => <span>{row.original.wechat}</span>,
    },

    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Төлөв" />
      ),
      cell: ({ row }) => {

        const status = row.original.status;
        const color = status === "ACTIVE" ? "default" : status === "INACTIVE" ? "disabled" : "secondary";
        const text = status === "ACTIVE" ? "Идэвхтэй" : status === "INACTIVE" ? "Идэвхгүй" : status;


        return <Badge variant={color}>{text}</Badge>
      },
    },

    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Үүсгэсэн" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {new Date(row.original.createdAt).toISOString().slice(0, 10)}
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

          <DropdownMenuContent align="end">
            <UpdateDrawer
              supplier={row.original}
              onUpdated={onUpdated}
            />

            <DropdownMenuSeparator />

            <DeleteSupplierDialog
              supplierId={row.original.id}
              supplierName={row.original.name}
              onDeleted={onUpdated}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
