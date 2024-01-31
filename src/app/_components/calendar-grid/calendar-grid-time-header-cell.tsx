// An individual cell in the time header row of the calendar grid

import { type Dayjs } from "dayjs";

export default function CalendarGridTimeHeaderCell({
  columnDay,
}: {
  columnDay: Dayjs;
}) {
  return (
    <div className="h-full w-full overflow-hidden">
      <p className="sticky top-0 z-[101]  whitespace-nowrap p-1 font-semibold tracking-tight">
        {columnDay.toDate().toDateString()}
      </p>
    </div>
  );
}
