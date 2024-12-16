/**
 * Generates a 6-digit one-time password
 * @returns string A random 6-digit number as a string
 */
export const generateOtp = (): string => {
  // Generate a number between 100000 and 999999
  return Math.floor(100000 + Math.random() * 900000).toString();
};
