"use client"

import * as React from "react"
import { toast } from "sonner"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { deleteProduct } from "@/services/actions/product"

type Props = {
    productId: number
    productName: string
    onDeleted: () => Promise<void>
}

export function DeleteProductDialog({
    productId,
    productName,
    onDeleted,
}: Props) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <DropdownMenuItem
                    className="text-red-500"
                    onSelect={(e) => e.preventDefault()}
                >
                    Устгах
                </DropdownMenuItem>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Устгах уу?</AlertDialogTitle>
                    <AlertDialogDescription>
                        <b>{productName}</b> бүтээгдэхүүн устгахдаа итгэлтэй байна уу?
                        Энэ үйлдлийг буцаах боломжгүй.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel>Болих</AlertDialogCancel>

                    <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={async () => {
                            await toast.promise(
                                deleteProduct(productId),
                                {
                                    loading: "Устгаж байна...",
                                    success: async () => {
                                        await onDeleted()
                                        return "Нийлүүлэгч амжилттай устгагдлаа!"
                                    },
                                    error: "Устгах үед алдаа гарлаа",
                                }
                            )
                        }}
                    >
                        Устгах
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
