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
        // 'Content-Type': 'application/x-www-form-urlencoded',
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
        // 'Content-Type': 'application/x-www-form-urlencoded',
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

export async function fetchGetJSONAuthed() {
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
    const total = await data.reduce((subtotal, item) => subtotal + Number(item.amount),0)
    const donations = await data.reduce((subtotal, item) => subtotal + 1,0)
    return await {total: total, donations: donations}
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message)
    }
    throw err
  }
}
