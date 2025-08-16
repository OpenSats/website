import { NextApiRequest, NextApiResponse } from 'next'

import { CURRENCY, MIN_AMOUNT } from '../../config'
import { formatAmountForStripe } from '../../utils/stripe-helpers'

import Stripe from 'stripe'
import { PayReq } from '../../utils/types'
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // https://github.com/stripe/stripe-node#configuration
  // @ts-ignore stripe-version-202-08-27
  apiVersion: '2020-08-27',
})

const ZAPRITE_USER_UUID = process.env.ZAPRITE_USER_UUID

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { amount, project_name, email, name, zaprite }: PayReq = req.body

  if (!ZAPRITE_USER_UUID) {
    throw new Error('Something went wrong with Stripe setup')
  }

  if (req.method === 'POST') {
    try {
      // Validate the amount that was passed from the client.
      if (!(amount >= MIN_AMOUNT)) {
        throw new Error('Invalid amount.')
      }
      // Create Checkout Sessions from body params.
      const params: Stripe.Checkout.SessionCreateParams = {
        mode: 'payment',
        submit_type: 'donate',
        payment_method_types: ['card'],
        line_items: [
          {
            // @ts-ignore
            name: `OpenSats donation: ${project_name}`,
            amount: formatAmountForStripe(amount, CURRENCY),
            currency: CURRENCY,
            quantity: 1,
          },
        ],
        metadata: {
          donor_email: email || null,
          donor_name: name || null,
          recipient_campaign: zaprite,
          recipient_uuid: ZAPRITE_USER_UUID,
        },
        success_url: `${req.headers.origin}/thankyou`,
        cancel_url: `${req.headers.origin}/`,
        // We need metadata in here for some reason
        payment_intent_data: {
          metadata: {
            donor_email: email || null,
            donor_name: name || null,
            recipient_campaign: zaprite,
            recipient_uuid: ZAPRITE_USER_UUID,
          },
        },
      }
      const checkoutSession: Stripe.Checkout.Session =
        await stripe.checkout.sessions.create(params)

      res.status(200).json(checkoutSession)
    } catch (err) {
      res.status(500).json({ statusCode: 500, message: (err as Error).message })
    }
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}
