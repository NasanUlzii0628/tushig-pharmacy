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

export async function fetchBucketList(product_id?: number) {
    const filters = product_id ? { product_id } : {}

    const queryString = getQueryString(filters)

    const path = `/order/bucket/list${queryString}`

    const { data, message, success, httpStatus } = await GET<{ data: BucketList }>({ path })

    return {
        data,
        httpStatus,
        message,
        success,
    }
}




type FetchOrderParams = Record<string, string | number>

type PaginatedCustomers = {
    data: OrderTypes[]
    content: OrderTypes[]
    totalElements: number
    totalPages: number
}

export async function FetchOrderList(params: FetchOrderParams) {
    const filters = {
        // ...params,
        page: params.page || DEFAULT_PAGE,
        limit: params.size || DEFAULT_SIZE,
    }

    const queryString = getQueryString(filters)

    const path = `/order/list${queryString}`

    const { data, message, success, httpStatus } = await GET<PaginatedCustomers>({ path })

    return {
        ...data,
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




