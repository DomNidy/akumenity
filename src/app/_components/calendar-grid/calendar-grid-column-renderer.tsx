"use client";
import { useContext, useMemo } from "react";
import { CalendarGridContext } from "./calendar-grid-context";
import { useUserPreferences } from "~/app/hooks/use-user-preferences";
import { calculateGridColumnCount } from "~/lib/utils";
import dayjs from "dayjs";
import { CalendarGridColumn } from "./calendar-grid-column";

// This component is responsible for determining what date each column represents, then rendering out the columns for those dates
export function CalendarGridColumnRenderer() {
  const userPreferences = useUserPreferences();

  const calendarGridContext = useContext(CalendarGridContext);

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
          <div key={index} className="w-full">
            <p className="absolute z-[101] bg-blue-800  w-full ">
              {columnDay.toDate().toDateString()}
            </p>
            <CalendarGridColumn day={columnDay.toDate()} />
          </div>
        );
      })}
    </>
  );
}
