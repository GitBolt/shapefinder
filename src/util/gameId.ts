/**
 * Generates a random 4-digit game ID for identification
 * @returns A string containing a 4-digit number
 */
export function generateGameId(): string {
  // Generate a random number between 1000 and 9999
  return Math.floor(1000 + Math.random() * 9000).toString();
} 