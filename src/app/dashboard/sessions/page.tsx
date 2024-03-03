"use client";

import { SessionTable } from "~/app/_components/session-table/session-table";
import { sessionTableColumns } from "~/app/_components/session-table/session-table-columns";
import { sessionsToSessionTableItems } from "~/app/_components/session-table/session-table-utils";
import { api } from "~/trpc/react";

export default function SessionsPage() {
  // TODO: Implement pagination on the session table component and the query
  const sessions = api.topicSession.getTopicSessionsPaginated.useInfiniteQuery(
    {
      limit: 30,
    },
    {
      getNextPageParam: (lastPage) => lastPage.cursor ?? null,
    },
  );

  return (
    <div className="flex items-center justify-center">
      <div className="w-fit">
        <SessionTable
          fetchPreviousPage={sessions.fetchPreviousPage}
          fetchNextPage={sessions.fetchNextPage}
          columns={sessionTableColumns}
          data={sessionsToSessionTableItems(
            sessions.data?.pages.flatMap((page) => page.topicSessions) ?? [],
          )}
        />
      </div>
    </div>
  );
}
