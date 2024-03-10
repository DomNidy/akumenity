// Form used to update topic session options
"use client";
import { useTopicSessionOptions } from "~/app/hooks/use-topic-session-options";
import { type TopicSessionSlice } from "../calendar-grid-definitions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { TopicSessionUpdateSchema } from "~/definitions/topic-session-definitions";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Button } from "../../ui/button";
import { useEffect, useMemo, useRef, useState } from "react";
import { TopicSelectorMenu } from "../../my-topics/topic-selector-menu";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { useTopicsQuery } from "~/app/hooks/use-topics-query";
import DateTimePicker from "../../date-time-picker/date-time-picker";
import equal from "fast-deep-equal";

export function CalendarGridTopicSessionOptionsUpdateForm({
  topicSessionSlice,
}: {
  topicSessionSlice: TopicSessionSlice;
}) {
  const usersTopics = useTopicsQuery();

  // Store the selected topic in the "change associated topic" input
  const [selectedTopic, setSelectedTopic] = useState<{
    label: string;
    topicId: string;
  } | null>(null);

  // Exposes mutation functions for updating and deleting topic sessions
  const topicSessionOptions = useTopicSessionOptions({
    topicSessionId: topicSessionSlice.SK,
  });

  // Memoize the initial form values so we can check if they've changed before submitting
  const initialFormValues = useMemo<
    z.infer<typeof TopicSessionUpdateSchema>
  >(() => {
    return {
      TopicSession_ID: topicSessionSlice.SK,
      updatedFields: {
        startTimeMS: topicSessionSlice.Session_Start,
        endTimeMS: topicSessionSlice.Session_End ?? Date.now(),
        Topic_ID: topicSessionSlice.Topic_ID,
      },
    };
  }, [topicSessionSlice]);

  const form = useForm<z.infer<typeof TopicSessionUpdateSchema>>({
    resolver: zodResolver(TopicSessionUpdateSchema),
    defaultValues: initialFormValues,
  });

  async function onSubmit(values: z.infer<typeof TopicSessionUpdateSchema>) {
    // If the form values are the same as the initial values, don't submit as nothing has changed
    if (equal(values, initialFormValues)) {
      console.debug("No changes made");
      form.setError("root", {
        type: "value",
        message: "No changes made",
      });
      return;
    }

    try {
      console.log(values);
      await topicSessionOptions.updateTopicSessionMutation.mutateAsync(values);
    } catch (err) {
      console.error(err);
    }
  }

  // If the topic selector popover is open or not
  const [popoverOpen, setPopoverOpen] = useState(false);
  // Ref to the popover content (so we can close it when clicking outside of it)
  const popoverContentRef = useRef(null);

  // Because we update the seleced topic in a different component, we'll run an effect here to update our form state when that changes
  useEffect(() => {
    form.setValue(
      "updatedFields.Topic_ID",
      selectedTopic?.topicId ?? topicSessionSlice.Topic_ID,
    );
  }, [selectedTopic]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-max space-y-4 ">
        <FormField
          control={form.control}
          name="updatedFields.startTimeMS"
          render={({}) => (
            <FormItem>
              <FormLabel className="text-md font-semibold tracking-tight">
                Start time
              </FormLabel>
              <FormControl>
                <DateTimePicker
                  defaultDate={new Date(topicSessionSlice.Session_Start)}
                  setDate={(date) => {
                    form.setValue("updatedFields.startTimeMS", date?.getTime());
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

        <FormField
          control={form.control}
          name="updatedFields.endTimeMS"
          render={({}) => (
            <FormItem>
              <FormLabel className="text-md font-semibold tracking-tight">
                End time
              </FormLabel>
              <FormControl>
                <DateTimePicker
                  defaultDate={
                    new Date(topicSessionSlice.Session_End ?? Date.now())
                  }
                  setDate={(date) => {
                    form.setValue(
                      "updatedFields.endTimeMS",
                      date?.getTime() ?? Date.now(),
                    );
                  }}
                />
              </FormControl>
              <FormDescription>
                Change the time at which this session ended
              </FormDescription>
              {/** TODO: Improve this & UX: Don't know why form message component is not able to read the context from FormField parent
               * (as it should bubble up the tree till it finds the context), so im just manually displaying the message here */}
              <FormMessage>
                {form.formState.errors.updatedFields?.root?.message}{" "}
              </FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="updatedFields.Topic_ID"
          render={({}) => (
            <FormItem className="flex flex-col items-start">
              <FormLabel className="text-md font-semibold tracking-tight">
                Change associated topic
              </FormLabel>
              <FormControl>
                <Popover open={popoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      onClick={() => setPopoverOpen(!popoverOpen)}
                      role="combobox"
                      aria-expanded={false}
                      className="w-max justify-between"
                    >
                      {selectedTopic?.label ?? "Select Topic"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[300px] p-0"
                    ref={popoverContentRef}
                  >
                    <TopicSelectorMenu
                      popoverContentRef={popoverContentRef}
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
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormMessage>{form.formState.errors.root?.message}</FormMessage>
        <FormMessage>
          {topicSessionOptions.updateTopicSessionMutation.error?.message}
        </FormMessage>

        <div className="flex justify-between">
          <Button type="submit">Update</Button>
          <Button
            className="bg-transparent hover:bg-destructive/20"
            onClick={() =>
              topicSessionOptions.deleteTopicSessionMutation.mutate({
                topicSessionId: topicSessionSlice.SK,
              })
            }
          >
            <p className="cursor-pointer font-semibold text-destructive">
              Delete Session
            </p>
          </Button>
        </div>
      </form>
    </Form>
  );
}
