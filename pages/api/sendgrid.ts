import { NextApiRequest, NextApiResponse } from 'next/types'

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const TO_ADDRESS = process.env.SENDGRID_RECEPIENT
const FROM_ADDRESS = process.env.SENDGRID_VERIFIED_SENDER

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(SENDGRID_API_KEY)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    if (!SENDGRID_API_KEY || !TO_ADDRESS || !FROM_ADDRESS) {
      throw new Error('Env misconfigured')
    }

    let body = ''

    for (const [key, value] of Object.entries(req.body)) {
      body += `<h3>${key}</h3><p>${value}</p>`
    }

    try {
      console.log(process.env.SENDGRID_API_KEY)
      const msg = {
        to: TO_ADDRESS, // Change to your recipient
        from: FROM_ADDRESS, // Change to your verified sender
        subject: `OpenSats Application for ${req.body.project_name}`,
        html: `${body}`,
      }

      sgMail.send(msg)
      res.status(200).json({ message: 'success' })
    } catch (err) {
      res.status(500).json({ statusCode: 500, message: (err as Error).message })
    }
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}
