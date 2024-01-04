/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";
import { type inferFlattenedErrors, type z } from "zod";
import { TopicUpdateSchema } from "src/definitions/TopicDefinitions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "src/app/_components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "src/app/_components/ui/form";
import { Input } from "src/app/_components/ui/input";
import { useState } from "react";
import { Textarea } from "../ui/textarea";

import { TRPCClientError } from "@trpc/client";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "~/trpc/react";
import { type dbConstants } from "~/definitions/dbConstants";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

export default function TopicUpdateForm({
  topic,
  closeParentDialog,
}: {
  topic: z.infer<typeof dbConstants.itemTypes.topic.itemSchema>;
  closeParentDialog: () => void;
}) {
  const queryClient = useQueryClient();
  const updateTopic = api.topic.updateTopic.useMutation();

  const form = useForm<z.infer<typeof TopicUpdateSchema>>({
    resolver: zodResolver(TopicUpdateSchema),
    defaultValues: {
      Title: topic.Title,
      Description: topic.Description,
      Topic_ID: topic.Topic_ID,
    },
    shouldUnregister: false,
  });

  const deleteTopic = api.topic.deleteTopic.useMutation({
    onSettled: () => {
      // Invalidate topics query
      void queryClient.refetchQueries([["topic", "getTopics"]]);
    },
  });

  async function onSubmit(values: z.infer<typeof TopicUpdateSchema>) {
    try {
      await updateTopic.mutateAsync(values);
      closeParentDialog();
      form.reset();
      void queryClient.refetchQueries([["topic", "getTopics"]]);
    } catch (err) {
      if (err instanceof TRPCClientError) {
        // * Infer the error type from the schema
        const errors = err?.data?.zodError as inferFlattenedErrors<
          typeof TopicUpdateSchema
        > & { fieldErrors: { form?: string[] } }; // TODO: This is a hacky way to get the form error to show up, infer this in a better way

        errors?.fieldErrors?.form !== undefined &&
          form.setError("root", {
            message: errors?.fieldErrors?.form.join(" "),
          });

        errors?.fieldErrors?.Title &&
          form.setError("Title", {
            message: errors?.fieldErrors?.Title?.join(" "),
          });

        errors?.fieldErrors?.Description &&
          form.setError("Description", {
            message: errors?.fieldErrors?.Description?.join(" "),
          });
      }
    }
  }

  if (updateTopic.isLoading) {
    return <p className="text-center font-semibold">Loading...</p>;
  }

  // TODO: Implement proper error handling for this form
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="Title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter a title" {...field} />
              </FormControl>
              <FormDescription>
                This will be the title of your topic, ex: Calculus
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="Description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter a description" {...field} />
              </FormControl>
              <FormDescription>
                A brief description of this topic
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex w-full flex-row-reverse">
          {" "}
          <Button type="submit" className="ml-auto ">
            Save
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button>Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              {deleteTopic.isLoading ? (
                <p>Deleting...</p>
              ) : (
                <>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you sure you wish to delete this topic?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() =>
                        deleteTopic.mutate({
                          Topic_IDS: [topic.Topic_ID],
                        })
                      }
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </>
              )}
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </form>
      <FormMessage key={"root"}>
        {form.formState.errors.root?.message}
      </FormMessage>
    </Form>
  );
}
