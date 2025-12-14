// columns.ts
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
import { DeleteProductDialog } from "./delete";
import { getImageUrl } from "@/utils/image";

import type { ProductType } from "@/types/product";

export const productColumns = (
  onOrder: (product: ProductType) => void,
  onDelete: () => Promise<void>
): ColumnDef<ProductType>[] => [
    {
      id: "index",
      header: () => <span>#</span>,
      cell: ({ row }) => <span>{row.index + 1}</span>,
      enableSorting: false,
    },
    {
      accessorKey: "img",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Бүтээгдэхүүний зураг" />
      ),
      cell: ({ row }) => {
        const imageUrl = getImageUrl(row.original.img);

        return (
          <div className="">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={row.original.name}
                className="h-10 w-10 rounded-md object-cover border"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.src = "/placeholder-image.png";
                  target.onerror = null;
                }}
              />
            ) : (
              <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center border">
                <span className="text-xs text-muted-foreground">No img</span>
              </div>
            )}
          </div>
        );
      },
      enableSorting: false,
    },

    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Бүтээгдэхүүний нэр" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },

    {
      accessorKey: "default_price",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Үнэ" />
      ),
      cell: ({ row }) => (
        <span>{row.original.default_price} ¥</span>
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

    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Төлөв" />
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
            <DropdownMenuItem
              onClick={() => onOrder(row.original)}
            >
              Захиалах
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => alert(`Edit ${row.original.name}`)}>
              Шинэчлэх
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DeleteProductDialog
              productId={row.original.id}
              productName={row.original.name}
              onDeleted={onDelete} // ✅ Pass the refresh function
            />
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableSorting: false,
    },
  ];