import { env } from '../../../env.mjs'
import { btcpayApi as _btcpayApi } from '../../../server/services'
import { getBtcpayWebhookHandler } from '../../../server/utils/webhooks'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default getBtcpayWebhookHandler(env.BTCPAY_GENERAL_WEBHOOK_SECRET)
