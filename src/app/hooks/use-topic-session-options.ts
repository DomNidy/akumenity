import { api } from "~/trpc/react";
import { toast } from "sonner";
import { type TopicSessionSlice } from "../_components/calendar-grid/calendar-grid-definitions";
import { useQueryClient } from "@tanstack/react-query";
import { useCalendarGrid } from "./use-calendar-grid";

// Custom hook which provides a way to edit topic sessions and handles the logic needed to update the calendar grid to reflect the changes on the ui
export function useTopicSessionOptions({
  topicSessionSlice,
}: {
  topicSessionSlice: TopicSessionSlice;
}) {
  const calendarGridContext = useCalendarGrid();
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

        calendarGridContext.refreshDaySessionMap();
      },
    });

  // TODO: We need to, instead of adding session slices, we need a way to mock topic sessions themselves, then create slices from them
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
        // If the mutation fails, we should add the topic session back to the daysessionmap
        calendarGridContext.markSessionIdAsUnprocessed(topicSessionSlice.SK);

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

        calendarGridContext.removeSessionSlicesFromMap(topicSessionSlice.SK);
      },
    });

  return {
    deleteTopicSessionMutation,
    updateTopicSessionMutation,
  };
}
