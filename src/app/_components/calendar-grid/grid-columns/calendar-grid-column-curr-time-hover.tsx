import { CalendarGridTimeColumnRow } from "../time-column/calendar-grid-time-column-row";

// TODO: Make this a popover that triggers a menu which allows the user to create a new topic session at the clicked time
export function CalendarGridColumnCurrTimeHover({
  timeString,
  index,
  cellHeightPx,
}: {
  timeString: string;
  index: number;
  cellHeightPx: number;
}) {
  return (
    <CalendarGridTimeColumnRow
      key={index}
      timeString={timeString}
      cellHeightPx={cellHeightPx}
      rowIndex={index}
      className="hover:animate-calendar-grid-col-hover w-full bg-white text-black opacity-0"
    />
  );
}
