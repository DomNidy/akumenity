/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";
import { type inferFlattenedErrors, type z } from "zod";
import { TopicCreateSchema } from "src/definitions/TopicDefinitions";
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
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "src/app/_components/ui/dialog";
import { TRPCClientError } from "@trpc/client";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "~/trpc/react";

export default function TopicCreateForm() {
  const [open, setOpen] = useState<boolean>(false);

  const queryClient = useQueryClient();
  const createTopic = api.topic.createTopic.useMutation();

  const form = useForm<z.infer<typeof TopicCreateSchema>>({
    resolver: zodResolver(TopicCreateSchema),
    defaultValues: {
      Title: "",
      Description: "",
    },
    shouldUnregister: false,
  });

  async function onSubmit(values: z.infer<typeof TopicCreateSchema>) {
    try {
      await createTopic.mutateAsync(values);
      setOpen(false);
      form.reset();
      void queryClient.refetchQueries([["topic", "getTopics"]]);
    } catch (err) {
      if (err instanceof TRPCClientError) {
        // * Infer the error type from the schema
        const errors = err?.data?.zodError as inferFlattenedErrors<
          typeof TopicCreateSchema
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

  if (createTopic.isLoading) {
    return <p className="text-center font-semibold">Loading...</p>;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Topic</Button>
      </DialogTrigger>
      <DialogContent>
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
            <Button type="submit">Create Topic</Button>
          </form>
          <FormMessage key={"root"}>
            {form.formState.errors.root?.message}
          </FormMessage>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
