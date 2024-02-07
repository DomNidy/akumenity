"use client";
import { type z } from "zod";
import { type dbConstants } from "~/definitions/dbConstants";
import { Card } from "../ui/card";
import { timeSince } from "~/lib/utils";
import { Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { api } from "~/trpc/react";
import { useQueryClient } from "@tanstack/react-query";
import { useCalendarGrid } from "../calendar-grid/hooks/use-calendar-grid";
import { useTopicSessionOptions } from "~/app/hooks/use-topic-session-options";

export default function Timeclock({
  topicSession,
}: {
  topicSession: z.infer<typeof dbConstants.itemTypes.topicSession.itemSchema>;
}) {
  const { PK, SK, Session_Start, Session_Status, Topic_Title } = topicSession;

  const { endActiveTopicSessionMutation } = useTopicSessionOptions({
    topicSessionId: SK,
  });

  const calendarGridContext = useCalendarGrid();

  const stopSession = api.topicSession.endTopicSession.useMutation({
    onSettled: () => {
      calendarGridContext.removeSessionSlicesFromMap(SK);
      calendarGridContext.markSessionIdAsUnprocessed(SK);

      void queryClient.invalidateQueries([
        ["topicSession", "getActiveTopicSession"],
      ]);

      void queryClient.invalidateQueries([
        ["topicSession", "getTopicSessionsInDateRange"],
      ]);
    },
  });
  const queryClient = useQueryClient();

  const [timeElapsed, setTimeElapsed] = useState(Date.now() - Session_Start);
  const intervalRef = useRef<NodeJS.Timeout | undefined>();

  // When the user stops the session, we'll set this to false in order to instantly hide the timeclock
  const [active, setActive] = useState(true);

  // When this component receives a new topic session, we'll set the active state to true
  useEffect(() => {
    if (Session_Status !== "stopped") {
      setActive(true);
      setTimeElapsed(Date.now() - Session_Start);

      intervalRef.current = setInterval(() => {
        setTimeElapsed(Date.now() - Session_Start);
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [PK, SK, Session_Start]);

  if (!active) return null;

  return (
    <Card className="w-fit p-2">
      <div className="flex flex-row ">
        <div className="flex flex-col justify-start ">
          <span className="flex flex-row items-center gap-4">
            <p className="text-2xl font-bold">{Topic_Title}</p>
            <div className="ml-auto">
              <div className="mt-0.5 h-4 w-4 rounded-full bg-gradient-to-b from-green-400 via-green-500 to-green-600"></div>
            </div>
          </span>

          <p className="text-md ordinal text-muted-foreground">
            {timeSince(timeElapsed, 0)}
          </p>

          <div className="flex flex-row">
            <Square
              strokeWidth={3}
              size={24}
              className="cursor-pointer rounded-full bg-red-500 p-1 hover:bg-red-400"
              onClick={() => {
                stopSession.mutate();
                clearInterval(intervalRef.current);
                setActive(false);
              }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
