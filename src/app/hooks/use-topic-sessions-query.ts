// Encapsulates the logic of topic session querying

import { api } from "~/trpc/react";

// Hook responsible for querying topic sessions
export function useTopicSessionsQuery({
  startTimeMS,
  endTimeMS,
}: {
  startTimeMS: number;
  endTimeMS: number;
}) {
  const topicSessionsQuery =
    api.topicSession.getTopicSessionsInDateRange.useQuery({
      dateRange: {
        startTimeMS,
        endTimeMS,
      },
    });

  return topicSessionsQuery;
}
