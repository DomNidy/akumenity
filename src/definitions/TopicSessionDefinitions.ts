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
