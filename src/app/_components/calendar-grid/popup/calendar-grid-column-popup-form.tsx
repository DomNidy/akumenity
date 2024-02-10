// Form which allows the user to insert a topic session at the selected time
// Allow user to select a topic, and duration

import { useForm } from "react-hook-form";
import { type useTimeFromPosition } from "../hooks/use-time-from-position";
import { z } from "zod";
import { TopicSessionCreateNotActiveSchema } from "~/definitions/topic-session-definitions";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/trpc/react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "../../ui/form";
import { Input } from "../../ui/input";
import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Button } from "../../ui/button";
import { TopicSelectorMenu } from "../../my-topics/topic-selector-menu";

/**
 * @param clickPos position that the user clicked on the grid column
 */
export function CalendarGridColumnPopupForm({
  clickPos,
}: {
  clickPos: ReturnType<typeof useTimeFromPosition>["clickPos"];
}) {
  const form = useForm<z.infer<typeof TopicSessionCreateNotActiveSchema>>({
    resolver: zodResolver(TopicSessionCreateNotActiveSchema),
    defaultValues: {
      startTimeMS: clickPos?.calendarTimeMS ?? Date.now(),
      endTimeMS: (clickPos?.calendarTimeMS ?? Date.now()) + 1000 * 60 * 15,
    },
  });

  // TODO: Abstract into a hook that we can reuse
  const usersTopics = api.topic.getTopics.useQuery({
    limit: 50,
  });

  // Store the selected topic in the "change associated topic" input
  const [selectedTopic, setSelectedTopic] = useState<{
    label: string;
    topicId: string;
  } | null>(null);

  // if the popover to select a topic is open or not
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Because we update the seleced topic in a different component, we'll run an effect here to update our form state when that changes
  useEffect(() => {
    form.setValue("Topic_ID", selectedTopic?.topicId ?? "");
  }, [selectedTopic]);

  const createNotActiveTopicSession =
    api.topicSession.createTopicSessionNotActive.useMutation();

  async function onSubmit(
    values: z.infer<typeof TopicSessionCreateNotActiveSchema>,
  ) {
    console.log("submitting values", values);
    try {
      createNotActiveTopicSession.mutate(values);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="startTimeMS"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start time</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  placeholder={`${clickPos?.calendarTimeMS}`}
                />
              </FormControl>
              <FormDescription>
                Change the time at which this session begun
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="endTimeMS"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End time</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  placeholder={`${clickPos?.calendarTimeMS}`}
                />
              </FormControl>
              <FormDescription>
                Change the time at which this session ends
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="Topic_ID"
          render={({}) => (
            <FormItem>
              <FormLabel className="text-md font-semibold tracking-tight">
                Change associated topic
              </FormLabel>
              <FormControl>
                <Popover open={popoverOpen}>
                  <PopoverTrigger>
                    <Button
                      onClick={() => setPopoverOpen(!popoverOpen)}
                      role="combobox"
                      aria-expanded={false}
                      className="w-max justify-between"
                    >
                      {selectedTopic?.label ?? "Select Topic"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <TopicSelectorMenu
                      setPopoverOpen={setPopoverOpen}
                      setSelectedTopic={setSelectedTopic}
                      usersTopics={usersTopics.data?.topics}
                    />
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormDescription>
                Update the topic which this session is associated with
              </FormDescription>
            </FormItem>
          )}
        />

        <Button type="submit">Create</Button>
      </form>
    </Form>
  );
}
