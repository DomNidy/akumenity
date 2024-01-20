// This hook manages the state of the daySessionMap
// Exposes a function which accepts a `TopicSessionSlice` and adds it to the map

import { useCallback, useState } from "react";
import { getDaysSinceUnixEpoch } from "~/lib/utils";
import {
  type CalendarGridContextType,
  type TopicSessionSlice,
} from "../_components/calendar-grid/calendar-grid-context";

export function useDaySessionMap() {
  // If complexity grows too high and difficult to debug, we should move this to a reducer
  const [daySessionMap, setDaySessionMap] = useState<
    CalendarGridContextType["daySessionSliceMap"]
  >({});

  // Store topic session ids that have already been added to the map
  const [processedTopicSessionIds, setProcessedTopicSessionIds] = useState<
    Set<string>
  >(new Set());

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

  // Function which returns true or false depending on whether a session has already been processed (sliced and added to the map)
  const isSessionIdProcessed = useCallback(
    (
      topicSessionId: string,
    ) => {
      return processedTopicSessionIds.has(topicSessionId);
    },
    [processedTopicSessionIds],
  );

  // Function which adds a topic session id to the processedTopicSessionIds set
  const markSessionIdAsProcessed = useCallback(
    (
      topicSessionId: string,
    ) => {
      setProcessedTopicSessionIds((prevSet) => {
        const set = new Set(prevSet);
        set.add(topicSessionId);
        return set;
      });
    },
    [setProcessedTopicSessionIds],
  );

  return {
    daySessionMap,
    addSessionSliceToMap,
    isSessionIdProcessed,
    markSessionIdAsProcessed
  };
}
