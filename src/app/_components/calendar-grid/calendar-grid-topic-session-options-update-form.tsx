// Form used to update topic session options
"use client";
import { useTopicSessionOptions } from "~/app/hooks/use-topic-session-options";
import { type TopicSessionSlice } from "./calendar-grid-definitions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TopicSessionUpdateSchema } from "~/definitions/topic-session-definitions";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export function CalendarGridTopicSessionOptionsUpdateForm({
  topicSessionSlice,
}: {
  topicSessionSlice: TopicSessionSlice;
}) {
  const topicSessionOptions = useTopicSessionOptions({ topicSessionSlice });

  const form = useForm<z.infer<typeof TopicSessionUpdateSchema>>({
    resolver: zodResolver(TopicSessionUpdateSchema),
    defaultValues: {
      TopicSession_ID: topicSessionSlice.SK,
      updatedFields: {
        startTimeMS: topicSessionSlice.Session_Start,
        endTimeMS: topicSessionSlice.Session_End ?? Date.now(),
      },
    },
    shouldUnregister: false,
  });

  async function onSubmit(values: z.infer<typeof TopicSessionUpdateSchema>) {
    try {
      console.log(values);
      await topicSessionOptions.updateTopicSessionMutation.mutateAsync(values);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="updatedFields.startTimeMS"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormDescription>Start Time</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="updatedFields.endTimeMS"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormDescription>End Time</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Update</Button>
      </form>
      <FormMessage key={"root"}>
        {form.formState.errors.root?.message}
      </FormMessage>
    </Form>
  );
}
