import { z } from "zod";

// Define the names of different types of items we can store in the database
export const dbConstantsTypeNames = {
  topic: "Topic|",
  topicSession: "TopicSession|",
  topicSessionSpan: "TopicSessionSpan|",
  userID: "user_",
} as const;

// Define constants used in db tables
export const dbConstants = {
  // The names of the tables in dynamo db
  tables: {
    prod: {
      partitionKey: "PK",
      sortKey: "SK",
      GSI1: {
        indexName: "GSI1_PK-GSI1_SK-index",
        partitionKey: "GSI1_PK",
        sortKey: "GSI1_SK",
      },
    },
    dev: {
      partitionKey: "PK",
      sortKey: "SK",
      GSI1: {
        indexName: "GSI1_PK-GSI1_SK-index",
        partitionKey: "GSI1_PK",
        sortKey: "GSI1_SK",
      },
    },
  },
  // The different types of items we can store in the database
  itemTypes: {
    topic: {
      typeName: dbConstantsTypeNames.topic,
      itemSchema: z.object({
        PK: z.string().startsWith(dbConstantsTypeNames.userID), //* Partition key, For a topic, this is the user id of the user that created the topic
        SK: z.string().startsWith(dbConstantsTypeNames.topic), //* Sort key, For a topic, this is the unique ID of this topic
        ColorCode: z.enum([
          "red",
          "orange",
          "yellow",
          "green",
          "blue",
          "purple",
          "pink",
          "indigo",
        ]), // The color code of the topic
        Title: z.string().min(1, "Title must be at least 1 character."), // The title of the topic
        Description: z
          .string()
          .max(256, "Description must be at most 256 characters long.")
          .optional(),
      }),
      propertyNames: {
        ColorCode: "ColorCode",
        Title: "Title",
        Description: "Description",
      },
    },
    topicSession: {
      typeName: dbConstantsTypeNames.topicSession,
      itemSchema: z.object({
        PK: z.string().startsWith(dbConstantsTypeNames.userID), // * Partition key, For a topic session, this is the user id of the user that created the topic session
        SK: z.string().startsWith(dbConstantsTypeNames.topicSession), // * Sort key, For a topic session, this is the unique ID of this topic session
        Topic_Title: z.string(), // The title of the topic that this session is for (effectively snapshotting the topic title at the time of the session start)
        Topic_ID: z.string().startsWith(dbConstantsTypeNames.topic), //* GSI partition key The ID of the topic that this session is for (effectively snapshotting the topic ID at the time of the session start)
        Session_Start: z.number(), //* GSI sort key, The time in miliseconds the user started this session
        Session_End: z.number().nullable(), // The time in miliseconds at which this session was stopped, if it is null, the session is still active
        Session_Status: z.enum(["active", "stopped"]), // The status of the session, active means the user is currently working on the topic, paused means the user is not currently working on the topic, but has not stopped the session, stopped means the user has stopped the session
      }),
      propertyNames: {
        Topic_Title: "Topic_Title",
        Topic_ID: "Topic_ID",
        Session_Start: "Session_Start",
        Session_End: "Session_End",
        Session_Status: "Session_Status",
      },
    },
  },
} as const;

// const exampleTopic = {
//   PK: "user_12345",
//   SK: "Topic|ABCDEF",
//   Title: "My Topic",
//   Description: "This is a description of my topic.",
// } as z.infer<typeof dbConstants.itemTypes.topic.itemSchema>;

// const exampleTopicSession = {
//   PK: "user_12345",
//   SK: "TopicSession|ABCDEF",
//   Topic_Title: "My Topic",
//   Topic_ID: "Topic|12349",
//   Session_Start: 161800000000,
//   Session_End: 1620000000000,
//   Session_Status: "active",
// } as z.infer<typeof dbConstants.itemTypes.topicSession.itemSchema>;
