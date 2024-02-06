import {
  TopicCreateSchema,
  TopicDeleteSchema,
  TopicGetSchema,
  TopicUpdateSchema,
} from "~/definitions/topic-definitions";
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
import { env } from "~/env";

export const topicRouter = createTRPCRouter({
  getTopics: protectedProcedure
    .input(TopicGetSchema)
    .query(async ({ ctx, input }) => {
      try {
        // Create a request to get the user's topics and send it
        const res = await ddbDocClient.send(
          new QueryCommand({
            TableName: env.DYNAMO_DB_TABLE_NAME,
            KeyConditionExpression: `${dbConstants.tables.prod.partitionKey} = :user_id AND begins_with(${dbConstants.tables.prod.sortKey}, :topic_id)`,
            ExpressionAttributeValues: {
              ":user_id": ctx.session?.userId,
              ":topic_id": dbConstants.itemTypes.topic.typeName,
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
                PK: topic.PK as string,
                SK: topic.SK as string,
                Title: topic.Title as string,
                Description: topic.Description as string | undefined,
                ColorCode: topic.ColorCode as string,
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
            ? res.LastEvaluatedKey
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
        console.log("Creating topic");
        const findTopics = new QueryCommand({
          TableName: env.DYNAMO_DB_TABLE_NAME,
          KeyConditionExpression: `${dbConstants.tables.prod.partitionKey} = :user_id`,
          ExpressionAttributeValues: {
            ":user_id": ctx.session?.userId,
          },
          ProjectionExpression: "Title",
          ConsistentRead: true,
        });

        // Run the query to find duplicates
        const topics = await ddbDocClient.send(findTopics);

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
          PK: ctx.session?.userId,
          SK: `${dbConstants.itemTypes.topic.typeName}${randomUUID()}`,
          Title: `${input.Title}`,
          Description: input.Description,
          ColorCode: "blue",
        } as z.infer<typeof dbConstants.itemTypes.topic.itemSchema>);

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
          TableName: env.DYNAMO_DB_TABLE_NAME,
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

  updateTopic: protectedProcedure
    .input(TopicUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Parse the input to ensure it matches the schema
        const topicToUpdate = TopicUpdateSchema.safeParse({
          Topic_ID: input.Topic_ID,
          Title: input.Title,
          Description: input.Description,
          ColorCode: input.ColorCode,
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
          TableName: env.DYNAMO_DB_TABLE_NAME,
          Key: {
            PK: ctx.session?.userId,
            SK: input.Topic_ID,
          },
          AttributeUpdates: {
            Title: {
              Action: "PUT",
              Value: input.Title,
            },

            ...(input.ColorCode
              ? {
                  ColorCode: {
                    Action: "PUT",
                    Value: input.ColorCode,
                  },
                }
              : {}),

            Description: {
              Action: "PUT",
              Value: input.Description,
            },
          },
        });

        //* Send the request to update the topic
        await ddbDocClient.send(command);

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
                PK: ctx.session?.userId,
                SK: topicID,
              },
            },
          }));

          // Create the batched request
          const command = new BatchWriteCommand({
            RequestItems: {
              [env.DYNAMO_DB_TABLE_NAME]: deleteRequests,
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
