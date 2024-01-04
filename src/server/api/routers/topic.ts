import {
  TopicCreateSchema,
  TopicDeleteSchema,
  TopicGetSchema,
  TopicUpdateSchema,
} from "src/definitions/TopicDefinitions";
import { ddbDocClient } from "~/server/db";

import {
  BatchWriteCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { TRPCClientError } from "@trpc/client";
import { randomUUID } from "crypto";
import { TRPCError } from "@trpc/server";
import { ZodError, ZodIssueCode, type z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { dbConstants } from "~/definitions/dbConstants";
import { chunkArray } from "~/lib/utils";

export const topicRouter = createTRPCRouter({
  getTopics: protectedProcedure
    .input(TopicGetSchema)
    .query(async ({ ctx, input }) => {
      try {
        console.log(input);
        // Create a request to get the user's topics and send it
        const res = await ddbDocClient.send(
          new QueryCommand({
            TableName: dbConstants.tables.topic.tableName,
            KeyConditionExpression: `${dbConstants.tables.topic.partitionKey} = :user_id`,
            ExpressionAttributeValues: {
              ":user_id": ctx.session?.userId,
            },
            ConsistentRead: false,
            Limit: input?.limit ? input.limit : undefined,

            ExclusiveStartKey: input?.cursor ? { ...input.cursor } : undefined,
          }),
        );

        // Format the response
        const formattedResponse =
          res.Items?.reduce(
            (
              acc: Zod.TypeOf<typeof dbConstants.itemTypes.topic.itemSchema>[],
              topic,
            ) => {
              const formattedTopic = {
                Topic_ID: topic.Topic_ID as string,
                User_ID: topic.User_ID as string,
                Title: topic.Title as string,
                Description: topic.Description as string | undefined,
              } as z.infer<typeof dbConstants.itemTypes.topic.itemSchema>;

              // Parse each topic to ensure it is valid
              const parseResult =
                dbConstants.itemTypes.topic.itemSchema.safeParse(
                  formattedTopic,
                );

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

        // if the count is greater than the limit, there are more topics to get, otherwise dont return a cursor
        const lastKey =
          input?.limit &&
          res.Count &&
          res.Count >= input.limit &&
          res.LastEvaluatedKey
            ? (res.LastEvaluatedKey as { Topic_ID: string; User_ID: string })
            : null;

        return {
          topics: formattedResponse,
          cursor: lastKey,
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
          TableName: dbConstants.tables.topic.tableName,
          KeyConditionExpression: `${dbConstants.tables.topic.partitionKey} = :user_id`,
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

        // Parse the input to ensure it matches the schema
        const topicToCreate = dbConstants.itemTypes.topic.itemSchema.safeParse({
          User_ID: ctx.session?.userId,
          Topic_ID: `${dbConstants.itemTypes.topic.typeName}${randomUUID()}`,
          Title: `${input.Title}`,
          Description: input.Description,
        });

        // Handle schema validation errors
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
          Item: topicToCreate.data,
        });

        //* Send the request to create the topic
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

  // TODO: Implement updateTopic
  updateTopic: protectedProcedure
    .input(TopicUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Parse the input to ensure it matches the schema
        const topicToUpdate = dbConstants.itemTypes.topic.itemSchema.safeParse({
          User_ID: ctx.session?.userId,
          Topic_ID: input.Topic_ID,
          Title: input.Title,
          Description: input.Description,
        });

        // Handle schema validation errors
        if (!topicToUpdate.success) {
          console.log("Failed to update topic");

          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Failed to update topic",
            cause: topicToUpdate.error,
          });
        }

        // Create a request to update the topic and send it
        const command = new UpdateCommand({
          TableName: dbConstants.tables.topic.tableName,
          Key: {
            User_ID: ctx.session?.userId,
            Topic_ID: input.Topic_ID,
          },
          AttributeUpdates: {
            Title: {
              Action: "PUT",
              Value: input.Title,
            },
            Description: {
              Action: "PUT",
              Value: input.Description,
            },
          },
        });

        //* Send the request to update the topic
        const updateResult = await ddbDocClient.send(command);
        console.log(JSON.stringify(updateResult));

        return { success: true };
      } catch (err) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update topic, please try again",
          cause: err,
        });
      }
    }),

  deleteTopic: protectedProcedure
    .input(TopicDeleteSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Create a request to delete the topic
        const topicIDChunks = chunkArray(input.Topic_IDS, 25);

        // Send a batch of 25 delete requests at a time
        for (const chunk of topicIDChunks) {
          // Create the delete requests from the topic ids
          const deleteRequests = chunk.map((topicID) => ({
            DeleteRequest: {
              Key: {
                User_ID: ctx.session?.userId,
                Topic_ID: topicID,
              },
            },
          }));

          // Create the batched request
          const command = new BatchWriteCommand({
            RequestItems: {
              Topic: deleteRequests,
            },
          });

          //* Send a the batched request to delete the topic
          await ddbDocClient.send(command);
        }

        return { success: true };
      } catch (err) {
        console.error(err);
        throw new TRPCClientError("Failed to delete topic");
      }
    }),
});
