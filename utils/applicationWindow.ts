// Closed during the third month of each quarter (Mar, Jun, Sep, Dec).
export function areApplicationsOpen(date = new Date()): boolean {
  return date.getMonth() % 3 !== 2
}
