import nodemailer from "nodemailer";
export const sendEmail = async ({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    secure: true, // true for port 465, false for other ports
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject,
    text,
    html,
  });
  console.log("Message sent: %s", info.messageId);
  return info;
};
