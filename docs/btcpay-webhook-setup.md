# BTCPay Webhook Setup for Multiple Funds

This document explains how to set up BTCPay Server webhooks for all three OpenSats funds.

## Overview

OpenSats has three funds, each with its own BTCPay Server store:
1. **General Fund** - Store ID: `44CuVJv4hkAyY9qUsaQL2nsAwjG9H5RiS23k4UqGx7TG`
2. **The Nostr Fund** - Store ID: `FTJT37saZKH96U6RjekQtueMBKzYajzEWLDjpTAY7QUw`
3. **Operations Budget** - Store ID: `HudVcHrn8q4KpgaNTcwx1soLzYoEFAzvRuBXhAncbjF5`

Each fund has its own dedicated webhook endpoint and requires a separate webhook secret.

## Webhook Endpoints

The following webhook endpoints are available:

- **General Fund**: `/api/btcpay-webhook-general`
- **Nostr Fund**: `/api/btcpay-webhook-nostr`
- **Operations Budget**: `/api/btcpay-webhook-ops`

## Environment Variables

You need to set up the following environment variables:

```bash
# General Fund webhook secret
BTCPAY_WEBHOOK_SECRET_GENERAL=your_general_fund_webhook_secret

# Nostr Fund webhook secret
BTCPAY_WEBHOOK_SECRET_NOSTR=your_nostr_fund_webhook_secret

# Operations Budget webhook secret
BTCPAY_WEBHOOK_SECRET_OPS=your_ops_budget_webhook_secret

# Shared SendGrid configuration (used by all webhooks)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_VERIFIED_SENDER=your_verified_sender_email
```

## BTCPay Server Configuration

For each fund's BTCPay Server store, you need to:

1. **Create a webhook** in the BTCPay Server admin interface
2. **Set the webhook URL** to the appropriate endpoint:
   - General Fund: `https://yourdomain.com/api/btcpay-webhook-general`
   - Nostr Fund: `https://yourdomain.com/api/btcpay-webhook-nostr`
   - Operations Budget: `https://yourdomain.com/api/btcpay-webhook-ops`
3. **Configure the webhook events** to include:
   - `InvoicePaymentSettled`
4. **Generate a webhook secret** and save it to the corresponding environment variable
5. **Test the webhook** to ensure it's working correctly

## Webhook Functionality

Each webhook performs the following actions when an `InvoicePaymentSettled` event is received:

1. **Verifies the webhook signature** using the fund-specific secret
2. **Extracts donor information** from the webhook payload
3. **Sends a donation receipt email** via SendGrid to the donor (if email is provided)
4. **Logs the transaction** for monitoring and debugging

## Security Considerations

- Each fund uses a **separate webhook secret** for isolation
- Webhook signatures are verified using **crypto.timingSafeEqual** to prevent timing attacks
- Raw body parsing is used to ensure accurate signature verification
- All webhook processing is logged for monitoring

## Monitoring

Webhook activity is logged with the following information:
- Fund-specific log messages (e.g., "General Fund Invoice Payment Settled!")
- Donor email and name (if provided)
- Invoice ID and payment amount
- Receipt email status (sent/failed)
- Signature verification results

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**: Check that the webhook URL is correct and accessible
2. **Signature verification failing**: Ensure the webhook secret matches between BTCPay Server and your environment variables
3. **Receipt emails not sending**: Verify SendGrid API key and verified sender email are configured correctly
4. **404 errors**: Make sure the webhook endpoints are deployed and accessible

### Testing

You can test webhook functionality by:
1. Making a small donation to any fund
2. Checking the logs for webhook processing
3. Verifying receipt emails are sent (if email provided)
4. Confirming the webhook returns a 200 status code

## Migration from Single Webhook

If you're migrating from the original single webhook (`/api/btcpay-webhook`), you'll need to:

1. **Update BTCPay Server** to use the new fund-specific webhook URLs
2. **Set up the new environment variables** for each fund
3. **Test each webhook** individually
4. **Monitor logs** to ensure all webhooks are working correctly
5. **Remove the old webhook** once migration is complete

## Code Structure

The webhook implementation uses a shared utility module (`utils/btcpay-webhook-helpers.ts`) to reduce code duplication. Each fund-specific webhook:

- Imports shared functions and types
- Uses its own environment variable for the webhook secret
- Calls the shared `processBTCPayWebhook` function with the appropriate fund name
- Provides fund-specific logging and error messages
