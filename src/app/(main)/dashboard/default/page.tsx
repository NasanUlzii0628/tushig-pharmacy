import { fetchCustomers } from "@/services/actions/product";
import { DataTable } from "./_components/data-table";
import { FetchSupplier } from "@/services/actions/supplier";
import { unstable_cache } from "next/cache";
import { cookies } from "next/headers";

export default async function Page() {
  // ✅ Get token OUTSIDE cache
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";

  const getCachedProducts = unstable_cache(
    async (authToken: string) => fetchCustomers({ page: 1, size: 10 }, authToken),
    ["products-initial"],
    { tags: ["products"], revalidate: 60 }
  );

  const getCachedSuppliers = unstable_cache(
    async (authToken: string) => FetchSupplier({ page: 1, size: 50 }, authToken),
    ["suppliers-list"],
    { tags: ["suppliers"], revalidate: 300 }
  );

  const [res, resSupplier] = await Promise.all([
    getCachedProducts(token),
    getCachedSuppliers(token),
  ]);

  const suppliers = resSupplier.data ?? [];
  const products = res.data ?? [];

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <DataTable 
        initialData={products} 
        initialTotalPages={res.totalPages ?? 1} 
        supplierData={suppliers} 
      />
    </div>
  );
}