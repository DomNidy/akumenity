import { type TopicSessionSlice } from "../calendar-grid-definitions";
import { MoreVertical } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { CalendarGridTopicSessionTimespan } from "./calendar-grid-topic-session-timespan";
import { CalendarGridTopicSessionOptionsUpdateForm } from "./calendar-grid-topic-session-options-update-form";

// This renders out the popover content for a topic session
export function CalendarGridTopicSessionPopoverContent({
  topicSessionSlice,
}: {
  topicSessionSlice: TopicSessionSlice;
}) {
  return (
    <>
      <div className="flex justify-between">
        <p>{topicSessionSlice.Topic_Title}</p>
        <Popover>
          <PopoverTrigger asChild className="duration-0">
            <MoreVertical color="white" className="cursor-pointer" />
          </PopoverTrigger>
          <PopoverContent side="right" className="w-max">
            <CalendarGridTopicSessionOptionsUpdateForm
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
    </>
  );
}
