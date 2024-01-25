"use client";
import { useContext } from "react";
import { CalendarGridContext } from "./calendar-grid-context";
import { CalendarGridTimeColumnRow } from "./calendar-grid-time-column-row";

export function CalendarGridTimeColumn({
  calendarGridTimeColumnRef,
}: {
  calendarGridTimeColumnRef: React.RefObject<HTMLDivElement>;
}) {
  const calendarGridContext = useContext(CalendarGridContext);

  return (
    <div className="flex flex-col pr-2" ref={calendarGridTimeColumnRef}>
      {[...Array(24 * calendarGridContext.zoomLevel).keys()].map(
        (value, index) => {
          const rowTime = new Date();
          rowTime.setHours(0, (60 / calendarGridContext.zoomLevel) * index, 0);
          const timeString = rowTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
          return (
            <CalendarGridTimeColumnRow
              key={index}
              timeString={timeString}
              cellHeightPx={calendarGridContext.cellHeightPx}
              rowIndex={index}
            />
          );
        },
      )}
    </div>
  );
}
