import { describe, expect, it } from "vitest";
import dayjs from "dayjs";

describe("dayjs", () => {
  it("should return the end and start of the week", () => {
    const date = dayjs().year(2024).month(0).date(14);

    const startOf = date.startOf("week");
    const endOf = date.endOf("week");

    expect(startOf.toISOString()).toBe("2024-01-14T05:00:00.000Z");
    expect(endOf.toISOString()).toBe("2024-01-21T04:59:59.999Z");
  });
});
