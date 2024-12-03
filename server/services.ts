import { FundSlug, PrismaClient } from '@prisma/client'
import Stripe from 'stripe'
import KeycloakAdminClient from '@keycloak/keycloak-admin-client'
import nodemailer from 'nodemailer'
import axios from 'axios'

import { env } from '../env.mjs'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'info', 'warn', 'error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

const keycloak = new KeycloakAdminClient({
  baseUrl: env.KEYCLOAK_URL,
  realmName: env.KEYCLOAK_REALM_NAME,
})

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
})

const btcpayApi = axios.create({
  baseURL: `${env.BTCPAY_URL}/api/v1/stores/${env.BTCPAY_STORE_ID}`,
  headers: { Authorization: `token ${env.BTCPAY_API_KEY}` },
})

const strapiApi = axios.create({
  baseURL: `${env.STRAPI_API_URL}`,
  headers: { Authorization: `Bearer ${env.STRAPI_API_TOKEN}` },
})

const printfulApi = axios.create({
  baseURL: 'https://api.printful.com',
  headers: { Authorization: `Bearer ${env.PRINTFUL_API_KEY}` },
})

const stripe: Record<FundSlug, Stripe> = {
  monero: new Stripe(env.STRIPE_MONERO_SECRET_KEY, { apiVersion: '2024-04-10' }),
  firo: new Stripe(env.STRIPE_FIRO_SECRET_KEY, { apiVersion: '2024-04-10' }),
  privacyguides: new Stripe(env.STRIPE_PRIVACY_GUIDES_SECRET_KEY, { apiVersion: '2024-04-10' }),
  general: new Stripe(env.STRIPE_GENERAL_SECRET_KEY, { apiVersion: '2024-04-10' }),
}

export { prisma, keycloak, transporter, btcpayApi, strapiApi, printfulApi, stripe }
