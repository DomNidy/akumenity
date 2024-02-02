// An individual cell in the time header row of the calendar grid

import { type Dayjs } from "dayjs";
import { formatTime } from "~/lib/utils";

export default function CalendarGridTimeHeaderCell({
  columnDay,
  durationOfSessions,
}: {
  columnDay: Dayjs;
  durationOfSessions: number;
}) {
  return (
    <div className="h-full w-full overflow-hidden flex flex-col">
      <p className="sticky top-0 z-[101]  whitespace-nowrap p-1 font-semibold tracking-tight">
        {columnDay.toDate().toDateString()}
      </p>
      <p className="sticky top-0 z-[101] whitespace-nowrap p-1 text-sm font-medium text-white ">
        {formatTime(durationOfSessions)}
      </p>
    </div>
  );
}
