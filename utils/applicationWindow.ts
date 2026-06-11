// Closed during the third month of each quarter (Mar, Jun, Sep, Dec).
export function areApplicationsOpen(date = new Date()): boolean {
  // TEMP: forced open for build preview testing. DROP THIS COMMIT BEFORE MERGE.
  return true
  return date.getMonth() % 3 !== 2
}
