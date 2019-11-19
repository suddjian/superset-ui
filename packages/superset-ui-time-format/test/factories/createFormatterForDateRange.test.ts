import createFormatterForDateRange from '../../src/factories/createFormatterForDateRange';

describe('createFormatterForDateRange()', () => {
  describe('creates a formatter for a specified date range', () => {
    it('formats with month granularity and scope', () => {
      const formatter = createFormatterForDateRange({
        id: 'my_format',
        useLocalTime: true,
        dates: [new Date(2019, 10), new Date(2019, 11)],
      });
      expect(formatter(new Date(2019, 10))).toEqual('November');
    });

    it('formats with hour granularity and month scope', () => {
      const formatter = createFormatterForDateRange({
        id: 'my_format',
        useLocalTime: true,
        dates: [new Date(2019, 10, 12, 8), new Date(2019, 11, 19, 10)],
      });
      expect(formatter(new Date(2019, 10, 9, 8))).toEqual('Nov 09, 08 AM');
    });

    it('formats with minute granularity and week scope', () => {
      const formatter = createFormatterForDateRange({
        id: 'my_format',
        useLocalTime: true,
        dates: [new Date(2019, 10, 18, 8), new Date(2019, 10, 17, 10), new Date(2019, 10, 19, 10)],
      });
      expect(formatter(new Date(2019, 10, 18, 8))).toEqual('Monday 08 AM');
    });

    it('formats with year granularity and scope', () => {
      const formatter = createFormatterForDateRange({
        id: 'my_format',
        useLocalTime: true,
        dates: [new Date(2019, 0), new Date(2018, 0), new Date(2017, 0)],
      });
      expect(formatter(new Date(2020, 10, 18, 8))).toEqual('2020');
    });

    it('formats with millisecond granularity and year scope', () => {
      const formatter = createFormatterForDateRange({
        id: 'my_format',
        useLocalTime: true,
        dates: [
          new Date(2019, 9, 18, 8, 11, 50, 875),
          new Date(2019, 10, 8),
          new Date(2020, 10, 19, 10, 20, 0, 10),
        ],
      });
      expect(formatter(new Date(2020, 10, 18, 18, 30, 42, 200))).toEqual(
        '2020/11/18 06:30:42.200 PM',
      );
    });

    it('formats with millisecond granularity and minute scope', () => {
      const formatter = createFormatterForDateRange({
        id: 'my_format',
        useLocalTime: true,
        dates: [
          new Date(2019, 9, 18, 8, 2),
          new Date(2019, 9, 18, 8, 11, 50, 875),
          new Date(2019, 9, 18, 8, 20, 24, 250),
        ],
      });
      expect(formatter(new Date(2019, 9, 18, 18, 30, 42, 200))).toEqual(':30:42.200');
    });

    it('tolerates a list of 1', () => {
      const formatter = createFormatterForDateRange({
        id: 'my_format',
        useLocalTime: true,
        dates: [new Date(2019, 9, 18, 8, 2)],
      });
      expect(formatter(new Date(2019, 9, 18, 18, 30, 42, 200))).toEqual(':30');
    });

    it('tolerates an empty list', () => {
      const formatter = createFormatterForDateRange({
        id: 'my_format',
        useLocalTime: true,
        dates: [],
      });
      expect(formatter(new Date(2019, 9, 18, 18, 30, 42, 200))).toEqual(
        '2019/10/18 06:30:42.200 PM',
      );
    });
  });
});
