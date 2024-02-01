import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    CLERK_SECRET_KEY: z.string(),
    DYNAMO_DB_REGION: z.string(),
    AMAZON_ACCESS_KEY_ID: z.string(),
    AMAZON_SECRET_ACCESS_KEY: z.string(),
    // Table name in dynamo db for prod and test
    DYNAMO_DB_TABLE_NAME: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
    NEXT_PUBLIC_MAX_TOPICS_PER_USER: z.number().min(0).max(1000),
    NEXT_PUBLIC_DEPLOYMENT_URL: z.string().url(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    // Public env vars
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_MAX_TOPICS_PER_USER: parseInt(process.env.NEXT_PUBLIC_MAX_TOPICS_PER_USER ?? '0'),
    NEXT_PUBLIC_DEPLOYMENT_URL: process.env.NEXT_PUBLIC_DEPLOYMENT_URL,

    // Private env vars
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    DYNAMO_DB_REGION: process.env.DYNAMO_DB_REGION,
    DYNAMO_DB_TABLE_NAME: process.env.DYNAMO_DB_TABLE_NAME,
    NODE_ENV: process.env.NODE_ENV,
    AMAZON_ACCESS_KEY_ID: process.env.AMAZON_ACCESS_KEY_ID,
    AMAZON_SECRET_ACCESS_KEY: process.env.AMAZON_SECRET_ACCESS_KEY,


    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
