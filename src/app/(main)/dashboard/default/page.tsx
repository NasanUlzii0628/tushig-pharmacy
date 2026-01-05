import { fetchCustomers } from "@/services/actions/product";
import { DataTable } from "./_components/data-table";
import { FetchSupplier } from "@/services/actions/supplier";

export default async function Page() {
  const res = await fetchCustomers({ page: 1, size: 10 });

  const resSupplier = await FetchSupplier({ page: 1, size: 50 });

  const suppliers = resSupplier.data ?? []
  const products = res.data ?? [];

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <DataTable initialData={products} initialTotalPages={res.totalPages ?? 1} supplierData={suppliers} />
    </div>
  );
}
