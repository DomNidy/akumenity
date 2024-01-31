import { useContext } from "react";
import { api } from "~/trpc/react";
import { CalendarGridContext } from "../_components/calendar-grid/calendar-grid-context";
import { toast } from "sonner";
import { type TopicSessionSlice } from "../_components/calendar-grid/calendar-grid-definitions";
import { useQueryClient } from "@tanstack/react-query";

// Custom hook which provides a way to edit topic sessions and handles the logic needed to update the calendar grid to reflect the changes on the ui
export function useTopicSessionOptions({
  topicSessionSlice,
}: {
  topicSessionSlice: TopicSessionSlice;
}) {
  const calendarGridContext = useContext(CalendarGridContext);
  const queryClient = useQueryClient();

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

  // TODO: Create an endpoint to update the time span of a topic session
  const updateTopicSessionMutation =
    api.topicSession.updateTopicSession.useMutation({
      mutationKey: ["topicSession", "updateTopicSession"],
      onMutate: async (variables) => {
        // Remove the topic session from the daysessionmap
        calendarGridContext.removeSessionSlicesFromMap(
          variables.TopicSession_ID,
        );
        // Optimistically update the topic session in the daysessionmap
        calendarGridContext.addSessionSliceToMap({
          ...topicSessionSlice,
          ...variables.updatedFields,
        });
      },
      onError: (err) => {
        // Add the topic session back to the daysessionmap
        calendarGridContext.addSessionSliceToMap(topicSessionSlice);
        toast(err.message);
      },
      onSuccess: () => {
        toast("Session updated");
        void queryClient.invalidateQueries([
          ["topicSession", "getActiveTopicSession"],
        ]);
        void queryClient.invalidateQueries([
          ["topicSession", "getTopicSessionsInDateRange"],
        ]);
      },
    });

  return {
    deleteTopicSessionMutation,
    updateTopicSessionMutation,
  };
}
