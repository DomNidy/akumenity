// This hook manages the state of the daySessionMap
import { useCallback, useState } from "react";
import { getDaysSinceUnixEpoch, sliceTopicSession } from "~/lib/utils";
import {
  type CalendarGridContextData,
  type TopicSessionSlice,
} from "../calendar-grid-definitions";
import { type RouterOutputs } from "~/trpc/react";

export function useDaySessionMap() {
  // If complexity grows too high and difficult to debug, we should move this to a reducer
  const [daySessionMap, setDaySessionMap] = useState<
    CalendarGridContextData["daySessionSliceMap"]
  >({});

  // Store topic session ids that have already been added to the map
  // The value is an array of ints which correspond to days that this session has slices for
  const [processedTopicSessionIds, setProcessedTopicSessionIds] = useState<
    Record<string, Set<number>>
  >({});

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
        markSessionIdAsProcessed(slice.SK, new Set([dayOfSlice]));
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
      setProcessedTopicSessionIds((prevMap) => {
        const map = { ...prevMap };

        // Delete the topic session id from the map
        delete map[topicSessionId];

        return map;
      });
    },
    [setProcessedTopicSessionIds],
  );

  // TODO: Refactor this to only iterate over the days that the session has slices for (using the processedTopicSessionIds map)
  // When the processedTopicSessionIds map changes, we should redefine this function (as in the dependency array of the useCallback hook)
  // Function which removes all topic session slices associated with a topic session id from the map
  const removeSessionSlicesFromMap = useCallback(
    (topicSessionId: string) => {
      // Ensure the session is in the processed topic session ids map
      if (!processedTopicSessionIds.hasOwnProperty(topicSessionId)) {
        console.error(
          `Tried to remove topic session ${topicSessionId} from the processed topic session ids map, but it has not been processed!`,
        );
        return;
      }

      // Get the days that this session has slices for
      const sliceDays = processedTopicSessionIds[topicSessionId];
      if (sliceDays?.size === 0 || !sliceDays) {
        console.error(
          `Tried to remove topic session ${topicSessionId} from the processed topic session ids map, but it has no slices, or evaluated to undefined!: sliceDays: ${JSON.stringify(
            sliceDays,
          )}`,
        );
        return;
      }

      // Remove the session from the processed topic session ids map
      markSessionIdAsUnprocessed(topicSessionId);

      // Remove the slices from the map
      setDaySessionMap((prevMap) => {
        const map = { ...prevMap };

        // Iterate over each day this session has slices for, and filter them out
        for (const day of sliceDays) {
          console.debug("Removing slices for day", day);
          console.debug(`${JSON.stringify(map[day])} day `);
          map[day] = {
            topicSessionSlices:
              map[day]?.topicSessionSlices.filter(
                (slice) => slice.SK !== topicSessionId,
              ) ?? [],
            day: map[day]?.day ?? new Date(),
          };
        }

        return map;
      });
    },
    [setDaySessionMap, processedTopicSessionIds, markSessionIdAsUnprocessed],
  );

  // Function which returns true or false depending on whether a session has already been processed (sliced and added to the map)
  const isSessionIdProcessed = useCallback(
    (topicSessionId: string) => {
      return processedTopicSessionIds.hasOwnProperty(topicSessionId);
    },
    [processedTopicSessionIds],
  );

  /**
   * Function which receives a topic session id, and an array of days for which this session has slices, and adds it to the processedTopicSessionIds
   * @param {any} topicSessionId:string The id of the topic session
   * @param {any} sliceDays:Set<number> A set of integers which correspond to days that this session has slices for
   * @returns {any}
   */
  const markSessionIdAsProcessed = useCallback(
    (topicSessionId: string, sliceDays: Set<number>) => {
      setProcessedTopicSessionIds((prev) => {
        const map = { ...prev, [topicSessionId]: sliceDays };

        return map;
      });
    },
    [setProcessedTopicSessionIds, processedTopicSessionIds],
  );

  //* Function which takes in an array of topic sessions, slices them, and adds them to the daySessionMap
  const sliceAndAddTopicSessionsToMap = (
    data: RouterOutputs["topicSession"]["getTopicSessionsInDateRange"],
  ) => {
    // If there is no data, return
    if (!data) {
      console.error("No data provided to sliceAndAddTopicSessionsToMap");
      return;
    }

    // IF already processed, skip

    data.forEach((topicSession) => {
      // If the session has already been processed, skip it
      if (isSessionIdProcessed(topicSession.SK)) {
        console.debug(
          `Topic session ${topicSession.SK} has already been processed`,
        );
        // go to next iteration
        return;
      }

      // Create a set to store days that this session has slices for
      const sliceDays = new Set<number>();
      const slices = sliceTopicSession(topicSession);

      // Slice topic session can return multiple slices if the session spans multiple days
      slices.forEach((topicSessionSlice) => {
        // Add the day of the slice to the set
        sliceDays.add(
          getDaysSinceUnixEpoch(new Date(topicSessionSlice.sliceStartMS)),
        );
        // Add the slice to the map
        addSessionSliceToMap(topicSessionSlice);
      });

      // Mark the session as processed
      // This means it wont be re-added to the map from following queries unless it is marked as unprocessed
      markSessionIdAsProcessed(topicSession.SK, sliceDays);
    });
  };

  // Function which returns all session slices associated with a topic session id
  // Returns undefined if the topic session id is not in the map
  const getSessionSlicesByTopicSessionId = useCallback(
    (topicSessionId: string) => {
      console.log("getSessionSlicesByTopicSessionId");
      if (!processedTopicSessionIds.hasOwnProperty(topicSessionId))
        return undefined;

      // Get all days which this session has slices for
      const sliceDays = processedTopicSessionIds[topicSessionId];
      console.debug(
        `Slice days associated with topic session ${topicSessionId}`,
        sliceDays,
      );

      // Create an array to store the slices
      const slices: TopicSessionSlice[] = [];

      // Iterate over each day and get the slices matching the topic session id
      sliceDays?.forEach((day) => {
        // Get the slices for this day
        const _slices = daySessionMap[day]?.topicSessionSlices.filter(
          (slice) => slice.SK === topicSessionId,
        );

        console.debug("Grabbed slice from day", day, _slices);
        slices.push(...(_slices ?? []));
      });

      console.debug(
        `Found ${slices.length} sessions associated with ${topicSessionId}`,
        slices,
      );

      return slices;
    },
    [daySessionMap, processedTopicSessionIds],
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
