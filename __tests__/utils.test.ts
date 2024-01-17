import { describe, expect, it } from "vitest";
import {
  UTCToLocalDate,
  getWeekNumberSinceUnixEpoch,
  getWeekStartAndEnd,
  localToUTCDate,
} from "~/lib/utils";

describe("UTC -> Local date conversion function", () => {
  it("converts UTC date to local date", () => {
    const date = new Date("2024-01-17T06:01:00.000Z");
    const localDate = UTCToLocalDate(date);
    expect(localDate).toEqual(
      new Date(date.setMinutes(date.getMinutes() - date.getTimezoneOffset())),
    );
  });
});

describe("Local -> UTC date conversion function", () => {
  it("converts local date to UTC date", () => {
    const date = new Date("2024-01-17T06:01:00.000Z");
    const localDate = UTCToLocalDate(date);
    const utcDate = localToUTCDate(localDate);
    expect(utcDate).toEqual(date);
  });
});

describe("getWeekStartAndEnd returns correct timespans", () => {
  it("handles a date on a Sunday", () => {
    const date = new Date("2024-01-17T06:01:00.000Z");
    const { startTimeMS, endTimeMS } = getWeekStartAndEnd(date);

    const startOfWeekDate = new Date(startTimeMS);
    const endOfWeekDate = new Date(endTimeMS);

    console.log(startOfWeekDate, endOfWeekDate);

    expect(startOfWeekDate).toStrictEqual(new Date("2024-01-14T00:00:00.000Z"));
    expect(endOfWeekDate).toStrictEqual(new Date("2024-01-20T23:59:59.999Z"));
  });

  it("handles date prior to unix epoch", () => {
    const date = new Date("1930-01-01T00:00:00.000Z");
    const { startTimeMS, endTimeMS } = getWeekStartAndEnd(date);
    console.log(new Date(-1262545200000));

    const startOfWeekDate = new Date(startTimeMS);
    const endOfWeekDate = new Date(endTimeMS);

    expect(startOfWeekDate).toStrictEqual(new Date("1929-12-29T00:00:00.000Z"));
    expect(endOfWeekDate).toStrictEqual(new Date("1930-01-04T23:59:59.999Z"));
  });
});

describe("Get week number since unix epoch", () => {
  it("handles a date on a Sunday", () => {
    const date = new Date("2024-01-17T06:01:00.000Z");
    const weekNumber = getWeekNumberSinceUnixEpoch(date);

    expect(weekNumber).toBe(2820);
  });

  it("handles date prior to unix epoch", () => {
    const date = new Date("1940-01-01T00:00:00.000Z");
    const weekNumber = getWeekNumberSinceUnixEpoch(date);

    expect(weekNumber).toBe(-1565);
  });

  it("handles the first week of the unix epoch", () => {
    const date = new Date("1970-01-01T00:00:00.000Z");
    const weekNumber = getWeekNumberSinceUnixEpoch(date);

    expect(weekNumber).toBe(0);
  });
});
