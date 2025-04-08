import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (!process.env.SENDGRID_API_KEY) {
  console.warn('SendGrid API key not found. Email sending will be disabled.');
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

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
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('Email would have been sent:', { to, subject });
      return false;
    }

    const msg = {
      to,
      from: 'sarathi@example.com', // Set your verified sender email
      subject,
      text,
      html: html || text
    };

    await sgMail.send(msg);
    console.log(`Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

/**
 * Send a verification email to a newly registered user
 */
export async function sendVerificationEmail(to: string, verificationToken: string): Promise<boolean> {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const verificationUrl = `${baseUrl}/api/verify-email?token=${verificationToken}`;
  
  const subject = 'Verify your Sarathi account';
  const text = `Welcome to Sarathi! Please verify your email by clicking the following link: ${verificationUrl}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #5E35B1;">Welcome to Sarathi</h1>
      </div>
      <p>Thank you for registering with Sarathi, your trusted service provider marketplace in Kathmandu.</p>
      <p>To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #5E35B1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email Address</a>
      </div>
      <p>If the button doesn't work, please copy and paste the following link into your browser:</p>
      <p style="word-break: break-all; color: #5E35B1;">${verificationUrl}</p>
      <p>This verification link will expire in 24 hours.</p>
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
      <p style="font-size: 12px; color: #757575; text-align: center;">If you didn't create an account with Sarathi, please ignore this email.</p>
    </div>
  `;
  
  return sendEmail({ to, subject, text, html });
}

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(to: string, resetToken: string): Promise<boolean> {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
  
  const subject = 'Reset your Sarathi password';
  const text = `You requested to reset your Sarathi password. Please click the following link to reset your password: ${resetUrl}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #5E35B1;">Reset Your Password</h1>
      </div>
      <p>You requested to reset your password for your Sarathi account.</p>
      <p>Click the button below to create a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #5E35B1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
      </div>
      <p>If the button doesn't work, please copy and paste the following link into your browser:</p>
      <p style="word-break: break-all; color: #5E35B1;">${resetUrl}</p>
      <p>This password reset link will expire in 1 hour.</p>
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
      <p style="font-size: 12px; color: #757575; text-align: center;">If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
    </div>
  `;
  
  return sendEmail({ to, subject, text, html });
}

/**
 * Send a booking confirmation email
 */
export async function sendBookingConfirmationEmail(
  to: string, 
  bookingDetails: {
    id: number;
    serviceName: string;
    providerName: string;
    date: string;
    time: string;
    location: string;
  }
): Promise<boolean> {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const bookingUrl = `${baseUrl}/dashboard/bookings/${bookingDetails.id}`;
  
  const subject = `Booking Confirmation: ${bookingDetails.serviceName}`;
  const text = `Your booking for ${bookingDetails.serviceName} with ${bookingDetails.providerName} has been confirmed for ${bookingDetails.date} at ${bookingDetails.time}. Location: ${bookingDetails.location}. View your booking at: ${bookingUrl}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #5E35B1;">Booking Confirmed</h1>
      </div>
      <p>Your booking for <strong>${bookingDetails.serviceName}</strong> has been confirmed.</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Service Provider:</strong> ${bookingDetails.providerName}</p>
        <p><strong>Date:</strong> ${bookingDetails.date}</p>
        <p><strong>Time:</strong> ${bookingDetails.time}</p>
        <p><strong>Location:</strong> ${bookingDetails.location}</p>
        <p><strong>Booking ID:</strong> #${bookingDetails.id}</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${bookingUrl}" style="background-color: #5E35B1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Booking Details</a>
      </div>
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
      <p style="font-size: 12px; color: #757575; text-align: center;">Thank you for choosing Sarathi for your service needs.</p>
    </div>
  `;
  
  return sendEmail({ to, subject, text, html });
}