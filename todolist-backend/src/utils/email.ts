import nodemailer from 'nodemailer';

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  // In a real app, this should be an environment variable like process.env.FRONTEND_URL
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const verificationUrl = `${baseUrl}/api/auth/confirm/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Confirme seu cadastro - ToDoList',
    html: `
      <h2>Bem-vindo ao ToDoList!</h2>
      <p>Obrigado por se cadastrar em nossa plataforma.</p>
      <p>Para concluir seu cadastro, por favor clique no link abaixo para verificar seu e-mail:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 16px 0;">Confirmar E-mail</a>
      <p>Se você não solicitou este cadastro, ignore este e-mail.</p>
      <p>Este link expira em 24 horas.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function verifyEmailWithGoogle(email: string): Promise<boolean> {
  // This is a placeholder for Google API email verification
  // In production, you would use Google's API to verify if the email exists
  // For now, we'll do a basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
