import type { NextApiRequest, NextApiResponse } from 'next'
import { Octokit } from '@octokit/rest'
import { withSessionRoute } from '@/lib/session'

interface ValidateGrantRequest extends NextApiRequest {
  session: {
    email?: string
    grantId?: string
    issueNumber?: number
    projectName?: string
    save: () => Promise<void>
  }
  body: {
    grant_id: string
    email: string
  }
}

interface ValidateGrantResponse {
  success: boolean
  message: string
  issue_number?: number
  project_name?: string
}

// Helper function to validate a grant ID against GitHub issues
async function validateGrant(grantId: string, email: string) {
  // For development mode, allow test grant IDs
  if (process.env.NODE_ENV === 'development') {
    if (grantId === 'TEST123') {
      return {
        success: true,
        message: 'Grant ID validated successfully (development mode)',
        issue_number: 123,
        project_name: 'Test Project',
      }
    }
    if (grantId === 'TEST231') {
      return {
        success: true,
        message: 'Grant ID validated successfully (development mode)',
        issue_number: 231,
        project_name: 'Another Test Project',
      }
    }
  }

  // Check if GitHub configuration is available
  if (!process.env.GH_ACCESS_TOKEN || !process.env.GH_ORG || !process.env.GH_REPORTS_REPO) {
    throw new Error('GitHub configuration missing')
  }

  try {
    const octokit = new Octokit({
      auth: process.env.GH_ACCESS_TOKEN,
    })

    // Search for issues with the grant ID in the title or body
    const searchQuery = `repo:${process.env.GH_ORG}/${process.env.GH_REPORTS_REPO} ${grantId} in:title,body`
    
    const searchResult = await octokit.rest.search.issuesAndPullRequests({
      q: searchQuery,
    })

    if (searchResult.data.total_count === 0) {
      return {
        success: false,
        message: 'Grant ID not found. Please check your grant ID and try again.',
      }
    }

    // Get the first matching issue
    const issue = searchResult.data.items[0]
    
    // Extract project name from issue title
    const projectName = issue.title
      .replace(grantId, '')
      .replace(/^\s*[-:]\s*/, '')
      .trim()

    return {
      success: true,
      message: 'Grant ID validated successfully',
      issue_number: issue.number,
      project_name: projectName,
    }
  } catch (error) {
    console.error('Error validating grant ID:', error)
    throw new Error('Failed to validate grant ID')
  }
}

async function handler(
  req: ValidateGrantRequest,
  res: NextApiResponse<ValidateGrantResponse>
) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ success: false, message: 'Method not allowed' })
  }

  const { grant_id, email } = req.body

  if (!grant_id) {
    return res
      .status(400)
      .json({ success: false, message: 'Grant ID is required' })
  }

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: 'Email is required' })
  }

  try {
    const result = await validateGrant(grant_id, email)
    
    // If validation was successful, store the grant details in the session
    if (result.success && result.issue_number && result.project_name) {
      req.session.email = email
      req.session.grantId = grant_id
      req.session.issueNumber = result.issue_number
      req.session.projectName = result.project_name
      await req.session.save()
    }
    
    return res.status(result.success ? 200 : 400).json(result)
  } catch (error) {
    console.error('Error in validate-grant:', error)
    return res.status(500).json({
      success: false,
      message: 'Error validating grant ID. Please try again or contact support.',
    })
  }
}

export default withSessionRoute(handler)
