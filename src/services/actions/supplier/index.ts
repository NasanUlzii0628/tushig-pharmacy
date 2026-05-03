'use server'

import { DEFAULT_PAGE, DEFAULT_SIZE } from '@/constants'
import { GET, POST, PUT, DELETE } from '@/services/handler'
import { getQueryString } from '@/utils'
import { SupplierType, SupplierCreateForm, SupplierUpdateForm } from '@/types/supplier'

type FetchSupplierParams = {
  page?: number;
  size?: number;
  name?: string;
  wechat?: string;
  contact?: string;
  [key: string]: string | number | undefined;
}

type PaginatedCustomers = {
  data: SupplierType[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export async function FetchSupplier(params: FetchSupplierParams, token?: string) {
  const filters: Record<string, string | number> = {
    page: params.page || DEFAULT_PAGE,
    limit: params.size || DEFAULT_SIZE,
  }

  // Add optional filters only if they exist
  if (params.name) {
    filters.name = params.name;
  }

  if (params.wechat) {
    filters.wechat = params.wechat;
  }

  if (params.contact) {
    filters.contact = params.contact;
  }

  const queryString = getQueryString(filters)

  const path = `/pharmacy/supplier/list${queryString}`

  const { data, message, success, httpStatus } = await GET<PaginatedCustomers>({ path,token })

  return {
    ...data,
    httpStatus,
    message,
    success,
  }
}


export async function createSupplier(payload: SupplierCreateForm) {
  const body = {
    ...payload,
  }
  const path = "/pharmacy/supplier/create"
  return POST({ path, payload: body })
}

export async function updateSupplier(payload: SupplierUpdateForm) {
  const body = {
    ...payload
  }
  const path = "/pharmacy/supplier/update"
  return PUT({ path, payload: body })
}

export async function deleteSupplier(id: number) {
  const path = `/pharmacy/supplier/delete/${id}`
  return DELETE({ path })
}