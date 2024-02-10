"use client";
import { getLabelColor } from "~/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { useCalculateCalendarItemPlacement } from "~/app/_components/calendar-grid/hooks/use-calculate-calendar-item-placement";
import { CalendarGridTopicSessionPopoverContent } from "./calendar-grid-topic-session-popover-content";
import { CalendarGridTopicSessionBodyContent } from "./calendar-grid-topic-session-body-content";
import { type CalendarGridTopicSessionSliceItem } from "~/app/_components/calendar-grid/hooks/use-calendar-grid-column";
import { useHoveredCalendarItem } from "../calendar-grid-hovered-topic-session-context";
import { useCalendarGrid } from "../hooks/use-calendar-grid";

// The component places a topic session on the calendar grid
// innerColumnIndex: When we have overlapping elements, the inner column index determines which the order in which elements are rendered left to right
export function CalendarGridTopicSession({
  topicSessionSlice,
  columnDomRef,
}: {
  topicSessionSlice: CalendarGridTopicSessionSliceItem;
  columnDomRef: React.RefObject<HTMLDivElement>;
}) {
  // TODO: Only used here because of hack
  const calendarGridContext = useCalendarGrid();

  const topicSessionPlacement = useCalculateCalendarItemPlacement({
    columnDomRef,
    sliceStartMS: topicSessionSlice.sliceStartMS,
    sliceEndMS: topicSessionSlice.sliceEndMS,
    columnInnerColIndex: topicSessionSlice.columnInnerColIndex ?? null,
    localMaxInnerColIndex: topicSessionSlice.localMaxInnerColIndex ?? null,
    Session_End: topicSessionSlice.Session_End,
  });

  const hoverContext = useHoveredCalendarItem();

  // TODO: This onClick is higher in the tree and thus is ran first.
  return (
    <Popover>
      <PopoverTrigger
        asChild
        onClick={(e) => {
          e.stopPropagation();
          // TODO: WARNING THIS IS ULTRA HACKY (REMOVE THIS)
          // TODO: It is not ideal to handle this here, but works for now
          // TODO: This code ensures that the popup element is closed when the user clicks on the calendar grid
          // TODO: Would be ideal to handle this with DOM events
          calendarGridContext.setActivePopupElementId("");
        }}
      >
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
          } absolute z-50 flex cursor-pointer flex-col overflow-hidden rounded-lg drop-shadow-sm transition-all duration-75`}
          style={{
            height: `${topicSessionPlacement.height}px`,
            width: `${topicSessionPlacement.width}px`,
            top: `${topicSessionPlacement.top}px`,
            left: `${topicSessionPlacement.left}px`,
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
