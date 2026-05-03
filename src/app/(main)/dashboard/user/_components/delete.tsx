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
import { deleteUser } from "@/services/actions/user"

type Props = {
  supplierId: number
  supplierName: string
  onDeleted: () => Promise<void>
}

export function DeleteUserDialog({
  supplierId,
  supplierName,
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
          <AlertDialogTitle>Устгах</AlertDialogTitle>
          <AlertDialogDescription>
            <b>{supplierName}</b> хэрэглэгчийг устгахдаа итгэлтэй байна уу?
            Энэ үйлдлийг буцаах боломжгүй.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Болих</AlertDialogCancel>

          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700"
            onClick={async () => {
              await toast.promise(
                deleteUser(supplierId),
                {
                  loading: "Устгаж байна...",
                  success: async () => {
                    await onDeleted()
                    return "Хэрэглэгч амжилттай устгагдлаа!"
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
