import { NextApiRequest, NextApiResponse } from 'next/types'

const GH_ACCESS_TOKEN = process.env.GH_ACCESS_TOKEN
const GH_ORG = process.env.GH_ORG
const GH_APP_REPO = process.env.GH_APP_REPO

import { Octokit } from "@octokit/rest";
const octokit = new Octokit({ auth: GH_ACCESS_TOKEN });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if (req.method === 'POST') {
    if (!GH_ACCESS_TOKEN || !GH_ORG || !GH_APP_REPO) {
      throw new Error('Env misconfigured')
    }
    console.log(`REPO: ${GH_ORG}/${GH_APP_REPO}`)

    const issueTitle = `${req.body.project_name} by ${req.body.your_name}`

    // Condensed information for screening purposes, no PII
    const issueBody = `
### Description

${req.body.short_description}

### Potential Impact

${req.body.potential_impact}

### Timeline & Milestones

${req.body.timelines}

### Proposed Budget

${req.body.proposed_budget}

### References

${req.body.references}

---

${req.body.github}
${req.body.personal_github}
        `

    // Label set according to "main focus"
    const mainFocus = `${req.body.main_focus}`.toLowerCase()
    const issueLabels = [ mainFocus ]
    if (mainFocus === 'lightning') {
      issueLabels.push('bitcoin') // LN = subset of Bitcoin
    }

    // Tag depending on request for grant and/or request for listing
    req.body.general_fund  && issueLabels.push('grant')
    req.body.explore_page  && issueLabels.push('website')

    try {
      await octokit.rest.issues.create({
        owner: GH_ORG,
        repo: GH_APP_REPO,
        title: issueTitle,
        body: issueBody,
        labels: issueLabels,
      });

      res.status(200).json({ message: 'success' })
    } catch (err) {
      res.status(500).json({ statusCode: 500, message: (err as Error).message })
    }
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}
