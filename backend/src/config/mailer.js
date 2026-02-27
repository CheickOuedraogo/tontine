const { MailerSend, EmailParams, Sender, Recipient } = require('mailersend');

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY,
});

// sendMail(to: string, subject: string, html: string) => Promise<void>
const sendMail = async (to, subject, html) => {
  try {
    const sentFrom = new Sender(
      process.env.MAIL_FROM_EMAIL || 'noreply@trial-0r83ql3zx7pg2vwr.mlsender.net',
      process.env.MAIL_FROM_NAME || 'Tontine'
    );

    const recipients = [new Recipient(to, to)];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(subject)
      .setHtml(html);

    await mailerSend.email.send(emailParams);
    console.log(`Email envoye a ${to}`);
  } catch (error) {
    console.error('Erreur envoi email:', error.message);
    throw error;
  }
};

module.exports = { sendMail };
