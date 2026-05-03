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
import { deleteOrderList } from "@/services/actions/order"

type Props = {
    orderId: number
    onDeleted: () => Promise<void> | void
}

export function DeleteOrderDialog({
    orderId,
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
                    <AlertDialogTitle>Бүртгэлийг устгах уу?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Захиалгыг устгахдаа итгэлтэй байна уу?
                        Энэ үйлдлийг буцаах боломжгүй. 
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel>Болих</AlertDialogCancel>

                    <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={async () => {
                            await toast.promise(
                                deleteOrderList(orderId),
                                {
                                    loading: "Устгаж байна...",
                                    success: async () => {
                                        await onDeleted()
                                        return "Захиалга амжилттай устгагдлаа!"
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
