import { NextApiRequest, NextApiResponse } from 'next'
import { env } from '../../env.mjs'

async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  return res.json({ type: 'ed25519', publicKey: env.NEXT_PUBLIC_ATTESTATION_PUBLIC_KEY_HEX })
}

export default handle
