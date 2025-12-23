import { ColumnDef } from "@tanstack/react-table";
import { EllipsisVertical } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { UserType } from "@/types/user";
import { UpdateUserDrawer } from "./update";
import { DeleteUserDialog } from "./delete";

const roleTranslations = {
  MANAGER: "Менежер",
  STAFF: "Ажилтан"
};

export const userColumns = (onUpdated: () => Promise<void>): ColumnDef<UserType>[] => [
  {
    id: "index",
    header: () => <span>#</span>,
    cell: ({ row }) => <span>{row.index + 1}</span>,
    enableSorting: false,
  },

  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Нэр" />,
    cell: ({ row }) => <span className="font-medium">{row.original.username}</span>,
  },
  {
    accessorKey: "role",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Эрх" />,
    cell: ({ row }) => <span>{roleTranslations[row.original.role as keyof typeof roleTranslations] || row.original.role}</span>,
  },

  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Төлөв" />,
    cell: ({ row }) => {
      const status = row.original.status;
      const color = status === "ACTIVE" ? "default" : status === "INACTIVE" ? "disabled" : "secondary";
      const text = status === "ACTIVE" ? "Идэвхтэй" : status === "INACTIVE" ? "Идэвхгүй" : status;

      return <Badge variant={color}>{text}</Badge>;
    },
  },

  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Үүсгэсэн" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {new Date(row.original.createdAt).toISOString().slice(0, 10)}
      </span>
    ),
  },

  {
    id: "actions",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Үйлдэл" />,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <EllipsisVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-32">
          <UpdateUserDrawer user={row.original} onUpdated={onUpdated} />
          <DropdownMenuSeparator />

          <DeleteUserDialog supplierId={row.original.id} supplierName={row.original.username} onDeleted={onUpdated} />
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
