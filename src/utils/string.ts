const formatCurrencyNumber = (numberValue: string | number, isUSD?: boolean) => {
  const suffix = isUSD ? '$' : '¥'

  if (!numberValue) return `0${suffix}`

  const formattedNumber = formatCurrencyNumberWithoutSuffix(numberValue)
  return formattedNumber + suffix
}

const formatCurrencyNumberFixedSuffix = (numberValue: string | number, isUSD?: boolean) => {
  const suffix = isUSD ? '$' : '¥'

  if (!numberValue) return `0${suffix}`

  const formattedNumber = formatCurrencyNumberWithoutSuffix2(numberValue)
  return formattedNumber + suffix
}

const formatCurrencyNumberWithoutSuffix = (numberValue: string | number) => {
  if (!numberValue) return '0'

  const numberStr = numberValue.toString()
  const [integerPart, decimalPart] = numberStr.split('.')
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger
}

const formatCurrencyNumberWithoutSuffix2 = (numberValue: string | number) => {
  if (!numberValue) return '0'

  const num = Number(numberValue)
  const fixed = num.toFixed(2)
  const [integerPart, decimalPart] = fixed.split('.')
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return `${formattedInteger}.${decimalPart}`
}

const nullishSafeString = (value: string | number | undefined | null, nullishReturnString?: string): string => {
  if (value === undefined || value === null) {
    return nullishReturnString || ''
  }
  return value.toString()
}

const maskPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return ''

  // 99009900 to 99*****00
  const length = phoneNumber.length
  if (length < 4) return phoneNumber
  if (length < 7) return phoneNumber.slice(0, 2) + '*'.repeat(length - 4) + phoneNumber.slice(-2)
  return phoneNumber.slice(0, 2) + '*'.repeat(length - 4) + phoneNumber.slice(-2)
}

const capitalizeFirstLetterOfEachWord = (str?: string) => {
  if (!str) {
    return ''
  }
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => {
      if (word.length > 0) {
        return word.charAt(0).toUpperCase() + word.slice(1)
      }
      return '' // Handle empty words (e.g., from multiple spaces)
    })
    .join(' ')
}

export {
  formatCurrencyNumber,
  formatCurrencyNumberWithoutSuffix,
  formatCurrencyNumberFixedSuffix,
  maskPhoneNumber,
  capitalizeFirstLetterOfEachWord,
  nullishSafeString,
}
