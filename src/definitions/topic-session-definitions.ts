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
        .max(128)
        .optional(),
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
