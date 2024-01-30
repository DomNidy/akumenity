// Custom hook which calculates the placement, width, and height of a topic session
"use client";
import { useContext, useEffect, useMemo, useState } from "react";
import { CalendarGridContext } from "../_components/calendar-grid/calendar-grid-context";
import dayjs from "dayjs";
import { calculateTopicSessionHeightInPixels } from "~/lib/utils";
import { type CalendarGridTopicSessionSliceItem } from "./use-calendar-grid-column";
import { useRefreshLiveTopicSessions } from "./use-refresh-live-topic-sessions";

export function useCalculateTopicSessionPlacement({
  topicSessionSlice,
  // Reference to the column we are rendering this topic session in
  columnDomRef,
}: {
  topicSessionSlice: CalendarGridTopicSessionSliceItem;
  columnDomRef: React.RefObject<HTMLDivElement>;
}) {
  const calendarGridContext = useContext(CalendarGridContext);

  // This hook will update if the initially passed value is undefined
  // So if we pass in a slice with an unspecified end time, it will update every 3 seconds (the refresh interval)
  // This will cause the topic session to update its height as the current time changes
  const liveTime = useRefreshLiveTopicSessions(
    topicSessionSlice.Session_End,
    3000,
  );

  // Calculate the width this topic session should be (in pixels)
  const [topicSessionWidth, setTopicSessionWidth] = useState(
    calculateTopicSessionWidth(),
  );
  // Calculate the left offset of this topic session (in pixels)
  const [topicSessionLeftOffset, setTopicSessionLeftOffset] = useState(
    calculateLeftOffset(),
  );

  // Whenever the topicSessionWidth changes, recalculate the left offset
  useEffect(() => {
    setTopicSessionLeftOffset(calculateLeftOffset());
  }, [topicSessionWidth, columnDomRef]);

  // Since zoomLevel is the amount of cells (vertically stacked) needed to represent 1 hour
  // we calculate the height of 1 hour in pixels by multiplying the cellHeightPx by the zoomLevel
  const hourHeightInPx = useMemo(
    () => calendarGridContext.cellHeightPx * calendarGridContext.zoomLevel,
    [calendarGridContext.cellHeightPx, calendarGridContext.zoomLevel],
  );

  // Read the column height from the DOM, if available, otherwise calculate it using cellHeightPx * zoomLevel * 24
  const columnHeight = useMemo(() => {
    if (columnDomRef.current) {
      return columnDomRef.current.clientHeight;
    } else {
      return (
        calendarGridContext.cellHeightPx * calendarGridContext.zoomLevel * 24
      );
    }
  }, [
    calendarGridContext.cellHeightPx,
    calendarGridContext.zoomLevel,
    hourHeightInPx,
    columnDomRef,
  ]);

  // Calculate the hour of the day that this topic session starts at
  const startHour = useMemo(
    () =>
      dayjs(topicSessionSlice.sliceStartMS).hour() +
      dayjs(topicSessionSlice.sliceStartMS).minute() / 60,
    [
      topicSessionSlice.sliceStartMS,
      calendarGridContext.zoomLevel,
      hourHeightInPx,
    ],
  );

  

  // Add a resize observer to the column DOM element so that we can recalculate the width of the topic session when the column width changes
  // We do this because the width of the topic session is dependent on the width of the column it is rendered in,
  // and we cant just use CSS because multiple topic sessions can be rendered in the same column, and we use absolute positioning to place them
  useEffect(() => {
    console.log("Effect ran");
    const resizeObserver = new ResizeObserver(() => {
      setTopicSessionWidth(calculateTopicSessionWidth());
    });

    if (columnDomRef.current) {
      resizeObserver.observe(columnDomRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [columnDomRef.current]);

  // Calculate the top offset of this topic session (in pixels)
  const topicSessionTopOffset = useMemo(
    () => startHour * hourHeightInPx,
    [hourHeightInPx, startHour],
  );

  // TODO: Make this less hacky
  // This is a hacky way to do things
  // Calculate the maximum height of a topic session so it cannot overflow the bottom of the grid column
  // We do this because we use the topicSessionSlice.Slice_End to calculate the height of the topic session instead of the sliceEndMS
  // This is because we want the topic session to update its height as the current time changes, and we cant update the sliceEndMS without re-slicing the topic session
  const maxHeight = useMemo(() => {
    const gridColumnHeight = columnDomRef.current?.offsetHeight ?? 0;
    return gridColumnHeight - topicSessionTopOffset;
  }, [columnDomRef, topicSessionTopOffset]);

// Calculate the height this topic session should be (in pixels)
const topicSessionHeight = useMemo(
  () =>
    // We use max here to give a minimum height of 5px to each topic session
    Math.max(
      5,
      Math.min(
        calculateTopicSessionHeightInPixels(
          topicSessionSlice.sliceStartMS,
          liveTime,
          hourHeightInPx,
        ),
        maxHeight,
      ),
    ),
  [
    topicSessionSlice.sliceEndMS,
    topicSessionSlice.Session_End,
    liveTime,
    maxHeight,
    topicSessionSlice.sliceStartMS,
    calendarGridContext.cellHeightPx,
    calendarGridContext.zoomLevel,
    hourHeightInPx,
  ],
);


  // Calculates how many pixels wide this topic session should
  function calculateTopicSessionWidth() {
    return columnDomRef.current?.clientWidth
      ? columnDomRef.current?.clientWidth /
          Math.max(1 + (topicSessionSlice.localMaxInnerColIndex ?? 0), 1)
      : 5;
  }

  // Calculate the left offset of this topic session (in pixels) based on the inner column index
  function calculateLeftOffset() {
    if (!topicSessionSlice.columnInnerColIndex) return 0;

    // Calculate the left offset of this topic session based on the inner column index
    return topicSessionSlice.columnInnerColIndex * topicSessionWidth;
  }

  return {
    topicSessionHeight,
    topicSessionWidth,
    topicSessionTopOffset,
    topicSessionLeftOffset,
    columnHeight,
  };
}
