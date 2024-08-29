// src/env.mjs
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  /*
   * Serverside Environment variables, not available on the client.
   * Will throw if you access these variables on the client.
   */
  server: {
    BUILD_MODE: z.boolean(),
    APP_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(32),

    SMTP_HOST: z.string().min(1),
    SMTP_PORT: z.string().min(1),
    SMTP_USER: z.string().min(1),
    SMTP_PASS: z.string().min(1),

    STRIPE_MONERO_SECRET_KEY: z.string().min(1),
    STRIPE_MONERO_WEBHOOK_SECRET: z.string().min(1),
    STRIPE_FIRO_SECRET_KEY: z.string().min(1),
    STRIPE_FIRO_WEBHOOK_SECRET: z.string().min(1),
    STRIPE_PRIVACY_GUIDES_SECRET_KEY: z.string().min(1),
    STRIPE_PRIVACY_GUIDES_WEBHOOK_SECRET: z.string().min(1),
    STRIPE_GENERAL_SECRET_KEY: z.string().min(1),
    STRIPE_GENERAL_WEBHOOK_SECRET: z.string().min(1),

    KEYCLOAK_URL: z.string().url(),
    KEYCLOAK_CLIENT_ID: z.string().min(1),
    KEYCLOAK_CLIENT_SECRET: z.string().min(1),
    KEYCLOAK_REALM_NAME: z.string().min(1),

    BTCPAY_URL: z.string().url(),
    BTCPAY_API_KEY: z.string().min(1),
    BTCPAY_MONERO_STORE_ID: z.string().min(1),
    BTCPAY_MONERO_WEBHOOK_SECRET: z.string().min(1),
    BTCPAY_FIRO_STORE_ID: z.string().min(1),
    BTCPAY_FIRO_WEBHOOK_SECRET: z.string().min(1),
    BTCPAY_PRIVACY_GUIDES_STORE_ID: z.string().min(1),
    BTCPAY_PRIVACY_GUIDES_WEBHOOK_SECRET: z.string().min(1),
    BTCPAY_GENERAL_STORE_ID: z.string().min(1),
    BTCPAY_GENERAL_WEBHOOK_SECRET: z.string().min(1),

    SES_VERIFIED_SENDER: z.string().email(),
  },
  /*
   * Environment variables available on the client (and server).
   *
   * 💡 You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
   */
  client: {
    NEXT_PUBLIC_MONERO_APPLICATION_RECIPIENT: z.string().email(),
    NEXT_PUBLIC_FIRO_APPLICATION_RECIPIENT: z.string().email(),
    NEXT_PUBLIC_PRIVACY_GUIDES_APPLICATION_RECIPIENT: z.string().email(),
    NEXT_PUBLIC_GENERAL_APPLICATION_RECIPIENT: z.string().email(),
  },
  /*
   * Due to how Next.js bundles environment variables on Edge and Client,
   * we need to manually destructure them to make sure all are included in bundle.
   *
   * 💡 You'll get type errors if not all variables from `server` & `client` are included here.
   */
  runtimeEnv: {
    BUILD_MODE: !!process.env.BUILD_MODE,
    APP_URL: process.env.APP_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,

    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SES_VERIFIED_SENDER: process.env.SES_VERIFIED_SENDER,

    STRIPE_MONERO_SECRET_KEY: process.env.STRIPE_MONERO_SECRET_KEY,
    STRIPE_MONERO_WEBHOOK_SECRET: process.env.STRIPE_MONERO_WEBHOOK_SECRET,
    STRIPE_FIRO_SECRET_KEY: process.env.STRIPE_FIRO_SECRET_KEY,
    STRIPE_FIRO_WEBHOOK_SECRET: process.env.STRIPE_FIRO_WEBHOOK_SECRET,
    STRIPE_PRIVACY_GUIDES_SECRET_KEY: process.env.STRIPE_PRIVACY_GUIDES_SECRET_KEY,
    STRIPE_PRIVACY_GUIDES_WEBHOOK_SECRET: process.env.STRIPE_PRIVACY_GUIDES_WEBHOOK_SECRET,
    STRIPE_GENERAL_SECRET_KEY: process.env.STRIPE_GENERAL_SECRET_KEY,
    STRIPE_GENERAL_WEBHOOK_SECRET: process.env.STRIPE_GENERAL_WEBHOOK_SECRET,

    KEYCLOAK_URL: process.env.KEYCLOAK_URL,
    KEYCLOAK_CLIENT_ID: process.env.KEYCLOAK_CLIENT_ID,
    KEYCLOAK_CLIENT_SECRET: process.env.KEYCLOAK_CLIENT_SECRET,
    KEYCLOAK_REALM_NAME: process.env.KEYCLOAK_REALM_NAME,

    BTCPAY_URL: process.env.BTCPAY_URL,
    BTCPAY_API_KEY: process.env.BTCPAY_API_KEY,
    BTCPAY_MONERO_STORE_ID: process.env.BTCPAY_MONERO_STORE_ID,
    BTCPAY_MONERO_WEBHOOK_SECRET: process.env.BTCPAY_MONERO_WEBHOOK_SECRET,
    BTCPAY_FIRO_STORE_ID: process.env.BTCPAY_FIRO_STORE_ID,
    BTCPAY_FIRO_WEBHOOK_SECRET: process.env.BTCPAY_FIRO_WEBHOOK_SECRET,
    BTCPAY_PRIVACY_GUIDES_STORE_ID: process.env.BTCPAY_PRIVACY_GUIDES_STORE_ID,
    BTCPAY_PRIVACY_GUIDES_WEBHOOK_SECRET: process.env.BTCPAY_PRIVACY_GUIDES_WEBHOOK_SECRET,
    BTCPAY_GENERAL_STORE_ID: process.env.BTCPAY_GENERAL_STORE_ID,
    BTCPAY_GENERAL_WEBHOOK_SECRET: process.env.BTCPAY_GENERAL_WEBHOOK_SECRET,

    NEXT_PUBLIC_MONERO_APPLICATION_RECIPIENT: process.env.NEXT_PUBLIC_MONERO_APPLICATION_RECIPIENT,
    NEXT_PUBLIC_FIRO_APPLICATION_RECIPIENT: process.env.NEXT_PUBLIC_FIRO_APPLICATION_RECIPIENT,
    NEXT_PUBLIC_PRIVACY_GUIDES_APPLICATION_RECIPIENT:
      process.env.NEXT_PUBLIC_PRIVACY_GUIDES_APPLICATION_RECIPIENT,
    NEXT_PUBLIC_GENERAL_APPLICATION_RECIPIENT:
      process.env.NEXT_PUBLIC_GENERAL_APPLICATION_RECIPIENT,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.BUILD_MODE,
})
