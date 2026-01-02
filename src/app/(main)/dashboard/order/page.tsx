// src/app/(main)/dashboard/order/page.tsx
import { FetchOrderList } from "@/services/actions/order";
import { DataTable } from "./_components/data-table";

export default async function OrderPage() {
  const res = await FetchOrderList({ page: 1, size: 10 });

  return (
    <DataTable
      initialData={res.data ?? []}
      initialTotalPages={res.totalPages ?? 1}
    />
  );
}
