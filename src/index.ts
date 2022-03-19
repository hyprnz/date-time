import * as tzfns from 'date-fns-tz'
import * as datefns from 'date-fns'
import enNZ from 'date-fns/locale/en-NZ'
import { TimeZone } from './timeZones'

declare const valieDateTime: unique symbol

export type DateTimeStr<T extends TimeZone> = string & { [valieDateTime]: T }

export type InvalidDate = {
  _tag: 'InvalidDate'
  message: string
}

const invalidDate = (date: string): InvalidDate => ({
  _tag: 'InvalidDate',
  message: `Provided JS Date ${date} is invalid`
})

export type DateTime<T extends TimeZone> = {
  _tag: 'DateTime'
  value: DateTimeStr<T>
}

const defaultOptions: tzfns.OptionsWithTZ = {
  locale: enNZ,
  timeZone: 'UTC'
}

const of = <T extends TimeZone>(dateStr: string): DateTime<T> => ({
  _tag: 'DateTime',
  value: dateStr as DateTimeStr<T>
})

export namespace DateTime {
  export const formatStr = `yyyy-MM-dd'T'HH:mm:ss.SSSxxx`

  export function isDateTime(x: any): x is DateTime<any> {
    return x._tag && x._tag === 'DateTime'
  }

  export function assertIsDateTime(x: any): asserts x is DateTime<any> {
    if (isDateTime(x)) return
    throw new Error(`${JSON.stringify(x)} is not a DateTime object`)
  }

  const fromDateUnsafe = (date: Date): DateTime<'UTC'> => {
    const utcDate = tzfns.formatInTimeZone(date, 'UTC', formatStr, defaultOptions)

    return of(utcDate)
  }

  export const fromDate = (date: Date): InvalidDate | DateTime<'UTC'> => {
    if (!datefns.isValid(date)) return invalidDate(date.toJSON())

    return fromDateUnsafe(date)
  }

  export const now = () => fromDate(new Date())

  export const min = fromDateUnsafe(new Date(-1000000000000))

  export const max = fromDateUnsafe(new Date(10000000000000))

  export const fromEpoch = (epoch: number): InvalidDate | DateTime<'UTC'> => {
    const date = new Date(epoch)

    if (!datefns.isValid(date)) return invalidDate(date.toJSON())

    const utcDate = tzfns.formatInTimeZone(date, 'UTC', formatStr, defaultOptions)
    return of(utcDate)
  }

  export const toDate = <T extends TimeZone>(dateTime: DateTime<T>): Date => tzfns.toDate(dateTime.value, defaultOptions)

  export const toTimezone =
    <T extends TimeZone>(tz: T) =>
    <U extends TimeZone>(dateTime: DateTime<U>): DateTime<T> => {
      const tzDate = tzfns.formatInTimeZone(dateTime.value, tz, formatStr, defaultOptions)
      return of(tzDate)
    }

  export const isBefore =
    <T extends TimeZone>(x: DateTime<T>) =>
    (y: DateTime<T>) =>
      datefns.isBefore(toDate(y), toDate(x))

  export const isAfter =
    <T extends TimeZone>(x: DateTime<T>) =>
    (y: DateTime<T>) =>
      isBefore(y)(x)

  // export const isBetween = (cfg: { start: DateTime; end: DateTime }) => (toCheck: DateTime) =>
  //   datefns.isWithinInterval(toDate(toCheck), { start: toDate(cfg.start), end: toDate(cfg.end) })

  export const makeMicroseconds = (utcDate: DateTimeStr<'UTC'>): number => {
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
