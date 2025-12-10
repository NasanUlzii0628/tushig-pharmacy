'use server'

import logger from '@/lib/logger'
import { ERROR_MESSAGE_MAP } from '@/constants/auth'
import { type ActionResult, makeApiRequest } from '@/services/handler/request-no-auth'

type LoginResponse = {
  accessToken: string
  refreshToken?: string
  expiresIn?: number
  message?: string
}

export async function login({
  username,
  password,
}: {
  username: string
  password: string
}): Promise<ActionResult<LoginResponse>> {
  try {
    const { response, data, errorData } = await makeApiRequest<LoginResponse>(
      '/auth/login',
      'POST',
      {
        body: { username, password },
      }
    )

    const status = response.status

    if (!response.ok) {
      const message =
        errorData?.message ||
        data?.message ||
        ERROR_MESSAGE_MAP[status] ||
        'Нэвтрэх үед алдаа гарлаа.'

      return {
        data: null,
        errorData,
        message,
        status,
        success: false,
      }
    }


    return {
      message: 'Амжилттай нэвтэрлээ',
      status,
      success: true,
    }
  } catch (error) {
    logger.error(`Error in login service: ${error}`)

    return {
      data: null,
      message: 'Нэвтрэх үйлдэл амжилтгүй боллоо. Дахин оролдоно уу.',
      status: 500,
      success: false,
    }
  }
}
