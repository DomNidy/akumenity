import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import { cn } from "~/lib/utils";
import { Card } from "../ui/card";
import { toast } from "sonner";
import Timeclock from "./timeclock";
import { type z } from "zod";
import { type dbConstants } from "~/definitions/dbConstants";
import { TopicSelectorMenu } from "./topic-selector-menu";

export default function TopicSessionManager() {
  // TODO: Implement infinite scroll (for requerying and adjusting the limit), or just refactor the endpoint to not even paginate user topics
  const usersTopics = api.topic.getTopics.useQuery({
    limit: 50,
  });

  const activeTopicSessionQuery =
    api.topicSession.getActiveTopicSession.useQuery();

  const queryClient = useQueryClient();
  const createTopicSession = api.topicSession.createTopicSession.useMutation({
    onError(error, variables) {
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

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<{
    label: string;
    topicId: string;
  } | null>(null);

  return (
    <Card className="w-fit space-x-2 space-y-2 p-2">
      <h2 className="text-2xl font-semibold tracking-tight">Begin session</h2>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            role="combobox"
            aria-expanded={popoverOpen}
            className="w-[250px] justify-between "
          >
            {selectedTopic?.label ?? "Select Topic"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0">
          <TopicSelectorMenu
            usersTopics={usersTopics.data?.topics}
            setSelectedTopic={setSelectedTopic}
            setPopoverOpen={setPopoverOpen}
          />
        </PopoverContent>
      </Popover>

      {/**  TODO: Implement optimistic updates here (so that when the user clicks the button, the timeclock instantly appears) **/}

      {selectedTopic && (
        <Button
          onClick={async () => {
            await createTopicSession.mutateAsync({
              Topic_ID: selectedTopic?.topicId,
            });

            await queryClient.refetchQueries([
              ["topicSession", "getActiveTopicSession"],
            ]);

            await queryClient.refetchQueries([
              ["topicSession", "getTopicSessionsInDateRange"],
            ]);
          }}
        >
          Begin {selectedTopic.label} session
        </Button>
      )}

      {activeTopicSessionQuery.data && (
        <Timeclock
          topicSession={
            activeTopicSessionQuery.data as z.infer<
              typeof dbConstants.itemTypes.topicSession.itemSchema
            >
          }
        />
      )}
    </Card>
  );
}
