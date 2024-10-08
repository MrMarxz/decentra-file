import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    THIRDWEB_SECRET_KEY: z.string(),
    AUTH_PRIVATE_KEY: z.string(),
    THIRDWEB_ADMIN_PRIVATE_KEY: z.string(),
    IPFS_DOMAIN: z.string(),
    IPFS_API_KEY: z.string(),
    IPFS_API_SECRET: z.string(),
    IPFS_JWT: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
    NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN: z.string(),
    NEXT_PUBLIC_THIRDWEB_CLIENT_ID: z.string(),
    NEXT_PUBLIC_IPFS_DOMAIN: z.string(),
    NEXT_PUBLIC_CONTRACT_ADDRESS: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    THIRDWEB_SECRET_KEY: process.env.THIRDWEB_SECRET_KEY,
    AUTH_PRIVATE_KEY: process.env.AUTH_PRIVATE_KEY,
    THIRDWEB_ADMIN_PRIVATE_KEY: process.env.THIRDWEB_ADMIN_PRIVATE_KEY,
    NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN: process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN,
    NEXT_PUBLIC_THIRDWEB_CLIENT_ID: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
    IPFS_DOMAIN: process.env.IPFS_DOMAIN,
    IPFS_API_KEY: process.env.IPFS_API_KEY,
    IPFS_API_SECRET: process.env.IPFS_API_SECRET,
    IPFS_JWT: process.env.IPFS_JWT,
    NEXT_PUBLIC_IPFS_DOMAIN: process.env.NEXT_PUBLIC_IPFS_DOMAIN,
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
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
