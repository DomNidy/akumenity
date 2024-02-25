// Custom hook which calculates the placement, width, and height of a topic session
"use client";
import {
  Ref,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import dayjs from "dayjs";
import { calculateTopicSessionHeightInPixels } from "~/lib/utils";
import { useRefreshLiveTopicSessions } from "../../../hooks/use-refresh-live-topic-sessions";
import { useCalendarGrid } from "./use-calendar-grid";

export type CalculateCalendarItemPlacementProps = {
  // Reference to the column we should place this topic session in
  columnDomRef: React.RefObject<HTMLDivElement>;
  sliceStartMS: number;
  sliceEndMS: number;
  // This is only used when passing in a topic session with an unspecified end time
  // Used to update the topic session height as the current time changes
  // TODO: We can probably refactor this prop out, need to think about this more
  Session_End: number | null;
  // THe inner column index of the topic session, used only for left offset calculation of topic sessions
  localMaxInnerColIndex: number | null;
  columnInnerColIndex: number | null;
};

/**
 * This hook will compute the placement, width, and height of an item on the calendar grid, wrapper around both useCalculateCalendarItemHorizontalPos and useCalculateCalendarItemVerticalPos
 * @param columnDomRef - Reference to the column we should place this calendar item in
 * @param sliceStartMS - The start time of this calendar item
 * @param sliceEndMS - The end time of this calendar item
 * @param Session_End - Only used when passing in an item with
 * @returns
 */
export function useCalculateCalendarItemPlacement({
  ...props
}: CalculateCalendarItemPlacementProps) {
  const {
    Session_End,
    columnDomRef,
    columnInnerColIndex,
    localMaxInnerColIndex,
    sliceEndMS,
    sliceStartMS,
  } = props;

  const horizontalPositioning = useCalculateCalendarItemHorizontalPos({
    gridColumnRef: columnDomRef,
    columnInnerColIndex,
    localMaxInnerColIndex,
  });

  const verticalPositioning = useCalculateCalendarItemVerticalPos({
    timeStart: sliceStartMS,
    timeEnd: sliceEndMS,
    gridColumnRef: columnDomRef,
    liveTime: Session_End === undefined,
  });

  return {
    ...horizontalPositioning,
    ...verticalPositioning,
  };
}

type CalculateCalendarItemVerticalPosProps = {
  timeStart: number;
  timeEnd?: number;
  // If set to true, the topic session will update its height as the current time changes
  liveTime?: boolean;
  gridColumnRef: React.RefObject<HTMLDivElement>;
};

/**
 *  * This hook will compute the vertical positioning (top offset, and height) of an item on the calendar grid
 * @param timeStart - The start which we want to place an item at on the calendar grid
 * @param gridColumnRef - Reference to the column we should place this topic session in
 * @param timeEnd - The end time of this calendar item, used to calculate its height, if not provided, will fallback to a default height of 1 hour in pixels
 * @param liveTime - If set to true, the topic session will update its height as the current time changes
 * @returns
 */
export function useCalculateCalendarItemVerticalPos({
  ...props
}: CalculateCalendarItemVerticalPosProps) {
  const { timeStart, gridColumnRef, timeEnd, liveTime } = props;
  const calendarGridContext = useCalendarGrid();

  // This hook will update its time value if the initially passed value is null
  // Is this too many ternaries?
  const liveTimeEnd = useRefreshLiveTopicSessions(
    liveTime && timeEnd ? null : timeEnd ?? null,
    3000,
  );

  // Calculate the height of 1 hour on the calendar grid in pixels
  const hourHeightInPx = useMemo(
    () => calendarGridContext.cellHeightPx * calendarGridContext.zoomLevel,
    [calendarGridContext.cellHeightPx, calendarGridContext.zoomLevel],
  );

  // Calculate the hour of the day that this item should start at
  const startHour = useMemo(
    () => dayjs(timeStart).hour() + dayjs(timeStart).minute() / 60,
    [timeStart, calendarGridContext.zoomLevel, hourHeightInPx],
  );

  // Calculate the top offset of this topic session (in pixels)
  const itemTopOffset = useMemo(
    () => startHour * hourHeightInPx,
    [hourHeightInPx, startHour],
  );

  // Hacky way to prevent topic sessions from overflowing the bottom of the grid column
  const maxHeight = useMemo(() => {
    const gridColumnHeight = gridColumnRef.current?.offsetHeight ?? 0;
    return gridColumnHeight - itemTopOffset;
  }, [gridColumnRef, itemTopOffset, gridColumnRef.current?.offsetHeight]);

  // Calculate the height this topic session should be (in pixels)
  const itemHeight = useMemo(
    () =>
      // We use max here to give a minimum height of 5px to each topic session
      Math.max(
        5,
        Math.min(
          calculateTopicSessionHeightInPixels(
            timeStart,
            liveTimeEnd,
            hourHeightInPx,
          ),
          maxHeight,
        ),
      ),
    [
      timeEnd,
      timeStart,
      liveTime,
      liveTimeEnd,
      maxHeight,
      calendarGridContext.cellHeightPx,
      calendarGridContext.zoomLevel,
      hourHeightInPx,
    ],
  );

  return {
    top: itemTopOffset,
    height: itemHeight,
  };
}

type CalculateCalendarItemHorizontalPosProps = {
  gridColumnRef: React.RefObject<HTMLDivElement>;
  columnInnerColIndex: number | null;
  localMaxInnerColIndex: number | null;
};

/**
 * * This hook will compute the horizontal positioning (left offset, and width) of an item on the calendar grid
 * @param gridColumnRef - Reference to the column we should place this topic session in
 * @param columnInnerColIndex - The inner column index of the topic session, used only for left offset calculation of topic sessions
 * @param localMaxInnerColIndex - The maximum inner column index of all topic sessions that overlap with this one
 * @returns
 */
export function useCalculateCalendarItemHorizontalPos({
  ...props
}: CalculateCalendarItemHorizontalPosProps) {
  const { columnInnerColIndex, gridColumnRef, localMaxInnerColIndex } = props;
  const [itemWidth, setItemWidth] = useState(
    calculateWidth(localMaxInnerColIndex ?? undefined, gridColumnRef),
  );

  const itemLeftOffset = useMemo(
    () => calculateLeftOffset(itemWidth, columnInnerColIndex ?? undefined),
    [columnInnerColIndex, itemWidth, localMaxInnerColIndex],
  );

  //* This function is important and controls the width of the topic session / resizing of the topic session
  // Add a resize observer to recompute the width when the column width changes
  useEffect(() => {
    // Function to update the width of the topic session
    const updateWidth = () => {
      const newWidth = calculateWidth(
        localMaxInnerColIndex ?? undefined,
        gridColumnRef,
      );

      if (newWidth !== itemWidth) {
        setItemWidth(newWidth);
      }
    };

    // Create resize observer
    const resizeObserver = new ResizeObserver(updateWidth);

    // Observe the column
    if (gridColumnRef.current) {
      resizeObserver.observe(gridColumnRef.current);
    }

    // Initial width update
    updateWidth();

    return () => {
      resizeObserver.disconnect();
    };
  }, [gridColumnRef, localMaxInnerColIndex, columnInnerColIndex]);

  // Calculate the width this topic session should be (in pixels)
  // Used to fill the remaining space of the column
  function calculateWidth(
    localMaxInnerColIndex?: number,
    gridColumnRef?: RefObject<HTMLDivElement>,
  ) {
    if (!gridColumnRef?.current) return 5;
    return (
      gridColumnRef.current.clientWidth /
      Math.max(1 + (localMaxInnerColIndex ?? 0), 1)
    );
  }

  // Calculate the left offset of this topic session (in pixels) based on the inner column index
  function calculateLeftOffset(
    itemWidth: number,
    columnInnerColIndex?: number,
  ) {
    if (!columnInnerColIndex) return 0;

    // Calculate the left offset of this topic session based on the inner column index
    return columnInnerColIndex * itemWidth;
  }

  return {
    width: itemWidth,
    left: itemLeftOffset,
  };
}
