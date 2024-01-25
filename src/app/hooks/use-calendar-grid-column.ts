// Hook used to manage the state of a single column in the calendar grid

import { useContext, useEffect, useState } from "react";
import { CalendarGridContext } from "../_components/calendar-grid/calendar-grid-context";
import { type TopicSessionSlice } from "../_components/calendar-grid/calendar-grid-definitions";
import { getDaysSinceUnixEpoch } from "~/lib/utils";

// This type extends the TopicSessionSlice type to include the columnInnerColIndex
type CalendarGridTopicSessionSliceItem = TopicSessionSlice & {
  columnInnerColIndex?: number;
};

/**
 * @param day  The day that this column represents and reads data for
 */
export function useCalendarGridColumn({
  day,
  columnDomRef,
}: {
  day: Date;
  columnDomRef: React.RefObject<HTMLDivElement>;
}) {
  const calendarGridContext = useContext(CalendarGridContext);

  // Retrieve topic session slices associated with this column
  const [columnTopicSessionSlices, setColumnTopicSessionSlices] = useState<
    CalendarGridTopicSessionSliceItem[]
  >(
    calendarGridContext.daySessionSliceMap[getDaysSinceUnixEpoch(day)]
      ?.topicSessionSlices ?? [],
  );

  console.log(
    calendarGridContext.daySessionSliceMap[getDaysSinceUnixEpoch(day)]
      ?.topicSessionSlices ?? [],
  );

  useEffect(() => {
    // Whenever the daySessionSliceMap changes, read the new topic sessions
    // transform them into CalendarGridTopicSessionSliceItem and assign them an innerColIndex, then set the state
    setColumnTopicSessionSlices(
      assignInnerColIndex(
        calendarGridContext.daySessionSliceMap[getDaysSinceUnixEpoch(day)]
          ?.topicSessionSlices ?? [],
      ),
    );
  }, [calendarGridContext.daySessionSliceMap, day]);

  function assignInnerColIndex(
    topicSessionSlices: CalendarGridTopicSessionSliceItem[],
  ): CalendarGridTopicSessionSliceItem[] {
    console.log("assignInnerColIndex", topicSessionSlices);
    // Sort the new topic session slices by sliceStartMS and map them to CalendarGridTopicSessionSliceItem
    const sortedTopicSessionSlices =
      topicSessionSlices?.sort((a, b) => a.sliceStartMS - b.sliceStartMS) ??
      (([] as TopicSessionSlice[]).map((topicSessionSlice) => ({
        ...topicSessionSlice,
        columnInnerColIndex: 0,
      })) as CalendarGridTopicSessionSliceItem[]);

    const stack: CalendarGridTopicSessionSliceItem[] = [];
    const result: CalendarGridTopicSessionSliceItem[] = [];

    for (const topicSessionSlice of sortedTopicSessionSlices) {
      // If the current element doesn't overlap with the last element in the stack, remove the last element from the stack
      while (
        stack.length > 0 &&
        topicSessionSlice.sliceStartMS >=
          (stack[stack.length - 1]?.sliceEndMS ?? 0)
      ) {
        stack.pop();
      }

      // If the stack is empty, this element doesn't overlap with any previous ones
      topicSessionSlice.columnInnerColIndex =
        stack.length === 0
          ? 0
          : (stack[stack.length - 1]?.columnInnerColIndex ?? 0) + 1;

      stack.push(topicSessionSlice);
      result.push(topicSessionSlice);
    }

    console.log("result", result);
    return result;
  }

  return {
    columnTopicSessionSlices,
  };
}

// type TimeSlot = {
//     startTimeMS: number;
//     endTimeMS: number;
//     innerColIndex?: number;
// };

// function assignInnerColIndex(timeSlots: TimeSlot[]): TimeSlot[] {
//     // Sort the array by startTimeMS
//     const sortedTimeSlots = [...timeSlots].sort((a, b) => a.startTimeMS - b.startTimeMS);

//     const stack: TimeSlot[] = [];
//     const result: TimeSlot[] = [];

//     for (const timeSlot of sortedTimeSlots) {
//         // Pop from the stack as long as the current timeSlot starts after or exactly when the last one ends
//         while (stack.length > 0 && timeSlot.startTimeMS >= stack[stack.length - 1].endTimeMS) {
//             stack.pop();
//         }

//         // If the stack is empty, this timeSlot doesn't overlap with any previous ones
//         // Otherwise, it overlaps with the last one in the stack
//         timeSlot.innerColIndex = stack.length === 0 ? 0 : stack[stack.length - 1].innerColIndex! + 1;

//         // Push the current timeSlot onto the stack and add it to the result array
//         stack.push(timeSlot);
//         result.push(timeSlot);
//     }

//     return result;
// }
