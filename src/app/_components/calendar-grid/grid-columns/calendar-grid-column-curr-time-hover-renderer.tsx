// Renders out the curr time hover divs

import { useCalendarGrid } from "~/app/_components/calendar-grid/hooks/use-calendar-grid";
import { CalendarGridColumnCurrTimeHover } from "./calendar-grid-column-curr-time-hover";

export function CalendarGridColumnCurrTimeHoverRenderer() {
  const calendarGridContext = useCalendarGrid();

  // TODO: This is likely performance heavy, like, probably really heavy, fix this, maybe memoization ?
  // TODO: If we have our display mode set to "week", we are effectively rendering 7 * 24 * zoomLevel cells, which is a lot
  // TODO: If we have the max zoom level of 11, we are rendering 1848 cells, which is a lot, and we are doing this every time the user zooms in or out
  return (
    <div className="flex w-full flex-col">
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
            <CalendarGridColumnCurrTimeHover
              index={index}
              key={index}
              timeString={timeString}
              cellHeightPx={calendarGridContext.cellHeightPx}
            />
          );
        },
      )}
    </div>
  );
}
