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
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { TopicSelectorMenu } from "../../my-topics/topic-selector-menu";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";

export function CalendarGridTopicSessionOptionsUpdateForm({
  topicSessionSlice,
}: {
  topicSessionSlice: TopicSessionSlice;
}) {
  // TODO: Abstract into a hook that we can reuse
  const usersTopics = api.topic.getTopics.useQuery({
    limit: 50,
  });

  // Store the selected topic in the "change associated topic" input
  const [selectedTopic, setSelectedTopic] = useState<{
    label: string;
    topicId: string;
  } | null>(null);

  const topicSessionOptions = useTopicSessionOptions({
    topicSessionId: topicSessionSlice.SK,
  });

  const form = useForm<z.infer<typeof TopicSessionUpdateSchema>>({
    resolver: zodResolver(TopicSessionUpdateSchema),
    defaultValues: {
      TopicSession_ID: topicSessionSlice.SK,
      updatedFields: {},
    },
  });

  async function onSubmit(values: z.infer<typeof TopicSessionUpdateSchema>) {
    console.log("submitting");
    try {
      console.log(values);
      await topicSessionOptions.updateTopicSessionMutation.mutateAsync(values);
    } catch (err) {
      console.error(err);
    }
  }

  const [popoverOpen, setPopoverOpen] = useState(false);

  // Because we update the seleced topic in a different component, we'll run an effect here to update our form state when that changes
  useEffect(() => {
    form.setValue("updatedFields.Topic_ID", selectedTopic?.topicId);
  }, [selectedTopic]);

  useEffect(() => {
    // whenever form errors change, log them
    console.log(form.formState.errors);
  }, [form.formState.errors]);

  // TODO: FormMessage is not showing the errors, figure out how react hook form works
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="updatedFields.startTimeMS"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-md font-semibold tracking-tight">
                Start time
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  placeholder={`${topicSessionSlice.Session_Start}`}
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
          name="updatedFields.endTimeMS"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-md font-semibold tracking-tight">
                End time
              </FormLabel>
              <FormControl onError={(e) => console.log(e)}>
                <Input
                  {...field}
                  type="number"
                  placeholder={`${topicSessionSlice.Session_End ?? Date.now()}`}
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
            <FormItem>
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
                      className="w-[250px] justify-between"
                    >
                      {selectedTopic?.label ?? "Select Topic"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
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
      <FormMessage key={"root"}>
        {topicSessionOptions.updateTopicSessionMutation.error?.message}
      </FormMessage>
    </Form>
  );
}
