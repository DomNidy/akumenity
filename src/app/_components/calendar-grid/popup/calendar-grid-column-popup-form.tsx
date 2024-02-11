// Form which allows the user to insert a topic session at the selected time
// Allow user to select a topic, and duration

import { useForm } from "react-hook-form";
import { type useTimeFromPosition } from "../hooks/use-time-from-position";
import { type z } from "zod";
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
  FormMessage,
} from "../../ui/form";
import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Button } from "../../ui/button";
import { TopicSelectorMenu } from "../../my-topics/topic-selector-menu";
import { useUserTopicsQuery } from "~/app/hooks/use-user-topics-query";
import DateTimePicker from "../../date-time-picker/date-time-picker";
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

  const usersTopics = useUserTopicsQuery();

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

  // log form errors

  useEffect(() => {
    console.log(form.formState.errors);
  }, [form.formState.errors]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="startTimeMS"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-md font-semibold tracking-tight">
                Start time
              </FormLabel>
              <FormControl>
                <DateTimePicker
                  setDate={(date) => {
                    form.setValue("startTimeMS", date?.getTime() ?? Date.now());
                  }}
                />
              </FormControl>
              <FormDescription>
                Change the time at which this session begun
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/** Replace this with date time picker */}

        <FormField
          control={form.control}
          name="endTimeMS"
          render={({}) => (
            <FormItem>
              <FormLabel className="text-md font-semibold tracking-tight">
                End time
              </FormLabel>
              <FormControl>
                <DateTimePicker
                  setDate={(date) => {
                    form.setValue("endTimeMS", date?.getTime() ?? Date.now());
                  }}
                />
              </FormControl>
              <FormDescription>
                Change the time at which this session ends
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="Topic_ID"
          render={({}) => (
            <FormItem>
              <FormLabel className="text-md font-semibold tracking-tight">
                Associated topic
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
                Which topic should this session be associated with?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Create</Button>
      </form>
    </Form>
  );
}
