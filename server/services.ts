import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'
import sendgrid from '@sendgrid/mail'
import KeycloakAdminClient from '@keycloak/keycloak-admin-client'
import nodemailer from 'nodemailer'
import axios, { AxiosInstance } from 'axios'

import { env } from '../env.mjs'
import { FundSlug } from '../utils/funds'

sendgrid.setApiKey(env.SENDGRID_API_KEY)

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'info', 'warn', 'error'],
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

const btcpayApi: Record<FundSlug, AxiosInstance> = {
  monero: axios.create({
    baseURL: `${env.BTCPAY_URL}/api/v1/stores/${env.BTCPAY_MONERO_STORE_ID}`,
    headers: { Authorization: `token ${env.BTCPAY_API_KEY}` },
  }),
  firo: axios.create({
    baseURL: `${env.BTCPAY_URL}/api/v1/stores/${env.BTCPAY_FIRO_STORE_ID}`,
    headers: { Authorization: `token ${env.BTCPAY_API_KEY}` },
  }),
  privacy_guides: axios.create({
    baseURL: `${env.BTCPAY_URL}/api/v1/stores/${env.BTCPAY_PRIVACY_GUIDES_STORE_ID}`,
    headers: { Authorization: `token ${env.BTCPAY_API_KEY}` },
  }),
  general: axios.create({
    baseURL: `${env.BTCPAY_URL}/api/v1/stores/${env.BTCPAY_GENERAL_STORE_ID}`,
    headers: { Authorization: `token ${env.BTCPAY_API_KEY}` },
  }),
}

const stripe: Record<FundSlug, Stripe> = {
  monero: new Stripe(env.STRIPE_MONERO_SECRET_KEY, { apiVersion: '2024-04-10' }),
  firo: new Stripe(env.STRIPE_MONERO_SECRET_KEY, { apiVersion: '2024-04-10' }),
  privacy_guides: new Stripe(env.STRIPE_MONERO_SECRET_KEY, { apiVersion: '2024-04-10' }),
  general: new Stripe(env.STRIPE_MONERO_SECRET_KEY, { apiVersion: '2024-04-10' }),
}

export { sendgrid, prisma, keycloak, transporter, btcpayApi, stripe }
