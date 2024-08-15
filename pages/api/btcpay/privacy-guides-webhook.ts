import { env } from '../../../env.mjs'
import { btcpayApi as _btcpayApi } from '../../../server/services'
import { getBtcpayWebhookHandler } from '../../../server/utils/webhooks'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default getBtcpayWebhookHandler(env.BTCPAY_PRIVACY_GUIDES_WEBHOOK_SECRET)
