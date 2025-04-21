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

export async function fetchPostJSON(url: string, data?: object) {
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
  data?: object
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

export function getReportPreview(grantDetails: any, reportData: any): string {
  const {
    projectName,
    reportNumber,
    timeSpent,
    plansForNextQuarter,
    useOfFunds,
    helpNeeded,
  } = reportData

  return `
# ${projectName} - Report ${reportNumber}

## Time Spent
${timeSpent}

## Plans for Next Quarter
${plansForNextQuarter}

## Use of Funds
${useOfFunds}

${helpNeeded ? `## Help Needed\n${helpNeeded}` : ''}
`
}

export async function getGrantById(grantId: string) {
  const response = await fetch(`/api/grants/${grantId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch grant details')
  }
  return response.json()
}

export async function getReportById(reportId: string) {
  const response = await fetch(`/api/reports/${reportId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch report details')
  }
  return response.json()
}
