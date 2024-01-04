import { z } from "zod";

// Define the names of different types of items we can store in the database
export const dbConstantsTypeNames = {
  topic: "Topic_",
  topicSession: "TopicSession_",
  topicSessionSpan: "TopicSessionSpan_",
} as const;

// Define constants used in db tables
export const dbConstants = {
  // The names of the tables in dynamo db
  tables: {
    topic: { tableName: "Topic", partitionKey: "User_ID", sortKey: "Topic_ID" },
  },
  // The different types of items we can store in the database
  itemTypes: {
    topic: {
      typeName: dbConstantsTypeNames.topic,
      itemSchema: z.object({
        User_ID: z.string(), //* Partition key, The user that this topic belongs to
        Topic_ID: z.string().startsWith(dbConstantsTypeNames.topic), //* Sort key, The unique ID of this topic
        Title: z.string().min(1, "Title must be at least 1 character."), // The title of the topic
        Description: z
          .string()
          .max(256, "Description must be at most 256 characters long.")
          .optional(),
      }),
    },
    topicSession: {
      typeName: dbConstantsTypeNames.topicSession,
      itemSchema: z.object({
        User_ID: z.string(), // * Partition key, The user that this session is for
        SessionID: z.string().startsWith(dbConstantsTypeNames.topicSession), // * Sort key, The unique ID of this Topic Session
        Topic_ID: z.string().nullable(), //* GSI partition key, The topic that this session is for, if it is null, the related topic may have been deleted
        SessionStart: z.number(), //* GSI sort key, The time in miliseconds the user started this session
        SessionStatus: z.enum(["active", "paused", "stopped"]), // The status of the session, active means the user is currently working on the topic, paused means the user is not currently working on the topic, but has not stopped the session, stopped means the user has stopped the session
        Topic_Title: z.string(), // The title of the topic that this session is for (effectively snapshotting the topic title at the time of the session start)
        SessionDuration: z.number(), // The total time the user was actively working on this topic (sums up the session spans)
        SessionSpans: z.array(
          z.string().startsWith(dbConstantsTypeNames.topicSessionSpan),
        ), // An array of the session span ids that make up this session
      }),
    },

    topicSessionSpan: {
      typeName: dbConstantsTypeNames.topicSessionSpan,
      itemSchema: z.object({
        User_ID: z.string(), //* Partition key, The user who this session span is for
        SessionSpanID: z
          .string()
          .startsWith(dbConstantsTypeNames.topicSessionSpan), //* Sort key, the unique id of this session span
        Start: z.number(), // The time in miliseconds at which this span started
        Session_ID: z.string(), // The session that this span is for, (maybe create a GSI for this if  we need to query by session id)
        End: z.date().nullable(), // The time at which this span ended, if null, the span is still active
      }),
    },
  },
} as const;
