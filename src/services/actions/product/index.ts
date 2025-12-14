'use server'
import { notFound } from 'next/navigation'

import type { ProductCreateForm, ProductType, ProductUpdateForm } from '@/types/product'
import { DEFAULT_PAGE, DEFAULT_SIZE } from '@/constants'
import { GET, POST, PUT, DELETE } from '@/services/handler'
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

export async function createProdcut(payload: ProductCreateForm) {
  const body = {
    ...payload,
  }
  const path = "/product/create"
  return POST({ path, payload: body })
}

export async function updateProduct(payload: ProductUpdateForm) {
  const body = {
    ...payload
  }
  const path = "/product/update"
  return PUT({ path, payload: body })
}

export async function deleteProduct(id: number) {
  const path = `/product/delete/${id}`
  return DELETE({ path })
}


