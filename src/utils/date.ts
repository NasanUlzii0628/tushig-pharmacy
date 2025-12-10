import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'

const formatExpiryDate = (dateStr: string) => {
  const validLength = 6

  if (dateStr.length === validLength) {
    return `${dateStr.slice(0, 4)}/${dateStr.slice(4)}`
  }

  return dateStr
}

const formatYYYYMMDDtoYYYY_MM_DD = (dateStr: string): string => {
  if (dateStr.length === 8) {
    return `${dateStr[0] + dateStr[1] + dateStr[2] + dateStr[3]}-${dateStr[4]}${dateStr[5]}-${dateStr[6]}${dateStr[7]}`
  }
  return dateStr
}

const formatToYYYYMMDDHHmmss = (dateStr: string): string => {
  const isValidDate = dayjs(dateStr).isValid()

  if (isValidDate) {
    return dayjs(dateStr).format('YYYY/MM/DD\nHH:mm:ss')
  }
  return '-'
}

const getCurrentYYYYMM = (): string => {
  return dayjs().format('YYYYMM')
}

const getTodayAndLastSeventhDay = (): Dayjs[] => {
  const currentDate = dayjs()

  const today = currentDate
  const lastSeventhDay = currentDate.subtract(7, 'day')
  return [lastSeventhDay, today]
}

const getTodayAndLastSeventhDayYYYYMMDD = (): string[] => {
  const [lastSeventhDay, today] = getTodayAndLastSeventhDay()

  return [lastSeventhDay.format('YYYYMMDD'), today.format('YYYYMMDD')]
}

export {
  getCurrentYYYYMM,
  getTodayAndLastSeventhDayYYYYMMDD,
  formatExpiryDate,
  formatToYYYYMMDDHHmmss,
  formatYYYYMMDDtoYYYY_MM_DD,
}
