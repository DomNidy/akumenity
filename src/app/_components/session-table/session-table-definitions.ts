import type { z } from "zod";
import type { dbConstants } from "~/definitions/dbConstants";

export type SessionTableItem = {
  topicSessionId: string;
  topicColorCode: z.infer<
    typeof dbConstants.itemTypes.topic.itemSchema.shape.ColorCode
  >;
  topicName: string;
  sessionStartMS: number;
  sessionEndMS: number;
  sessionDurationMS: number;
};
