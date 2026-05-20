const nodemailer = require('nodemailer');

const port = Number(process.env.EMAIL_PORT) || 587;
const secure = port === 465;

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port,
  secure,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// TEMP TEST - runs on server startup to check SMTP connection
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP CONNECTION FAILED:', error.message);
    console.error('SMTP ERROR CODE:', error.code);
    console.error('SMTP ERROR RESPONSE:', error.response);
  } else {
  }
});

const companyName = () => process.env.COMPANY_NAME || 'HR ATS';

const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const buildInterviewHtml = (candidate, interview, job, heading) => {
  const meetingBlock = interview.meetingLink
    ? `<p style="margin: 0 0 12px;"><strong>Meeting link:</strong> <a href="${interview.meetingLink}" style="color: #4f46e5;">${interview.meetingLink}</a></p>`
    : '';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      <h2 style="color: #4f46e5; margin-bottom: 16px;">${heading}</h2>
      <p style="margin: 0 0 12px;">Dear ${candidate.name},</p>
      <p style="margin: 0 0 12px;">
        You have an interview for the position of <strong>${job.title}</strong> at <strong>${companyName()}</strong>.
      </p>
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0 0 8px;"><strong>Date &amp; time:</strong> ${formatDateTime(interview.scheduledAt)}</p>
        <p style="margin: 0 0 8px;"><strong>Duration:</strong> ${interview.duration} minutes</p>
        <p style="margin: 0 0 8px;"><strong>Type:</strong> ${interview.type}</p>
        ${meetingBlock}
      </div>
      <p style="margin: 16px 0 0;">Please arrive on time and let us know if you need to reschedule.</p>
      <p style="margin: 16px 0 0;">Best regards,<br/>${companyName()} Recruitment Team</p>
    </div>
  `;
};

const sendInterviewInvite = async (candidate, interview, job) => {
  try {
    const subject = `Interview Invitation — ${job.title} at ${companyName()}`;
    const html = buildInterviewHtml(
      candidate,
      interview,
      job,
      'Interview Invitation'
    );

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: candidate.email,
      subject,
      html,
    });

  } catch (error) {
    console.error('EMAIL INVITE ERROR:', JSON.stringify(error, null, 2));
    console.error('ERROR MESSAGE:', error.message);
    console.error('ERROR CODE:', error.code);
    console.error('ERROR RESPONSE:', error.response);
  }
};

const sendInterviewReminder = async (candidate, interview, job) => {
  try {
    const subject = `Reminder: Your interview tomorrow — ${job.title}`;
    const html = buildInterviewHtml(
      candidate,
      interview,
      job,
      'Interview Reminder'
    );

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: candidate.email,
      subject,
      html,
    });

  } catch (error) {
    console.error('EMAIL REMINDER ERROR:', error.message);
    console.error('ERROR MESSAGE:', error.message);
    console.error('ERROR CODE:', error.code);
    console.error('ERROR RESPONSE:', error.response);
  }
};

module.exports = {
  sendInterviewInvite,
  sendInterviewReminder,
};