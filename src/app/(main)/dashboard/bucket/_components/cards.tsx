import { fetchBucketList } from "@/services/actions/order";
import { BucketList } from "@/types/order";
import { BucketListClient } from "./bucket-list-client";

const BucketCards = async () => {
    const result = await fetchBucketList();
    const items: BucketList[] = result.data?.data ? (Array.isArray(result.data.data) ? result.data.data : [result.data.data]) : [];

    return <BucketListClient items={items} />;
}

export default BucketCards