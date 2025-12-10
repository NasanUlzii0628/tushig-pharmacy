import type { Nullish } from '@/types'

type ParamsType = {
  [key: string]: Nullish<string | number>
}

export const getQueryString = (params: ParamsType) => {
  const queryParams = []

  for (const [key, value] of Object.entries(params)) {
    if (value || (typeof value === 'number' && value === 0) || (typeof value === 'boolean' && value === false)) {
      queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    }
  }

  const queryString = queryParams.length ? `${queryParams.join('&')}` : ''

  return `?${queryString}`
}

// export const getQueryStringWithoutEncode = (params: ParamsType) => {
//   const queryParams = [];

//   for (const [key, value] of Object.entries(params)) {
//     if (value || (typeof value === 'number' && value === 0) || (typeof value === 'boolean' && value === false)) {
//       queryParams.push(`${encodeURIComponent(key)}=${value}`);
//     }
//   }

//   const queryString = queryParams.length ? `${queryParams.join('&')}` : '';

//   return `?${queryString}`;
// };
