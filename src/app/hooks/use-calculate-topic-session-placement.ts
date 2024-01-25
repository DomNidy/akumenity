// Custom hook which calculates the placement, width, and height of a topic session
"use client";
import { useContext, useEffect, useMemo, useState } from "react";
import { type TopicSessionSlice } from "../_components/calendar-grid/calendar-grid-definitions";
import { CalendarGridContext } from "../_components/calendar-grid/calendar-grid-context";
import dayjs from "dayjs";
import { calculateTopicSessionHeightInPixels } from "~/lib/utils";

export function useCalculateTopicSessionPlacement({
  topicSessionSlice,
  // The inner column index of this topic session in the grid column
  innerColumnIndex,
  // Reference to the column we are rendering this topic session in
  columnDomRef,
}: {
  topicSessionSlice: TopicSessionSlice;
  innerColumnIndex: number;
  columnDomRef: React.RefObject<HTMLDivElement>;
}) {
  const calendarGridContext = useContext(CalendarGridContext);

  // Calculate the left offset of this topic session (in pixels)
  const [topicSessionLeftOffset, setTopicSessionLeftOffset] = useState(
    calculateLeftOffset(),
  );

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

  // Calculate the width this topic session should be (in pixels)
  const [topicSessionWidth, setTopicSessionWidth] = useState(
    calculateTopicSessionWidth(),
  );

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

  // Calculate the height this topic session should be (in pixels)
  const topicSessionHeight = useMemo(
    () =>
      // We use max here to give a minimum height of 5px to each topic session
      Math.max(
        5,
        calculateTopicSessionHeightInPixels(
          topicSessionSlice.sliceStartMS,
          topicSessionSlice.sliceEndMS,
          hourHeightInPx,
        ),
      ),
    [
      topicSessionSlice.sliceEndMS,
      topicSessionSlice.sliceStartMS,
      calendarGridContext.cellHeightPx,
      calendarGridContext.zoomLevel,
      hourHeightInPx,
    ],
  );

  // Add a resize observer to the column DOM element so that we can recalculate the width of the topic session when the column width changes
  // We do this because the width of the topic session is dependent on the width of the column it is rendered in,
  // and we cant just use CSS because multiple topic sessions can be rendered in the same column, and we use absolute positioning to place them
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      setTopicSessionWidth(calculateTopicSessionWidth());
      setTopicSessionLeftOffset(calculateLeftOffset());
    });

    if (columnDomRef.current) {
      resizeObserver.observe(columnDomRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [columnDomRef]);

  // Calculate the top offset of this topic session (in pixels)
  const topicSessionTopOffset = useMemo(
    () => startHour * hourHeightInPx,
    [hourHeightInPx, startHour],
  );

  // Calculates how many pixels wide this topic session should
  function calculateTopicSessionWidth() {
    return columnDomRef.current?.clientWidth
      ? columnDomRef.current?.clientWidth - topicSessionLeftOffset
      : 5;
  }

  // Calculate the left offset of this topic session (in pixels)
  function calculateLeftOffset() {
    if (!innerColumnIndex) return 0;

    // TODO: Instead of multiplying by 20, we should divide the column width by the number of inner columns
    const columnWidth = columnDomRef.current?.clientWidth
      ? innerColumnIndex * 20
      : 50;

    return columnWidth;
  }

  return {
    topicSessionHeight,
    topicSessionWidth,
    topicSessionTopOffset,
    topicSessionLeftOffset,
    columnHeight,
  };
}
