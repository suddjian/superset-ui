import { utcFormat, timeFormat } from 'd3-time-format';
import { utcUtils, localTimeUtils } from '../utils';
import TimeFormatter from '../TimeFormatter';

type TimeUnit = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond';

// time units ordered by increasing granularity
const granularities: TimeUnit[] = [
  'year',
  'month',
  'week',
  'day',
  'hour',
  'minute',
  'second',
  'millisecond',
];

// mapping TimeUnit names to the granularity of that time unit
const granularityMap = {} as { [k in TimeUnit]: number };
granularities.forEach((gran, i) => {
  granularityMap[gran] = i;
});

// A set of dates has a "granularity" and a "scope".
// "granularity" refers to the precision of the dates in the set - whether they represent milliseconds, seconds, minutes, etc.
// "scope" refers to the largest unit of variance in the date set - Do the dates differ by year? By month? week? hour?
// This matrix defines a format for each possible combination of granularity and scope.
// The x axis is the scope of the date set, and the y axis is the granularity.
// Scope ranges from Year at the left, to Millisecond at the right.
// Granularity ranges from Year at the top, to Millisecond at the bottom.
// Some combinations are impossible: a set of dates cannot have day-granularity with hourly scope. Hence the empty strings.
// prettier-ignore
const dateFormatMatrix = [
  ['%Y',                      '',                     '',                     '',                  '',               '',          '',       ''],
  ['%b %Y',                   '%B',                   '',                     '',                  '',               '',          '',       ''],
  ['%Y/%m/%d',                '%b %d',                '%b %d',                '',                  '',               '',          '',       ''],
  ['%Y/%m/%d',                '%b %d',                '%b %d',                '%A',                '',               '',          '',       ''],
  ['%Y/%m/%d %I %p',          '%b %d, %I %p',         '%b %d, %I %p',         '%A %I %p',          '%I %p',          '',          '',       ''],
  ['%Y/%m/%d %I:%M %p',       '%b %d %I:%M %p',       '%b %d %I:%M %p',       '%A %I:%M %p',       '%I:%M %p',       ':%M',       '',       ''],
  ['%Y/%m/%d %I:%M:%S %p',    '%b %d %I:%M:%S %p',    '%b %d %I:%M:%S %p',    '%A %I:%M:%S %p',    '%I:%M:%S %p',    ':%M:%S',    ':%S',    ''],
  ['%Y/%m/%d %I:%M:%S.%L %p', '%b %d %I:%M:%S.%L %p', '%b %d %I:%M:%S.%L %p', '%A %I:%M:%S.%L %p', '%I:%M:%S.%L %p', ':%M:%S.%L', ':%S.%L', '.%L'],
];

function getFormatFunc(useLocalTime: boolean, dates: Date[]) {
  const format = useLocalTime ? timeFormat : utcFormat;

  const {
    floorSecond,
    floorMinute,
    floorHour,
    floorDay,
    floorWeek,
    floorMonth,
    floorYear,
    hasMillisecond,
    hasSecond,
    hasMinute,
    hasHour,
    isNotFirstDayOfMonth,
    isNotFirstDayOfWeek,
    isNotFirstMonth,
  } = useLocalTime ? localTimeUtils : utcUtils;

  if (!dates.length) {
    return format(dateFormatMatrix[granularityMap.millisecond][granularityMap.year]);
  }

  function getGranularity(date: Date): TimeUnit {
    if (hasMillisecond(date)) {
      return 'millisecond';
    } else if (hasSecond(date)) {
      return 'second';
    } else if (hasMinute(date)) {
      return 'minute';
    } else if (hasHour(date)) {
      return 'hour';
    } else if (isNotFirstDayOfMonth(date)) {
      return isNotFirstDayOfWeek(date) ? 'day' : 'week';
    } else if (isNotFirstMonth(date)) {
      return 'month';
    }

    return 'year';
  }

  // Finds the least granular TimeUnit where dates differ.
  // e.g. if the Dates occur in the same day but have different hours, will be "hour"
  function getScope(earliest: Date, latest: Date) {
    if (floorYear(earliest).valueOf() !== floorYear(latest).valueOf()) return 'year';
    if (floorMonth(earliest).valueOf() !== floorMonth(latest).valueOf()) return 'month';
    if (floorWeek(earliest).valueOf() !== floorWeek(latest).valueOf()) return 'week';
    if (floorDay(earliest).valueOf() !== floorDay(latest).valueOf()) return 'day';
    if (floorHour(earliest).valueOf() !== floorHour(latest).valueOf()) return 'hour';
    if (floorMinute(earliest).valueOf() !== floorMinute(latest).valueOf()) return 'minute';
    if (floorSecond(earliest).valueOf() !== floorSecond(latest).valueOf()) return 'second';

    return 'millisecond';
  }

  // Smallest granularity of any date in the set. May be possible to improve
  // using average granularity, sampling, interval analysis, or fancier rules.
  let granularity = granularityMap.year;
  let earliest = dates[0];
  let latest = dates[0];

  dates.forEach(date => {
    const dateGrain = granularityMap[getGranularity(date)];
    if (dateGrain > granularity) granularity = dateGrain;
    if (date < earliest) earliest = date;
    if (date > latest) latest = date;
  });

  // edge case: if we have <=1 date, scope is arbitrary: just set it to granularity
  const scope = dates.length <= 1 ? granularity : granularityMap[getScope(earliest, latest)];

  return format(dateFormatMatrix[granularity][scope]);
}

export default function createFormatterForDateRange({
  id,
  dates,
  label,
  description,
  useLocalTime = false,
}: {
  id: string;
  dates: Date[];
  label?: string;
  description?: string;
  useLocalTime?: boolean;
}) {
  return new TimeFormatter({
    description,
    formatFunc: getFormatFunc(useLocalTime, dates),
    id,
    label,
    useLocalTime,
  });
}
