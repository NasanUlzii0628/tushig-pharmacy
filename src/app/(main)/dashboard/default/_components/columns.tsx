// src/app/(main)/dashboard/products/_components/columns.ts

import { ColumnDef } from "@tanstack/react-table";
import { EllipsisVertical } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

import type { ProductType } from "@/types/product";

export const productColumns: ColumnDef<ProductType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "img",
    header: () => <span>Image</span>,
    cell: ({ row }) => (
      <img
        src={row.original.img}
        alt={row.original.name}
        className="h-10 w-10 rounded-md object-cover border"
      />
    ),
    enableSorting: false,
  },

  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product Name" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.original.name}</span>
    ),
  },

  {
    accessorKey: "default_price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Default Price" />
    ),
    cell: ({ row }) => (
      <span>{row.original.default_price} ₮</span>
    ),
  },

  {
    accessorKey: "default_supplier_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Supplier" />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.default_supplier_id}
      </span>
    ),
  },

  // STATUS
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.original.status;
      const color =
        status === "ACTIVE"
          ? "outline"
          : status === "DISABLED"
            ? "destructive"
            : "secondary";

      return <Badge variant={color}>{status}</Badge>;
    },
  },

  // ACTIONS MENU
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <EllipsisVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem onClick={() => alert(`Edit ${row.original.name}`)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => alert(`Duplicate ${row.original.id}`)}>
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-500"
            onClick={() => alert(`Delete ${row.original.id}`)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableSorting: false,
  },
];
