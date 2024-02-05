import { useEffect, useState } from "react";

/**
 *
 * @param topicSessionEndMS If this initially passed value is null, create an interval which updates the current time every refreshIntervalMS, this is the returned value
 * @param refreshIntervalMS The interval between updates to the current time
 * @returns The current time, or the time passed in initially
 */
export function useRefreshLiveTopicSessions(
  topicSessionEndMS: number | null,
  refreshIntervalMS: number,
) {
  const [currentTime, setCurrentTime] = useState(topicSessionEndMS);

  // TODO: Review that this does not cause unnecessary re-renders & potential memory leaks
  useEffect(() => {
    if (!topicSessionEndMS) {
      const interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, refreshIntervalMS);

      return () => clearInterval(interval);
    }
  }, []);

  return currentTime ?? Date.now();
}
