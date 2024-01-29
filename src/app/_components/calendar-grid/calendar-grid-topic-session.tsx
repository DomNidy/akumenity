"use client";
import { useState } from "react";
import { getLabelColor } from "~/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useCalculateTopicSessionPlacement } from "~/app/hooks/use-calculate-topic-session-placement";
import { CalendarGridTopicSessionPopoverContent } from "./calendar-grid-topic-session-popover-content";
import { CalendarGridTopicSessionBodyContent } from "./calendar-grid-topic-session-body-content";
import { useIsCalendarGridItemHovered } from "~/app/hooks/use-is-calendar-item-hovered";
import { type CalendarGridTopicSessionSliceItem } from "~/app/hooks/use-calendar-grid-column";

// The component places a topic session on the calendar grid
// innerColumnIndex: When we have overlapping elements, the inner column index determines which the order in which elements are rendered left to right
export function CalendarGridTopicSession({
  topicSessionSlice,
  columnDomRef,
}: {
  topicSessionSlice: CalendarGridTopicSessionSliceItem;
  columnDomRef: React.RefObject<HTMLDivElement>;
}) {
  const [open, setOpen] = useState(false);

  const topicSessionPlacement = useCalculateTopicSessionPlacement({
    topicSessionSlice,
    columnDomRef,
  });

  const { isHovered, setHovered } = useIsCalendarGridItemHovered(
    topicSessionSlice.SK,
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          onMouseOver={() => {
            setHovered(true);
          }}
          onMouseOut={() => {
            setHovered(false);
          }}
          id={topicSessionSlice.SK}
          data-calendar-grid-item-type="topic-session"
          onClick={() => setOpen(!open)}
          className={`${getLabelColor(topicSessionSlice.ColorCode)} ${
            isHovered ? `border-2 brightness-125` : ``
          } duration-[35] absolute z-50 flex cursor-pointer flex-col overflow-hidden rounded-lg transition-all`}
          style={{
            height: `${topicSessionPlacement.topicSessionHeight}px`,
            width: `${topicSessionPlacement.topicSessionWidth}px`,
            top: `${topicSessionPlacement.topicSessionTopOffset}px`,
            left: `${topicSessionPlacement.topicSessionLeftOffset}px`,
            // TODO: Use the left,right,width properties to position elements that are overlapping
          }}
        >
          <CalendarGridTopicSessionBodyContent
            topicSessionSlice={topicSessionSlice}
          />
          <p>
            {topicSessionSlice.columnInnerColIndex} /{" "}
            {topicSessionSlice.localMaxInnerColIndex}
          </p>
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
