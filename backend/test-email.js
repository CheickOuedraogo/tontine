require('dotenv').config();
const { sendMail } = require('./src/config/mailer');

async function testEmail() {
  console.log('=== Test d\'envoi d\'email avec MailerSend ===\n');
  
  // Demander l'email destinataire
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.question('Entrez votre email pour le test: ', async (email) => {
    try {
      console.log(`\nEnvoi d'un email de test a ${email}...`);
      
      await sendMail(
        email,
        'Test Tontine - Configuration MailerSend',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #4CAF50;">✅ MailerSend fonctionne!</h1>
            <p>Si vous recevez cet email, votre configuration MailerSend est correcte.</p>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h2>Configuration actuelle:</h2>
              <ul>
                <li><strong>Token:</strong> ${process.env.MAILERSEND_API_KEY.substring(0, 20)}...</li>
                <li><strong>From:</strong> ${process.env.MAIL_FROM_EMAIL}</li>
                <li><strong>Name:</strong> ${process.env.MAIL_FROM_NAME}</li>
              </ul>
            </div>
            
            <p>Vous pouvez maintenant utiliser l'application Tontine avec l'envoi d'emails!</p>
            
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              Cet email a été envoyé depuis votre backend Tontine en développement.
            </p>
          </div>
        `
      );
      
      console.log('\n✅ Email envoyé avec succès!');
      console.log('Vérifiez votre boîte de réception (et les spams si nécessaire)');
      console.log('\nVous pouvez aussi consulter l\'activité sur:');
      console.log('https://app.mailersend.com/activity\n');
      
    } catch (error) {
      console.error('\n❌ Erreur lors de l\'envoi:', error.message);
      console.log('\nVérifiez:');
      console.log('1. Que le token MAILERSEND_API_KEY est correct dans .env');
      console.log('2. Que vous avez installé les dépendances: npm install');
      console.log('3. Que l\'email destinataire est valide\n');
    }
    
    readline.close();
  });
}

testEmail();
