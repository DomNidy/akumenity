import { type TopicSessionSlice } from "./calendar-grid-definitions";
import { MoreVertical } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import CalendarGridTopicSessionOptions from "./calendar-grid-topic-session-options";
import { CalendarGridTopicSessionTimespan } from "./calendar-grid-topic-session-timespan";

// This renders out the popover content for a topic session
export function CalendarGridTopicSessionPopoverContent({
  topicSessionSlice,
}: {
  topicSessionSlice: TopicSessionSlice;
}) {
  return (
    <div>
      <div className="flex justify-between">
        <p>{topicSessionSlice.Topic_Title}</p>
        <Popover>
          <PopoverTrigger asChild className="duration-0">
            <MoreVertical color="white" className="cursor-pointer" />
          </PopoverTrigger>
          <PopoverContent side="right">
            <CalendarGridTopicSessionOptions
              topicSessionSlice={topicSessionSlice}
            />
          </PopoverContent>
        </Popover>
      </div>
      <p>{topicSessionSlice.SK}</p>
      <CalendarGridTopicSessionTimespan
        sessionStartTimeMS={topicSessionSlice.Session_Start}
        sessionEndTimeMS={topicSessionSlice.Session_End}
      />
    </div>
  );
}
