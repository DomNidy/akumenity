import { Button } from "../ui/button";
import { type TopicSessionSlice } from "./calendar-grid-definitions";
import { useTopicSessionOptions } from "~/app/hooks/use-topic-session-options";
import { CalendarGridTopicSessionOptionsUpdateForm } from "./calendar-grid-topic-session-options-update-form";

export default function CalendarGridTopicSessionOptions({
  topicSessionSlice,
}: {
  topicSessionSlice: TopicSessionSlice;
}) {
  const topicSessionOptions = useTopicSessionOptions({ topicSessionSlice });

  return (
    <div className="flex flex-col rounded-lg p-1 ">
      <Button
        className="bg-transparent hover:bg-destructive/20"
        onClick={() =>
          void topicSessionOptions.deleteTopicSessionMutation.mutateAsync({
            topicSessionId: topicSessionSlice.SK,
          })
        }
      >
        <p className="cursor-pointer text-destructive">Delete Session</p>
      </Button>
      <Button
        className="bg-transparent hover:bg-primary/20"
        onClick={() =>
          void topicSessionOptions.updateTopicSessionMutation.mutateAsync({
            TopicSession_ID: topicSessionSlice.SK,
            updatedFields: {
              endTimeMS: Date.now() + 1000 * 60 * 30,
            },
          })
        }
      >
        <p className="cursor-pointer text-primary">Edit Session</p>
      </Button>
      <CalendarGridTopicSessionOptionsUpdateForm
        topicSessionSlice={topicSessionSlice}
      />
    </div>
  );
}
