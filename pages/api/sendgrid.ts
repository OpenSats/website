import { NextApiRequest, NextApiResponse } from 'next/types'

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const TO_ADDRESS = process.env.SENDGRID_RECIPIENT
const CC_ADDRESS = process.env.SENDGRID_CC
const FROM_ADDRESS = process.env.SENDGRID_VERIFIED_SENDER

import sgMail from '@sendgrid/mail'

sgMail.setApiKey(SENDGRID_API_KEY || '')

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

    const thankYouMessage = `
Thank you for applying to OpenSats! 

We have received your application and will evaluate it soon.
This process can take 2-3 months, but in most cases it's faster.
Feel free to reach out to applications@opensats.org if you have any questions.

We will reach out again once we've made a decision. 
Thank you for your patience.
    `

    try {
      // Mail 'application received' to applicant
      const msg = {
        to: `${req.body.email}`, // Applicant
        from: FROM_ADDRESS, // Verified sender
        subject: `Your Application to OpenSats`,
        html: `${thankYouMessage}`,
      }

      await sgMail.send(msg)
      console.info('Application receipt sent')
    } catch (err) {
      console.error(err)
    } finally {
      // Mail application content to us
      try {
        const msg = {
          to: TO_ADDRESS, // OpenSats
          cc: CC_ADDRESS, // Processing & backup
          from: FROM_ADDRESS, // Verified sender
          subject: `OpenSats Application for ${req.body.project_name}`,
          html: `${body}`,
        }

        await sgMail.send(msg)
        res.status(200).json({ message: 'success' })
      } catch (err) {
        res
          .status(500)
          .json({ statusCode: 500, message: (err as Error).message })
      }
    }
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}
