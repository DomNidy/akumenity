// Hook which takes in an array of topic session slices and returns the total duration of the slices in milliseconds
// If a slice has an undefined end time, we'll use the current time as the end time

import { useEffect, useState } from "react";
import { type TopicSessionSlice } from "../_components/calendar-grid/calendar-grid-definitions";

export function useCalculateDaySessionDurations(
  topicSessionSlices: TopicSessionSlice[],
  currentTime: number,
): number {
  function calculateTotalDuration() {
    return topicSessionSlices.reduce((acc, slice) => {
      const endMS =
        slice.Session_Status === "active" ? currentTime : slice.sliceEndMS;
      return acc + (endMS - slice.sliceStartMS);
    }, 0);
  }

  const [totalDuration, setTotalDuration] = useState(calculateTotalDuration());

  // TODO: Review that this does not cause unnecessary re-renders & potential memory leaks
  useEffect(() => {
    setTotalDuration(calculateTotalDuration());
  }, [currentTime, topicSessionSlices]);

  return totalDuration;
}
