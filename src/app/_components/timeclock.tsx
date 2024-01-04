import { type z } from "zod";
import { type dbConstants } from "~/definitions/dbConstants";
import { Card } from "./ui/card";
import { timeSince } from "~/lib/utils";
import { Pause, PauseIcon, Play, Square, Timer } from "lucide-react";

export default function Timeclock({
  topicSession,
}: {
  topicSession: z.infer<typeof dbConstants.itemTypes.topicSession.itemSchema>;
}) {
  const {
    SessionDuration,
    SessionID,
    SessionSpans,
    SessionStart,
    Topic_ID,
    Topic_Title,
  } = topicSession;

  // TODO: Continue implementing timeclock
  return (
    <Card className="w-fit p-2">
      <div className="flex flex-row">
        <div className="flex flex-col justify-start ">
          <span className="flex flex-row items-center gap-4">
            <p className="text-2xl font-bold">{Topic_Title}</p>
            <div className="ml-auto">
              <div className="mt-0.5 h-4 w-4 rounded-full bg-gradient-to-b from-green-400 via-green-500 to-green-600"></div>
            </div>
          </span>

          <p className="text-md ordinal text-muted-foreground">
            {timeSince(Date.now(), SessionStart)}
          </p>

          <div className="flex flex-row">
            <Square strokeWidth={1.75} size={24} />
            <Pause size={24} strokeWidth={1.75} />
            <Play strokeWidth={1.75} size={24} />
          </div>
        </div>
      </div>
    </Card>
  );
}
