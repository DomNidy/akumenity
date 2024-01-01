import { authMiddleware } from "@clerk/nextjs/server";

export default authMiddleware({
  // Clerk will not run at all on these routes
  // ignoredRoutes: [],

  // Clerk will run on these routes, but are still public
  publicRoutes: ["/", "api/trpc"],

  // Clerk will 401 unauthorized requests to these routes
  apiRoutes: ["/api/topic"],

  debug: true,
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
