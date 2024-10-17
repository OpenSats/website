import { getStripeWebhookHandler } from '../../../server/utils/webhooks'
import { env } from '../../../env.mjs'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default getStripeWebhookHandler('firo', env.STRIPE_FIRO_WEBHOOK_SECRET)
