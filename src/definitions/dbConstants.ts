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
    topic: {
      tableName: "Akumenity",
      partitionKey: "User_ID",
      sortKey: "ItemType_ID",
    },
  },
  // The different types of items we can store in the database
  itemTypes: {
    topic: {
      typeName: dbConstantsTypeNames.topic,
      itemSchema: z.object({
        User_ID: z.string(), //* Partition key, The user that this topic belongs to
        ItemType_ID: z.string().startsWith(dbConstantsTypeNames.topic), //* Sort key, The unique ID of this topic
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
        ItemType_ID: z.string().startsWith(dbConstantsTypeNames.topicSession), //* Sort key, The topic that this session is for, if it is null, the related topic may have been deleted
        Topic_Title: z.string(), // The title of the topic that this session is for (effectively snapshotting the topic title at the time of the session start)
        Topic_ID: z.string().startsWith(dbConstantsTypeNames.topic), //* GSI partition key The ID of the topic that this session is for (effectively snapshotting the topic ID at the time of the session start)
        Session_Start: z.number(), //* GSI sort key, The time in miliseconds the user started this session
        Session_End: z.number().nullable(), // The time in miliseconds at which this session was stopped, if it is null, the session is still active
        Session_Status: z.enum(["active", "stopped"]), // The status of the session, active means the user is currently working on the topic, paused means the user is not currently working on the topic, but has not stopped the session, stopped means the user has stopped the session
      }),
    },
  },
} as const;
