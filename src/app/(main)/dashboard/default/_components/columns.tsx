// columns.ts
import { ColumnDef } from "@tanstack/react-table";
import { EllipsisVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DeleteProductDialog } from "./delete";

import type { ProductType } from "@/types/product";
import { UpdateProductDrawer } from "./update";
import React from "react";
import { SupplierType } from "@/types/supplier";

const ImagePreview = ({ src, alt }: { src: string; alt: string }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <img
          src={src}
          alt={alt}
          className="h-10 w-10 cursor-pointer rounded-md border object-cover transition-opacity hover:opacity-80"
          onError={(e) => {
            const target = e.currentTarget;
            target.src = "/placeholder.png";
            target.onerror = null;
          }}
        />
      </DialogTrigger>

      <DialogContent className="max-w-3xl">
        <DialogTitle></DialogTitle>

        <img
          src={src}
          alt={alt}
          className="h-auto w-full rounded-lg"
          onError={(e) => {
            const target = e.currentTarget;
            target.src = "/placeholder.png";
            target.onerror = null;
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export const productColumns = (
  onOrder: (product: ProductType) => void,
  onDelete: () => Promise<void>,
  supplierData: SupplierType[],
): ColumnDef<ProductType>[] => [
    {
      id: "index",
      header: () => <span>#</span>,
      cell: ({ row }) => <span>{row.index + 1}</span>,
      enableSorting: false,
    },
    {
      accessorKey: "img",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Бүтээгдэхүүний зураг" />,
      cell: ({ row }) => {
        const imageUrl = row.original.img;
        const addiImgs = row.original.addi_imgs;
        const hasAdditional = Array.isArray(addiImgs) && addiImgs.length > 0 && addiImgs[0];

        const additionalImageUrl = hasAdditional ? addiImgs[0] : null;

        return (
          <div className="flex flex-row gap-2">
            {imageUrl ? (
              <ImagePreview src={`https://cdn.tushig.online/${imageUrl}`} alt={row.original.name} />
            ) : (
              <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-md border">
                <span className="text-muted-foreground text-xs">No img</span>
              </div>
            )}

            {addiImgs && Array.isArray(addiImgs) && addiImgs.length > 0 &&
              addiImgs.map((img: string, index: number) => (
                <ImagePreview key={`${row.original.id}-addi-${index}`} src={`https://cdn.tushig.online/${img}`} alt={`${row.original.name} - additional ${index + 1}`} />
              ))}
          </div>
        );
      },

      enableSorting: false,
    },

    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Бүтээгдэхүүний нэр" />,
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },

    {
      accessorKey: "default_price",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Үнэ" />,
      cell: ({ row }) => <span>{row.original.default_price} ¥</span>,
    },

    {
      accessorKey: "default_supplier",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Нийлүүлэгч" />,
      cell: ({ row }) => <span>{row.original.default_supplier.name}</span>,
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
      id: "actions",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Үйлдэл" />,
      cell: ({ row }) => {
        const [open, setOpen] = React.useState(false);

        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <EllipsisVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>


              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onOrder(row.original)}
                >
                  Захиалах
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setOpen(true)}>Шинэчлэх</DropdownMenuItem>

                <DropdownMenuSeparator />

                <DeleteProductDialog productId={row.original.id} productName={row.original.name} onDeleted={onDelete} />
              </DropdownMenuContent>
            </DropdownMenu>

            <UpdateProductDrawer
              open={open}
              setOpen={setOpen}
              product={row.original}
              supplierData={supplierData}
              refresh={onDelete}
            />
          </>
        );
      },

      enableSorting: false,
    },
  ];
