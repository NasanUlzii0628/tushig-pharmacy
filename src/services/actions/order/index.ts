'use server'
import { notFound, redirect } from 'next/navigation'


import { GET, POST } from '@/services/handler'
import { BucketList, OrderAdd, OrderCheck, OrderTypes, OrderDetailData } from '@/types/order'
import { getQueryString } from '@/utils'
import { DEFAULT_PAGE, DEFAULT_SIZE } from '@/constants'


export async function createOrder(payload: OrderAdd) {
    const body = {
        ...payload,
    }
    const path = "/order/bucket/add"
    return POST({ path, payload: body })
}


export async function orderBucketList(bucket_item_ids: number[]) {
    const body = {
        bucket_item_ids,
    }
    const path = "/order/create"
    return POST({ path, payload: body })
}

export async function deleteBucketList(product_id: number) {
    const body = {
        product_id,
    }
    const path = "/order/bucket/delete"
    return POST({ path, payload: body })
}


export async function checkOrder(product_id: number) {
    const filters = {
        product_id,
    }

    const queryString = getQueryString(filters)

    const path = `/order/bucket/check${queryString}`

    const { data, message, success, httpStatus } = await GET<{ data: OrderCheck }>({ path })

    return {
        data,
        httpStatus,
        message,
        success,
    }
}

export async function fetchBucketList(params?: {
    product_id?: number;
    name?: string;
    supplier_id?: string;
}) {
    const filters: Record<string, any> = {};

    if (params?.product_id) {
        filters.product_id = params.product_id;
    }
    if (params?.name) {
        filters.name = params.name;
    }
    if (params?.supplier_id) {
        filters.supplier_id = params.supplier_id;
    }

    const queryString = getQueryString(filters);
    const path = `/order/bucket/list${queryString}`;

    const { data, message, success, httpStatus } = await GET<{ data: BucketList }>({ path });

    return {
        data,
        httpStatus,
        message,
        success,
    };
}



type FetchOrderParams = Record<string, string | number | undefined>

type PaginatedOrdersResponse = {
    data: OrderTypes[]
    pagination: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
}

export async function FetchOrderList(params: FetchOrderParams) {
    const filters: Record<string, string | number> = {
        page: params.page || DEFAULT_PAGE,
        limit: params.size || DEFAULT_SIZE,
    }

    if (params.start_date) {
        filters.start_date = params.start_date
    }
    if (params.end_date) {
        filters.end_date = params.end_date
    }
    if (params.supplier_id) {
        filters.supplier_id = params.supplier_id
    }

    const queryString = getQueryString(filters)

    const path = `/order/list${queryString}`

    const { data, message, success, httpStatus } = await GET<PaginatedOrdersResponse>({ path })

    return {
        data: data?.data ?? [],
        totalElements: data?.pagination?.total ?? 0,
        totalPages: data?.pagination?.totalPages ?? 1,
        page: data?.pagination?.page ?? 1,
        httpStatus,
        message,
        success,
    }
}


export const fetchOrderDetail = async (id: string) => {
    const path = `/order/detail/${id}`

    const { data, success } = await GET<OrderDetailData>({ path })

    if (!success || !data) {
        redirect(`/dashboard/order/${id}/404`)
    }

    return {
        data,
    }
}

export async function updateBucketItem(product_id: number, unit_price: number, supplier_id: number) {
    const body = {
        product_id,
        unit_price,
        supplier_id,
    }
    const path = "/order/bucket/update"
    return POST({ path, payload: body })
}

export async function deleteOrderList(order_id: number) {

    const body = {
        order_id,
    }
    console.log(body)
    const path = "/order/delete"
    return POST({ path, payload: body })
}





