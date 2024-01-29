// This component renders out the content of the calendar grid topic session body
// (the content displayed inside of the topic session element on the calendar grid)

import { type TopicSessionSlice } from "./calendar-grid-definitions";
import { timeSince } from "~/lib/utils";

export function CalendarGridTopicSessionBodyContent({
  topicSessionSlice,
}: {
  topicSessionSlice: TopicSessionSlice;
}) {
  return (
    <>
      <h2 className="font-bold tracking-tight">
        {topicSessionSlice.Topic_Title}
      </h2>
      <h3>
        {timeSince(
          topicSessionSlice?.Session_End
            ? topicSessionSlice.Session_End
            : new Date().getTime(),
          topicSessionSlice.Session_Start,
        )}
      </h3>
    </>
  );
}
