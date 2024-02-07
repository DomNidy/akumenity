import { useState } from "react";
import { useCalendarGrid } from "./use-calendar-grid";

// Custom hook which returns the time on the calendar grid based on the click position
// Returns an event handler which can be passed in an onClick event to update this internal state
export function useTimeFromPosition({
  gridColumnDomRef,
  columnDay,
}: {
  gridColumnDomRef: React.RefObject<HTMLDivElement>;
  columnDay: Date;
}) {
  // Get the calendar grid context
  const calendarGridContext = useCalendarGrid();

  // The position and associated calendar time of the click
  const [clickPos, setClickPos] = useState<{
    x: number;
    y: number;
    calendarTimeMS: number;
  } | null>(null);

  function timeFromXYPosition(x: number, y: number) {
    // Get the cell height and zoom level
    const cellHeight = calendarGridContext.cellHeightPx;
    const zoomLevel = calendarGridContext.zoomLevel;

    // Calculate the cell x and y position
    const cellY = Math.floor(y / cellHeight);

    // Create a new date object
    const time = new Date();
    time.setHours(0, (60 / zoomLevel) * cellY, 0);
    time.setDate(columnDay.getDate());
    time.setMonth(columnDay.getMonth());
    time.setFullYear(columnDay.getFullYear());

    // Log the time
    return time;
  }

  // Return the event handler
  const onClickedCalendarGridColumn = (e: React.MouseEvent<HTMLDivElement>) => {
    // Get the grid column dom ref
    const rect = gridColumnDomRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Get the x and y position of the click (relative to the grid column)
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const calendarTimeMS = timeFromXYPosition(x, y).getTime();

    // Update the click position
    setClickPos({
      calendarTimeMS,
      x,
      y,
    });
  };

  return {
    onClickedCalendarGridColumn,
    clickPos,
  };
}
