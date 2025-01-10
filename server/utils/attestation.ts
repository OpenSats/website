import * as ed from '@noble/ed25519'
import { FundSlug } from '@prisma/client'
import dayjs from 'dayjs'

import { env } from '../../env.mjs'

type GetDonationAttestationParams = {
  donorName: string
  donorEmail: string
  donationId: string
  amount: number
  method: string
  fundSlug: FundSlug
  fundName: string
  projectName: string
  date: Date
}

export async function getDonationAttestation({
  donorName,
  donorEmail,
  donationId,
  amount,
  method,
  fundSlug,
  fundName,
  projectName,
  date,
}: GetDonationAttestationParams) {
  const message = `MAGIC Grants Donation Attestation

Name: ${donorName}
Email: ${donorEmail}
Donation ID: ${donationId}
Amount: $${amount.toFixed(2)}
Method: ${method}
Fund: ${fundName}
Project: ${projectName}
Date: ${dayjs(date).format('YYYY-M-D')}

Verify this attestation at donate.magicgrants.org/${fundSlug}/verify-attestation`

  const signature = await ed.signAsync(
    Buffer.from(message, 'utf-8').toString('hex'),
    env.ATTESTATION_PRIVATE_KEY_HEX
  )

  const signatureHex = Buffer.from(signature).toString('hex')

  return { message, signature: signatureHex }
}

type GetMembershipAttestation = {
  donorName: string
  donorEmail: string
  amount: number
  method: string
  fundName: string
  fundSlug: FundSlug
  periodStart: Date
  periodEnd: Date
}

export async function getMembershipAttestation({
  donorName,
  donorEmail,
  amount,
  method,
  fundName,
  fundSlug,
  periodStart,
  periodEnd,
}: GetMembershipAttestation) {
  const message = `MAGIC Grants Membership Attestation
  
  Name: ${donorName}
  Email: ${donorEmail}
  Total amount: $${amount.toFixed(2)}
  Method: ${method}
  Fund: ${fundName}
  Period start: ${dayjs(periodStart).format('YYYY-M-D')}
  Period end: ${dayjs(periodEnd).format('YYYY-M-D')}
  
  Verify this attestation at donate.magicgrants.org/${fundSlug}/verify-attestation`

  const signature = await ed.signAsync(
    Buffer.from(message, 'utf-8').toString('hex'),
    env.ATTESTATION_PRIVATE_KEY_HEX
  )

  const signatureHex = Buffer.from(signature).toString('hex')

  return { message, signature: signatureHex }
}
