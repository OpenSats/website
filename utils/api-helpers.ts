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
        Authorization: `token ${process.env.BTCPAY_API_KEY}`,
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

export async function fetchGetJSONAuthedBTCPay() {
  try {
    const url = `${process.env.BTCPAY_URL!}stores/${process.env.BTCPAY_STORE_ID}/invoices`
    const auth = `token ${process.env.BTCPAY_API_KEY}`
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
    for(let i=0;i<data.length;i++){
      const id = data[i].id
      const urliter = `${process.env.BTCPAY_URL!}stores/${process.env.BTCPAY_STORE_ID}/invoices/${id}/payment-methods`
      const authiter = `token ${process.env.BTCPAY_API_KEY}`
      const responseiter = await fetch(urliter, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authiter,
        },
      })
      const dataiter = await responseiter.json();
      if (dataiter[1].cryptoCode == 'XMR' && dataiter[1].totalPaid > 0) {
        numdonationsxmr += 1
        totaldonationsxmr += Number(dataiter[1].totalPaid)
        totaldonationsinfiatxmr += Number(dataiter[1].totalPaid) * Number(dataiter[1].rate)
      }
      if (dataiter[0].cryptoCode == 'BTC' && dataiter[0].totalPaid > 0) {
        numdonationsbtc += 1
        totaldonationsbtc += Number(dataiter[0].totalPaid)
        totaldonationsinfiatbtc += Number(dataiter[0].totalPaid) * Number(dataiter[0].rate)
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
      }
     }
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message)
    }
    throw err
  }
}

export async function fetchGetJSONAuthedStripe() {
  try {
    const url = "https://api.stripe.com/v1/charges"
    const auth = `Bearer ${process.env.STRIPE_SECRET_KEY}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth,
      },
    })
    const data = await response.json()
    const dataext = data.data
    const total = await dataext.reduce((subtotal: number, item: any) => subtotal + Number(item.amount)/100,0)
    const donations = await dataext.reduce((subtotal: number, item: any) => subtotal + 1,0)
    return await { numdonations: donations, totaldonationsinfiat: total, totaldonations: total }
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message)
    }
    throw err
  }
}
