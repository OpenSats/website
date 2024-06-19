import { env } from '../env.mjs'

export async function fetchGetJSON(url: string) {
  try {
    const data = await fetch(url).then((res) => res.json())
    return data
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message)
    }
    throw err
  }
}

export async function fetchPostJSON(url: string, data?: {}) {
  try {
    // Default options are marked with *
    const response = await fetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json',
        Authorization: `token ${env.NEXT_PUBLIC_BTCPAY_API_KEY}`,
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *client
      body: JSON.stringify(data || {}), // body data type must match "Content-Type" header
    })

    return await response.json() // parses JSON response into native JavaScript objects
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message)
    }
    throw err
  }
}

export async function fetchPostJSONAuthed(
  url: string,
  auth: string,
  data?: {}
) {
  try {
    // Default options are marked with *
    const response = await fetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth,
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *client
      body: JSON.stringify(data || {}), // body data type must match "Content-Type" header
    })
    return await response.json() // parses JSON response into native JavaScript objects
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message)
    }
    throw err
  }
}

export async function fetchGetJSONAuthedBTCPay(slug: string) {
  try {
    const url = `${env.BTCPAY_URL}stores/${env.BTCPAY_STORE_ID}/invoices`
    const auth = `token ${env.BTCPAY_API_KEY}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth,
      },
    })
    const data = await response.json()
    let numdonationsxmr = 0
    let numdonationsbtc = 0
    let totaldonationsxmr = 0
    let totaldonationsbtc = 0
    let totaldonationsinfiatxmr = 0
    let totaldonationsinfiatbtc = 0
    for (let i = 0; i < data.length; i++) {
      if (
        data[i].metadata.orderId != slug &&
        data[i].metadata.orderId != `${slug}_STATIC`
      ) {
        continue
      }
      const id = data[i].id
      const urliter = `${env.BTCPAY_URL}stores/${env.BTCPAY_STORE_ID}/invoices/${id}/payment-methods`
      const authiter = `token ${env.BTCPAY_API_KEY}`
      const responseiter = await fetch(urliter, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authiter,
        },
      })
      const dataiter = await responseiter.json()
      if (
        dataiter[1].cryptoCode == 'XMR' &&
        dataiter[1].paymentMethodPaid > 0
      ) {
        numdonationsxmr += dataiter[1].payments.length
        totaldonationsxmr += Number(dataiter[1].paymentMethodPaid)
        totaldonationsinfiatxmr +=
          Number(dataiter[1].paymentMethodPaid) * Number(dataiter[1].rate)
      }
      if (
        dataiter[0].cryptoCode == 'BTC' &&
        dataiter[0].paymentMethodPaid > 0
      ) {
        numdonationsbtc += dataiter[0].payments.length
        totaldonationsbtc += Number(dataiter[0].paymentMethodPaid)
        totaldonationsinfiatbtc +=
          Number(dataiter[0].paymentMethodPaid) * Number(dataiter[0].rate)
      }
    }
    return await {
      xmr: {
        numdonations: numdonationsxmr,
        totaldonationsinfiat: totaldonationsinfiatxmr,
        totaldonations: totaldonationsxmr,
      },
      btc: {
        numdonations: numdonationsbtc,
        totaldonationsinfiat: totaldonationsinfiatbtc,
        totaldonations: totaldonationsbtc,
      },
    }
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message)
    }
    throw err
  }
}

export async function fetchGetJSONAuthedStripe(slug: string) {
  try {
    const url = 'https://api.stripe.com/v1/charges'
    const auth = `Bearer ${env.STRIPE_SECRET_KEY}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth,
      },
    })
    const data = await response.json()
    const dataext = data.data
    let total = 0
    let donations = 0
    for (let i = 0; i < dataext.length; i++) {
      if (
        dataext[i].metadata.project_slug == null ||
        dataext[i].metadata.project_slug != slug
      ) {
        continue
      }
      total += Number(dataext[i].amount) / 100
      donations += 1
    }
    return await {
      numdonations: donations,
      totaldonationsinfiat: total,
      totaldonations: total,
    }
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message)
    }
    throw err
  }
}
