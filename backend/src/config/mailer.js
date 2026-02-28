const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// sendMail(to: string, subject: string, html: string) => Promise<void>
const sendMail = async (to, subject, html) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `${process.env.MAIL_FROM_NAME || 'Tontine'} <${process.env.MAIL_FROM_EMAIL || 'onboarding@resend.dev'}>`,
      to,
      subject,
      html,
    });

    if (error) {
       console.error('Erreur envoi email Resend:', error);
       return;
    }

    console.log(`Email envoye a ${to}. ID: ${data.id}`);
  } catch (err) {
    console.error('Exception envoi email:', err.message);
  }
};

module.exports = { sendMail };

