// Form which allows the user to insert a topic session at the selected time
// Allow user to select a topic, and duration
"use client";
import { useForm } from "react-hook-form";
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
import { useTopicsQuery } from "~/app/hooks/use-topics-query";
import DateTimePicker from "../../date-time-picker/date-time-picker";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useCalendarPopup } from "../hooks/use-calendar-popup";

/**
 * @param clickTime Time where the calendar grid was clicked
 */
export function CalendarPopupForm() {
  const { currentPopupData, closePopup } = useCalendarPopup();

  const form = useForm<z.infer<typeof TopicSessionCreateNotActiveSchema>>({
    resolver: zodResolver(TopicSessionCreateNotActiveSchema),
    defaultValues: {
      startTimeMS: currentPopupData?.clickTime.getTime() ?? Date.now(),
      endTimeMS: currentPopupData
        ? currentPopupData.clickTime.getTime() + 1000 * 60 * 15
        : Date.now() + 1000 * 60 * 15,
    },
  });

  const queryClient = useQueryClient();

  const usersTopics = useTopicsQuery();

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

  // TODO: Extract to hook
  const createNotActiveTopicSession =
    api.topicSession.createTopicSessionNotActive.useMutation({
      onError(error) {
        if (error) {
          toast.error("Failed to create topic session", {
            description: error.message,
            position: "top-right",
            descriptionClassName: "text-muted-foreground/10",
          });
        }
      },
      onSettled() {
        void queryClient.invalidateQueries(
          [["topicSession", "getTopicSessionsInDateRange"]],
          {
            type: "all",
          },
        );

        setPopoverOpen(false);
        closePopup();
      },
    });

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-max space-y-4">
        <FormField
          control={form.control}
          name="startTimeMS"
          render={({}) => (
            <FormItem>
              <FormLabel className="text-md font-semibold tracking-tight">
                Start time
              </FormLabel>
              <FormControl>
                <DateTimePicker
                  defaultDate={currentPopupData?.clickTime ?? new Date()}
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
                  defaultDate={
                    new Date(
                      currentPopupData
                        ? currentPopupData.clickTime.getTime() + 1000 * 60 * 15
                        : Date.now() + 1000 * 60 * 15,
                    )
                  }
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
            <FormItem className="flex flex-col items-start">
              <FormLabel className="text-md font-semibold tracking-tight">
                Associated topic
              </FormLabel>
              <FormControl>
                <Popover open={popoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        setPopoverOpen(!popoverOpen);
                      }}
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

        <Button type="submit" disabled={createNotActiveTopicSession.isLoading}>
          Create
        </Button>
      </form>
    </Form>
  );
}
