/**
 * @param {string} value - a string representation of a float with 8 decimal points (btc)
 * @returns {boolean} - Returns true if value passed is larger then 1 sat
 */
export default function satsIsGreaterThanZero(value: string): boolean {
  const parsedValue = parseFloat(value);
  const threshold = 0.00000001; 

  return parsedValue >= threshold;
}
