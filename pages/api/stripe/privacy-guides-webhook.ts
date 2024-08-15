import { getStripeWebhookHandler } from '../../../server/utils/webhooks'
import { env } from '../../../env.mjs'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default getStripeWebhookHandler(env.STRIPE_PRIVACY_GUIDES_WEBHOOK_SECRET)
