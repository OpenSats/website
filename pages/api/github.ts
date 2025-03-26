import { NextApiRequest, NextApiResponse } from 'next/types'

const GH_ACCESS_TOKEN = process.env.GH_ACCESS_TOKEN
const GH_ORG = process.env.GH_ORG
const GH_APP_REPO = process.env.GH_APP_REPO

import { Octokit } from '@octokit/rest'
const octokit = new Octokit({ auth: GH_ACCESS_TOKEN })

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    if (!GH_ACCESS_TOKEN || !GH_ORG || !GH_APP_REPO) {
      throw new Error('Env misconfigured')
    }
    console.log(`REPO: ${GH_ORG}/${GH_APP_REPO}`)

    const byOrFor = req.body.LTS ? 'for' : 'by'
    const issueTitle = `${req.body.project_name} ${byOrFor} ${req.body.your_name}`

    // Condensed information for screening purposes, no PII
    const issueBody = `
### Description

${req.body.short_description}

### Potential Impact

${req.body.potential_impact}

### Timeline & Milestones

${req.body.duration ? `Grant duration: ${req.body.duration}` : ''}
${req.body.commitment ? `Time commitment: ${req.body.commitment}` : ''}

${req.body.timelines}

### Proposed Budget

${req.body.proposed_budget}

**Prior funding:** ${req.body.has_received_funding ? 'Yes' : 'No'}

${req.body.what_funding}

### References & Prior Contributions

${req.body.references}

${req.body.bios ? req.body.bios : 'No prior contributions.'}

**Years of dev experience:**
${req.body.years_experience ? `${req.body.years_experience}` : '0'}

### Anything Else

${req.body.anything_else ? req.body.anything_else : 'No.'}

---

${req.body.website ? `Website: ${req.body.website}` : ''}
${req.body.license ? `License: ${req.body.license}` : ''}
${req.body.github ? req.body.github : ''}
${req.body.personal_github ? req.body.personal_github : ''}
${
  req.body.other_contact
    ? `Other contact details: ${req.body.other_contact}`
    : ''
}
        `

    // Label set according to "main focus"
    const mainFocus = `${req.body.main_focus}`.toLowerCase()
    const issueLabels = [mainFocus]
    if (mainFocus === 'layer1' || mainFocus === 'layer2') {
      issueLabels.push('bitcoin') // L1 & L2 = subset of Bitcoin
    }

    // Repo set according to "main focus"
    let appRepo = GH_APP_REPO
    if (mainFocus === 'nostr') {
      appRepo = `${GH_APP_REPO}-nostr`
    }
    if (mainFocus === 'layer1') {
      appRepo = `${GH_APP_REPO}-layer1`
    }
    if (mainFocus === 'layer2') {
      appRepo = `${GH_APP_REPO}-layer2`
    }
    if (mainFocus === 'core') {
      appRepo = `${GH_APP_REPO}-core`
    }
    if (mainFocus === 'education') {
      appRepo = `${GH_APP_REPO}-education`
    }

    // Tag depending on request for grant and/or request for listing
    req.body.LTS && issueLabels.push('LTS')

    // Additional tags based on yes/no answers
    req.body.has_received_funding && issueLabels.push('prior funding')
    !req.body.free_open_source && issueLabels.push('not FLOSS')
    !req.body.are_you_lead && issueLabels.push('surrogate')

    try {
      await octokit.rest.issues.create({
        owner: GH_ORG,
        repo: appRepo,
        title: issueTitle,
        body: issueBody,
        labels: issueLabels,
      })

      res.status(200).json({ message: 'success' })
    } catch (err) {
      res.status(500).json({ statusCode: 500, message: (err as Error).message })
    }
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}
