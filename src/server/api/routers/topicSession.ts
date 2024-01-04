import { createTRPCRouter, protectedProcedure } from "../trpc";

export const topicSessionRouter = createTRPCRouter({
  // TODO: Implement this, it should efficiently return an active topic session for a user, if one exists.
  // TODO: If no active topic session exists, it should return null.
  // * Use the GSI to efficiently query for active topic sessions for a user
  //   getActiveTopicSession: protectedProcedure
  //     .input()
  //     .query(async ({ ctx, input }) => {}),
});
