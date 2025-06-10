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
        Authorization: `token ${process.env.BTCPAY_INVOICE_KEY}`,
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

/**
 * Generates the markdown content for a grant report
 * @param reportData Object containing report data (project_name, time_spent, next_quarter, money_usage, help_needed)
 * @returns Formatted markdown string for the report
 */
export function generateReportContent(reportData: {
  project_name: string
  time_spent: string
  next_quarter: string
  money_usage: string
  help_needed?: string
}): string {
  const { project_name, time_spent, next_quarter, money_usage, help_needed } =
    reportData

  // Format the help needed section if it exists
  const helpNeededSection = help_needed
    ? `## Anything OpenSats could help with? \n${help_needed}`
    : ''

  return `# ${project_name} - Progress Report

## Time Spent
${time_spent}

## Plans for Next Quarter
${next_quarter}

## Use of Funds
${money_usage}

${helpNeededSection}`
}

export function getReportPreview(reportData: any): string {
  return generateReportContent(reportData)
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
