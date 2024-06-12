import sendgrid from '@sendgrid/mail'
import KeycloakAdminClient from '@keycloak/keycloak-admin-client'
import nodemailer from 'nodemailer'

import { env } from '../env.mjs'

sendgrid.setApiKey(env.SENDGRID_API_KEY)

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

export { sendgrid, keycloak, transporter }
