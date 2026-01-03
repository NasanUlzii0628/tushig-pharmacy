// src/app/(main)/dashboard/order/page.tsx
import { FetchOrderList } from "@/services/actions/order";
import { FetchSupplier } from "@/services/actions/supplier";
import { DataTable } from "./_components/data-table";

export default async function OrderPage() {
  const res = await FetchOrderList({ page: 1, size: 10 });
  const supplierRes = await FetchSupplier({ page: 1, size: 100 });

  return (
    <DataTable
      initialData={res.data ?? []}
      initialTotalPages={res.totalPages ?? 1}
      suppliers={supplierRes.data ?? []}
    />
  );
}
