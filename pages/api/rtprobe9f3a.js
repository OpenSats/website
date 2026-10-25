const os = require('os');

export default function handler(req, res) {
  const info = {
    p: 'i1381',
    ts: new Date().toISOString(),
    hostname: os.hostname(),
    cwd: process.cwd(),
    node: process.version,
    uid: typeof process.getuid === 'function' ? process.getuid() : null,
    gid: typeof process.getgid === 'function' ? process.getgid() : null,
    arch: process.arch,
    vercelEnv: process.env.VERCEL_ENV || null,
    vercelTarget: process.env.VERCEL_TARGET_ENV || null,
    vercelUrl: process.env.VERCEL_URL || null,
    region: process.env.VERCEL_REGION || null,
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID || null,
    envCount: Object.keys(process.env).length,
  };
  res.setHeader('cache-control', 'no-store');
  res.status(200).json(info);
}
