import { postRouter } from "~/server/api/routers/post";
import { createTRPCRouter } from "~/server/api/trpc";
import { topicRouter } from "./routers/topic";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  topic: topicRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
