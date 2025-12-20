'use server'

import { DEFAULT_PAGE, DEFAULT_SIZE } from '@/constants'
import { GET, POST, PUT, DELETE } from '@/services/handler'
import { getQueryString } from '@/utils'
import { UserType, UserCreateForm, UserUpdateForm } from '@/types/user'

type FetchUserParams = Record<string, string | number>

type PaginatedCustomers = {
  data: UserType[]
  content: UserType[]
  totalElements: number
  totalPages: number
}

export async function fetchUser(params: FetchUserParams) {
  const filters = {
    ...params,
    page: params.page || DEFAULT_PAGE,
    limit: params.size || DEFAULT_SIZE,
  }

  const queryString = getQueryString(filters)

  const path = `/user/list${queryString}`

  const { data, message, success, httpStatus } = await GET<PaginatedCustomers>({ path })

  return {
    ...data,
    httpStatus,
    message,
    success,
  }
}


export async function createUser(payload: UserCreateForm) {
  const body = {
    ...payload,
  }
  const path = "/user/create"
  return POST({ path, payload: body })
}

export async function updateUser(payload: UserUpdateForm) {
  const body = {
    ...payload
  }
  const path = "/user/update"
  return PUT({ path, payload: body })
}

export async function deleteUser(id: number) {
  const path = `/user/delete/${id}`
  return DELETE({ path })
}


