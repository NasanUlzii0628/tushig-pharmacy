// src/app/(main)/dashboard/order/[id]/page.tsx
import { fetchOrderDetail } from "@/services/actions/order";
import { OrderHeader } from "./_components/order-header";
import { OrderInfoCard } from "./_components/order-info-card";
import { OrderItemsTable } from "./_components/order-items-table";
import { OrderSummary } from "./_components/order-summary";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const targetId = (await params).id;
  const { data } = await fetchOrderDetail(targetId);

  if (!data) {
    return (
      <div className="@container/main flex flex-col gap-6">
        <div className="py-12 text-center">
          <h2 className="text-2xl font-bold">Захиалга олдсонгүй</h2>
          <p className="text-muted-foreground mt-2">Уучлаарай, энэ захиалгын мэдээлэл олдсонгүй.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="@container/main flex flex-col gap-6">
      <OrderHeader orderId={data.data.id} orderDate={data.data.order_date} orderData={data.data} />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-3 space-y-6">
          <OrderInfoCard order={data.data} amount={data.data.amount} itemCount={data.data.details?.length ?? 0} />
          <OrderItemsTable items={data.data.details ?? []} />
        </div>

        {/* <div className="md:col-span-1">
                    <OrderSummary
                        amount={data.data.amount}
                        itemCount={data.data.details?.length ?? 0}
                    />
                </div> */}
      </div>
    </div>
  );
}
