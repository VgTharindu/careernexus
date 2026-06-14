const nodemailer = require("nodemailer");

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Send application confirmation to student ────────────
const sendApplicationConfirmation = async (
  studentEmail,
  studentName,
  jobTitle,
  companyName,
) => {
  try {
    await transporter.sendMail({
      from: `"Campus Job Board" <${process.env.EMAIL_USER}>`,
      to: studentEmail,
      subject: `Application Submitted — ${jobTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7B3F2A;">Application Submitted Successfully</h2>
          <p>Dear <strong>${studentName}</strong>,</p>
          <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been received.</p>
          <p>You can track your application status by logging into the Campus Job Board.</p>
          <br>
          <p style="color: #888;">Campus Job Board — SLIATE Labuduwa</p>
        </div>
      `,
    });
    console.log("Confirmation email sent to:", studentEmail);
  } catch (error) {
    console.error("Email error:", error.message);
  }
};

// ── Send status update to student ───────────────────────
const sendStatusUpdate = async (
  studentEmail,
  studentName,
  jobTitle,
  companyName,
  status,
) => {
  try {
    const statusMessages = {
      shortlisted: {
        subject: `Great News! You have been shortlisted — ${jobTitle}`,
        color: "#1F7A4D",
        message: `Congratulations! You have been shortlisted for <strong>${jobTitle}</strong> at <strong>${companyName}</strong>. The company will contact you soon regarding next steps.`,
      },
      rejected: {
        subject: `Application Update — ${jobTitle}`,
        color: "#C05A00",
        message: `Thank you for applying for <strong>${jobTitle}</strong> at <strong>${companyName}</strong>. Unfortunately your application was not successful this time. Keep applying!`,
      },
      hired: {
        subject: `Congratulations! You have been hired — ${jobTitle}`,
        color: "#2E75B6",
        message: `Congratulations <strong>${studentName}</strong>! You have been selected for <strong>${jobTitle}</strong> at <strong>${companyName}</strong>. Well done!`,
      },
    };

    const content = statusMessages[status];
    if (!content) return;

    await transporter.sendMail({
      from: `"Campus Job Board" <${process.env.EMAIL_USER}>`,
      to: studentEmail,
      subject: content.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${content.color};">Application Status Update</h2>
          <p>Dear <strong>${studentName}</strong>,</p>
          <p>${content.message}</p>
          <br>
          <p style="color: #888;">Campus Job Board — SLIATE Labuduwa</p>
        </div>
      `,
    });
    console.log("Status email sent to:", studentEmail);
  } catch (error) {
    console.error("Email error:", error.message);
  }
};

// ── Send approval notification to company ───────────────
const sendCompanyApproval = async (companyEmail, companyName) => {
  try {
    await transporter.sendMail({
      from: `"Campus Job Board" <${process.env.EMAIL_USER}>`,
      to: companyEmail,
      subject: "Your company account has been approved",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7B3F2A;">Company Account Approved</h2>
          <p>Dear <strong>${companyName}</strong>,</p>
          <p>Your company account on Campus Job Board has been approved. You can now post job and internship listings.</p>
          <br>
          <p style="color: #888;">Campus Job Board — SLIATE Labuduwa</p>
        </div>
      `,
    });
    console.log("Approval email sent to:", companyEmail);
  } catch (error) {
    console.error("Email error:", error.message);
  }
};

module.exports = {
  sendApplicationConfirmation,
  sendStatusUpdate,
  sendCompanyApproval,
};
