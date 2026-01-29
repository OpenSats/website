import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }

  try {
    const API_KEY = process.env.BUTTONDOWN_API_KEY
    const response = await fetch(
      'https://api.buttondown.email/v1/subscribers',
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email_address: email }),
      }
    )

    if (response.status >= 400) {
      const data = await response.json()
      return res
        .status(response.status)
        .json({ error: data.detail || 'Error subscribing' })
    }

    return res.status(201).json({ error: '' })
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message || 'Internal server error' })
  }
}
