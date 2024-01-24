"use client";
import { useState } from "react";
import { getLabelColor } from "~/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { type TopicSessionSlice } from "./calendar-grid-definitions";
import { useCalculateTopicSessionPlacement } from "~/app/hooks/use-calculate-topic-session-placement";
import { CalendarGridTopicSessionPopoverContent } from "./calendar-grid-topic-session-popover-content";
import { CalendarGridTopicSessionBodyContent } from "./calendar-grid-topic-session-body-content";

// The component places a topic session on the calendar grid
export function CalendarGridTopicSession({
  topicSessionSlice,
  columnDomRef,
}: {
  topicSessionSlice: TopicSessionSlice;
  columnDomRef: React.RefObject<HTMLDivElement>;
}) {
  const [open, setOpen] = useState(false);

  const topicSessionPlacement = useCalculateTopicSessionPlacement({
    topicSessionSlice,
    columnDomRef,
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          id={topicSessionSlice.SK}
          onClick={() => setOpen(!open)}
          className={`${getLabelColor(
            topicSessionSlice.ColorCode,
          )} absolute flex cursor-pointer  flex-col overflow-hidden rounded-lg hover:border-2`}
          style={{
            height: `${topicSessionPlacement.topicSessionHeight}px`,
            width: `${topicSessionPlacement.topicSessionWidth}px`,
            top: `${topicSessionPlacement.topicSessionTopOffset}px`,
            // TODO: Use the left,right,width properties to position elements that are overlapping
            // left: `${}px`,
          }}
        >
          <CalendarGridTopicSessionBodyContent
            topicSessionSlice={topicSessionSlice}
          />
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-80">
        <CalendarGridTopicSessionPopoverContent
          topicSessionSlice={topicSessionSlice}
        />
      </PopoverContent>
    </Popover>
  );
}
