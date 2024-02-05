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
import { useEffect } from "react";

export function CalendarGridTopicSessionOptionsUpdateForm({
  topicSessionSlice,
}: {
  topicSessionSlice: TopicSessionSlice;
}) {
  const topicSessionOptions = useTopicSessionOptions({
    topicSessionId: topicSessionSlice.SK,
  });

  const form = useForm<z.infer<typeof TopicSessionUpdateSchema>>({
    resolver: zodResolver(TopicSessionUpdateSchema),
    defaultValues: {
      TopicSession_ID: topicSessionSlice.SK,
      updatedFields: {
        startTimeMS: topicSessionSlice.Session_Start,
        endTimeMS: topicSessionSlice.Session_End ?? Date.now(),
      },
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

  useEffect(() => {
    // whenever form errors change, log them
    console.log(form.formState.errors);
  }, [form.formState.errors]);

  // TODO: FormMessage is not showing the errors, figure out how react hook form works
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
                <Input {...field} type="number" />
              </FormControl>
              <FormDescription>Start Time</FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="updatedFields.endTimeMS"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl onError={(e) => console.log(e)}>
                <Input {...field} type="number" />
              </FormControl>
              <FormDescription>End Time</FormDescription>
              {/** TODO: Improve this & UX: Don't know why form message component is not able to read the context from FormField parent
               * (as it should bubble up the tree till it finds the context), so im just manually displaying the message here */}
              <FormMessage>
                {form.formState.errors.updatedFields?.root?.message}{" "}
              </FormMessage>
            </FormItem>
          )}
        />

        <Button type="submit">Update</Button>
        <Button
          className="bg-transparent hover:bg-destructive/20"
          onClick={() =>
            topicSessionOptions.deleteTopicSessionMutation.mutate({
              topicSessionId: topicSessionSlice.SK,
            })
          }
        >
          <p className="cursor-pointer text-destructive">Delete Session</p>
        </Button>
      </form>
      <FormMessage key={"root"}>
        {topicSessionOptions.updateTopicSessionMutation.error?.message}
      </FormMessage>
    </Form>
  );
}
