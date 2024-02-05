// This hook manages the state of the daySessionMap
import { useCallback, useState } from "react";
import { getDaysSinceUnixEpoch, sliceTopicSession } from "~/lib/utils";
import {
  type CalendarGridContextType,
  type TopicSessionSlice,
} from "../_components/calendar-grid/calendar-grid-definitions";
import { type RouterOutputs } from "~/trpc/react";

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
      // Get the day in which the slice starts
      const _sliceDate = new Date(slice.sliceStartMS);
      _sliceDate.setHours(0, 0, 0, 0);
      const dayOfSlice = getDaysSinceUnixEpoch(_sliceDate);

      // If the session has already been processed, don't add it to the map
      if (isSessionIdProcessed(slice.SK)) {
        return;
      } else {
        markSessionIdAsProcessed(slice.SK);
      }

      // Add the slice to the map
      setDaySessionMap((prevMap) => {
        const map = { ...prevMap };

        map[dayOfSlice] = {
          day: _sliceDate,
          // If there are already slices for this day, keep them
          topicSessionSlices: [
            ...(prevMap[dayOfSlice]?.topicSessionSlices ?? []),
            {
              ...slice,
            },
          ],
        };

        return map;
      });
    },
    [setDaySessionMap],
  );

  // Function used to mark a topic session as unprocessed
  // useful for when we want to update the data associated with a topic session
  // This will cause new slices to be created from this topic sessions data
  const markSessionIdAsUnprocessed = useCallback(
    (topicSessionId: string) => {
      setProcessedTopicSessionIds((prevSet) => {
        const set = new Set(prevSet);
        set.delete(topicSessionId);
        return set;
      });
    },
    [setProcessedTopicSessionIds],
  );

  // Function which removes all topic session slices associated with a topic session id from the map
  const removeSessionSlicesFromMap = useCallback(
    (topicSessionId: string) => {
      markSessionIdAsUnprocessed(topicSessionId);
      setDaySessionMap((prevMap) => {
        const map = { ...prevMap };

        Object.keys(map).forEach((day) => {
          map[Number(day)] = {
            topicSessionSlices:
              map[Number(day)]?.topicSessionSlices.filter(
                (slice) => slice.SK !== topicSessionId,
              ) ?? [],
            day: map[Number(day)]?.day ?? new Date(),
          };
        });

        return map;
      });
    },
    [setDaySessionMap],
  );

  // Function which returns true or false depending on whether a session has already been processed (sliced and added to the map)
  const isSessionIdProcessed = useCallback(
    (topicSessionId: string) => {
      return processedTopicSessionIds.has(topicSessionId);
    },
    [processedTopicSessionIds],
  );

  // Function which adds a topic session id to the processedTopicSessionIds set
  const markSessionIdAsProcessed = useCallback(
    (topicSessionId: string) => {
      setProcessedTopicSessionIds((prevSet) => {
        const set = new Set(prevSet);
        set.add(topicSessionId);
        return set;
      });
    },
    [setProcessedTopicSessionIds],
  );

  //* Function which takes in an array of topic sessions, slices them, and adds them to the daySessionMap
  const sliceAndAddTopicSessionsToMap = useCallback(
    (data: RouterOutputs["topicSession"]["getTopicSessionsInDateRange"]) => {
      // If there is no data, return
      if (!data) return;

      data.forEach((topicSession) => {
        console.log(topicSession, "topicSession in slice");

        // If the session has already been processed, skip it
        if (isSessionIdProcessed(topicSession.SK)) return;

        // Slice topic session can return multiple slices if the session spans multiple days
        sliceTopicSession(topicSession).forEach((topicSessionSlice) => {
          addSessionSliceToMap(topicSessionSlice);
        });

        // Mark the session as processed
        // This means it wont be re-added to the map from following queries unless it is marked as unprocessed
        markSessionIdAsProcessed(topicSession.SK);
      });
    },
    [addSessionSliceToMap, isSessionIdProcessed, markSessionIdAsProcessed],
  );

  // Function which returns all session slices associated with a topic session id
  // Returns undefined if the topic session id is not in the map
  const getSessionSlicesByTopicSessionId = useCallback(
    (topicSessionId: string) => {
      console.log(
        "Getting slices by topic session id",
        topicSessionId,
        processedTopicSessionIds,
      );
      if (!processedTopicSessionIds.has(topicSessionId)) return undefined;

      console.log("still in the function");

      const slices = Object.values(daySessionMap).flatMap(
        (day) => day.topicSessionSlices,
      );

      return slices.filter((slice) => slice.SK === topicSessionId);
    },
    [daySessionMap],
  );

  return {
    daySessionMap,
    addSessionSliceToMap,
    isSessionIdProcessed,
    markSessionIdAsProcessed,
    sliceAndAddTopicSessionsToMap,
    markSessionIdAsUnprocessed,
    removeSessionSlicesFromMap,
    getSessionSlicesByTopicSessionId,
  };
}
