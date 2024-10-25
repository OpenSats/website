import { FundSlug } from '@prisma/client'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import dayjs from 'dayjs'

import { env } from '../../env.mjs'
import { transporter } from '../services'
import { funds } from '../../utils/funds'
import { POINTS_REDEEM_PRICE_USD } from '../../config'
import markdownToHtml from '../../utils/markdownToHtml'

dayjs.extend(localizedFormat)

const pointsFormat = Intl.NumberFormat('en', { notation: 'standard', compactDisplay: 'long' })

type SendDonationConfirmationEmailParams = {
  to: string
  donorName: string
  fundSlug: FundSlug
  projectName?: string
  isMembership: boolean
  isSubscription: boolean
  stripeUsdAmount?: number
  btcpayCryptoAmount?: number
  btcpayAsset?: 'BTC' | 'XMR'
  pointsReceived: number
}

export async function sendDonationConfirmationEmail({
  to,
  donorName,
  fundSlug,
  projectName,
  isMembership,
  isSubscription,
  stripeUsdAmount,
  btcpayCryptoAmount,
  btcpayAsset,
  pointsReceived,
}: SendDonationConfirmationEmailParams) {
  const dateStr = dayjs().format('YYYY-M-D')
  const fundName = funds[fundSlug].title

  const markdown = `Thank you for your donation to MAGIC Grants! Your donation supports our charitable mission.

  ${
    !isMembership
      ? `You donated to: ${fundName}
  ${projectName ? `You supported this campaign: ${projectName}` : ''}`
      : ''
  }

  ${
    isMembership
      ? `You purchased an annual membership for the ${fundName}.
  This membership ${isSubscription ? 'will' : 'will not'} renew automatically. Easily manage your membership by logging into your account at donate.magicgrants.org.`
      : ''
  }

  Please see the full details on your donation receipt below:

  MAGIC Grants is a 501(c)(3) public charity. This serves as your donation receipt. Donations to MAGIC Grants are tax deductible to the extent allowable by law.

  Donation Date: ${dateStr}

  Donor Information:
  ${donorName}

  MAGIC Grants acknowledges and expresses appreciation for the following contribution:
  - [${stripeUsdAmount ? 'x' : ' '}] Cash or bank transfer donation amount: ${stripeUsdAmount ? stripeUsdAmount.toFixed(2) : 'N/A'}
  - [${btcpayCryptoAmount ? 'x' : ' '}] In-kind (non-fiat) donation description: ${btcpayCryptoAmount} ${btcpayAsset}

  Description and/or restrictions: ${fundSlug === 'general' ? 'None' : `Donation to the ${fundName}`}

  The following describes the context of your donation:

  - [${!pointsReceived ? 'x' : ' '}] No goods or services were received in exchange for your generous donation.
  - [${pointsReceived ? 'x' : ' '}] In connection with your generous donation, you received ${pointsFormat.format(pointsReceived)} points, valued at approximately $${(pointsReceived * POINTS_REDEEM_PRICE_USD).toFixed(2)}.

  ${btcpayCryptoAmount ? 'If you wish to receive a tax deduction for a cryptocurrency donation over $500, you MUST complete [Form 8283](https://www.irs.gov/pub/irs-pdf/f8283.pdf) and send the completed form to [info@magicgrants.org](mailto:info@magicgrants.org) to qualify for a deduction.' : ''}

  MAGIC Grants
  1942 Broadway St., STE 314C
  Boulder, CO 80302
  EIN: 82-5183590
  (303) 900-3237
  info@magicgrants.org`

  const htmlFromMarkdown = await markdownToHtml(markdown)

  const html = `<style>
  html {
    display: flex;
  }

  body {
    max-width: 700px;
    padding: 20px;
    margin: 0 auto;
    font-family: sans-serif;
    background-color: #F1F5FF;
  }

  a {
    color: #3a76f0;
  }
</style>

${htmlFromMarkdown}`

  return transporter.sendMail({
    from: env.SES_VERIFIED_SENDER,
    to,
    html,
  })
}
