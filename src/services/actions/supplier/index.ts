'use server'
import { notFound } from 'next/navigation'

import logger from '@/lib/logger'

import { DEFAULT_PAGE, DEFAULT_SIZE } from '@/constants'
import { GET, POST, PUT, DELETE } from '@/services/handler'
import { getQueryString } from '@/utils'
import { SupplierType, SupplierCreateForm, SupplierUpdateForm } from '@/types/supplier'

type FetchSupplierParams = Record<string, string | number>

type PaginatedCustomers = {
  data: SupplierType[]
  content: SupplierType[]
  totalElements: number
  totalPages: number
}

export async function FetchSupplier(params: FetchSupplierParams) {
  const filters = {
    // ...params,
    page: params.page || DEFAULT_PAGE,
    limit: params.size || DEFAULT_SIZE,
  }

  const queryString = getQueryString(filters)

  const path = `/supplier/list${queryString}`

  const { data, message, success, httpStatus } = await GET<PaginatedCustomers>({ path })

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
  const path = "/supplier/create"
  return POST({ path, payload: body })
}

export async function updateSupplier(payload: SupplierUpdateForm) {
  const body = {
    ...payload
  }
  const path = "/supplier/update"
  return PUT({ path, payload: body })
}

export async function deleteSupplier(id: number) {
  const path = `/supplier/delete/${id}`
  return DELETE({ path })
}


