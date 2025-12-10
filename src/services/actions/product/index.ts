'use server'
import { notFound } from 'next/navigation'

import logger from '@/lib/logger'

import type { ProductType } from '@/types/product'
import { DEFAULT_PAGE, DEFAULT_SIZE } from '@/constants'
import { GET, POST } from '@/services/handler'
import { getQueryString } from '@/utils'

type FetchCustomerParams = Record<string, string | number>

type PaginatedCustomers = {
    data: ProductType[]
    content: ProductType[]
    totalElements: number
    totalPages: number
}

export async function fetchCustomers(params: FetchCustomerParams) {
    const filters = {
        // ...params,
        page: params.page || DEFAULT_PAGE,
        limit: params.size || DEFAULT_SIZE,
    }

    const queryString = getQueryString(filters)

    const path = `/product/list${queryString}`

    const { data, message, success, httpStatus } = await GET<PaginatedCustomers>({ path })

    return {
        ...data,
        httpStatus,
        message,
        success,
    }
}


