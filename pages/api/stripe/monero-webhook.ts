import { getStripeWebhookHandler } from '../../../server/utils/webhooks'
import { env } from '../../../env.mjs'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default getStripeWebhookHandler('monero', env.STRIPE_MONERO_WEBHOOK_SECRET)
