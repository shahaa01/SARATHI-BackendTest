/**
 * Email service for sending various types of emails
 */
import { MailService } from '@sendgrid/mail';

// Initialize SendGrid with API key
const sendgridApiKey = process.env.SENDGRID_API_KEY;
const mailService = new MailService();

if (sendgridApiKey) {
  mailService.setApiKey(sendgridApiKey);
}

const FROM_EMAIL = 'noreply@sarathi.com';
const APP_NAME = 'Sarathi';
const BASE_URL = process.env.APP_URL || 'http://localhost:3000';

/**
 * Interface for email options
 */
interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Send an email using SendGrid
 */
export async function sendEmail({ to, subject, text = '', html = '' }: EmailOptions): Promise<boolean> {
  if (!sendgridApiKey) {
    console.warn('SendGrid API key not set. Email sending is disabled.');
    return false;
  }

  try {
    await mailService.send({
      to,
      from: FROM_EMAIL,
      subject,
      text,
      html: html || text,
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Send an OTP verification email
 */
export async function sendOTPVerificationEmail(to: string, otp: string): Promise<boolean> {
  const subject = `${APP_NAME} - Your Verification Code`;
  
  const text = `
    Your verification code for ${APP_NAME} is: ${otp}
    
    This code will expire in 10 minutes.
    
    If you did not request this code, please ignore this email.
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a6ee0;">${APP_NAME} - Email Verification</h2>
      <p>To complete your registration, please use the verification code below:</p>
      <div style="background-color: #f4f7ff; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
        ${otp}
      </div>
      <p>This code will expire in <strong>10 minutes</strong>.</p>
      <p>If you did not request this code, please ignore this email.</p>
      <p style="margin-top: 30px; font-size: 12px; color: #666;">
        &copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
      </p>
    </div>
  `;
  
  return await sendEmail({ to, subject, text, html });
}

/**
 * Send a verification email to a newly registered user
 */
export async function sendVerificationEmail(to: string, verificationToken: string): Promise<boolean> {
  const verificationLink = `${BASE_URL}/verify-email?token=${verificationToken}`;
  const subject = `${APP_NAME} - Verify Your Email`;
  
  const text = `
    Thank you for registering with ${APP_NAME}!
    
    Please click the link below to verify your email address:
    ${verificationLink}
    
    This link will expire in 24 hours.
    
    If you did not create an account, please ignore this email.
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a6ee0;">${APP_NAME} - Email Verification</h2>
      <p>Thank you for registering with ${APP_NAME}!</p>
      <p>Please click the button below to verify your email address:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" style="background-color: #4a6ee0; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
          Verify Email
        </a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p style="word-break: break-all; color: #4a6ee0;">${verificationLink}</p>
      <p>This link will expire in <strong>24 hours</strong>.</p>
      <p>If you did not create an account, please ignore this email.</p>
      <p style="margin-top: 30px; font-size: 12px; color: #666;">
        &copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
      </p>
    </div>
  `;
  
  return await sendEmail({ to, subject, text, html });
}

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(to: string, resetToken: string): Promise<boolean> {
  const resetLink = `${BASE_URL}/reset-password?token=${resetToken}`;
  const subject = `${APP_NAME} - Password Reset`;
  
  const text = `
    You requested a password reset for your ${APP_NAME} account.
    
    Please click the link below to reset your password:
    ${resetLink}
    
    This link will expire in 1 hour.
    
    If you did not request a password reset, please ignore this email.
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a6ee0;">${APP_NAME} - Password Reset</h2>
      <p>You requested a password reset for your ${APP_NAME} account.</p>
      <p>Please click the button below to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #4a6ee0; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
          Reset Password
        </a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p style="word-break: break-all; color: #4a6ee0;">${resetLink}</p>
      <p>This link will expire in <strong>1 hour</strong>.</p>
      <p>If you did not request a password reset, please ignore this email.</p>
      <p style="margin-top: 30px; font-size: 12px; color: #666;">
        &copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
      </p>
    </div>
  `;
  
  return await sendEmail({ to, subject, text, html });
}

/**
 * Send a booking confirmation email
 */
export async function sendBookingConfirmationEmail(
  to: string,
  customerName: string,
  serviceName: string,
  providerName: string,
  dateTime: Date,
  bookingId: number
): Promise<boolean> {
  const bookingDetailsLink = `${BASE_URL}/bookings/${bookingId}`;
  const formattedDateTime = dateTime.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const subject = `${APP_NAME} - Booking Confirmation`;
  
  const text = `
    Hello ${customerName},
    
    Your booking for ${serviceName} with ${providerName} has been confirmed.
    
    Date and Time: ${formattedDateTime}
    Booking ID: ${bookingId}
    
    You can view your booking details at: ${bookingDetailsLink}
    
    Thank you for using ${APP_NAME}!
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a6ee0;">${APP_NAME} - Booking Confirmation</h2>
      <p>Hello ${customerName},</p>
      <p>Your booking has been confirmed:</p>
      
      <div style="background-color: #f4f7ff; padding: 20px; margin: 20px 0; border-radius: 5px;">
        <p><strong>Service:</strong> ${serviceName}</p>
        <p><strong>Service Provider:</strong> ${providerName}</p>
        <p><strong>Date & Time:</strong> ${formattedDateTime}</p>
        <p><strong>Booking ID:</strong> ${bookingId}</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${bookingDetailsLink}" style="background-color: #4a6ee0; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
          View Booking Details
        </a>
      </div>
      
      <p>Thank you for using ${APP_NAME}!</p>
      <p style="margin-top: 30px; font-size: 12px; color: #666;">
        &copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
      </p>
    </div>
  `;
  
  return await sendEmail({ to, subject, text, html });
}