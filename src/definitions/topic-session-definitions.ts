import { z } from "zod";
import { dbConstants } from "./dbConstants";

/**
 * Schema for a topic session create request
 */
export const TopicSessionCreateSchema = z.object({
  Topic_ID: z
    .string()
    .startsWith(dbConstants.itemTypes.topic.typeName)
    .min(1)
    .max(128), // The id of the topic to create a session for
});

/**
 * Schema for a get topic session request
 */
export const TopicSessionGetSchema = z.object({
  // The time range which we want to retrieve topic sessions for
  dateRange: z
    .object({
      startTimeMS: z.number().min(0).optional(),
      endTimeMS: z.number().min(0).optional(),
    })
    .refine(
      (times) => {
        // Ensure that the start time is before the end time
        if (times.startTimeMS && times.endTimeMS) {
          return times.startTimeMS < times.endTimeMS;
        }

        return true;
      },
      { message: "Start time must be before end time" },
    ),

  // The topics that we should retrieve sessions for, if undefined then we will retrieve sessions for all topics (that are owned by the user)
  topicIDS: z
    .array(
      z
        .string()
        .startsWith(dbConstants.itemTypes.topic.typeName)
        .min(1)
        .max(128),
    )
    .optional(),
});

export const TopicSessionGetSessionsForTopicSchema = z.object({
  dateRange: z.object({
    startTimeMS: z.number().min(0).optional(),
    endTimeMS: z.number().min(0).optional(),
  }),
  Topic_ID: z
    .string()
    .startsWith(dbConstants.itemTypes.topic.typeName)
    .min(1)
    .max(128),
});

// Schema for topic session update
export const TopicSessionUpdateSchema = z.object({
  // The id of the topic session to update
  TopicSession_ID: z
    .string()
    .startsWith(dbConstants.itemTypes.topicSession.typeName)
    .min(1)
    .max(128),
  // The data that we should update to
  updatedFields: z
    .object({
      // Changing the id causes the topic session to be associated with a different topic
      Topic_ID: z
        .string()
        .startsWith(dbConstants.itemTypes.topic.typeName)
        .min(1)
        .max(128),
      startTimeMS: z.coerce.number().min(0).optional(),
      endTimeMS: z.coerce.number().min(0).optional(),
    })
    .refine(
      (data) => {
        // Ensure that the start time is before the end time
        if (data.startTimeMS && data.endTimeMS) {
          return data.startTimeMS < data.endTimeMS;
        }

        return true;
      },
      {
        message: "Start time must be before end time",
      },
    )
    .refine(
      (data) => {
        // Ensure that the end time would not cause the session to be longer than the maximum allowed duration
        if (data.startTimeMS && data.endTimeMS) {
          // Max duration is 30 days
          return data.endTimeMS - data.startTimeMS <= 1000 * 60 * 60 * 24 * 30;
        }
      },
      {
        message: "Session duration cannot be longer than 30 days",
      },
    ),
});

export const TopicSessionCreateNotActiveSchema = z
  .object({
    Topic_ID: z
      .string()
      .startsWith(dbConstants.itemTypes.topic.typeName, "Invalid Topic")
      .min(1)
      .max(128), // The id of the topic to create a session for
    startTimeMS: z.coerce.number().min(0),
    endTimeMS: z.coerce.number().min(0),
  })
  .refine(
    (data) => {
      // Ensure that the start time is before the end time
      return data.startTimeMS < data.endTimeMS;
    },
    { message: "Start time must be before end time", path: ["startTimeMS"] },
  )
  .refine(
    (data) => {
      // Ensure that the end time would not cause the session to be longer than the maximum allowed duration
      return data.endTimeMS - data.startTimeMS <= 1000 * 60 * 60 * 24 * 30;
    },
    {
      message: "Session duration cannot be longer than 30 days",
      path: ["endTimeMS"],
    },
  );

// Request payload schema for getting paginated topic sessions
export const TopicSessionGetPaginatedRequest = z.object({
  cursor: z
    .object({
      User_ID: z.string(),
      TopicSession_ID: z.string(),
    })
    .nullish(),
  limit: z.number().min(1).max(100).optional(),
});

// Request payload schema for a bulk topic session delete
export const TopicSessionBulkDeleteSchema = z.object({
  TopicSession_IDs: z
    .array(
      z
        .string()
        .startsWith(dbConstants.itemTypes.topicSession.typeName)
        .min(1)
        .max(128),
    )
    .min(1, "Must provide at least one topic session to delete")
    .max(5, "Cannot delete more than 5 topic sessions at once"),
});
