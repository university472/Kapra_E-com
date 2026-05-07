import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

export const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html
  })
}

export const otpEmailTemplate = (otp, name) => `
  <div style="font-family:Poppins,sans-serif;max-width:480px;margin:auto;padding:24px;
              border:1px solid #e5e7eb;border-radius:12px;">
    <h2 style="color:#b45309;">Kapra Store — Email Verification</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your one-time verification code is:</p>
    <div style="font-size:36px;font-weight:bold;letter-spacing:8px;
                color:#b45309;text-align:center;padding:16px 0;">${otp}</div>
    <p style="color:#6b7280;font-size:13px;">
      This code expires in <strong>10 minutes</strong>. Do not share it with anyone.
    </p>
    <hr style="border-color:#f3f4f6;"/>
    <p style="font-size:12px;color:#9ca3af;">
      If you did not register on Kapra Store, ignore this email.
    </p>
  </div>
`
