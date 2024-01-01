import { z } from "zod";

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
  Topic_ID: z.string(),
  User_ID: z.string(),
  Title: z.string().min(1),
  Description: z.string().optional(),
});
