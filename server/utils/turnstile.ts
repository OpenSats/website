import axios from 'axios'
import { env } from '../../env.mjs'

export async function isTurnstileValid(token: string) {
  const { data: turnstileResult } = await axios.post(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    { response: token, secret: env.TURNSTILE_SECRET }
  )

  return turnstileResult.success
}
