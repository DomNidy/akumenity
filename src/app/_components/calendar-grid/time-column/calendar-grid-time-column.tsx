"use client";
import { CalendarGridTimeColumnRow } from "./calendar-grid-time-column-row";
import { useCalendarGrid } from "~/app/hooks/use-calendar-grid";



export function CalendarGridTimeColumn() {
  const calendarGridContext = useCalendarGrid();
  return (
    <div className="flex flex-col" ref={calendarGridContext.timeColumnRef}>
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
              className="bg-[#0A0A0A]"
            />
          );
        },
      )}
    </div>
  );
}
