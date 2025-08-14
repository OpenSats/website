# BTCPay Server Webhook Setup

This document explains how to set up the BTCPay Server webhook for automatic receipt generation when donations are received.

## Overview

The webhook endpoint (`/api/btcpay-webhook`) receives notifications from BTCPay Server when invoices are paid. Currently, it logs donor information to the console. In the future, it will automatically send receipts via SendGrid using dynamic templates.

## Setup Instructions

### 1. Environment Variables

Add the following environment variable to your `.env.local` file:

```bash
BTCPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

### 2. BTCPay Server Configuration

1. Log into your BTCPay Server dashboard
2. Go to **Store Settings** → **Webhooks**
3. Click **Create new Webhook**
4. Configure the webhook:
   - **Payload URL**: `https://yourdomain.com/api/btcpay-webhook`
   - **Events**: Select `InvoicePaymentSettled`
   - **Automatic redelivery**: Enable (recommended)
5. Copy the **Webhook Secret** and add it to your environment variables
6. Click **Add webhook**

### 3. Testing the Webhook

#### Option A: Using the Test Script

1. Make sure your development server is running (`npm run dev`)
2. Run the test script:
   ```bash
   node scripts/test-btcpay-webhook.js
   ```
3. Check your server console for the logged donor information

#### Option B: Manual Testing

1. Create a test donation through your website
2. Complete the payment in BTCPay Server
3. Check your server console for webhook logs

## Webhook Payload Structure

The webhook receives the following data structure:

```json
{
  "deliveryId": "string",
  "webhookId": "string",
  "originalDeliveryId": "string",
  "isRedelivery": false,
  "type": "InvoicePaymentSettled",
  "timestamp": 1234567890,
  "storeId": "string",
  "invoiceId": "string",
  "metadata": {
    "orderId": "string",
    "fund_name": "string",
    "buyerName": "string",
    "buyerEmail": "string",
    "posData": {
      "orderId": "string",
      "zaprite_campaign": "string",
      "fund_name": "string",
      "buyerName": "string",
      "buyerEmail": "string"
    },
    "zaprite_campaign": "string",
    "recipient_uuid": "string"
  }
}
```

## Security

The webhook includes signature verification to ensure requests come from your BTCPay Server instance:

- Uses HMAC-SHA256 for signature generation
- Verifies the `btcpay-sig` header against the webhook secret
- Rejects requests with invalid signatures

## Current Functionality

Currently, the webhook:
- ✅ Verifies webhook signatures
- ✅ Logs donor information to console
- ✅ Handles `InvoicePaymentSettled` events
- ✅ Returns appropriate HTTP status codes

## Future Enhancements

Planned functionality:
- 🔄 Send automatic receipts via SendGrid
- 🔄 Use dynamic templates for personalized emails
- 🔄 Handle different fund types with specific templates
- 🔄 Add retry logic for failed email sends
- 🔄 Log webhook events to a database

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**
   - Check that the webhook URL is accessible from BTCPay Server
   - Verify the webhook is enabled in BTCPay Server
   - Check server logs for errors

2. **Signature verification failing**
   - Ensure `BTCPAY_WEBHOOK_SECRET` is set correctly
   - Verify the secret matches the one in BTCPay Server
   - Check that the webhook secret hasn't been regenerated

3. **Missing donor information**
   - Verify that donor information is being passed in the invoice metadata
   - Check the BTCPay Server invoice creation process

### Debug Mode

To enable detailed logging, add this to your environment:

```bash
DEBUG_WEBHOOK=true
```

## API Endpoint

**URL**: `/api/btcpay-webhook`
**Method**: POST
**Headers**: 
- `Content-Type: application/json`
- `btcpay-sig: <signature>`

**Response**: 
```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "eventType": "InvoicePaymentSettled"
}
```

## References

- [BTCPay Server Webhook Documentation](https://docs.btcpayserver.org/FAQ/General/#how-to-create-a-webhook-)
- [BTCPay Server Greenfield API](https://docs.btcpayserver.org/API/Greenfield/v1/#operation/Webhook_InvoicePaymentSettled)
