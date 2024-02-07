import { useState } from "react";
import { useCalculateCalendarItemVerticalPos } from "~/app/_components/calendar-grid/hooks/use-calculate-calendar-item-placement";
import { useInterval } from "usehooks-ts";
import { useCalendarGrid } from "~/app/_components/calendar-grid/hooks/use-calendar-grid";

// This function renders out a bar on the calendar grid, located at the current time
export function CalendarGridCurrentTimeBar({
  calendarGridTimeColumnRef,
}: {
  calendarGridTimeColumnRef: React.RefObject<HTMLDivElement>;
}) {
  const { currentTimeElementRef } = useCalendarGrid();

  // We use the useState hook to keep track of the current time
  const [currentTime, setCurrentTime] = useState(new Date().getTime());

  // Update the current time every 3 seconds
  useInterval(() => {
    setCurrentTime(new Date().getTime());
  }, 3000);

  // We use the useCalculateCalendarItemPlacement hook to calculate the placement of the current time bar
  // We are just giving it a fake topic session slice, and the ref to the time column
  // We might want to extract this hook to be more generic, so that it can be used for other things (such as useCalculatePlacement, and useCalculateCalendarItemPlacement)
  const placement = useCalculateCalendarItemVerticalPos({
    gridColumnRef: calendarGridTimeColumnRef,
    timeStart: currentTime,
    timeEnd: currentTime,
    liveTime: true,
  });

  return (
    <div
      ref={currentTimeElementRef}
      className="absolute h-2 w-full bg-blue-500"
      style={{
        height: `${placement.height}px`,
        width: `100%`,
        top: `${placement.top}px`,
      }}
    />
  );
}
