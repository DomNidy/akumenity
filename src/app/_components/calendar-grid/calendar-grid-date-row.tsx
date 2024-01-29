// Renders out the row of dates above the time columns

import { useContext, useMemo } from "react";
import { CalendarGridContext } from "./calendar-grid-context";
import { calculateGridColumnCount } from "~/lib/utils";
import { useUserPreferences } from "~/app/hooks/use-user-preferences";
import dayjs from "dayjs";

export function CalendarGridDateRowRenderer() {
  const userPreferences = useUserPreferences();
  const calendarGridContext = useContext(CalendarGridContext);

  // Recalculate the number of columns to render when the display mode changes
  const numColumnsToRender = useMemo(
    () => calculateGridColumnCount(userPreferences.displayMode, dayjs()),
    [userPreferences.displayMode],
  );

  return (
    <div className="ml-[38px] flex flex-row ">
      {[...Array(numColumnsToRender).keys()].map((value, index) => {
        const columnDay = dayjs(
          calendarGridContext.displayDateBounds.beginDate,
        ).add(index, "day");
        return (
          <div key={index} className="h-full w-full">
            <p className="sticky top-0 z-[101] w-full  bg-blue-800 ">
              {columnDay.toDate().toDateString()}
            </p>
          </div>
        );
      })}
    </div>
  );
}
