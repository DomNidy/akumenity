"use client";
import { useState } from "react";
import { getLabelColor } from "~/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useCalculateCalendarItemPlacement } from "~/app/hooks/use-calculate-calendar-item-placement";
import { CalendarGridTopicSessionPopoverContent } from "./calendar-grid-topic-session-popover-content";
import { CalendarGridTopicSessionBodyContent } from "./calendar-grid-topic-session-body-content";
import { type CalendarGridTopicSessionSliceItem } from "~/app/hooks/use-calendar-grid-column";
import { useHoveredCalendarItem } from "./calendar-grid-hovered-topic-session-context";

// The component places a topic session on the calendar grid
// innerColumnIndex: When we have overlapping elements, the inner column index determines which the order in which elements are rendered left to right
export function CalendarGridTopicSession({
  topicSessionSlice,
  columnDomRef,
}: {
  topicSessionSlice: CalendarGridTopicSessionSliceItem;
  columnDomRef: React.RefObject<HTMLDivElement>;
}) {
  const topicSessionPlacement = useCalculateCalendarItemPlacement({
    columnDomRef,
    sliceStartMS: topicSessionSlice.sliceStartMS,
    sliceEndMS: topicSessionSlice.sliceEndMS,
    columnInnerColIndex: topicSessionSlice.columnInnerColIndex ?? null,
    localMaxInnerColIndex: topicSessionSlice.localMaxInnerColIndex ?? null,
    Session_End: topicSessionSlice.Session_End,
  });

  const hoverContext = useHoveredCalendarItem();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          onMouseOver={() => {
            hoverContext.setHoveredCalendarItemId(topicSessionSlice.SK);
          }}
          onMouseOut={() => {
            hoverContext.setHoveredCalendarItemId(null);
          }}
          id={topicSessionSlice.SK}
          data-calendar-grid-item-type="topic-session"
          className={`${getLabelColor(topicSessionSlice.ColorCode)} ${
            hoverContext.hoveredCalendarItemId === topicSessionSlice.SK
              ? `brightness-125`
              : ``
          } absolute z-50 flex cursor-pointer flex-col overflow-hidden rounded-lg transition-all duration-75`}
          style={{
            height: `${topicSessionPlacement.topicSessionHeight}px`,
            width: `${topicSessionPlacement.topicSessionWidth}px`,
            top: `${topicSessionPlacement.topicSessionTopOffset}px`,
            left: `${topicSessionPlacement.topicSessionLeftOffset}px`,
          }}
        >
          <CalendarGridTopicSessionBodyContent
            topicSessionSlice={topicSessionSlice}
          />
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-fit" side="top" avoidCollisions={true}>
        <CalendarGridTopicSessionPopoverContent
          topicSessionSlice={topicSessionSlice}
        />
      </PopoverContent>
    </Popover>
  );
}
