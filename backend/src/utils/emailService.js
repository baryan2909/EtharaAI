const nodemailer = require('nodemailer');

/**
 * Initialize nodemailer transporter with environment variables
 */
const createTransporter = () => {
  // If SMTP configurations are available, use them
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  ) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Otherwise, return null to trigger fallback mode
  return null;
};

/**
 * Core function to send emails
 * @param {Object} options Email configuration parameters
 * @param {string} options.email Destination email address
 * @param {string} options.subject Email subject line
 * @param {string} options.message Plaintext or HTML email content
 */
const sendEmail = async (options) => {
  const transporter = createTransporter();

  if (transporter) {
    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'Team Task Manager'}" <${process.env.FROM_EMAIL || 'noreply@collabflow.com'}>`,
      to: options.email,
      subject: options.subject,
      html: options.message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email dispatched successfully! Message ID: ${info.messageId}`);
    return info;
  } else {
    // Elegant fallback logger for local development
    console.log('\n--- [MOCK EMAIL SERVICE DISPATCH] ---');
    console.log(`To:      ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log('Message:');
    console.log(options.message);
    console.log('-------------------------------------\n');
    return { mock: true, message: 'Email logged to console (SMTP credentials missing).' };
  }
};

/**
 * Specialized templates for Task Management
 */
const sendTaskAssignmentEmail = async (userEmail, userName, taskTitle, projectName, dueDate) => {
  const subject = `New Task Assigned: "${taskTitle}" in ${projectName}`;
  const formattedDate = dueDate ? new Date(dueDate).toLocaleDateString() : 'No Deadline';
  const htmlMessage = `
    <div style="font-family: sans-serif; padding: 20px; color: #1f2937; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px;">
      <h2 style="color: #4f46e5; margin-bottom: 10px;">Hello, ${userName}!</h2>
      <p style="font-size: 14px; line-height: 1.5;">You have been assigned a new task in the workspace project <strong>${projectName}</strong>.</p>
      
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #4f46e5; margin: 20px 0;">
        <p style="margin: 0; font-size: 16px; font-weight: bold; color: #111827;">${taskTitle}</p>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;"><strong>Due Date:</strong> ${formattedDate}</p>
      </div>

      <p style="font-size: 14px; line-height: 1.5; color: #4b5563;">Please log in to your dashboard to review task instructions and update progress statuses.</p>
      
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 25px 0;" />
      <p style="font-size: 11px; color: #9ca3af; text-align: center;">CollabFlow Task Orchestrator &bull; Automatically Generated</p>
    </div>
  `;

  return await sendEmail({
    email: userEmail,
    subject,
    message: htmlMessage
  });
};

module.exports = {
  sendEmail,
  sendTaskAssignmentEmail
};
