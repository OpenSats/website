import { PrismaClient } from '@prisma/client'
import sendgrid from '@sendgrid/mail'
import KeycloakAdminClient from '@keycloak/keycloak-admin-client'
import nodemailer from 'nodemailer'
import axios from 'axios'

import { env } from '../env.mjs'
import Stripe from 'stripe'

sendgrid.setApiKey(env.SENDGRID_API_KEY)

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'production'
        ? ['error']
        : ['query', 'info', 'warn', 'error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

const keycloak = new KeycloakAdminClient({
  baseUrl: 'http://localhost:8080',
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
  baseURL: `${env.BTCPAY_URL}/api/v1`,
  headers: { Authorization: `token ${env.BTCPAY_API_KEY}` },
})

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  // https://github.com/stripe/stripe-node#configuration
  apiVersion: '2024-04-10',
})

export { sendgrid, prisma, keycloak, transporter, btcpayApi, stripe }
