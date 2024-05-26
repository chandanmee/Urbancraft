const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");

const sendEmail = asyncHandler(async (data, req, res) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SENDINBLUE_SMTP_HOST,
    port: process.env.SENDINBLUE_SMTP_PORT,
    auth: {
      user: process.env.SENDINBLUE_SMTP_USER,
      pass: process.env.SENDINBLUE_SMTP_PASS,
    },
  });

  async function main() {
    try {
      // send mail with defined transport object
      const info = await transporter.sendMail({
        from: process.env.SENDINBLUE_SMTP_USER, // sender address
        to: data.to, // list of receivers
        subject: data.subject, // Subject line
        text: data.text, // plain text body
        html: data.htm, // html body
      });

      console.log("Message sent: %s", info.messageId);
      // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
    } catch (error) {
      console.error("Error occurred while sending email:", error);
      throw error; // Re-throw the error to be handled by asyncHandler
    }
  }

  await main(); // Call the main function to send the email
});

module.exports = sendEmail;
