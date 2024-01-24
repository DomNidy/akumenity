import { useUserPreferences } from "~/app/hooks/use-user-preferences";
import { type TopicSessionSlice } from "./calendar-grid-definitions";

// This renders out the popover content for a topic session
export function CalendarGridTopicSessionPopoverContent({
  topicSessionSlice,
}: {
  topicSessionSlice: TopicSessionSlice;
}) {
  const { dateTimeFormatOptions } = useUserPreferences();

  return (
    <div>
      <p>{topicSessionSlice.Topic_Title}</p>
      <p>{topicSessionSlice.SK}</p>
      <p>
        {new Date(topicSessionSlice.Session_Start).toLocaleTimeString(
          "en-us",
          dateTimeFormatOptions,
        )}{" "}
        -{" "}
        {new Date(
          topicSessionSlice.Session_End
            ? topicSessionSlice.Session_End
            : new Date(),
        ).toLocaleTimeString("en-us", dateTimeFormatOptions)}
      </p>
    </div>
  );
}
