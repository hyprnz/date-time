import { DateTime, DateTimeStr } from '.'
import { assertThat } from 'mismatched'
import * as fc from 'fast-check'
import * as tzfns from 'date-fns-tz'

describe('DateTime', function () {
  it('gets current date', () => {
    const now = new Date()
    const dateTime = DateTime.fromDate(now)
  })

  it('makes a date from seconds epoch zero', function () {
    const fromEpoch = DateTime.fromEpoch(0)
    assertThat(fromEpoch).is({ _tag: 'DateTime', value: '1970-01-01T00:00:00.000+00:00' as DateTimeStr, tz: 'UTC' })
  })

  it('makes a date from seconds epoch', function () {
    fc.assert(
      fc.property(fc.date(), now => {
        const epochNow = now.valueOf()
        const expected = DateTime.fromDate(now)
        const fromEpoch = DateTime.fromEpoch(epochNow)

        assertThat(fromEpoch).is(expected)
      })
    )
  })

  it('converts to a JS Date', function () {
    fc.assert(
      fc.property(fc.date(), jsDate => {
        const dateTime = DateTime.fromDate(jsDate)
        DateTime.assertIsDateTime(dateTime)

        const toJsDate = DateTime.toDate(dateTime)
        assertThat(toJsDate).is(jsDate)
      })
    )
  })

  it('converts to Pacific/Auckland TZ', function () {
    fc.assert(
      fc.property(fc.date({ min: DateTime.toDate(DateTime.min), max: DateTime.toDate(DateTime.max) }), jsDate => {
        const utc = DateTime.fromDate(jsDate)
        DateTime.assertIsDateTime(utc)

        const aklDate = DateTime.toTimezone('Pacific/Auckland')(utc)
        const dateFnsDate = tzfns.formatInTimeZone(utc.value, 'Pacific/Auckland', DateTime.formatStr)

        assertThat(aklDate).is({ _tag: 'DateTime', value: dateFnsDate as DateTimeStr, tz: 'Pacific/Auckland' })
      })
    )
  })

  it('isBefore', function () {
    fc.assert(
      fc.property(
        fc.date({ min: DateTime.toDate(DateTime.min), max: DateTime.toDate(DateTime.max) }),
        fc.date({ min: DateTime.toDate(DateTime.min), max: DateTime.toDate(DateTime.max) }),
        (x, y) => {
          const date1 = DateTime.fromDate(x)
          const date2 = DateTime.fromDate(y)

          DateTime.assertIsDateTime(date1)
          DateTime.assertIsDateTime(date2)

          const assertion = assertThat(DateTime.isBefore(date1)(date2))

          if (x > y) assertion.withMessage(`${date2} is not before ${date1}`).is(true)
          else assertion.withMessage(`${date2} is before ${date1}`).is(false)
        }
      )
    )
  })

  it('isAfter', function () {
    fc.assert(
      fc.property(
        fc.date({ min: DateTime.toDate(DateTime.min), max: DateTime.toDate(DateTime.max) }),
        fc.date({ min: DateTime.toDate(DateTime.min), max: DateTime.toDate(DateTime.max) }),
        (x, y) => {
          const date1 = DateTime.fromDate(x)
          const date2 = DateTime.fromDate(y)

          DateTime.assertIsDateTime(date1)
          DateTime.assertIsDateTime(date2)

          const assertion = assertThat(DateTime.isAfter(date1)(date2))

          if (x < y) assertion.withMessage(`${date2} is not after ${date1}`).is(true)
          else assertion.withMessage(`${date2} is after ${date1}`).is(false)
        }
      )
    )
  })

  // it('isBetween', function () {
  //   fc.assert(
  //     fc.property(
  //       fc.date({ min: DateTime.toDate(DateTime.min), max: DateTime.toDate(DateTime.max) }),
  //       fc.date({ min: DateTime.toDate(DateTime.min), max: DateTime.toDate(DateTime.max) }),
  //       fc.date({ min: DateTime.toDate(DateTime.min), max: DateTime.toDate(DateTime.max) }),
  //       (x, y, z) => {
  //         fc.pre(x < y)

  //         const start = DateTime.fromDate(x)
  //         const end = DateTime.fromDate(y)
  //         const toCheck = DateTime.fromDate(z)

  //         DateTime.assertIsDateTime(start)
  //         DateTime.assertIsDateTime(end)
  //         DateTime.assertIsDateTime(toCheck)

  //         const assertion = assertThat(DateTime.isBetween({ start, end })(toCheck))

  //         if (x < z) assertion.withMessage(`${toCheck.value} is not between ${start.value} - ${end.value}`).is(true)
  //         else assertion.withMessage(`${toCheck.value} is between ${start.value} - ${end.value}`).is(false)
  //       }
  //     )
  //   )
  // })
})
