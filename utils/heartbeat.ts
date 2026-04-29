export function getHeartbeatUrl(git?: string): string | null {
  if (!git) return null
  try {
    const url = new URL(git)
    if (url.hostname !== 'github.com' && url.hostname !== 'www.github.com') {
      return null
    }
    const [owner, repo] = url.pathname.replace(/^\/+/, '').split('/')
    if (!owner || !repo) return null
    const cleanRepo = repo.replace(/\.git$/, '')
    return `https://heartbeat.opensats.org/?repos=${encodeURIComponent(
      `${owner}/${cleanRepo}`
    )}`
  } catch {
    return null
  }
}
