import { fetchBucketList } from "@/services/actions/order";
import { BucketList } from "@/types/order";
import { BucketListClient } from "./bucket-list-client";
import { getCurrentUserRole } from "@/lib/auth-user";
import { FetchSupplier } from "@/services/actions/supplier";

const BucketCards = async () => {
    const [result, userRole, resSupplier] = await Promise.all([
        fetchBucketList({ currency: "CNY" }),
        getCurrentUserRole(),
        FetchSupplier({ page: 1, size: 50 }),
    ]);

    const items: BucketList[] = result.data?.data
        ? (Array.isArray(result.data.data) ? result.data.data : [result.data.data])
        : [];

    const suppliers = resSupplier.data ?? [];

    return <BucketListClient items={items} userRole={userRole || undefined} suppliers={suppliers} />;
}

export default BucketCards;