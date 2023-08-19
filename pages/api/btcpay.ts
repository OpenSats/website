// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { CURRENCY, MIN_AMOUNT } from '../../config'
import { fetchPostJSONAuthed } from '../../utils/api-helpers'
import { PayReq } from '../../utils/types'
import type { Project } from 'contentlayer/generated'
import { allProjects } from 'contentlayer/generated'

const ZAPRITE_USER_UUID = process.env.ZAPRITE_USER_UUID

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { amount, btcpay, email, name }: PayReq = req.body
    const REDIRECT = 'http://opensats.org/thankyou'

    try {
      // Validate the amount that was passed from the client.
      if (amount != null && amount < MIN_AMOUNT) {
        throw new Error('Invalid amount.')
      }
      if (!btcpay) {
        throw new Error('Invalid project.')
      }

      let project: Project
      try {
        project = allProjects.find((p) => p.btcpay === btcpay)
      } catch {
        throw new Error('Invalid project.')
      }
      const reqData = {
        currency: CURRENCY,
        metadata: {
          orderId: project.btcpay,
          project_name: project.title,
          buyerName: name || 'anonymous',
          buyerEmail: email || null,
          posData: {
            orderId: project.btcpay,
            zaprite_campaign: project.zaprite,
            project_name: project.title,
            buyerName: name || 'anonymous',
            buyerEmail: email || null,
          },
          zaprite_campaign: project.zaprite,
          recipient_uuid: ZAPRITE_USER_UUID,
        },
        checkout: { redirectURL: REDIRECT },
      }

      if (amount) {
        Object.assign(reqData, { amount })
      }
      const data = await fetchPostJSONAuthed(
        `${process.env.BTCPAY_URL!}stores/${
          process.env.BTCPAY_STORE_ID
        }/invoices`,
        `token ${process.env.BTCPAY_API_KEY}`,
        reqData
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
