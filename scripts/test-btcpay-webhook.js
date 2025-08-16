#!/usr/bin/env node

/**
 * Test script for BTCPay Server webhook
 *
 * This script simulates a BTCPay Server webhook payload to test your webhook endpoint.
 *
 * Usage:
 * 1. Set your BTCPAY_WEBHOOK_SECRET environment variable
 * 2. Run: node scripts/test-btcpay-webhook.js
 *
 * Make sure your development server is running on http://localhost:3000
 */

const crypto = require('crypto')

// Configuration
const WEBHOOK_URL = 'http://localhost:3000/api/btcpay-webhook'
const WEBHOOK_SECRET = process.env.BTCPAY_WEBHOOK_SECRET

if (!WEBHOOK_SECRET) {
  console.error('❌ BTCPAY_WEBHOOK_SECRET environment variable is required')
  console.log('Please set it in your .env.local file')
  process.exit(1)
}

// Sample webhook payload based on BTCPay Server documentation
const webhookPayload = {
  deliveryId: 'test-delivery-123',
  webhookId: 'test-webhook-456',
  originalDeliveryId: 'test-delivery-123',
  isRedelivery: false,
  type: 'InvoicePaymentSettled',
  timestamp: Math.floor(Date.now() / 1000),
  storeId: 'test-store',
  invoiceId: 'test-invoice-789',
  metadata: {
    orderId: 'general_fund',
    fund_name: 'General Fund',
    buyerName: 'John Doe',
    buyerEmail: 'john.doe@example.com',
    posData: {
      orderId: 'general_fund',
      zaprite_campaign: 'test-campaign',
      fund_name: 'General Fund',
      buyerName: 'John Doe',
      buyerEmail: 'john.doe@example.com',
    },
    zaprite_campaign: 'test-campaign',
    recipient_uuid: 'test-uuid',
  },
}

// Create signature
const payloadString = JSON.stringify(webhookPayload)
const signature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(payloadString, 'utf8')
  .digest('hex')

async function testWebhook() {
  try {
    console.log('🚀 Testing BTCPay webhook...')
    console.log('📡 URL:', WEBHOOK_URL)
    console.log('📦 Payload:', JSON.stringify(webhookPayload, null, 2))
    console.log('🔐 Signature:', signature)
    console.log('')

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'btcpay-sig': signature,
      },
      body: payloadString,
    })

    const responseData = await response.json()

    console.log('📊 Response Status:', response.status)
    console.log('📄 Response Body:', JSON.stringify(responseData, null, 2))

    if (response.ok) {
      console.log('✅ Webhook test successful!')
      console.log('')
      console.log('Check your server console for the logged donor information:')
      console.log('- Donor Email: john.doe@example.com')
      console.log('- Donor Name: John Doe')
      console.log('- Fund: General Fund')
    } else {
      console.log('❌ Webhook test failed!')
    }
  } catch (error) {
    console.error('❌ Error testing webhook:', error.message)

    if (error.code === 'ECONNREFUSED') {
      console.log(
        '💡 Make sure your development server is running on http://localhost:3000'
      )
    }
  }
}

// Run the test
testWebhook()
