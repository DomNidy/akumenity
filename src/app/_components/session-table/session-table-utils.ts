import { type useTopicSessionsQuery } from "~/app/hooks/use-topic-sessions-query";
import { type SessionTableItem } from "./session-table-definitions";

export function sessionsToSessionTableItems(
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
