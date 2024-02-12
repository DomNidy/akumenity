import { api } from "~/trpc/react";
import { toast } from "sonner";
import { type TopicSessionSlice } from "../_components/calendar-grid/calendar-grid-definitions";
import { useQueryClient } from "@tanstack/react-query";
import { useCalendarGrid } from "../_components/calendar-grid/hooks/use-calendar-grid";
import { useState } from "react";
// Custom hook which provides a way to edit topic sessions and handles the logic needed to update the calendar grid to reflect the changes on the ui
export function useTopicSessionOptions({
  topicSessionId,
}: {
  topicSessionId: string;
}) {
  const calendarGridContext = useCalendarGrid();
  const queryClient = useQueryClient();

  // State which stores copies of the slices associated with this topic session
  const [associatedSlices, setAssociatedSlices] = useState<
    TopicSessionSlice[] | undefined
  >();

  // Function which gets the topic sessions associated with session id, and updates the associated slices
  const snapshotSlices = () => {
    console.log("Snapshotting slices");
    const slices =
      calendarGridContext.getSessionSlicesByTopicSessionId(topicSessionId);
    setAssociatedSlices(slices);
  };

  // Function which adds the snapshotted slices back to the map
  const addSnapshottedSlicesToMap = () => {
    if (!associatedSlices) return;
    associatedSlices.forEach((slice) => {
      calendarGridContext.addSessionSliceToMap(slice);
    });

    setAssociatedSlices(undefined);
  };

  const deleteTopicSessionMutation =
    api.topicSession.deleteTopicSession.useMutation({
      mutationKey: ["topicSession", "deleteTopicSession"],
      // We should remove this from the daysessionmap
      onMutate: async ({ topicSessionId }) => {
        // Update associated slices before we remove the topic session from the map
        snapshotSlices();

        // Remove the slices from the map
        calendarGridContext.removeSessionSlicesFromMap(topicSessionId);
      },
      // When the mutation fails, we should add the topic session back to the daysessionmap
      onError: () => {
        if (!associatedSlices) return;
        // Add all slices back to the map
        addSnapshottedSlicesToMap();
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

  const updateTopicSessionMutation =
    api.topicSession.updateTopicSession.useMutation({
      mutationKey: ["topicSession", "updateTopicSession"],
      onMutate: async (variables) => {
        // Update the slices before we update the topic session
        snapshotSlices();

        // Remove the topic session from the daysessionmap
        calendarGridContext.removeSessionSlicesFromMap(topicSessionId);

        // * We might run into issues here due to reacts async state updates
        // Optimistically update the topic session slices in the daysessionmap
        associatedSlices?.forEach((slice) => {
          calendarGridContext.addSessionSliceToMap({
            ...slice,
            ...variables.updatedFields,
          });
        });
      },
      onError: (err) => {
        // If the mutation fails, we should add the topic session back to the daysessionmap
        calendarGridContext.markSessionIdAsUnprocessed(topicSessionId);

        // Add all slices back to the map
        addSnapshottedSlicesToMap();

        toast(err.message);
      },
      onSuccess: () => {
        toast("Session updated");
        calendarGridContext.removeSessionSlicesFromMap(topicSessionId);

        void queryClient.invalidateQueries([
          ["topicSession", "getActiveTopicSession"],
        ]);
        void queryClient.invalidateQueries([
          ["topicSession", "getTopicSessionsInDateRange"],
        ]);
      },
    });

  // Ends an ongoing topic session (if one exists)
  const endActiveTopicSessionMutation =
    api.topicSession.endTopicSession.useMutation({
      onSettled: () => {
        calendarGridContext.removeSessionSlicesFromMap(topicSessionId);
        calendarGridContext.markSessionIdAsUnprocessed(topicSessionId);

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
    endActiveTopicSessionMutation,
  };
}
