/**
 * Utility functions for token generation and management
 * Used for email verification and password reset functionalities
 */
import crypto from 'crypto';

/**
 * Generates a random token for email verification or password reset
 * @param length Length of the token in bytes (resulting string will be twice as long)
 * @returns A hex string token
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Calculates expiry time from now
 * @param hours Number of hours until expiry
 * @returns Date object representing the expiry time
 */
export function getExpiryDate(hours: number = 24): Date {
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + hours);
  return expiryDate;
}

/**
 * Checks if a token is expired
 * @param expiryDate The expiry date to check against
 * @returns boolean indicating if the token is expired
 */
export function isTokenExpired(expiryDate: Date | null | undefined): boolean {
  if (!expiryDate) return true;
  return new Date() > expiryDate;
}