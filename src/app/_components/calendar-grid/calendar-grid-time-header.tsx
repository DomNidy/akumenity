// Renders out the row of dates above the time columns

import { useMemo } from "react";
import {
  calculateDurationsOfSlices,
  calculateGridColumnCount,
  getDaysSinceUnixEpoch,
} from "~/lib/utils";
import { useUserPreferences } from "~/app/hooks/use-user-preferences";
import dayjs from "dayjs";
import CalendarGridTimeHeaderCell from "./calendar-grid-time-header-cell";
import { useCalendarGrid } from "~/app/hooks/use-calendar-grid";
import { useCalendarGridColumn } from "~/app/hooks/use-calendar-grid-column";

export function CalendarGridTimeHeader() {
  const userPreferences = useUserPreferences();
  const calendarGridContext = useCalendarGrid();

  // Recalculate the number of columns to render when the display mode changes
  const numColumnsToRender = useMemo(
    () => calculateGridColumnCount(userPreferences.displayMode, dayjs()),
    [userPreferences.displayMode],
  );

  return (
    <div className={`flex w-full flex-row bg-blue-800`}>
      <div
        style={{
          marginLeft: `${calendarGridContext.timeColumnRef?.current?.clientWidth}px`,
        }}
      >
        {" "}
      </div>
      {[...Array(numColumnsToRender).keys()].map((value, index) => {
        const columnDay = dayjs(
          calendarGridContext.displayDateBounds.beginDate,
        ).add(index, "day");

        // TODO: Figure out a way to update this if we have live session
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
