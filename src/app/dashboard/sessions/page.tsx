"use client";

import { SessionTable } from "~/app/_components/session-table/session-table";
import { sessionTableColumns } from "~/app/_components/session-table/session-table-columns";
import { type SessionTableItem } from "~/app/_components/session-table/session-table-definitions";
import { type useTopicSessionsQuery } from "~/app/hooks/use-topic-sessions-query";
import { api } from "~/trpc/react";

// TODO: Move this to an appropriate location
// Function which takes the sessions and converts them to the format required by the session table
function sessionsToSessionTableItems(
  sessions: ReturnType<typeof useTopicSessionsQuery>["data"],
): SessionTableItem[] {
  return (
    sessions
      ?.filter((session) => {
        return session.Session_End && session.Session_Start;
      })
      .map((session) => {
        return {
          topicName: session.Topic_Title,
          topicColorCode: session.ColorCode,
          topicSessionId: session.SK,
          sessionStartMS: session.Session_Start,
          sessionEndMS: session.Session_End,
          sessionDurationMS: session.Session_End! - session.Session_Start,
        } as SessionTableItem;
      }) ?? []
  );
}

const endTimeMS = Date.now();

export default function SessionsPage() {
  // TODO: Implement pagination on the session table component and the query
  const sessions = api.topicSession.getTopicSessionsInDateRange.useQuery({
    dateRange: {
      startTimeMS: 0,
      endTimeMS: endTimeMS,
    },
  });

  return (
    <div>
      <SessionTable
        columns={sessionTableColumns}
        data={sessionsToSessionTableItems(sessions.data)}
      />
    </div>
  );
}
