// This component renders out the content of the calendar grid topic session body
// (the content displayed inside of the topic session element on the calendar grid)

import { type TopicSessionSlice } from "../calendar-grid-definitions";
import { timeSince } from "~/lib/utils";
import { useRefreshLiveTopicSessions } from "~/app/hooks/use-refresh-live-topic-sessions";

export function CalendarGridTopicSessionBodyContent({
  topicSessionSlice,
}: {
  topicSessionSlice: TopicSessionSlice;
}) {
  const refreshedTopicSessionEndTime = useRefreshLiveTopicSessions(
    topicSessionSlice.Session_End,
    1000,
  );

  return (
    <>
      <h2 className="font-bold text-lg tracking-tight">
        {topicSessionSlice.Topic_Title}
      </h2>
      <h3 className="text-md">
        {timeSince(
          refreshedTopicSessionEndTime,
          topicSessionSlice.Session_Start,
        )}
      </h3>
    </>
  );
}
