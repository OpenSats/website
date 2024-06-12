import { NextApiRequest, NextApiResponse } from 'next/types'

import { env } from '../../env.mjs'
import { sendgrid } from '../../server/services'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    let body = ''

    for (const [key, value] of Object.entries(req.body)) {
      body += `<h3>${key}</h3><p>${value}</p>`
    }

    try {
      const msg = {
        to: env.SENDGRID_RECIPIENT,
        from: env.SENDGRID_VERIFIED_SENDER,
        subject: `MAGIC Monero Fund Application for ${req.body.project_name}`,
        html: `${body}`,
      }

      sendgrid.send(msg)
      res.status(200).json({ message: 'success' })
    } catch (err) {
      res.status(500).json({ statusCode: 500, message: (err as Error).message })
    }
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}
