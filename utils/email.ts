import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
  cc?: string;
  from?: string;
  forceDev?: boolean;
}

/**
 * Send an email using SendGrid
 * @param options Email options including to, subject, text, html, cc, and from
 * @returns Promise that resolves when email is sent
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // Validate required fields
  if (!options.to || !options.subject || !options.text || !options.html) {
    console.error('Missing required email fields:', {
      to: !!options.to,
      subject: !!options.subject,
      text: !!options.text,
      html: !!options.html
    });
    return false;
  }

  // Simulate email sending in development mode unless FORCE_REAL_EMAILS is set
  if (process.env.NODE_ENV !== 'production' && process.env.FORCE_REAL_EMAILS !== 'true') {
    const { to, subject, text } = options;
    console.log(' [DEV MODE] Simulating email send:');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`From: ${options.from || process.env.EMAIL_FROM || 'support@opensats.org'}`);
    console.log('Content:', text.substring(0, 150) + (text.length > 150 ? '...' : ''));
    console.log('[SIMULATED] Email sent successfully!');
    return true;
  }

  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured. Email not sent.');
    return false;
  }

  const { to, subject, text, html, cc, from } = options;
  
  try {
    // Re-initialize SendGrid with API key every time to ensure it's using the latest key
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const msg = {
      to,
      from: from || process.env.EMAIL_FROM || 'support@opensats.org',
      subject,
      text,
      html,
      ...(cc ? { cc } : {})
    };
    
    const startTime = Date.now();
    await sgMail.send(msg);
    const duration = Date.now() - startTime;
    
    console.log(`Email sent successfully to ${to} in ${duration}ms`);
    return true;
  } catch (error: any) {
    console.error('Error sending email:', error);
    if (error.response) {
      console.error('  Status code:', error.code);
      console.error('  Response body:', JSON.stringify(error.response.body, null, 2));
    }
    
    // Log additional details for troubleshooting
    console.error('Email details:', {
      to,
      from: from || process.env.EMAIL_FROM || 'support@opensats.org',
      subject,
      textLength: text?.length || 0,
      htmlLength: html?.length || 0,
      hasCc: !!cc
    });
    
    return false;
  }
}

/**
 * Send an email using SendGrid with retry logic
 * @param options Email options including to, subject, text, html, cc, and from
 * @param maxRetries Maximum number of retry attempts (default: 3)
 * @param retryDelay Base delay in ms between retries (default: 1000, will be multiplied by attempt number)
 * @returns Promise that resolves when email is sent
 */
export async function sendEmailWithRetry(
  options: EmailOptions,
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<boolean> {
  let attempts = 0;
  
  while (attempts < maxRetries) {
    try {
      const result = await sendEmail(options);
      if (result) return true;
      
      // If sendEmail returned false but didn't throw, we still need to retry
      attempts++;
      if (attempts < maxRetries) {
        const delay = retryDelay * attempts;
        console.log(`Email sending attempt ${attempts} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      attempts++;
      if (attempts < maxRetries) {
        const delay = retryDelay * attempts;
        console.error(`Email sending attempt ${attempts} failed with error, retrying in ${delay}ms:`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error(`All ${maxRetries} email sending attempts failed:`, error);
        return false;
      }
    }
  }
  
  console.error(`Failed to send email after ${maxRetries} attempts`);
  return false;
}

/**
 * Send a confirmation email for a submitted report with retry logic
 * @param to Recipient email address
 * @param projectName Name of the project
 * @param reportNumber Report number
 * @param reportUrl URL to the submitted report
 * @param reportContent The markdown content of the report
 * @param forceDev Optional parameter to force development mode simulation
 * @returns Promise that resolves when email is sent
 */
export async function sendReportConfirmationEmail(
  to: string,
  projectName: string,
  reportNumber: string,
  reportUrl: string,
  reportContent?: string,
  forceDev?: boolean
): Promise<boolean> {
  const subject = `OpenSats Progress Report #${reportNumber} Submitted: ${projectName}`;
  
  // Include report content in the plain text version if available
  const reportSection = reportContent ? `
Your Report Content:
${reportContent}

` : '';

  const text = `
Thank you for submitting your progress report for ${projectName}!

Your Progress Report #${reportNumber} has been successfully submitted to OpenSats. The OpenSats team will review your report and may reach out if they have any questions.

${reportSection}If you have any questions or need assistance, please reply to this email or contact support@opensats.org.

Best Regards,
The OpenSats Team
`;

  // Convert Markdown to GitHub-style HTML for the report content
  const formattedReportContent = reportContent ? convertMarkdownToHtml(reportContent) : '';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #24292e;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #f97316;
      padding: 20px;
      text-align: center;
      color: white;
      border-radius: 5px 5px 0 0;
    }
    .content {
      padding: 20px;
      border: 1px solid #e1e4e8;
      border-top: none;
      border-radius: 0 0 5px 5px;
    }
    .button {
      display: inline-block;
      background-color: #f97316;
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #6a737d;
      text-align: center;
    }
    /* GitHub Markdown Styles */
    .markdown-body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 16px;
      line-height: 1.5;
      word-wrap: break-word;
      background-color: #f6f8fa;
      border: 1px solid #e1e4e8;
      border-radius: 6px;
      padding: 16px;
      margin: 20px 0;
    }
    .markdown-body h1 {
      padding-bottom: 0.3em;
      font-size: 2em;
      border-bottom: 1px solid #eaecef;
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
    }
    .markdown-body h2 {
      padding-bottom: 0.3em;
      font-size: 1.5em;
      border-bottom: 1px solid #eaecef;
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
    }
    .markdown-body h3 {
      font-size: 1.25em;
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
    }
    .markdown-body p {
      margin-top: 0;
      margin-bottom: 16px;
    }
    .markdown-body ul, .markdown-body ol {
      padding-left: 2em;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .markdown-body li {
      margin-top: 0.25em;
    }
    .markdown-body a {
      color: #0366d6;
      text-decoration: none;
    }
    .markdown-body a:hover {
      text-decoration: underline;
    }
    .markdown-body code {
      padding: 0.2em 0.4em;
      margin: 0;
      font-size: 85%;
      background-color: rgba(27,31,35,0.05);
      border-radius: 3px;
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
    }
    .markdown-body pre {
      word-wrap: normal;
      padding: 16px;
      overflow: auto;
      font-size: 85%;
      line-height: 1.45;
      background-color: #f6f8fa;
      border-radius: 3px;
      margin-top: 0;
      margin-bottom: 16px;
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
    }
  </style>
</head>
<body>
  <div class="header">
    <h2>Progress Report Submitted</h2>
  </div>
  <div class="content">
    <p>Thank you for submitting your progress report for <strong>${projectName}</strong>!</p>
    
    <p>Your Progress Report #${reportNumber} has been successfully submitted to OpenSats. The OpenSats team will review your report and may reach out if they have any questions.</p>
    
    ${formattedReportContent ? `
    <h3>Your Report Content:</h3>
    <div class="markdown-body">
      ${formattedReportContent}
    </div>
    ` : ''}
    
    <p>If you have any questions or need assistance, please reply to this email or contact <a href="mailto:support@opensats.org">support@opensats.org</a>.</p>
    
    <p>Best Regards,<br>The OpenSats Team</p>
  </div>
  <div class="footer">
    <p>&copy; ${new Date().getFullYear()} OpenSats. All rights reserved.</p>
  </div>
</body>
</html>
`;

  // Only include cc if REPORT_CC_EMAIL is set in the environment
  const options: EmailOptions = {
    to,
    subject,
    text,
    html,
    forceDev
  };
  
  // Add cc only if the environment variable is set
  if (process.env.REPORT_CC_EMAIL) {
    options.cc = process.env.REPORT_CC_EMAIL;
  }

  // Use retry logic in production, but not in development unless forced
  if (process.env.NODE_ENV === 'production' || process.env.FORCE_REAL_EMAILS === 'true') {
    return sendEmailWithRetry(options);
  } else {
    return sendEmail(options);
  }
}

/**
 * Convert Markdown to GitHub-style HTML
 * @param markdown Markdown content to convert
 * @returns HTML content
 */
function convertMarkdownToHtml(markdown: string): string {
  if (!markdown) {
    return '';
  }

  try {
    // Simple Markdown to HTML conversion
    return markdown
      // Headers
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Links
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
      // Lists - improved to handle nested lists better
      .replace(/^\s*[\*\-] (.*$)/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li>$2</li>')
      // Code
      .replace(/`(.*?)`/g, '<code>$1</code>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      // Paragraphs (must be last)
      .replace(/^(?!<[hl]|<li|<pre)(.+)$/gm, '<p>$1</p>')
      // Fix multiple line breaks
      .replace(/\n\n+/g, '\n\n')
      // Fix lists - wrap in ul/ol tags
      .replace(/(<li>.*?<\/li>\n*)+/g, '<ul>$&</ul>')
      // Fix nested lists
      .replace(/<\/ul>\s*<ul>/g, '')
      // Escape HTML in code blocks
      .replace(/<code>([\s\S]*?)<\/code>/g, (match, p1) => 
        `<code>${p1.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>`
      );
  } catch (error) {
    console.error('Error converting Markdown to HTML:', error);
    // Return sanitized plain text as fallback
    return markdown
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .split('\n')
      .map(line => `<p>${line}</p>`)
      .join('');
  }
}
