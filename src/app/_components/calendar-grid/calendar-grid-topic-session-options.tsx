import { api } from "~/trpc/react";
import { Button } from "../ui/button";
import { CalendarGridContext } from "./calendar-grid-context";
import { useContext } from "react";
import { type TopicSessionSlice } from "./calendar-grid-definitions";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function CalendarGridTopicSessionOptions({
  topicSessionSlice,
}: {
  topicSessionSlice: TopicSessionSlice;
}) {
  const calendarGridContext = useContext(CalendarGridContext);

  const queryClient = useQueryClient();

  // TODO: Create a custom hook for this logic
  const deleteTopicSessionMutation =
    api.topicSession.deleteTopicSession.useMutation({
      mutationKey: ["topicSession", "deleteTopicSession"],
      // We should remove this from the daysessionmap
      onMutate: async ({ topicSessionId }) => {
        calendarGridContext.removeSessionSlicesFromMap(topicSessionId);
      },
      // When the mutation fails, we should add the topic session back to the daysessionmap
      onError: () => {
        calendarGridContext.addSessionSliceToMap(topicSessionSlice);
        toast("Failed to delete session");
      },
      // We'll invalidate the active topic session query (incase the deleted session was the active one)
      onSuccess: () => {
        toast("Session deleted");
        void queryClient.invalidateQueries([
          ["topicSession", "getActiveTopicSession"],
        ]);
      },
    });

  return (
    <div className="flex flex-col rounded-lg p-1 ">
      <Button
        className="bg-transparent hover:bg-destructive/20"
        onClick={() =>
          void deleteTopicSessionMutation.mutateAsync({
            topicSessionId: topicSessionSlice.SK,
          })
        }
      >
        <p className="cursor-pointer text-destructive">Delete Session</p>
      </Button>
    </div>
  );
}
