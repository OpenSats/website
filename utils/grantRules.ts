/** Video is required on general grant applications. LTS and RED skip it. */
export function isVideoRequired(application: {
  LTS?: unknown
  RED?: unknown
}): boolean {
  return !application.LTS && !application.RED
}
