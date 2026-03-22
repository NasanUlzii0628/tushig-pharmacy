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
import { revertOrder } from "@/services/actions/order"

type Props = {
    orderId: number
    onReverted: () => Promise<void> | void
}

export function RevertOrderDialog({ orderId, onReverted }: Props) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <DropdownMenuItem
                    className="text-orange-500"
                    onSelect={(e) => e.preventDefault()}
                >
                    Цуцлах
                </DropdownMenuItem>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Захиалга цуцлах уу?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Захиалгыг цуцалснаар бүтээгдэхүүнүүд сагс руу буцан орно.
                        Энэ үйлдлийг баталгаажуулна уу.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel>Болих</AlertDialogCancel>

                    <AlertDialogAction
                        className="bg-orange-500 hover:bg-orange-600"
                        onClick={async () => {
                            await toast.promise(
                                revertOrder(orderId),
                                {
                                    loading: "Цуцалж байна...",
                                    success: async (res) => {
                                        if (!res.success) {
                                            throw new Error(res.message)
                                        }
                                        await onReverted()
                                        return "Захиалга амжилттай цуцлагдлаа!"
                                    },
                                    error: (err) => err?.message || "Цуцлах үед алдаа гарлаа",
                                }
                            )
                        }}
                    >
                        Цуцлах
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
