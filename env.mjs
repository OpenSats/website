// src/env.mjs
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  /*
   * Serverside Environment variables, not available on the client.
   * Will throw if you access these variables on the client.
   */
  server: {
    STRIPE_SECRET_KEY: z.string().min(1),
    KEYCLOAK_CLIENT_ID: z.string().min(1),
    KEYCLOAK_CLIENT_SECRET: z.string().min(1),
    KEYCLOAK_REALM_NAME: z.string().min(1),
    BTCPAY_URL: z.string().min(1),
    BTCPAY_STORE_ID: z.string().min(1),
    BTCPAY_API_KEY: z.string().min(1),
    SENDGRID_RECIPIENT: z.string().min(1),
    SENDGRID_VERIFIED_SENDER: z.string().min(1),
    SENDGRID_API_KEY: z.string().min(1),
  },
  /*
   * Environment variables available on the client (and server).
   *
   * 💡 You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
   */
  client: {
    // NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  },
  /*
   * Due to how Next.js bundles environment variables on Edge and Client,
   * we need to manually destructure them to make sure all are included in bundle.
   *
   * 💡 You'll get type errors if not all variables from `server` & `client` are included here.
   */
  runtimeEnv: {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    KEYCLOAK_CLIENT_ID: process.env.KEYCLOAK_CLIENT_ID,
    KEYCLOAK_CLIENT_SECRET: process.env.KEYCLOAK_CLIENT_SECRET,
    KEYCLOAK_REALM_NAME: process.env.KEYCLOAK_REALM_NAME,
    BTCPAY_URL: process.env.BTCPAY_URL,
    BTCPAY_STORE_ID: process.env.BTCPAY_STORE_ID,
    BTCPAY_API_KEY: process.env.BTCPAY_API_KEY,
    SENDGRID_RECIPIENT: process.env.SENDGRID_RECIPIENT,
    SENDGRID_VERIFIED_SENDER: process.env.SENDGRID_VERIFIED_SENDER,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  },
})
