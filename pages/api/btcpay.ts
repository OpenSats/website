// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { CURRENCY, MIN_AMOUNT } from '../../config'
import { fetchPostJSONAuthed } from '../../utils/api-helpers'
import { PayReq } from '../../utils/types'
import { env } from '../../env.mjs'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { amount, project_name, project_slug, email, name }: PayReq = req.body
    const REDIRECT = 'http://monerofund.org/thankyou'

    try {
      // Validate the amount that was passed from the client.
      if (!(amount >= MIN_AMOUNT)) {
        throw new Error('Invalid amount.')
      }

      const metadata = {
        orderId: project_slug,
        project_name,
        buyerName: name || 'anonymous',
        buyerEmail: email || null,
      }

      let data = await fetchPostJSONAuthed(
        `${env.BTCPAY_URL}stores/${env.BTCPAY_STORE_ID}/invoices`,
        `token ${env.BTCPAY_API_KEY}`,
        {
          amount: amount,
          currency: 'USD',
          metadata: {
            orderId: project_slug,
            project_name,
            buyerName: name || 'anonymous',
            buyerEmail: email || null,
            posData: metadata,
          },
          checkout: { redirectURL: REDIRECT },
        }
      )
      res.status(200).json(data)
    } catch (err) {
      console.log(err)
      res.status(500).json({ statusCode: 500, message: (err as Error).message })
    }
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}
