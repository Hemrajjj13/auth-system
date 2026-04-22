import nodemailer from 'nodemailer';

const createTransport = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

const send = async ({ to, subject, html }) => {
  const transport = createTransport();
  await transport.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

export const sendMagicLink = async (email, token) => {
  const url = `${process.env.CLIENT_URL}/auth/magic?token=${token}`;
  await send({
    to: email,
    subject: 'Your SecureAuth magic link',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;">
        <h2 style="color:#040f0f;margin-bottom:8px;">Sign in to SecureAuth</h2>
        <p style="color:#57737a;margin-bottom:32px;">Click the button below to sign in. This link expires in 15 minutes and can only be used once.</p>
        <a href="${url}" style="display:inline-block;background:#d33f49;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">Sign in now →</a>
        <p style="color:#57737a;font-size:13px;margin-top:32px;">Or copy this URL:<br/><span style="color:#003554;word-break:break-all;">${url}</span></p>
        <p style="color:#57737a;font-size:12px;margin-top:24px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};

export const sendOTP = async (email, otp) => {
  await send({
    to: email,
    subject: `${otp} — Your SecureAuth verification code`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;">
        <h2 style="color:#040f0f;margin-bottom:8px;">Verification code</h2>
        <p style="color:#57737a;margin-bottom:24px;">Use this code to sign in. It expires in 10 minutes and is valid for 3 attempts.</p>
        <div style="background:#f4f8f8;border:2px dashed #85bdbf;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
          <span style="font-size:40px;font-weight:800;letter-spacing:12px;color:#003554;">${otp}</span>
        </div>
        <p style="color:#57737a;font-size:12px;">If you didn't request this code, ignore this email.</p>
      </div>
    `,
  });
};
