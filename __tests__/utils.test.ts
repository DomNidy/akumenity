import { describe, expect, it } from "vitest";
import { CalendarGridDisplayMode } from "~/app/_components/calendar-grid/calendar-grid-definitions";
import { getDisplayDateBounds, setDayOfWeek } from "~/lib/utils";

describe("setDayOfWeek", () => {
  it("should set the day of the week to Sunday", () => {
    const date = new Date("2022-01-05"); // Wednesday
    const result = setDayOfWeek(date, 0);
    expect(result.getDay()).toBe(0); // Sunday
  });

  it("should set the day of the week to Saturday", () => {
    const date = new Date("2022-01-05"); // Wednesday
    const result = setDayOfWeek(date, 6);
    expect(result.getDay()).toBe(6); // Saturday
  });

  it("should throw an error for invalid day of week", () => {
    const date = new Date("2022-01-05"); // Wednesday
    expect(() => setDayOfWeek(date, 7)).toThrow(
      "Invalid day of week. Only 0 (Sunday) through 6 (Saturday) are allowed.",
    );
  });

  it("should handle dates that cross months", () => {
    const date = new Date("2022-01-31"); // Last day of January
    const result = setDayOfWeek(date, 2); // Set to Tuesday
    expect(result.getDate()).toBe(1); // Should be the first day of February
    expect(result.getMonth()).toBe(1); // February
  });
});

describe("getDisplayDateBounds", () => {
  it("should return the display date bounds for day display mode", () => {
    const displayMode = CalendarGridDisplayMode.DAY_DISPLAY;
    const date = new Date("2022-01-05");
    const result = getDisplayDateBounds(displayMode, date);
    const expectedBeginDate = new Date("2022-01-05");
    expectedBeginDate.setHours(0, 0, 0, 0);
    const expectedEndDate = new Date("2022-01-05");
    expectedEndDate.setHours(23, 59, 59, 999);
    expect(result).toEqual({
      beginDate: expectedBeginDate,
      endDate: expectedEndDate,
    });
  });

  it("should return the display date bounds for week display mode", () => {
    const displayMode = CalendarGridDisplayMode.WEEK_DISPLAY;
    const date = new Date("2022-01-05");
    const result = getDisplayDateBounds(displayMode, date);
    const expectedBeginDate = setDayOfWeek(new Date("2022-01-05"), 0);
    expectedBeginDate.setHours(0, 0, 0, 0);
    const expectedEndDate = setDayOfWeek(new Date("2022-01-05"), 6);
    expectedEndDate.setHours(23, 59, 59, 999);
    expect(result).toEqual({
      beginDate: expectedBeginDate,
      endDate: expectedEndDate,
    });
  });

  it("should return the display date bounds for month display mode", () => {
    const displayMode = CalendarGridDisplayMode.MONTH_DISPLAY;
    const date = new Date("2022-01-05T00:00:00Z"); // Create date in UTC
    const result = getDisplayDateBounds(displayMode, date);
    expect(result.beginDate.toLocaleString()).toEqual("1/1/2022, 12:00:00 AM");
    expect(result.endDate.toLocaleString()).toEqual("1/31/2022, 11:59:59 PM");
  });
});
