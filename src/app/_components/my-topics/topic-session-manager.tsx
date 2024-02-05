import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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

export default function TopicSessionManager() {
  // TODO: Implement infinite scroll (for requerying and adjusting the limit), or just refactor the endpoint to not even paginate user topics
  const usersTopics = api.topic.getTopics.useQuery(
    {
      limit: 50,
    },
    {
      select(data) {
        return data.topics?.map((topic) => {
          return {
            label: topic.Title,
            value: topic.SK,
          };
        });
      },
    },
  );

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

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  return (
    <Card className="w-fit space-x-2 space-y-2 p-2">
      <h2 className="text-2xl font-semibold tracking-tight">Begin session</h2>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            role="combobox"
            aria-expanded={open}
            className="w-[250px] justify-between"
          >
            {value
              ? usersTopics.data?.find(
                  (topic) => topic.value.toLowerCase() === value.toLowerCase(),
                )?.label
              : "Select Topic"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Search topic" />
            <CommandEmpty>No topic found</CommandEmpty>
            <CommandGroup>
              {usersTopics.data?.map((topic) => (
                <CommandItem
                  className="cursor-pointer"
                  key={topic.value}
                  value={topic.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === topic.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {topic.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/**  TODO: Implement optimistic updates here (so that when the user clicks the button, the timeclock instantly appears) **/}

      {!!value && (
        <Button
          onClick={async () => {
            await createTopicSession.mutateAsync({
              Topic_ID: value.slice(0, 1).toUpperCase().concat(value.slice(1)),
            });

            await queryClient.refetchQueries([
              ["topicSession", "getActiveTopicSession"],
            ]);

            await queryClient.refetchQueries([
              ["topicSession", "getTopicSessionsInDateRange"],
            ]);
          }}
        >
          Begin{" "}
          {value
            ? usersTopics.data?.find(
                (topic) => topic.value.toLowerCase() === value.toLowerCase(),
              )?.label
            : "Select Topic"}{" "}
          session
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
