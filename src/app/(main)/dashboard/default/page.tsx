import { fetchCustomers } from "@/services/actions/product";
import { DataTable } from "./_components/data-table";

export default async function Page() {
  const res = await fetchCustomers({ page: 1, size: 10 });

  const products = res.data ?? [];

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <DataTable data={products} />
    </div>
  );
}
