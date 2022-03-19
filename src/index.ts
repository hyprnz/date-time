import * as tzfns from 'date-fns-tz'
import * as datefns from 'date-fns'
import enNZ from 'date-fns/locale/en-NZ'
import { TimeZone } from './timeZones'

declare const valieDateTime: unique symbol

export type DateTimeStr = string & { [valieDateTime]: true }

export type InvalidDate = {
  _tag: 'InvalidDate'
  message: string
}

const invalidDate = (date: string): InvalidDate => ({
  _tag: 'InvalidDate',
  message: `Provided JS Date ${date} is invalid`
})

export type DateTime = {
  _tag: 'DateTime'
  value: DateTimeStr
  tz: TimeZone
}

const defaultOptions: tzfns.OptionsWithTZ = {
  locale: enNZ,
  timeZone: 'UTC'
}

const of = (dateStr: string, tz: TimeZone): DateTime => ({
  _tag: 'DateTime',
  value: dateStr as DateTimeStr,
  tz
})

export namespace DateTime {
  export const formatStr = `yyyy-MM-dd'T'HH:mm:ss.SSSxxx`

  export function isDateTime(x: any): x is DateTime {
    return x._tag && x._tag === 'DateTime'
  }

  export function assertIsDateTime(x: any): asserts x is DateTime {
    if (isDateTime(x)) return
    throw new Error(`${JSON.stringify(x)} is not a DateTime object`)
  }

  const fromDateUnsafe = (date: Date): DateTime => {
    const utcDate = tzfns.formatInTimeZone(date, 'UTC', formatStr, defaultOptions)

    return of(utcDate, 'UTC')
  }

  export const fromDate = (date: Date): InvalidDate | DateTime => {
    if (!datefns.isValid(date)) return invalidDate(date.toJSON())

    return fromDateUnsafe(date)
  }

  export const now = () => fromDate(new Date())

  export const min = fromDateUnsafe(new Date(-1000000000000))

  export const max = fromDateUnsafe(new Date(10000000000000))

  export const fromEpoch = (epoch: number): InvalidDate | DateTime => {
    const date = new Date(epoch)

    if (!datefns.isValid(date)) return invalidDate(date.toJSON())

    const utcDate = tzfns.formatInTimeZone(date, 'UTC', formatStr, defaultOptions)
    return of(utcDate, 'UTC')
  }

  export const toDate = (dateTime: DateTime): Date => tzfns.toDate(dateTime.value, defaultOptions)

  export const toTimezone =
    (tz: TimeZone) =>
    (dateTime: DateTime): DateTime => {
      const tzDate = tzfns.formatInTimeZone(dateTime.value, tz, formatStr, defaultOptions)
      return of(tzDate, tz)
    }

  export const isBefore = (x: DateTime) => (y: DateTime) => datefns.isBefore(toDate(y), toDate(x))
  export const isAfter = (x: DateTime) => (y: DateTime) => isBefore(y)(x)

  // export const isBetween = (cfg: { start: DateTime; end: DateTime }) => (toCheck: DateTime) =>
  //   datefns.isWithinInterval(toDate(toCheck), { start: toDate(cfg.start), end: toDate(cfg.end) })

  export const makeMicroseconds = (utcDate: DateTimeStr): number => {
    const parts = utcDate!.split('.')
    console.log(parts)
    return parts.length > 1 ? toMicro(parts[1].split(/[\+\-]/)[0]) : 0
  }

  const toMicro = (s: string): number => {
    return s.length > 0 ? padToNumber(s.replace(/[zZ]/, '').substring(0, 6)) : 0
  }

  const padToNumber = (aNumber: string): number => {
    return Number('0.' + aNumber)
  }
}
