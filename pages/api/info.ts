import { NextApiRequest, NextApiResponse } from 'next/types'
import { InfoReq } from '../../utils/types'

const USER_UUID = process.env.USER_UUID

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { zaprite }: InfoReq = req.body
    try {
      const response = await fetch(
        `https://app.zaprite.com/api/opensats/get-info?campaignUid=${zaprite}&userUid=${USER_UUID}`
      )
      const json = await response.json()
      res.status(200).json(json.data.totals)
    } catch (err) {
      res.status(500).json({ statusCode: 500, message: (err as Error).message })
    }
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}
