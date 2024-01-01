import { z } from "zod";
import { env } from "~/env";

/**
 * Schema for a topic get request
 */
export const TopicGetSchema = z
  .object({
    limit: z
      .number()
      .min(1)
      .max(env.NEXT_PUBLIC_MAX_TOPICS_PER_USER)
      .optional(), // The maximum number of topics to return
    lastEvaluatedKey: z
      .object({
        User_ID: z.string(),
        Topic_ID: z.string(),
      })
      .nullable(), // Effectively a cursor for dynamo db, points to the last item in the previous query
  })
  .nullable()
  .optional();

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

/**
 * Schema for an individual topic in a topic get response
 */
export const TopicItemSchema = z.object({
  User_ID: z.string(), // The user that this topic belongs to, partition key in the database
  Topic_ID: z.string(), // The unique ID of this topic, sort key in the database
  Title: z.string().min(1),
  Description: z.string().optional(),
});

/**
 * Schema for a TopicSessionSpan:
 * This object represents a single span of time the user was actively working on this topic
 * The session spans are used to calculate the session duration
 * When the user pauses, the session span is ended and a new one is created when the user resumes
 */
export const TopicSessionSpanSchema = z.object({
  Topic_ID: z.string(),
  Session_ID: z.string(),
  Start: z.date(),
  End: z.date().optional(),
});

/**
 * Schema for a TopicSession:
 * This object represents the metadata of a specific topic session:
 * Things such as:
 *
 * SessionDuration: The time the user was actively working on this topic
 * SessionSpans: The times the user was actively working on this topic (not paused)
 *
 *
 *
 */
export const TopicSessionSchema = z.object({
  User_ID: z.string(), // The user that this session is for, partition key in the database
  TopicSession_ID: z.string(), // The unique ID of this Topic Session, sort key in the database
  SessionStart: z.date(), // The time the user started this session, this is a GSI sort key
  Topic_ID: z.string(), // The topic that this session is for
  SessionDuration: z.number(), // The total time the user was actively working on this topic (sums up the session spans)
  SessionSpans: z.array(TopicSessionSpanSchema),
});
