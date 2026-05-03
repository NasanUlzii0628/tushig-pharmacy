'use server'
import { revalidatePath, updateTag } from 'next/cache'

import type { ProductCreateForm, ProductType, ProductUpdateForm } from '@/types/product'
import { DEFAULT_PAGE, DEFAULT_SIZE } from '@/constants'
import { GET, POST, PUT, DELETE } from '@/services/handler'
import { getQueryString } from '@/utils'

type FetchProductParams = Record<string, string | number | undefined>

type PaginatedProductsResponse = {
  data: ProductType[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// ✅ Add optional token parameter
export async function fetchCustomers(params: FetchProductParams, token?: string) {
  const filters: Record<string, string | number> = {
    page: params.page || DEFAULT_PAGE,
    limit: params.size || DEFAULT_SIZE,
  }

  if (params.name) {
    filters.name = params.name;
  }

  if (params.supplier_id) {
    filters.supplier_id = params.supplier_id;
  }

  const queryString = getQueryString(filters)
  const path = `/pharmacy/product/list${queryString}`

  // ✅ Pass token to GET handler
  const { data, message, success, httpStatus } = await GET<PaginatedProductsResponse>({ 
    path,
    token // Pass token if provided
  })

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

export async function createProdcut(payload: ProductCreateForm) {
  const body = { ...payload }
  const path = "/pharmacy/product/create"
  const result = await POST({ path, payload: body })

  if (result.success) {
    updateTag("products")
    revalidatePath("/dashboard/default", "page")
  }

  return result
}

export async function updateProduct(payload: ProductUpdateForm) {
  const body = { ...payload }
  const path = "/pharmacy/product/update"
  const result = await PUT({ path, payload: body })

  if (result.success) {
    updateTag("products")
    revalidatePath("/dashboard/default", "page")
  }

  return result
}

export async function createProductsBulk(names: string[]) {
  const path = "/pharmacy/product/create-bulk"
  const result = await POST({ path, payload: { names } })

  if (result.success) {
    updateTag("products")
    revalidatePath("/dashboard/default", "page")
  }

  return result
}

export async function deleteProduct(id: number) {
  const path = `/pharmacy/product/delete/${id}`
  const result = await DELETE({ path })

  if (result.success) {
    updateTag("products")
    revalidatePath("/dashboard/default", "page")
  }

  return result
}