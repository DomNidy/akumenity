// An individual cell in the time header row of the calendar grid

import { type Dayjs } from "dayjs";
import { formatTime } from "~/lib/utils";
import { type TopicSessionSlice } from "./calendar-grid-definitions";
import { useCalculateDaySessionDurations } from "~/app/hooks/use-calculate-day-session-durations";
import { useRefreshLiveTopicSessions } from "~/app/hooks/use-refresh-live-topic-sessions";

export default function CalendarGridTimeHeaderCell({
  columnDay,
  daySessionSlices,
}: {
  columnDay: Dayjs;
  daySessionSlices: TopicSessionSlice[];
}) {
  // We use the refreshLive topic session hook to get the current time, which updates every 1000ms
  // We pass null as the first argument as this hook will only refresh the live time if the first argument is null
  const liveTime = useRefreshLiveTopicSessions(null, 1000);

  // Calculate the total duration of all the sessions in the day
  const sumSessionDurations = useCalculateDaySessionDurations(
    daySessionSlices,
    liveTime,
  );

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <p className="sticky top-0 z-[101]  whitespace-nowrap p-1 font-semibold tracking-tight">
        {columnDay.toDate().toDateString()}
      </p>
      <p className="sticky top-0 z-[101] whitespace-nowrap p-1 text-sm font-medium text-white ">
        {formatTime(sumSessionDurations)}
      </p>
    </div>
  );
}
