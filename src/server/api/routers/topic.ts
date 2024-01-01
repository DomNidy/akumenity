import {
  TopicCreateSchema,
  TopicGetSchema,
  TopicItemSchema,
} from "src/definitions/TopicDefinitions";
import { ddbDocClient } from "~/server/db";

import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { TRPCClientError } from "@trpc/client";
import { randomUUID } from "crypto";
import { TRPCError } from "@trpc/server";
import { ZodError, ZodIssueCode } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const topicRouter = createTRPCRouter({
  getTopics: protectedProcedure
    .input(TopicGetSchema)
    .query(async ({ ctx, input }) => {
      try {
        console.log(input);
        // Create a request to get the user's topics and send it
        const res = await ddbDocClient.send(
          new QueryCommand({
            TableName: "Topic",
            KeyConditionExpression: "User_ID = :user_id",
            ExpressionAttributeValues: {
              ":user_id": ctx.session?.userId,
            },
            ConsistentRead: false,
            Limit: input?.limit ? input.limit + 1 : undefined,

            ExclusiveStartKey: input?.lastEvaluatedKey
              ? { User_ID: input?.lastEvaluatedKey }
              : undefined,
          }),
        );

        // Format the response
        const formattedResponse =
          res.Items?.reduce(
            (acc: Zod.TypeOf<typeof TopicItemSchema>[], topic) => {
              const formattedTopic = {
                Topic_ID: topic.Topic_ID as string,
                User_ID: topic.User_ID as string,
                Title: topic.Title as string,
                Description: topic.Description as string | undefined,
              };

              // Parse each topic to ensure it is valid
              const parseResult = TopicItemSchema.safeParse(formattedTopic);

              // Only add the topic to response array if it passes validation
              if (parseResult.success) {
                acc.push(formattedTopic);
              } else {
                // Log the errors if the topic fails validation
                console.error(
                  "Topic failed validation in request to get topics for user with id",
                  ctx.session?.userId,
                );
                console.error("Errors:");
                parseResult.error?.errors.forEach((err) => {
                  console.error(err);
                });
              }
              return acc;
            },
            [],
          ) ?? undefined;

        // Only include lastEvaluatedKey if there are more topics to get
        const lastKey =
          input?.limit &&
          res.Count &&
          res.Count >= input.limit + 1 &&
          res.LastEvaluatedKey
            ? (res.LastEvaluatedKey as { Topic_ID: string; User_ID: string })
            : null;

        return {
          topics: formattedResponse?.slice(0, input?.limit ?? undefined),
          lastEvaluatedKey: lastKey,
        };
      } catch (err) {
        console.error(err);
        throw new TRPCClientError("Failed to get topics");
      }
    }),
  createTopic: protectedProcedure
    .input(TopicCreateSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const findTopics = new QueryCommand({
          TableName: "Topic",
          KeyConditionExpression: "User_ID = :user_id",
          ExpressionAttributeValues: {
            ":user_id": ctx.session?.userId,
          },
          ProjectionExpression: "Title",
          ConsistentRead: true,
        });

        // Run the query to find duplicates
        const topics = await ddbDocClient.send(findTopics);

        // TODO: Figure out how/when topics.Count can be undefined
        if (
          !!topics.Count &&
          topics.Count >= parseInt(process.env.MAX_TOPICS_PER_USER ?? "50")
        ) {
          const mockedError = new TRPCError({
            code: "BAD_REQUEST",
            message: "You have reached the maximum number of topics",
            cause: new ZodError([
              {
                code: ZodIssueCode.custom,
                path: ["form"],
                message: `You have ${topics.Count} topics, the maximum is ${process.env.MAX_TOPICS_PER_USER}. Please delete some topics and try again.`,
              },
            ]),
          });
          throw mockedError;
        }

        // Try to find duplicates from the earlier query
        const duplicateTitleExists = topics.Items?.some(
          (topic) => topic.Title === input.Title,
        );

        if (duplicateTitleExists) {
          // Mock a zod validation error so we can include the "duplicate exists" error message
          const mockedError = new TRPCError({
            code: "BAD_REQUEST",
            message: "Topic with that title already exists",
            cause: new ZodError([
              {
                code: ZodIssueCode.invalid_literal,
                path: ["Title"],
                message: "Topic with that title already exists",
                expected: "unique string",
                received: "non-unique string",
              },
            ]),
          });
          throw mockedError;
        }

        const topicToCreate = TopicCreateSchema.safeParse({
          Topic_ID: randomUUID(),
          User_ID: ctx.session?.userId,
          Title: input.Title,
          Description: input.Description,
        });

        if (!topicToCreate.success) {
          console.log("Failed to create topic");
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Failed to create topic",
            cause: topicToCreate.error,
          });
        }

        // Create a request to create a topic and send it
        const command = new PutCommand({
          TableName: "Topic",
          Item: {
            Topic_ID: randomUUID(),
            User_ID: ctx.session?.userId,
            Title: topicToCreate.data.Title,
            Description: topicToCreate.data.Description,
          },
        });

        await ddbDocClient.send(command);

        return { success: true };
      } catch (err) {
        console.error(err);

        if (err instanceof TRPCError) {
          throw err;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create topic, please try again",
          cause: err,
        });
      }
    }),

  // TODO: Implement editTopic
  // editTopic: protectedProcedure.input(TopicItemSchema).mutation(async () => {}),

  //TODO: Implement deleteTopic
  // deleteTopic: protectedProcedure.input(TopicItemSchema).mutation(async () => {}),
});
