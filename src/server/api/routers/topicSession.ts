import { TopicSessionCreateSchema } from "~/definitions/TopicSessionDefinitions";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dbConstants } from "~/definitions/dbConstants";
import { TRPCError } from "@trpc/server";
import { type z } from "zod";
import { ddbDocClient } from "~/server/db";
import { randomUUID } from "crypto";

export const topicSessionRouter = createTRPCRouter({
  // TODO: Implement this, it should efficiently return an active topic session for a user, if one exists.
  // TODO: If no active topic session exists, it should return null.
  // * Use the GSI to efficiently query for active topic sessions for a user, return the topic session if one exists (that is active  )
  getActiveTopicSession: protectedProcedure.query(async ({ ctx }) => {
    try {
      const queryCommand = new QueryCommand({
        KeyConditionExpression: `PK = :pk and begins_with(SK, :sk)`,
        FilterExpression: `Session_Status = :sessionStatus`,
        ConsistentRead: true, // * This is required because if we do not use consistent reads, we may incorrectly assume the user does not have an active topic session when they do
        ExpressionAttributeValues: {
          ":pk": `${ctx.session.userId}`,
          ":sk": `${dbConstants.itemTypes.topicSession.typeName}`,
          ":sessionStatus":
            "active" as (typeof dbConstants.itemTypes.topicSession.itemSchema.shape.Session_Status._def)["values"][number],
        },
        TableName: dbConstants.tables.topic.tableName,
    
      });

      console.log("queryCommand", queryCommand);
      const result = await ddbDocClient.send(queryCommand);

      console.log("result", result);

      return result?.Items?.at(0) ?? null;
    } catch (err) {
      console.error(err);
      if (err instanceof TRPCError) {
        throw err;
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get active topic session, please try again",
        cause: err,
      });
    }
  }),

  createTopicSession: protectedProcedure
    .input(TopicSessionCreateSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Ensure that an active topic session does not already exist before creating a new one

        // Create the query command to check if an active topic session already exists
        const queryCommand = new QueryCommand({
          KeyConditionExpression: `PK = :pk and begins_with(SK, :sk)`,
          FilterExpression: `Session_Status = :sessionStatus`,

          ConsistentRead: true, // * This is required because if we do not use consistent reads, we may incorrectly assume the user does not have an active topic session when they do
          ExpressionAttributeValues: {
            ":pk": `${ctx.session.userId}`,
            ":sk": `${dbConstants.itemTypes.topicSession.typeName}`,
            ":sessionStatus":
              "active" as (typeof dbConstants.itemTypes.topicSession.itemSchema.shape.Session_Status._def)["values"][number],
          },
          TableName: dbConstants.tables.topic.tableName,
        });

        const activeTopicSessionAlreadyExists = await ddbDocClient
          .send(queryCommand)
          .then((result) => result.Items?.length !== 0);

        console.log(
          "activeTopicSessionAlreadyExists",
          activeTopicSessionAlreadyExists,
        );
        if (activeTopicSessionAlreadyExists) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "An active topic session already exists for this user, please end it before creating a new one",
          });
        }

        // Get title of the topic using its topic id
        const topicTitle = await ddbDocClient.send(
          new GetCommand({
            Key: {
              PK: `${ctx.session.userId}`,
              SK: `${input.Topic_ID}`,
            },
            AttributesToGet: ["Title"],
            TableName: dbConstants.tables.topic.tableName,
          }),
        );

        // Create the topicSession object locally so we can parse it with zod to ensure it is valid
        const topicSession = {
          PK: `${ctx.session.userId}`,
          SK: `${dbConstants.itemTypes.topicSession.typeName}${randomUUID()}`,
          Session_End: null,
          Session_Start: Date.now(),
          Session_Status: "active",
          Topic_ID: input.Topic_ID,
          Topic_Title: topicTitle.Item?.Title as string,
          [dbConstants.tables.topic.GSI1.partitionKey]: input.Topic_ID,
          [dbConstants.tables.topic.GSI1.sortKey]: Date.now(),
        } as z.infer<typeof dbConstants.itemTypes.topicSession.itemSchema>;

        // Validate the topic session object
        dbConstants.itemTypes.topicSession.itemSchema.parse(topicSession);

        // Create the command to put the topic session in the database
        const command = new PutCommand({
          Item: topicSession,
          TableName: dbConstants.tables.topic.tableName,
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
          message: "Failed to create topic session, please try again",
          cause: err,
        });
      }
    }),

  endTopicSession: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      // Create the query command to find the active topic session for the user
      const queryCommand = new QueryCommand({
        KeyConditionExpression: `PK = :pk and begins_with(SK, :sk)`,
        FilterExpression: `Session_Status = :sessionStatus`,
        ConsistentRead: true, // * This is required because if we do not use consistent reads, we may incorrectly assume the user does not have an active topic session when they do
        ExpressionAttributeValues: {
          ":pk": `${ctx.session.userId}`,
          ":sk": `${dbConstants.itemTypes.topicSession.typeName}`,
          ":sessionStatus":
            "active" as (typeof dbConstants.itemTypes.topicSession.itemSchema.shape.Session_Status._def)["values"][number],
        },
        TableName: dbConstants.tables.topic.tableName,
      });

      const activeTopicSession = await ddbDocClient
        .send(queryCommand)
        .then((result) => result.Items?.at(0));

      if (!activeTopicSession) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No active topic session exists.",
        });
      }

      // Create the update command to end the topic session
      const updateCommand = new PutCommand({
        Item: {
          ...activeTopicSession,
          Session_End: Date.now(),
          Session_Status:
            "stopped" as (typeof dbConstants.itemTypes.topicSession.itemSchema.shape.Session_Status._def)["values"][number],
        },
        TableName: dbConstants.tables.topic.tableName,
      });

      await ddbDocClient.send(updateCommand);

      return { success: true };
    } catch (err) {
      console.error(err);
      if (err instanceof TRPCError) {
        throw err;
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to end topic session, please try again",
        cause: err,
      });
    }
  }),
});
