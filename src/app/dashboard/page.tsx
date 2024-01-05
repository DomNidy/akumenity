"use client";

import MyTopics from "src/app/_components/MyTopics";
import { UserButton } from "@clerk/nextjs";
import Timeclock from "../_components/timeclock";
import { type z } from "zod";
import { useState } from "react";
import { type dbConstants } from "~/definitions/dbConstants";
import { api } from "~/trpc/react";
import { Button } from "../_components/ui/button";
import { useToast } from "../_components/ui/use-toast";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function Dashboard() {
  // Stores the ongoing topic session returned from the query (if one exists)
  const [ongoingSession, setOngoingSession] = useState<z.infer<
    typeof dbConstants.itemTypes.topicSession.itemSchema
  > | null>(null);

  const queryClient = useQueryClient();

  // Fetches the active topic session
  const activeTopicSessionQuery =
    api.topicSession.getActiveTopicSession.useQuery();

  const createTopicSession = api.topicSession.createTopicSession.useMutation({
    onError(error, variables) {
      console.log(error, "ERR");

      toast.error("Failed to create topic session", {
        description: error.message,
        position: "top-right",
        descriptionClassName: "text-muted-foreground/10",
        action: {
          label: "Retry",
          onClick: () => {
            createTopicSession.mutate(variables);
          },
        },
      });
    },
  });

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="fixed top-0 flex h-20 w-screen  items-center gap-6 bg-neutral-900 p-4">
        <h1 className="flex-grow text-2xl font-bold text-primary-foreground">
          Dashboard
        </h1>
        <UserButton afterSignOutUrl="/" />
      </div>

      <MyTopics />

      {/** TODO: Allow the user to select one of their topics from a list instead of hardcoding this */}
      <Button
        onClick={async () => {
          await createTopicSession.mutateAsync({
            Topic_ID: "Topic|3b1bb44e-1817-4c52-93f4-98b68a1713d8",
          });

          await queryClient.refetchQueries([
            ["topicSession", "getActiveTopicSession"],
          ]);
        }}
      >
        Create topic session
      </Button>

      <div className="mt-4 w-screen px-8 sm:w-[80vw] sm:px-2">
        {activeTopicSessionQuery.data && (
          <Timeclock
            topicSession={
              activeTopicSessionQuery.data as z.infer<
                typeof dbConstants.itemTypes.topicSession.itemSchema
              >
            }
          />
        )}
      </div>
    </main>
  );
}
