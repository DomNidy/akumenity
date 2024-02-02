"use client";

import { timeSince } from "~/lib/utils";
import { api } from "~/trpc/react";

const queryRangeStartTime = Date.now() - 7 * 24 * 60 * 60 * 1000;
export default function SessionsPage() {
  // TODO: Use this endpoint to fetch data for specific topics
  const sessions = api.topicSession.getSessionsForTopic.useQuery({
    Topic_ID: "Topic|705fe519-d598-40df-b544-da053562dd8f",
    dateRange: {
      startTimeMS: queryRangeStartTime,
    },
  });

  return (
    <div>
      {sessions.data?.map((session) => {
        return (
          <div>
            {timeSince(
              session.Session_End ?? Date.now(),
              session.Session_Start,
            )}
          </div>
        );
      })}

      <h1>Sessions</h1>
      <div>
        <pre className="w-fit bg-neutral-800 text-neutral-100">
          {JSON.stringify(sessions.data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
