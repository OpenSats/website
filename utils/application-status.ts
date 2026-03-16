export function applicationsOpenForClient() {
  return process.env.NEXT_PUBLIC_APPLICATIONS_OPEN === 'true'
}

export function applicationsOpenForServer() {
  return process.env.APPLICATIONS_OPEN === 'true'
}
