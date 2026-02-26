# Configuration MailerSend

## ✅ Configuration Actuelle

Votre token MailerSend est déjà configuré dans `.env`:
```
MAILERSEND_API_KEY=mlsn.5742ce6b15c6b42fcce334b76408512d9a630dae579fb917ec7c85258c66701a
```

## 📧 Domaine d'envoi

MailerSend vous fournit un domaine de test gratuit:
```
noreply@trial-0r83ql3zx7pg2vwr.mlsender.net
```

Ce domaine est déjà configuré dans `.env`.

## 🚀 Installation

```bash
npm install
```

Le package `mailersend` sera installé automatiquement.

## 🧪 Test d'envoi

Créez un fichier `test-email.js`:

```javascript
require('dotenv').config();
const { sendMail } = require('./src/config/mailer');

async function testEmail() {
  try {
    await sendMail(
      'votre@email.com',  // Remplacez par votre email
      'Test Tontine',
      '<h1>Email de test</h1><p>Si vous recevez ceci, MailerSend fonctionne!</p>'
    );
    console.log('✅ Email envoyé avec succès!');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testEmail();
```

Exécutez:
```bash
node test-email.js
```

## 📊 Limites du compte gratuit

- **100 emails/jour** sur le domaine de test
- **12,000 emails/mois** au total
- Parfait pour le développement et les tests

## 🌐 Utiliser votre propre domaine (Production)

### 1. Ajouter votre domaine
1. Allez sur https://app.mailersend.com/domains
2. Cliquez "Add Domain"
3. Entrez votre domaine (ex: `votredomaine.com`)

### 2. Configurer les DNS
Ajoutez les enregistrements DNS fournis par MailerSend:
- **TXT** pour vérification
- **CNAME** pour DKIM
- **MX** (optionnel)

### 3. Vérifier le domaine
Une fois les DNS configurés, cliquez "Verify Domain"

### 4. Mettre à jour .env
```env
MAIL_FROM_EMAIL=noreply@votredomaine.com
MAIL_FROM_NAME=Tontine
```

## 📝 Variables d'environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| MAILERSEND_API_KEY | Token API MailerSend | mlsn.xxx... |
| MAIL_FROM_EMAIL | Email expéditeur | noreply@trial-xxx.mlsender.net |
| MAIL_FROM_NAME | Nom expéditeur | Tontine |

## 🔍 Monitoring

Suivez vos emails sur:
https://app.mailersend.com/activity

Vous pouvez voir:
- Emails envoyés
- Emails délivrés
- Emails ouverts
- Clics sur les liens
- Erreurs

## 🎨 Templates (Optionnel)

MailerSend permet de créer des templates HTML:
1. Allez sur https://app.mailersend.com/email-templates
2. Créez un template
3. Utilisez-le dans votre code:

```javascript
const { MailerSend, EmailParams, Sender, Recipient } = require('mailersend');

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY,
});

const emailParams = new EmailParams()
  .setFrom(sentFrom)
  .setTo(recipients)
  .setTemplateId('template_id_here')
  .setVariables([
    {
      email: 'user@example.com',
      substitutions: [
        { var: 'nom', value: 'John' },
        { var: 'code', value: '123456' }
      ]
    }
  ]);
```

## ⚠️ Sécurité

- ✅ Ne commitez JAMAIS votre token API
- ✅ Le token est dans `.env` (ignoré par git)
- ✅ Utilisez des tokens différents pour dev/staging/prod
- ✅ Régénérez le token si compromis

## 🆘 Dépannage

### Erreur: "Invalid API key"
- Vérifiez que le token est correct dans `.env`
- Vérifiez qu'il n'y a pas d'espaces avant/après

### Erreur: "Domain not verified"
- Utilisez le domaine de test fourni
- Ou vérifiez votre domaine personnalisé

### Emails non reçus
- Vérifiez les spams
- Consultez l'activité sur MailerSend
- Vérifiez que l'email destinataire est valide

## 📚 Documentation

- API Reference: https://developers.mailersend.com/
- Node.js SDK: https://github.com/mailersend/mailersend-nodejs
- Dashboard: https://app.mailersend.com/

## ✅ Prêt!

Votre configuration MailerSend est prête. Les emails seront envoyés pour:
- Vérification d'inscription (code OTP)
- Réinitialisation mot de passe
- Invitations à rejoindre une tontine
- Notifications importantes
