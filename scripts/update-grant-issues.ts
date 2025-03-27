import { Octokit } from '@octokit/rest'
import dotenv from 'dotenv'
import readline from 'readline'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from .env.local
// Try multiple paths to find the .env file
const envPaths = [
  path.resolve(process.cwd(), '.env.local'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '../.env.local'),
  path.resolve(__dirname, '../.env'),
]

let envLoaded = false
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    console.log(`Loading environment from: ${envPath}`)
    dotenv.config({ path: envPath })
    envLoaded = true
    break
  }
}

if (!envLoaded) {
  console.warn(
    'No .env file found! Environment variables must be set manually.'
  )
}

// Log environment status (without exposing token values)
console.log('Environment status:')
console.log(
  `- GH_ORG: ${process.env.GH_ORG ? 'Set' : 'Not set'} (${
    process.env.GH_ORG || 'undefined'
  })`
)
console.log(
  `- GH_REPORTS_REPO: ${process.env.GH_REPORTS_REPO ? 'Set' : 'Not set'} (${
    process.env.GH_REPORTS_REPO || 'undefined'
  })`
)
console.log(
  `- GH_ACCESS_TOKEN: ${
    process.env.GH_ACCESS_TOKEN ? 'Set' : 'Not set'
  } (Length: ${
    process.env.GH_ACCESS_TOKEN ? process.env.GH_ACCESS_TOKEN.length : 0
  })`
)

// Test mode function to simulate an issue
function getTestIssue(issueNumber = 1) {
  return {
    number: issueNumber,
    title: `Test Report ${issueNumber} - My Project`,
    body: `• Project application: https://github.com/OpenSats/applications/issues/123
• Grant issue: https://github.com/OpenSats/grants/issues/456
• This is the rest of the report...
• More content here...`,
  }
}

// Test mode function to simulate a grant issue
function getTestGrantIssue() {
  return {
    data: {
      title: '882628 - My Project Grant',
    },
  }
}

// Test mode function to simulate multiple issues
function getTestIssues() {
  return [
    getTestIssue(1),
    getTestIssue(2),
    {
      number: 3,
      title: 'Test Report 3 - Already Updated Project',
      body: `• Project application: https://github.com/OpenSats/applications/issues/789
• Grant number: 123456
• Grant issue: https://github.com/OpenSats/grants/issues/101112
• This is a report that already has a grant number...`,
    },
    {
      number: 4,
      title: 'Test Report 4 - Multiple Grants Project',
      body: `1st Grant

• Project Application link: https://github.com/OpenSats/applications/issues/123
• Grant issue: https://github.com/OpenSats/grants/issues/456
• GitHub: test/repo1
• Grant start: JAN_2024
• Final report due: JUL_2024

2nd Grant

• Project Application link: https://github.com/OpenSats/applications/issues/789
• Grant issue: https://github.com/OpenSats/grants/issues/101112
• GitHub: test/repo2
• Grant start: SEP_2024
• Final report due: MAR_2025`,
    },
    // Test issue with no grant number - should be updated
    {
      number: 9001,
      title: 'Test Issue Without Grant Number',
      body: `- Application: https://github.com/OpenSats/applications-nostr/issues/123
- Grant Issue: https://github.com/OpenSats/grants/issues/123
- GitHub: [@testuser](https://github.com/testuser)
- Grant start: APR_2025
- Final report due: APR_2026`,
    },
    // Test issue with grant number already - should be skipped
    {
      number: 9002,
      title: 'Test Issue With Grant Number',
      body: `- Application: https://github.com/OpenSats/applications-nostr/issues/456
- Grant number: 887123
- Grant Issue: https://github.com/OpenSats/grants/issues/456
- GitHub: [@testuser2](https://github.com/testuser2)
- Grant start: APR_2025
- Final report due: APR_2026`,
    },
    // Test issue with different format - should be updated
    {
      number: 9003,
      title: 'Test Issue With Different Format',
      body: `• Project application link: https://github.com/OpenSats/applications-nostr/issues/789
• Grant Issue: https://github.com/OpenSats/grants/issues/789
• GitHub: [@testuser3](https://github.com/testuser3)
• Grant start: APR_2025
• Final report due: APR_2026`,
    },
    // Test issue with multiple grants - should update both sections
    {
      number: 9004,
      title: 'Test Issue With Multiple Grants',
      body: `## 1st Grant

- Application: https://github.com/OpenSats/applications-nostr/issues/111
- Grant Issue: https://github.com/OpenSats/grants/issues/111
- GitHub: [@testuser4](https://github.com/testuser4)

## 2nd Grant

- Application: https://github.com/OpenSats/applications-nostr/issues/222
- Grant Issue: https://github.com/OpenSats/grants/issues/222
- GitHub: [@testuser4](https://github.com/testuser4)`,
    },
  ]
}

const octokit = new Octokit({
  auth: process.env.GH_ACCESS_TOKEN,
})

async function findLinkedGrantNumber(
  issueBody: string,
  testMode = false
): Promise<string | null> {
  // Extract the grant issue link - handle both "Grant issue:" and "Grant Issue:" formats
  const grantIssueMatch = issueBody.match(
    /[-•]?\s*Grant [Ii]ssue:.*?github\.com\/OpenSats\/grants\/issues\/(\d+)/i
  )

  if (!grantIssueMatch) {
    return null
  }

  const grantIssueNumber = grantIssueMatch[1]

  if (testMode) {
    // In test mode, just return a fake grant number based on the issue number
    // This makes each test issue have a unique grant number
    return `${880000 + parseInt(grantIssueNumber)}`
  }

  try {
    const org = process.env.GH_ORG
    // Always use 'grants' as the repository name for grant issues
    const grantsRepo = 'grants'

    // Get the grant issue
    const grantIssue = await octokit.rest.issues.get({
      owner: org!,
      repo: grantsRepo,
      issue_number: parseInt(grantIssueNumber),
    })

    // Try multiple patterns to extract the grant number from the title

    // Pattern 1: Number at the beginning followed by a dash (most common)
    // Example: "887390 - Project Name"
    const pattern1 = grantIssue.data.title.match(/^(\d{6,7})\s*-/)
    if (pattern1) {
      return pattern1[1]
    }

    // Pattern 2: Number at the beginning without a dash
    // Example: "887390 Project Name"
    const pattern2 = grantIssue.data.title.match(/^(\d{6,7})(?:\s|$)/)
    if (pattern2) {
      return pattern2[1]
    }

    // Pattern 3: Number anywhere in the title with a prefix like "Grant #"
    // Example: "Project Name (Grant #887390)"
    const pattern3 = grantIssue.data.title.match(/Grant\s+#?(\d{6,7})/)
    if (pattern3) {
      return pattern3[1]
    }

    // Pattern 4: Just look for any 6-7 digit number in the title
    // This is a fallback pattern
    const pattern4 = grantIssue.data.title.match(/(\d{6,7})/)
    if (pattern4) {
      return pattern4[1]
    }

    // If we still can't find a grant number, check the body of the issue
    if (grantIssue.data.body) {
      // Look for "Grant ID:" or "Grant Number:" in the body
      const bodyPattern = grantIssue.data.body.match(
        /Grant\s+(ID|Number|#):\s*(\d{6,7})/i
      )
      if (bodyPattern) {
        return bodyPattern[2]
      }

      // Fallback: any 6-7 digit number in the body
      const bodyFallback = grantIssue.data.body.match(/(\d{6,7})/)
      if (bodyFallback) {
        return bodyFallback[1]
      }
    }

    console.log(
      `Could not find grant number in issue #${grantIssueNumber}: "${grantIssue.data.title}"`
    )
    return null
  } catch (error) {
    console.error(`Error fetching grant issue #${grantIssueNumber}:`, error)
    return null
  }
}

async function updateSingleIssue(issueNumber: number, testMode = false) {
  const org = process.env.GH_ORG
  const reportsRepo = process.env.GH_REPORTS_REPO

  if (!testMode && (!org || !reportsRepo)) {
    console.error('Missing GH_ORG or GH_REPORTS_REPO environment variables')
    process.exit(1)
  }

  try {
    // Get the issue (use test data in test mode)
    const issue = testMode
      ? issueNumber === 3
        ? getTestIssues()[2]
        : issueNumber === 4
        ? getTestIssues()[3]
        : getTestIssue(issueNumber)
      : (
          await octokit.rest.issues.get({
            owner: org!,
            repo: reportsRepo!,
            issue_number: issueNumber,
          })
        ).data

    console.log(`\n${'='.repeat(50)}\n`)
    console.log(`Processing issue #${issue.number}: ${issue.title}`)
    console.log('\nCurrent issue body:')
    console.log(issue.body)

    // Check if the issue already has grant numbers
    if (issue.body?.includes('Grant number:')) {
      console.log(
        `\nIssue #${issue.number} already has all grant numbers - skipping`
      )
      return
    }

    // Check if the issue has a Project Application link but no Grant issue link
    const hasApplicationLink = /Project [Aa]pplication link:/.test(
      issue.body || ''
    )
    const hasGrantIssueLink = /Grant issue:/.test(issue.body || '')

    if (hasApplicationLink && !hasGrantIssueLink) {
      console.log(
        `\nIssue #${issue.number} has a Project Application link but no Grant issue link - skipping`
      )
      return
    }

    // Split the body into sections based on common patterns like "1st Grant", "2nd Grant", etc.
    // Handle both plain text and markdown headers (like **1st Grant**)
    const sectionPattern = /(\n\s*\*\*\d+(?:st|nd|rd|th)\s+Grant\*\*\s*\n)/gi
    let sections = issue.body?.split(sectionPattern)

    // If no sections found, treat the entire body as one section
    if (!sections || sections.length <= 1) {
      sections = [issue.body || '']
    } else {
      // Rebuild sections to include the headers
      const rebuiltSections = []
      for (let i = 0; i < sections.length; i++) {
        if (i % 2 === 0) {
          // Even indices are content
          rebuiltSections.push(sections[i])
        } else {
          // Odd indices are section headers, merge with next content
          if (i + 1 < sections.length) {
            rebuiltSections.push(sections[i] + sections[i + 1])
            i++ // Skip the next content as we've merged it
          } else {
            rebuiltSections.push(sections[i])
          }
        }
      }
      sections = rebuiltSections
    }

    let updatedBody = ''
    let anyUpdates = false

    // Process each section
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i]

      // Skip if this section already has a grant number
      if (section.match(/[-•]?\s*Grant number:\s*\d+/i)) {
        updatedBody += section
        continue
      }

      // Check if the section contains a grant issue link
      const grantIssueMatch = section.match(
        /[-•]?\s*Grant [Ii]ssue:.*?github\.com\/OpenSats\/grants\/issues\/(\d+)/i
      )
      if (!grantIssueMatch) {
        updatedBody += section
        continue
      }

      // Extract the grant issue number
      const grantIssueNumber = grantIssueMatch[1]

      if (!grantIssueNumber) {
        updatedBody += section
        continue
      }

      // Find the grant number for this section
      const grantNumber = await findLinkedGrantNumber(section, testMode)
      if (!grantNumber) {
        console.log(
          `\nCould not find grant number for a section in issue #${issue.number}`
        )
        updatedBody += section
        continue
      }

      console.log(
        `\nFound grant number ${grantNumber} for a section in issue #${issue.number}`
      )

      // Update this section to include the grant number
      // First try with bullet points and "Project Application link:"
      let updatedSection = section.replace(
        /([-•]?\s*Project [Aa]pplication link:.*?)(\n[-•]?\s*Grant [Ii]ssue:)/i,
        (match, p1, p2) => {
          // Check if the first part has a bullet point
          const hasBullet = p1.trim().startsWith('•')
          const hasHyphen = p1.trim().startsWith('-')

          // Match the format of the original
          if (hasBullet) {
            return `${p1}\n• Grant number: ${grantNumber}${p2}`
          } else if (hasHyphen) {
            return `${p1}\n- Grant number: ${grantNumber}${p2}`
          } else {
            // No bullet in original, add bullet to our grant number line
            return `${p1}\n• Grant number: ${grantNumber}${p2}`
          }
        }
      )

      // If no change, try with "Application:"
      if (updatedSection === section) {
        updatedSection = section.replace(
          /([-•]?\s*Application:.*?)(\n[-•]?\s*Grant [Ii]ssue:)/i,
          (match, p1, p2) => {
            // Check if using hyphens or bullets
            const hasHyphen = p1.trim().startsWith('-')
            const hasBullet = p1.trim().startsWith('•')

            if (hasHyphen) {
              return `${p1}\n- Grant number: ${grantNumber}${p2}`
            } else if (hasBullet) {
              return `${p1}\n• Grant number: ${grantNumber}${p2}`
            } else {
              // No bullet/hyphen, use the same indentation as the Application line
              const prefix = p1.match(/^(\s*[-•]?\s*)/)[0]
              return `${p1}\n${prefix}Grant number: ${grantNumber}${p2}`
            }
          }
        )
      }

      // If still no change, try with alternative patterns
      if (updatedSection === section) {
        // Try to find the first line that might be the application link
        const lines = section.split(/\r?\n/)
        const updatedLines = [...lines]
        let updated = false

        for (let i = 0; i < lines.length - 1; i++) {
          // Check if this line contains Application and the next contains Grant Issue
          if (
            (lines[i].match(/Application:/) ||
              lines[i].match(/Project [Aa]pplication link:/)) &&
            lines[i + 1].match(/Grant [Ii]ssue:/)
          ) {
            // Determine the format (bullet, hyphen, or nothing)
            let prefix = ''
            if (lines[i].trim().startsWith('-')) {
              prefix = '- '
            } else if (lines[i].trim().startsWith('•')) {
              prefix = '• '
            } else {
              // Try to extract the indentation
              const indentMatch = lines[i].match(/^(\s*)/)
              prefix = indentMatch ? indentMatch[1] : ''
            }

            // Insert the grant number line
            updatedLines.splice(
              i + 1,
              0,
              `${prefix}Grant number: ${grantNumber}`
            )
            updated = true
            break
          }
        }

        if (updated) {
          updatedBody += updatedLines.join('\n')
          anyUpdates = true
        } else {
          updatedBody += section
        }
      } else {
        updatedBody += updatedSection
        anyUpdates = true
      }
    }

    if (!anyUpdates) {
      console.log(`\nNo updates needed for issue #${issue.number}`)
      return
    }

    console.log(`\nWould update issue body to:\n${updatedBody}`)

    // In test mode, don't actually update the issue
    if (testMode) {
      console.log('\nTest mode: No changes will be made to GitHub')
      return
    }

    // Confirm the update
    const confirm = await answer(
      'Would you like to proceed with this update? (y/n)'
    )
    if ((confirm as string).toLowerCase() !== 'y') {
      console.log('Update cancelled')
      return
    }

    try {
      await octokit.rest.issues.update({
        owner: org!,
        repo: reportsRepo!,
        issue_number: issue.number,
        body: updatedBody,
      })
      console.log(`Successfully updated issue #${issue.number}`)
    } catch (error) {
      console.error(`Error updating issue #${issue.number}:`, error)
    }
  } catch (error) {
    console.error(`Error processing issue #${issueNumber}:`, error)
  }
}

// Helper function to get user input
async function answer(question: string): Promise<string> {
  // Use the readline module from Node.js
  const readline = await import('readline')

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(question + ' ', (answer) => {
      rl.close()
      resolve(answer)
    })
  })
}

// Main function to update issues
async function main() {
  // Load environment variables
  dotenv.config({ path: '.env.local' })

  // Check environment variables
  checkEnvironment()

  // Parse command line arguments
  const args = process.argv.slice(2)
  const testMode = args.includes('--test')

  console.log(
    `Running in ${
      testMode
        ? 'TEST MODE - no changes will be made to GitHub'
        : 'PRODUCTION MODE - changes WILL be made to GitHub'
    }`
  )
  console.log('\n==================================================\n')

  // Check if we're processing a single issue or all issues
  const issueArg = args.find((arg) => !arg.startsWith('--'))

  // Store report data
  const reportData = []
  const totalIssues = 0
  const skippedIssues = 0
  const updatedIssues = 0

  if (issueArg === 'test') {
    // Run test mode with sample issues
    console.log('Running test mode with sample issues')
    const testIssues = getTestIssues()

    for (const issue of testIssues) {
      await processIssue(issue, true, false, false)
    }
  } else if (issueArg === 'all') {
    // Process all issues
    async function processAllIssues(testMode = false) {
      const issues = testMode ? getTestIssues() : await getAllIssues()

      console.log(`\nFetched ${issues.length} issues`)
      console.log('Analyzing issues...\n')

      const totalIssues = 0
      const updatedIssues = 0
      const skippedIssues = 0
      const reportData = []

      for (const issue of issues) {
        totalIssues++

        // Process the issue and get the result
        const result = await processIssue(issue, testMode, true, true) // true = report only, true = concise

        if (result.needsUpdate) {
          updatedIssues++
          reportData.push(result)
        } else {
          skippedIssues++
        }
      }

      // Generate a report of all changes
      if (reportData.length > 0) {
        console.log('\n==================================================')
        console.log('ISSUES TO BE UPDATED:')
        console.log('==================================================')

        for (const item of reportData) {
          // Format the grant numbers for display
          let grantInfo = item.grantNumbers.join(', ')
          if (item.grantNumbers.length > 1) {
            grantInfo = `${item.grantNumbers.length} grants: ${grantInfo}`
          }

          console.log(
            `#${item.issueNumber}: ${item.title.substring(0, 50)}${
              item.title.length > 50 ? '...' : ''
            } - ${grantInfo}`
          )
        }
      } else {
        console.log('\nNo issues need to be updated.')
      }

      console.log('\n==================================================')
      console.log(
        `SUMMARY: ${totalIssues} issues processed, ${updatedIssues} to be updated, ${skippedIssues} skipped`
      )
      console.log('==================================================')

      // Ask for confirmation to proceed with all changes
      if (!testMode && reportData.length > 0) {
        console.log('\nReady to apply changes to GitHub. Please confirm:')
        const answer = await askForConfirmation()
        if (!answer) {
          console.log('Update cancelled.')
          return
        }

        // Second pass: apply all changes
        console.log('\nApplying changes...')
        let successCount = 0
        let errorCount = 0

        for (const item of reportData) {
          try {
            const issue = await getIssue(item.issueNumber)
            if (issue) {
              console.log(`Updating issue #${item.issueNumber}...`)
              await processIssue(issue, false, false, true) // false = not test mode, false = apply changes, true = concise output
              console.log(`✓ Updated issue #${item.issueNumber}`)
              successCount++
            } else {
              console.error(`✗ Issue #${item.issueNumber} not found`)
              errorCount++
            }
          } catch (error) {
            console.error(`✗ Error updating issue #${item.issueNumber}:`, error)
            errorCount++
          }
        }

        console.log('\n==================================================')
        console.log(
          `UPDATE COMPLETE: ${successCount} issues updated successfully, ${errorCount} errors`
        )
        console.log('==================================================')
      }
    }

    await processAllIssues(testMode)
  } else {
    // Process a single issue
    const issueNumber = parseInt(issueArg)
    if (isNaN(issueNumber)) {
      console.error('Please provide a valid issue number or "all"')
      process.exit(1)
    }

    console.log(
      `Processing single issue #${issueNumber}${
        testMode ? ' in TEST MODE - no changes will be made to GitHub' : ''
      }`
    )

    const issue = await getIssue(issueNumber)
    if (issue) {
      await processIssue(issue, testMode, false, false) // false = not test mode, false = apply changes, false = verbose output
    } else {
      console.error(`Issue #${issueNumber} not found`)
    }
  }
}

// Process a single issue
async function processIssue(
  issue: any,
  testMode = false,
  reportOnly = false,
  concise = false
): Promise<any> {
  if (!issue || !issue.body) {
    if (!concise) {
      console.log(
        `Skipping issue #${issue?.number || 'unknown'}: No body content`
      )
    } else {
      console.log('skipped (no body content)')
    }
    return {
      issueNumber: issue?.number || 0,
      title: issue?.title || 'Unknown',
      grantNumbers: [],
      needsUpdate: false,
    }
  }

  if (!concise) {
    console.log(`Processing issue #${issue.number}: ${issue.title}\n`)
    console.log(`Current issue body:\n${issue.body}\n`)
  } else {
    process.stdout.write(`Processing issue #${issue.number}... `)
  }

  // Split the issue body into sections based on common patterns
  let sections = splitIntoSections(issue.body)

  // If there are multiple sections, rebuild them to ensure proper separation
  if (sections.length > 1) {
    const rebuiltSections = []
    for (let i = 0; i < sections.length; i++) {
      if (i > 0 && !sections[i].startsWith('\n')) {
        rebuiltSections.push('\n' + sections[i])
      } else {
        rebuiltSections.push(sections[i])
      }
    }
    sections = rebuiltSections
  }

  let updatedBody = ''
  let anyUpdates = false
  const grantNumbers = []

  // Process each section
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]

    // Skip if this section already has a grant number
    if (section.match(/[-•]?\s*Grant number:\s*\d+/i)) {
      updatedBody += section
      continue
    }

    // Check if the section contains a grant issue link
    const grantIssueMatch = section.match(
      /[-•]?\s*Grant [Ii]ssue:.*?github\.com\/OpenSats\/grants\/issues\/(\d+)/i
    )
    if (!grantIssueMatch) {
      updatedBody += section
      continue
    }

    // Extract the grant issue number
    const grantIssueNumber = grantIssueMatch[1]
    if (!grantIssueNumber) {
      updatedBody += section
      continue
    }

    // Find the grant number for this section
    const grantNumber = await findLinkedGrantNumber(section, testMode)
    if (!grantNumber) {
      if (!concise) {
        console.log(
          `\nCould not find grant number for a section in issue #${issue.number}`
        )
      }
      updatedBody += section
      continue
    }

    if (!concise) {
      console.log(
        `\nFound grant number ${grantNumber} for a section in issue #${issue.number}`
      )
    }
    grantNumbers.push(grantNumber)

    // Update this section to include the grant number
    // First try with bullet points and "Project Application link:"
    let updatedSection = section.replace(
      /([-•]?\s*Project [Aa]pplication link:.*?)(\n[-•]?\s*Grant [Ii]ssue:)/i,
      (match, p1, p2) => {
        // Check if the first part has a bullet point
        const hasBullet = p1.trim().startsWith('•')
        const hasHyphen = p1.trim().startsWith('-')

        // Match the format of the original
        if (hasBullet) {
          return `${p1}\n• Grant number: ${grantNumber}${p2}`
        } else if (hasHyphen) {
          return `${p1}\n- Grant number: ${grantNumber}${p2}`
        } else {
          // No bullet in original, add bullet to our grant number line
          return `${p1}\n• Grant number: ${grantNumber}${p2}`
        }
      }
    )

    // If no change, try with "Application:"
    if (updatedSection === section) {
      updatedSection = section.replace(
        /([-•]?\s*Application:.*?)(\n[-•]?\s*Grant [Ii]ssue:)/i,
        (match, p1, p2) => {
          // Check if using hyphens or bullets
          const hasHyphen = p1.trim().startsWith('-')
          const hasBullet = p1.trim().startsWith('•')

          if (hasHyphen) {
            return `${p1}\n- Grant number: ${grantNumber}${p2}`
          } else if (hasBullet) {
            return `${p1}\n• Grant number: ${grantNumber}${p2}`
          } else {
            // No bullet/hyphen, use the same indentation as the Application line
            const prefix = p1.match(/^(\s*[-•]?\s*)/)[0]
            return `${p1}\n${prefix}Grant number: ${grantNumber}${p2}`
          }
        }
      )
    }

    // If still no change, try with alternative patterns
    if (updatedSection === section) {
      // Try to find the first line that might be the application link
      const lines = section.split(/\r?\n/)
      const updatedLines = [...lines]
      let updated = false

      for (let i = 0; i < lines.length - 1; i++) {
        // Check if this line contains Application and the next contains Grant Issue
        if (
          (lines[i].match(/Application:/) ||
            lines[i].match(/Project [Aa]pplication link:/)) &&
          lines[i + 1].match(/Grant [Ii]ssue:/)
        ) {
          // Determine the format (bullet, hyphen, or nothing)
          let prefix = ''
          if (lines[i].trim().startsWith('-')) {
            prefix = '- '
          } else if (lines[i].trim().startsWith('•')) {
            prefix = '• '
          } else {
            // Try to extract the indentation
            const indentMatch = lines[i].match(/^(\s*)/)
            prefix = indentMatch ? indentMatch[1] : ''
          }

          // Insert the grant number line
          updatedLines.splice(i + 1, 0, `${prefix}Grant number: ${grantNumber}`)
          updated = true
          break
        }
      }

      if (updated) {
        updatedBody += updatedLines.join('\n')
        anyUpdates = true
      } else {
        updatedBody += section
      }
    } else {
      updatedBody += updatedSection
      anyUpdates = true
    }
  }

  if (!anyUpdates) {
    if (!concise) {
      console.log(`\nNo updates needed for issue #${issue.number}`)
    } else {
      console.log('skipped (already has grant number or no grant issue link)')
    }
    return {
      issueNumber: issue.number,
      title: issue.title,
      grantNumbers: [],
      needsUpdate: false,
    }
  }

  if (!concise) {
    console.log(`\nWould update issue body to:\n${updatedBody}`)
  } else {
    console.log(`needs update (grant numbers: ${grantNumbers.join(', ')})`)
  }

  if (testMode) {
    if (!concise) {
      console.log('\nTest mode: No changes will be made to GitHub')
    }
    return {
      issueNumber: issue.number,
      title: issue.title,
      grantNumbers: grantNumbers,
      needsUpdate: true,
    }
  }

  if (reportOnly) {
    // Just return the report data without making changes
    return {
      issueNumber: issue.number,
      title: issue.title,
      grantNumbers: grantNumbers,
      needsUpdate: true,
    }
  }

  // Update the issue on GitHub
  try {
    await updateIssue(issue.number, updatedBody)

    if (!concise) {
      console.log(`Successfully updated issue #${issue.number}`)
    }

    return {
      issueNumber: issue.number,
      title: issue.title,
      grantNumbers: grantNumbers,
      needsUpdate: true,
      updated: true,
    }
  } catch (error) {
    console.error(`Error updating issue #${issue.number}:`, error)

    return {
      issueNumber: issue.number,
      title: issue.title,
      grantNumbers: grantNumbers,
      needsUpdate: true,
      updated: false,
      error: error,
    }
  }
}

// Helper function to ask for confirmation
async function askForConfirmation(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  const answer = await new Promise<string>((resolve) => {
    rl.question(
      '\nWould you like to proceed with these updates? (y/n) ',
      resolve
    )
  })

  rl.close()

  return (answer as string).toLowerCase() === 'y'
}

// Helper function to split issue body into sections
function splitIntoSections(body: string): string[] {
  // Check if body is null or undefined
  if (!body) {
    return ['']
  }

  // First check if there are multiple grants indicated by headers
  const grantSectionMatches = body.match(
    /#{1,3}\s+(1st|2nd|3rd|\d+(?:th|st|nd|rd))\s+Grant/gi
  )

  if (grantSectionMatches && grantSectionMatches.length > 0) {
    // Split by grant headers
    const sections = []
    const parts = body.split(
      /(#{1,3}\s+(?:1st|2nd|3rd|\d+(?:th|st|nd|rd))\s+Grant)/i
    )

    // The first part might be before any headers
    if (parts[0].trim()) {
      sections.push(parts[0])
    }

    // Process the rest of the parts in pairs (header + content)
    for (let i = 1; i < parts.length; i += 2) {
      if (i + 1 < parts.length) {
        sections.push(parts[i] + parts[i + 1])
      } else {
        sections.push(parts[i])
      }
    }

    return sections
  }

  // If no grant headers, treat the whole body as one section
  return [body]
}

// Helper function to update an issue
async function updateIssue(issueNumber: number, updatedBody: string) {
  const org = process.env.GH_ORG
  const reportsRepo = process.env.GH_REPORTS_REPO

  try {
    // Add a small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const response = await octokit.rest.issues.update({
      owner: org,
      repo: reportsRepo,
      issue_number: issueNumber,
      body: updatedBody,
    })

    if (response.status !== 200) {
      throw new Error(`GitHub API returned status ${response.status}`)
    }

    return response.data
  } catch (error) {
    console.error(`Error updating issue #${issueNumber}:`, error)
    throw error
  }
}

// Helper function to get all issues
async function getAllIssues() {
  const org = process.env.GH_ORG
  const reportsRepo = process.env.GH_REPORTS_REPO

  try {
    let allIssues = []
    let page = 1
    let hasMorePages = true

    console.log('Fetching issues from GitHub...')

    while (hasMorePages) {
      const response = await octokit.rest.issues.listForRepo({
        owner: org,
        repo: reportsRepo,
        state: 'all',
        per_page: 100,
        page: page,
      })

      const issues = response.data

      if (issues.length === 0) {
        hasMorePages = false
      } else {
        allIssues = [...allIssues, ...issues]
        console.log(`Fetched page ${page} (${issues.length} issues)`)
        page++
      }
    }

    console.log(`Total issues fetched: ${allIssues.length}`)
    return allIssues
  } catch (error) {
    console.error('Error fetching issues:', error)
    return []
  }
}

// Helper function to get an issue
async function getIssue(issueNumber: number) {
  const org = process.env.GH_ORG
  const reportsRepo = process.env.GH_REPORTS_REPO

  try {
    const issue = await octokit.rest.issues.get({
      owner: org,
      repo: reportsRepo,
      issue_number: issueNumber,
    })

    return issue.data
  } catch (error) {
    console.error(`Error fetching issue #${issueNumber}:`, error)
    return null
  }
}

// Helper function to check environment variables
function checkEnvironment() {
  if (
    !process.env.GH_ORG ||
    !process.env.GH_REPORTS_REPO ||
    !process.env.GH_ACCESS_TOKEN
  ) {
    console.error(
      'Missing environment variables. Please set GH_ORG, GH_REPORTS_REPO, and GH_ACCESS_TOKEN.'
    )
    process.exit(1)
  }
}

// Define the processIssueWrapper function at the root level
async function processIssueWrapper(issue: any) {
  try {
    const result = await processIssue(issue, false, true, true)
    if (result) {
      reportData.push(result)
    }
  } catch (error) {
    console.error(`Error processing issue #${issue.number}:`, error)
  }
}

main()
