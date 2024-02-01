import {
  TopicSessionCreateSchema,
  TopicSessionGetSchema,
  TopicSessionGetSessionsForTopicSchema,
  TopicSessionUpdateSchema,
} from "~/definitions/topic-session-definitions";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  BatchGetCommand,
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { dbConstants } from "~/definitions/dbConstants";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { ddbDocClient } from "~/server/db";
import { randomUUID } from "crypto";
import { env } from "~/env";

export const topicSessionRouter = createTRPCRouter({
  // TODO: Implement this, it should efficiently return an active topic session for a user, if one exists.
  // TODO: If no active topic session exists, it should return null.
  // * Use the GSI to efficiently query for active topic sessions for a user, return the topic session if one exists (that is active)
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
        TableName: env.DYNAMO_DB_TABLE_NAME,
      });

      const result = await ddbDocClient.send(queryCommand);

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
          TableName: env.DYNAMO_DB_TABLE_NAME,
        });

        const activeTopicSessionAlreadyExists = await ddbDocClient
          .send(queryCommand)
          .then((result) => result.Items?.length !== 0);

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
            TableName: env.DYNAMO_DB_TABLE_NAME,
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
          [dbConstants.tables.prod.GSI1.partitionKey]: input.Topic_ID,
          [dbConstants.tables.prod.GSI1.sortKey]: Date.now(),
        } as z.infer<typeof dbConstants.itemTypes.topicSession.itemSchema>;

        // Validate the topic session object
        dbConstants.itemTypes.topicSession.itemSchema.parse(topicSession);

        // Create the command to put the topic session in the database
        const command = new PutCommand({
          Item: topicSession,
          TableName: env.DYNAMO_DB_TABLE_NAME,
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
        TableName: env.DYNAMO_DB_TABLE_NAME,
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
        TableName: env.DYNAMO_DB_TABLE_NAME,
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

  getTopicSessionsInDateRange: protectedProcedure
    .input(TopicSessionGetSchema)
    .query(async ({ ctx, input }) => {
      console.log("Getting topic sessions in date range");
      try {
        if (input.dateRange.startTimeMS && input.dateRange.endTimeMS) {
          console.log("Querying for topic sessions within date range:");
          console.log(
            "Start date:",
            new Date(input.dateRange.startTimeMS ?? 0),
            "\nEnd date:",
            new Date(input.dateRange.endTimeMS ?? 0),
          );
        }

        // Query using the table primary key and gsi sort key
        const queryCommand = new QueryCommand({
          TableName: env.DYNAMO_DB_TABLE_NAME,
          KeyConditionExpression: `PK = :pk and begins_with(SK, :sk)`,
          // Get sessions that were started before the end of the date range, but exclude sessions that do not end before the start of the date range
          FilterExpression: `${dbConstants.tables.prod.GSI1.sortKey} < :end and (attribute_type(${dbConstants.itemTypes.topicSession.propertyNames.Session_End}, :null) or ${dbConstants.itemTypes.topicSession.propertyNames.Session_End} > :start)`,
          ExpressionAttributeValues: {
            ":pk": `${ctx.session.userId}`,
            ":sk": `${dbConstants.itemTypes.topicSession.typeName}`,
            ":end": input.dateRange.endTimeMS ?? Date.now(),
            ":start": input.dateRange.startTimeMS ?? 0,
            ":null": "NULL",
          },
          ScanIndexForward: true,
        });

        const result = await ddbDocClient.send(queryCommand);

        // If no sessions exist, return an empty array
        if (!result?.Items?.length) {
          return [];
        }

        // Find the colorcode associated with each topic
        const topicIDS = new Set<string>();
        result?.Items?.forEach((item) => {
          topicIDS.add(item.Topic_ID as string);
        });

        // Get the colorcode for each topic
        const colorCodeQueryCommand = new BatchGetCommand({
          RequestItems: {
            [env.DYNAMO_DB_TABLE_NAME]: {
              Keys: Array.from(topicIDS).map((id) => ({
                PK: `${ctx.session.userId}`,
                SK: id,
              })),
              ProjectionExpression: `${dbConstants.itemTypes.topic.propertyNames.ColorCode}, ${dbConstants.tables.prod.sortKey} `,
            },
          },
        });

        // Send the query to get the colorcodes
        const colorCodeResult = await ddbDocClient.send(colorCodeQueryCommand);

        // Return the sessions with their colorcodes
        const sessions = result.Items?.map((session) => {
          return {
            ...((session?.PK as string) && { PK: session.PK as string }),

            ...((session?.SK as string) && { SK: session.SK as string }),

            ...((session?.Topic_Title as string) && {
              Topic_Title: session.Topic_Title as string,
            }),
            ...((session?.Topic_ID as string) && {
              Topic_ID: session.Topic_ID as string,
            }),
            ...((session?.Session_Start as number) && {
              Session_Start: session.Session_Start as number,
            }),
            ...((session?.Session_End as number) && {
              Session_End: session.Session_End as number,
            }),

            ColorCode:
              (colorCodeResult?.Responses?.[env.DYNAMO_DB_TABLE_NAME]?.find(
                (item) => item.SK === session.Topic_ID,
              )?.ColorCode as string) ?? "blue",
          };
        }) as (z.infer<typeof dbConstants.itemTypes.topicSession.itemSchema> & {
          ColorCode: z.infer<
            typeof dbConstants.itemTypes.topic.itemSchema.shape.ColorCode
          >;
        })[];

        return sessions;
      } catch (err) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get topic time summary, please try again",
          cause: err,
        });
      }
    }),

  // Retrieve all sessions for a topic within a date range
  getSessionsForTopic: protectedProcedure
    .input(TopicSessionGetSessionsForTopicSchema)
    .query(async ({ ctx, input }) => {
      try {
        // Query using GSI partition key
        const getSessionIDSCommand = new QueryCommand({
          IndexName: dbConstants.tables.prod.GSI1.indexName,
          TableName: env.DYNAMO_DB_TABLE_NAME,
          KeyConditionExpression: `${dbConstants.tables.prod.GSI1.partitionKey} = :topicID and ${dbConstants.tables.prod.GSI1.sortKey} BETWEEN :start AND :end`,
          ExpressionAttributeValues: {
            ":topicID": input.Topic_ID,
            ":start": input.dateRange.startTimeMS ?? 0,
            ":end": input.dateRange.endTimeMS ?? Date.now(),
          },
          ScanIndexForward: false,
        });

        // Get a list of topic session ids
        const topicSessionIDS = (
          await ddbDocClient.send(getSessionIDSCommand)
        ).Items?.map((item) => item.SK as string);

        // Return start and end times for each session
        // If a session is ongoing, do not return that session
        // Return all items that match the topic session ids
        const getSessionsCommand = new BatchGetCommand({
          RequestItems: {
            [env.DYNAMO_DB_TABLE_NAME]: {
              Keys: topicSessionIDS?.map((id) => ({
                PK: `${ctx.session.userId}`,
                SK: id,
              })),
              ProjectionExpression: `${dbConstants.itemTypes.topicSession.propertyNames.Session_Start}, 
              ${dbConstants.itemTypes.topicSession.propertyNames.Session_End}, 
              ${dbConstants.itemTypes.topicSession.propertyNames.Topic_Title}, 
              ${dbConstants.itemTypes.topicSession.propertyNames.Topic_ID}`,
            },
          },
        });

        // These returned sessions are:
        // In the date range
        // For the topic
        // Not ongoing
        // Owned by the user who requested them
        const result = await ddbDocClient.send(getSessionsCommand);

        return (
          (result?.Responses?.[env.DYNAMO_DB_TABLE_NAME] as z.infer<
            typeof dbConstants.itemTypes.topicSession.itemSchema
          >[]) ?? []
        );
      } catch (err) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get sessions for topic, please try again",
          cause: err,
        });
      }
    }),
  deleteTopicSession: protectedProcedure
    .input(
      z.object({
        topicSessionId: z.string().min(1).max(128),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Find the topic session
        const getSessionCommand = new GetCommand({
          TableName: env.DYNAMO_DB_TABLE_NAME,
          Key: {
            PK: `${ctx.session.userId}`,
            SK: input.topicSessionId,
          },
        });

        // Get the topic session
        const session = await ddbDocClient.send(getSessionCommand);

        // Ensure that the topic session exists
        if (!session.Item) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Topic session does not exist",
          });
        }

        // Ensure that the topic session belongs to the user
        if (session.Item.PK !== ctx.session.userId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Topic session does not belong to user",
          });
        }

        // Delete the topic session
        const deleteSessionCommand = new DeleteCommand({
          TableName: env.DYNAMO_DB_TABLE_NAME,
          Key: {
            PK: `${ctx.session.userId}`,
            SK: input.topicSessionId,
          },
        });

        await ddbDocClient.send(deleteSessionCommand);
      } catch (err) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete topic session, please try again",
          cause: err,
        });
      }
    }),

  updateTopicSession: protectedProcedure
    .input(TopicSessionUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Find the topic session
        const getSessionCommand = new GetCommand({
          TableName: env.DYNAMO_DB_TABLE_NAME,
          Key: {
            PK: `${ctx.session.userId}`,
            SK: input.TopicSession_ID,
          },
        });

        // Get the topic session
        const session = await ddbDocClient.send(getSessionCommand);

        // Parse the session as a topic session
        const parsedSession =
          dbConstants.itemTypes.topicSession.itemSchema.parse(session.Item);

        // If we're trying to update the session end time, and the session is ongoing, throw an error
        if (
          input.updatedFields.endTimeMS &&
          parsedSession.Session_Status === "active"
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot update the end time of an active session.",
          });
        }

        // Ensure that the topic session exists
        if (!session.Item) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Topic session does not exist",
          });
        }

        // Ensure that the topic session belongs to the user
        if (session.Item.PK !== ctx.session.userId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Topic session does not belong to user",
          });
        }

        // Update the topic session
        const updateSessionCommand = new PutCommand({
          TableName: env.DYNAMO_DB_TABLE_NAME,
          Item: {
            ...session.Item,
            // extract only session start and end times from the updated fields
            ...(input.updatedFields.endTimeMS
              ? { Session_End: input.updatedFields.endTimeMS }
              : {}),

            ...(input.updatedFields.startTimeMS
              ? { Session_Start: input.updatedFields.startTimeMS }
              : {}),
          } as z.infer<typeof dbConstants.itemTypes.topicSession.itemSchema>,
        });

        console.log(updateSessionCommand);

        await ddbDocClient.send(updateSessionCommand);

        return { success: true };
      } catch (err) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update topic session, please try again",
          cause: err,
        });
      }
    }),
});
