const nodemailer = require("nodemailer");

const sendEmployeeSetupEmail = async (to, name, setupLink) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Set up your employee account",
    html: `
      <h2>Welcome, ${name}</h2>
      <p>You have been added as an employee.</p>
      <p>Click the link below to set up your username and password:</p>
      <a href="${setupLink}">Set up your account</a>
      <p>This link expires in 24 hours.</p>
    `,
  });
};

module.exports = { sendEmployeeSetupEmail };