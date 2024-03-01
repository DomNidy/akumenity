"use client";

import { SessionTable } from "~/app/_components/session-table/session-table";
import { sessionTableColumns } from "~/app/_components/session-table/session-table-columns";
import { sessionsToSessionTableItems } from "~/app/_components/session-table/session-table-utils";
import { api } from "~/trpc/react";

// The time that the user loaded the sessions page
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
