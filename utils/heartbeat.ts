export function getHeartbeatUrl(git?: string): string | null {
  if (!git) return null
  try {
    const url = new URL(git)
    if (url.hostname !== 'github.com' && url.hostname !== 'www.github.com') {
      return null
    }
    const [owner, repo] = url.pathname.replace(/^\/+/, '').split('/')
    if (!owner) return null
    const cleanRepo = repo ? repo.replace(/\.git$/, '') : ''
    const query = cleanRepo ? `${owner}/${cleanRepo}` : owner
    return `https://heartbeat.opensats.org/?q=${encodeURIComponent(query)}`
  } catch {
    return null
  }
}
