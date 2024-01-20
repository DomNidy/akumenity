// This hook manages the state of the daySessionMap
// Exposes a function which accepts a `TopicSessionSlice` and adds it to the map

import { useCallback, useState } from "react";
import { getDaysSinceUnixEpoch } from "~/lib/utils";
import {
  type CalendarGridContextType,
  type TopicSessionSlice,
} from "../_components/calendar-grid/calendar-grid-context";

export function useDaySessionMap() {
  const [daySessionMap, setDaySessionMap] = useState<
    CalendarGridContextType["daySessionSliceMap"]
  >({});

  // useCallback to memoize the function so that it is not recreated on every render
  const addSessionSliceToMap = useCallback(
    (slice: TopicSessionSlice) => {
      const _sliceDate = new Date(slice.sliceStartMS);
      _sliceDate.setHours(0, 0, 0, 0);
      const dayOfSlice = getDaysSinceUnixEpoch(_sliceDate);

      setDaySessionMap((prevMap) => {
        const map = { ...prevMap };

        map[dayOfSlice] = {
          day: _sliceDate,
          topicSessionSlices: [
            {
              ...slice,
            },
            // If there are already slices for this day, keep them
            ...(prevMap[dayOfSlice]?.topicSessionSlices ?? []),
          ],
        };

        return map;
      });
    },
    [setDaySessionMap],
  );

  return {
    daySessionMap,
    addSessionSliceToMap,
  };
}
