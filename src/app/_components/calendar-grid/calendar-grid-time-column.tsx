"use client";
import { useContext } from "react";
import { CalendarGridContext } from "./calendar-grid-context";

export function CalendarGridTimeColumn() {
  const calendarGridContext = useContext(CalendarGridContext);

  return (
    <div className="flex flex-col pr-2">
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
            <div
              key={index}
              id={index.toString()}
              // If this elements index cooresponds to the current time, set it as the currentTimeElementRef
              ref={
                calendarGridContext.currentTimeElementId === index.toString()
                  ? calendarGridContext.currentTimeElementRef
                  : null
              }
              className={`${
                calendarGridContext.currentTimeElementId === index.toString()
                  ? "bg-red-700 font-bold"
                  : "bg-blue-700"
              }`}
              style={{
                height: `${calendarGridContext.cellHeightPx}px`,
                maxHeight: `${calendarGridContext.cellHeightPx}px`,
                minHeight: `${calendarGridContext.cellHeightPx}px`,
              }}
            >
              {timeString}
            </div>
          );
        },
      )}
    </div>
  );
}
