import logger from '@/lib/logger'

import { baseHeaderOptions } from '@/constants/auth'

const apiUrl = process.env.API_BASE_URL
const baseUrl = `${apiUrl}/api`

if (!baseUrl) {
  throw new Error('API_BASE_URL environment variable is not set.')
}

type ApiError = {
  message?: string
  error?: string
  [key: string]: unknown
} | null

export type ActionResult<T = null> = {
  success: boolean
  message: string
    data?: T | null
  status?: number
  errorData?: ApiError
}

export const makeApiRequest = async <T>(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  options: {
    body?: Record<string, unknown> | null 
    customHeaders?: Record<string, string>
  } = {},
  removeTrailingWeb?: boolean
): Promise<{ response: Response; data: T | null; errorData: ApiError }> => {
  const baseUrlWithoutWeb = removeTrailingWeb ? apiUrl : baseUrl

  const url = `${baseUrlWithoutWeb}${path}`
  logger.info(`makeApiRequest>>>API URL: ${url}`)

  const headers = {
    ...baseHeaderOptions,
    ...(options.body && { 'Content-Type': 'application/json' }),
    ...options.customHeaders,
  }

  logger.info(`makeApiRequest>>>HEADERS: ${JSON.stringify(headers)}`)

  try {
    const response = await fetch(url, {
      body: options.body ? JSON.stringify(options.body) : null,
      headers,
      method,
    })

    let responseData: T | null = null
    let errorData: ApiError = null
    try {
      if (response.status !== 204) {
        const json: unknown = await response.json()
        if (response.ok) {
          responseData = json as T
        } else {
          errorData =
            typeof json === 'object' && json !== null ? (json as ApiError) : { message: 'Unknown error structure' }
        }
      }
    } catch (err) {
      if (response.ok && response.status !== 204) {
        logger.error(`Failed to parse JSON response: ${err}`)
        errorData = { message: 'Failed to parse successful response JSON' }
      } else if (!response.ok) {
        errorData = { message: `Failed to parse error response JSON (Status: ${response.status})` }
      }
    }

    return { data: responseData, errorData, response }
  } catch (err) {
    logger.error(`API request failed for ${method} ${path}: ${err}`)
    const errorResponse = new Response(JSON.stringify({ message: 'Network or fetch error' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
    return { data: null, errorData: { message: 'Network or fetch error' }, response: errorResponse }
  }
}
