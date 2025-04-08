/**
 * Utility functions for OTP generation, validation, and management
 */
import crypto from 'crypto';

/**
 * Generate a random 6-digit OTP
 * @returns A 6-digit OTP as string
 */
export function generateOTP(): string {
  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
}

/**
 * Calculate OTP expiry time (10 minutes from now)
 * @returns Date object representing the expiry time
 */
export function getOTPExpiryTime(): Date {
  const expiryTime = new Date();
  expiryTime.setMinutes(expiryTime.getMinutes() + 10); // 10 minutes expiry
  return expiryTime;
}

/**
 * Checks if a OTP is expired
 * @param expiryTime The expiry time to check against
 * @returns boolean indicating if the OTP is expired
 */
export function isOTPExpired(expiryTime: Date | null | undefined): boolean {
  if (!expiryTime) return true;
  return new Date() > expiryTime;
}

/**
 * Hashes a string (used for safely storing OTPs)
 * @param value The string to hash
 * @returns Hashed string
 */
export function hashValue(value: string): string {
  return crypto
    .createHash('sha256')
    .update(value)
    .digest('hex');
}