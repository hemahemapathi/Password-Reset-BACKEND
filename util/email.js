import dotenv from 'dotenv';
import { createTransport } from 'nodemailer';

dotenv.config();
// Create a transporter using Gmail SMTP
const transporter = createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Function to send real email using Gmail
export async function sendEmail(to, subject, text) {
  try {
    await transporter.sendMail({
      from: '"Password Rest" <yourgmail@gmail.com>', // Sender email address
      to, // Recipient email address (real email)
      subject, // Email subject
      text, // Email body content
    });
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}
export default sendEmail;