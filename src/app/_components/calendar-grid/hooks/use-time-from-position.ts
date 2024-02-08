import { useEffect, useState } from "react";
import { useCalendarGrid } from "./use-calendar-grid";

// Custom hook which returns the time on the calendar grid based on the click position
// Returns an event handler which can be passed in an onClick event to update this internal state
// Attatches event listeners to the grid column dom element
export function useTimeFromPosition({
  gridColumnDomRef,
  columnDay,
}: {
  gridColumnDomRef: React.RefObject<HTMLDivElement>;
  columnDay: Date;
}) {
  // Get the calendar grid context
  const { zoomLevel, cellHeightPx } = useCalendarGrid();

  // The position and associated calendar time of the click
  const [clickPos, setClickPos] = useState<{
    x: number;
    y: number;
    calendarTimeMS: number;
  } | null>(null);

  // Attatch event listeners to the grid column
  // Automatically update the cursorInColumn state based on the mouseenter and mouseleave events
  useEffect(() => {
    const gridColumn = gridColumnDomRef.current;
    if (!gridColumn) return;

    gridColumn.addEventListener("click", (e) => {
      // Only update the click position if the user clicks on the grid column, not a child element / topic session
      if (e.target !== gridColumn) return;
      updateClickPos(e);
    });

    return () => {
      gridColumn.removeEventListener("click", (e) => updateClickPos(e));
    };
  }, [gridColumnDomRef]);

  // Function which returns the time based on the y position of the click
  function timeFromXYPosition(x: number, y: number) {
    // Calculate the cell x and y position
    const cellY = Math.floor(y / cellHeightPx);

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
  const updateClickPos = (e: MouseEvent) => {
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
    clickPos,
  };
}
