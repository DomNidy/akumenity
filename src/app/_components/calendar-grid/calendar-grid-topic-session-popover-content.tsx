import { useUserPreferences } from "~/app/hooks/use-user-preferences";
import { type TopicSessionSlice } from "./calendar-grid-definitions";
import { MoreVertical } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import CalendarGridTopicSessionOptions from "./calendar-grid-topic-session-options";

// This renders out the popover content for a topic session
export function CalendarGridTopicSessionPopoverContent({
  topicSessionSlice,
}: {
  topicSessionSlice: TopicSessionSlice;
}) {
  const { dateTimeFormatOptions } = useUserPreferences();

  return (
    <div>
      <div className="flex justify-between">
        <p>{topicSessionSlice.Topic_Title}</p>
        <Popover>
          <PopoverTrigger asChild className="duration-0">
            <MoreVertical color="white" className="cursor-pointer" />
          </PopoverTrigger>
          <PopoverContent side="bottom" className="relative right-32">
            <CalendarGridTopicSessionOptions
              topicSessionSlice={topicSessionSlice}
            />
          </PopoverContent>
        </Popover>
      </div>
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
