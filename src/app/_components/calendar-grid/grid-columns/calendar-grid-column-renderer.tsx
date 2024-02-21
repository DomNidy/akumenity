"use client";
import { useMemo } from "react";
import { useUserPreferences } from "~/app/hooks/use-user-preferences";
import { calculateGridColumnCount } from "~/lib/utils";
import dayjs from "dayjs";
import { CalendarGridColumn } from "./calendar-grid-column";
import { useCalendarGrid } from "~/app/_components/calendar-grid/hooks/use-calendar-grid";

// This component is responsible for determining what date each column represents, then rendering out the columns for those dates
export function CalendarGridColumnRenderer() {
  console.log("CalendarGridColumnRenderer rendered");

  const userPreferences = useUserPreferences();

  const calendarGridContext = useCalendarGrid();

  // Recalculate the number of columns to render when the display mode changes
  const numColumnsToRender = useMemo(
    () => calculateGridColumnCount(userPreferences.displayMode, dayjs()),
    [userPreferences.displayMode],
  );

  return (
    <>
      {[...Array(numColumnsToRender).keys()].map((value, index) => {
        const columnDay = dayjs(
          calendarGridContext.displayDateBounds.beginDate,
        ).add(index, "day");
        return (
          <CalendarGridColumn
            zoomLevel={calendarGridContext.zoomLevel}
            cellHeightPx={calendarGridContext.cellHeightPx}
            day={columnDay.toDate()}
            key={index}
          />
        );
      })}
    </>
  );
}
