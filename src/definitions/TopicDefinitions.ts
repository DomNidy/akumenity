import { z } from "zod";
import { env } from "~/env";

/**
 * Schema for a topic get request
 */
export const TopicGetSchema = z.object({
  limit: z.number().min(1).max(env.NEXT_PUBLIC_MAX_TOPICS_PER_USER).optional(), // The maximum number of topics to return
  cursor: z
    .object({
      User_ID: z.string(),
      Topic_ID: z.string(),
    })
    .nullish(), // Effectively a cursor for dynamo db, points to the last item in the previous query
});

/**
 * Schema for a topic delete request
 */
export const TopicDeleteSchema = z.object({
  Topic_IDS: z
    .array(z.string().min(1).max(128))
    .min(1, "At least 1 Topic ID is required for a delete request.")
    .max(50, "Cannot delete more than 50 topics at once."), // The ids of the topic to delete
});

/**
 * Schema for a topic create request
 */
export const TopicCreateSchema = z.object({
  Title: z
    .string()
    .min(1, "Must be at least 1 character long")
    .max(128, "Maximum length is 128 characters"),
  Description: z
    .string()
    .max(256, "Maximum length is 256 characters")
    .optional(),
});
