// Renders out the row of dates above the time columns

import { useContext, useMemo } from "react";
import { CalendarGridContext } from "./calendar-grid-context";
import { calculateGridColumnCount } from "~/lib/utils";
import { useUserPreferences } from "~/app/hooks/use-user-preferences";
import dayjs from "dayjs";
import CalendarGridTimeHeaderCell from "./calendar-grid-time-header-cell";

export function CalendarGridTimeHeader() {
  const userPreferences = useUserPreferences();
  const calendarGridContext = useContext(CalendarGridContext);

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
        return <CalendarGridTimeHeaderCell columnDay={columnDay} key={index} />;
      })}
    </div>
  );
}
