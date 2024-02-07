// Hook used to manage the state of a single column in the calendar grid

import { useEffect, useState } from "react";
import { type TopicSessionSlice } from "../calendar-grid-definitions";
import { getDaysSinceUnixEpoch } from "~/lib/utils";
import { useCalendarGrid } from "./use-calendar-grid";

// This type extends the TopicSessionSlice type to include the columnInnerColIndex and localMaxInnerColIndex
export type CalendarGridTopicSessionSliceItem = TopicSessionSlice & {
  // the inner column index of this topic session slice (0 is the leftmost column, 1 is the column to the right of that, etc.)
  // used to offset overlapping topic sessions
  columnInnerColIndex?: number;
  // the maximum inner column index of all topic sessions that overlap with this one
  // used to calculate the width of each topic session
  localMaxInnerColIndex?: number;
};

/**
 * @param day  The day that this column represents and reads data for
 */
export function useCalendarGridColumn({ day }: { day: Date }) {
  const calendarGridContext = useCalendarGrid();

  // Retrieve topic session slices associated with this column
  const [columnTopicSessionSlices, setColumnTopicSessionSlices] = useState<
    CalendarGridTopicSessionSliceItem[]
  >(
    calendarGridContext.daySessionSliceMap[getDaysSinceUnixEpoch(day)]
      ?.topicSessionSlices ?? [],
  );

  //* Important, this updates the column (and the topic session slices in this column) when the day or data changes
  //* Maybe we can target the specific data for a day instead of the whole map
  useEffect(() => {
    // Whenever the daySessionSliceMap changes, read the new topic sessions
    // transform them into CalendarGridTopicSessionSliceItem and assign them an innerColIndex, then set the state
    setColumnTopicSessionSlices(
      assignInnerColIndex(
        calendarGridContext.daySessionSliceMap[getDaysSinceUnixEpoch(day)]
          ?.topicSessionSlices ?? [],
      ),
    );
  }, [
    calendarGridContext.daySessionSliceMap,
    calendarGridContext.topicSessionsQuery?.data,
    day,
  ]);

  // Responsible for assigning inner column indexes, so that sessions which overlap can be offset later on in rendering
  function assignInnerColIndex(
    topicSessionSlices: CalendarGridTopicSessionSliceItem[],
  ): CalendarGridTopicSessionSliceItem[] {
    // Sort the topic session slices by start time
    const sortedTopicSessionSlices =
      topicSessionSlices?.sort((a, b) => a.sliceStartMS - b.sliceStartMS) ??
      (([] as TopicSessionSlice[]).map((topicSessionSlice) => ({
        ...topicSessionSlice,
        columnInnerColIndex: 0,
        localMaxInnerColIndex: 0,
      })) as CalendarGridTopicSessionSliceItem[]);

    const stack: CalendarGridTopicSessionSliceItem[] = [];
    const result: CalendarGridTopicSessionSliceItem[] = [];
    // Each session in a set of overlapping sessions should know the maximum inner col index of all sessions in that overlapping set
    let localMaxInnerColIndex = 0;
    // Keeps track of the start of the current set of overlapping sessions
    let startOfSetIndex = 0;

    for (const topicSessionSlice of sortedTopicSessionSlices) {
      // While the previous element in the stack ends before this element starts, pop it off the stack as it is no longer overlapping
      while (
        stack.length > 0 &&
        topicSessionSlice.sliceStartMS >=
          (stack[stack.length - 1]?.sliceEndMS ?? 0)
      ) {
        stack.pop();
      }

      if (stack.length === 0) {
        // If the stack is empty, we're starting a new set of overlapping sessions
        // Update the localMaxInnerColIndex of all elements in the previous set
        for (let i = startOfSetIndex; i < result.length; i++) {
          result[i] = {
            ...result[i]!,
            localMaxInnerColIndex: localMaxInnerColIndex,
          };
        }

        // Reset the localMaxInnerColIndex and startOfSetIndex for the new set
        topicSessionSlice.columnInnerColIndex = 0;
        localMaxInnerColIndex = 0;
        startOfSetIndex = result.length;
      } else {
        // If the stack is not empty, this element overlaps with the last element in the stack
        topicSessionSlice.columnInnerColIndex =
          (stack[stack.length - 1]?.columnInnerColIndex ?? 0) + 1;
        localMaxInnerColIndex = Math.max(
          localMaxInnerColIndex,
          topicSessionSlice.columnInnerColIndex,
        );
      }

      stack.push(topicSessionSlice);
      result.push(topicSessionSlice);
    }

    // Update the localMaxInnerColIndex of all elements in the last set
    for (let i = startOfSetIndex; i < result.length; i++) {
      result[i] = {
        ...result[i]!,
        localMaxInnerColIndex: localMaxInnerColIndex,
      };
    }

    return result;
  }

  return {
    columnTopicSessionSlices,
  };
}
