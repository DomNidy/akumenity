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
        KeyConditionExpression: "PK = :pk and begins_with(SK, :sk)",
        ExpressionAttributeValues: {
          ":pk": `${ctx.session.userId}`,
          ":sk": `${dbConstants.itemTypes.topicSession.typeName}`,
        },
        TableName: dbConstants.tables.topic.tableName,
        Limit: 1,
      });

      const result = await ddbDocClient.send(queryCommand);
      console.log(JSON.stringify(result));

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

        console.log(topicTitle.Item, "topic title");
        console.log(
          JSON.stringify({
            PK: `${ctx.session.userId}`,
            SK: `${dbConstants.itemTypes.topic.typeName}${input.Topic_ID}`,
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
});
