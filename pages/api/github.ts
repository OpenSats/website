import { Octokit } from '@octokit/rest'
import { NextApiRequest, NextApiResponse } from 'next/types'
import { isSpamSubmission } from '@/utils/spam-helpers'

const GH_ACCESS_TOKEN = process.env.GH_ACCESS_TOKEN
const GH_ORG = process.env.GH_ORG
const GH_APP_REPO = process.env.GH_APP_REPO

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  const application = req.body || {}

  if (isSpamSubmission(application)) {
    console.warn('Application rejected by spam checks')
    return res.status(422).json({ message: 'Submission rejected' })
  }

  if (!GH_ACCESS_TOKEN || !GH_ORG || !GH_APP_REPO) {
    console.error('GitHub application storage is not configured')
    return res.status(500).json({ message: 'Application storage unavailable' })
  }

  try {
    const octokit = new Octokit({ auth: GH_ACCESS_TOKEN })
    const byOrFor = application.LTS ? 'for' : 'by'
    const issueTitle = `${application.RED ? 'RED: ' : ''}${
      application.project_name
    } ${byOrFor} ${application.your_name}`

    const contactFooter = `
---

${application.website ? `Website: ${application.website}` : ''}
${application.license ? `License: ${application.license}` : ''}
${application.github ? `GitHub: ${application.github}` : ''}
${
  application.personal_github
    ? `Personal GitHub: ${application.personal_github}`
    : ''
}
${
  application.other_contact
    ? `Other contact details: ${application.other_contact}`
    : ''
}
${application.other_lead ? `Project lead: ${application.other_lead}` : ''}
`

    const organizations = Array.isArray(application.organizations)
      ? application.organizations.join(', ')
      : application.organizations
      ? String(application.organizations)
      : ''

    // Condensed information for screening purposes, no PII
    const issueBody = application.RED
      ? `
### Research

${application.short_description}

### Prior Work

${application.prior_work || 'n/a'}

### Budget

**Spend so far:**
${application.token_spend_so_far || 'n/a'}

**Expected ongoing burn:**
${application.estimated_token_burn || 'n/a'}

**Duration:** ${application.duration || 'n/a'}

### Acknowledgments

**Terms effective:** ${application.red_terms_effective || 'n/a'}

- Not authorization: ${application.red_ack_not_authorization ? 'Yes' : 'No'}
- Sanctions / export-control: ${application.red_ack_sanctions ? 'Yes' : 'No'}
- Authorized LLM/compute accounts: ${
          application.red_ack_llm_accounts ? 'Yes' : 'No'
        }
- Accurate info / responsible disclosure: ${
          application.red_ack_accurate_responsible ? 'Yes' : 'No'
        }
- Terms & privacy: ${application.red_ack_terms ? 'Yes' : 'No'}
${contactFooter}`
      : `
### Description

${application.short_description}

### Potential Impact

${application.potential_impact}

### Other Organizations Applied To

${
  organizations
    ? `This application was submitted to: ${organizations}`
    : 'No organizations specified'
}

### Timeline & Milestones

${application.duration ? `Grant duration: ${application.duration}` : ''}
${application.commitment ? `Time commitment: ${application.commitment}` : ''}

${application.timelines || ''}

### Proposed Budget

${application.proposed_budget}

**Prior funding:** ${application.has_received_funding === 'yes' ? 'Yes' : 'No'}

${application.what_funding ? application.what_funding : ''}

**Additional funding sources:** ${
          application.has_additional_funding === 'yes' ? 'Yes' : 'No'
        }

${application.additional_funding ? application.additional_funding : ''}

### References & Prior Contributions

${application.references || ''}

${application.bios ? application.bios : 'No prior contributions.'}

**Years of dev experience:**
${application.years_experience ? `${application.years_experience}` : 'n/a'}

### Project Media

${
  application.screenshots_videos
    ? application.screenshots_videos
    : 'None provided.'
}

### Video Application

${
  application.video_application
    ? application.video_application
    : 'None provided.'
}

### Anything Else

${application.anything_else ? application.anything_else : 'No.'}
${contactFooter}`

    // Label set according to "main focus" (absent for RED applications)
    const mainFocus = application.main_focus
      ? `${application.main_focus}`.toLowerCase()
      : ''
    const issueLabels = mainFocus ? [mainFocus] : []
    if (mainFocus === 'layer1' || mainFocus === 'layer2') {
      issueLabels.push('bitcoin')
    }

    if (application.source === 'common-grant-app') {
      issueLabels.push('common-grant-app')
    }

    let appRepo = GH_APP_REPO
    if (mainFocus === 'nostr') appRepo = `${GH_APP_REPO}-nostr`
    if (mainFocus === 'layer1') appRepo = `${GH_APP_REPO}-layer1`
    if (mainFocus === 'layer2') appRepo = `${GH_APP_REPO}-layer2`
    if (mainFocus === 'core') appRepo = `${GH_APP_REPO}-core`
    if (mainFocus === 'ecash') appRepo = `${GH_APP_REPO}-ecash`

    if (application.LTS) issueLabels.push('LTS')
    if (application.RED) issueLabels.push('RED')
    if (application.has_received_funding === 'yes') {
      issueLabels.push('prior funding')
    }
    if (!application.RED) {
      if (!application.free_open_source) issueLabels.push('not FLOSS')
      if (!application.are_you_lead) issueLabels.push('surrogate')
    }

    const issue = await octokit.rest.issues.create({
      owner: GH_ORG,
      repo: appRepo,
      title: issueTitle,
      body: issueBody,
      labels: issueLabels,
    })

    return res.status(200).json({
      message: 'success',
      issueNumber: issue.data.number,
      issueUrl: issue.data.html_url,
    })
  } catch (err) {
    console.error('Failed to store application in GitHub', err)
    return res.status(502).json({ message: 'Application storage failed' })
  }
}
