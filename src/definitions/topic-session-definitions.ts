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
