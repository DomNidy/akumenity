// Renders out the row of dates above the time columns
"use client";
import { useMemo } from "react";
import { calculateGridColumnCount, getDaysSinceUnixEpoch } from "~/lib/utils";
import { useUserPreferences } from "~/app/hooks/use-user-preferences";
import dayjs from "dayjs";
import CalendarGridTimeHeaderCell from "./calendar-grid-time-header-cell";
import { useCalendarGrid } from "~/app/hooks/use-calendar-grid";

export function CalendarGridTimeHeader() {
  const userPreferences = useUserPreferences();
  const calendarGridContext = useCalendarGrid();

  // Recalculate the number of columns to render when the display mode changes
  const numColumnsToRender = useMemo(
    () => calculateGridColumnCount(userPreferences.displayMode, dayjs()),
    [userPreferences.displayMode],
  );
  return (
    <div className={`flex w-full flex-row bg-[#0A0A0A]`}>
      <div
        style={{
          // TODO: FIX THIS: Upon navigating to another page along the dashboard route, the left offset of this is not properly set so that it aligns with the grid columns
          // TODO: This might have something to do with how our <CalendarGridProvider/> component wraps the entire dashboard route/layout
          marginLeft: `${calendarGridContext.timeColumnRef?.current?.clientWidth}px`,
        }}
      >
        {" "}
      </div>
      {[...Array(numColumnsToRender).keys()].map((value, index) => {
        const columnDay = dayjs(
          calendarGridContext.displayDateBounds.beginDate,
        ).add(index, "day");

        return (
          <CalendarGridTimeHeaderCell
            columnDay={columnDay}
            daySessionSlices={
              calendarGridContext.daySessionSliceMap[
                getDaysSinceUnixEpoch(columnDay.toDate())
              ]?.topicSessionSlices ?? []
            }
            key={index}
          />
        );
      })}
    </div>
  );
}
