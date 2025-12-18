'use server'
import { notFound } from 'next/navigation'

import type { ProductCreateForm, ProductType, ProductUpdateForm } from '@/types/product'
import { DEFAULT_PAGE, DEFAULT_SIZE } from '@/constants'
import { GET, POST, PUT, DELETE } from '@/services/handler'
import { getQueryString } from '@/utils'

type FetchCustomerParams = {
  page?: number;
  size?: number;
  name?: string;
  supplier_id?: string;
  [key: string]: string | number | undefined;
}

type PaginatedCustomers = {
  data: ProductType[]
  content: ProductType[]
  totalElements: number
  totalPages: number
}

export async function fetchCustomers(params: FetchCustomerParams) {
  const filters: Record<string, string | number> = {
    page: params.page || DEFAULT_PAGE,
    limit: params.size || DEFAULT_SIZE,
  }

  // Add optional filters only if they exist
  if (params.name) {
    filters.name = params.name;
  }

  if (params.supplier_id) {
    filters.supplier_id = params.supplier_id;
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