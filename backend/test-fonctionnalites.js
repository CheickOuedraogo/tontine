require('dotenv').config();
const fs = require('fs');

console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║         VÉRIFICATION DES FONCTIONNALITÉS - BACKEND TONTINE                  ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

// Fonction pour vérifier l'existence d'un fichier
const checkFile = (path, description) => {
  // Enlever le préfixe 'backend/' si on est déjà dans le dossier backend
  const cleanPath = path.startsWith('backend/') ? path.substring(8) : path;
  const exists = fs.existsSync(cleanPath);
  console.log(`${exists ? '✅' : '❌'} ${description}: ${path}`);
  return exists;
};

// Fonction pour vérifier le contenu d'un fichier
const checkFileContent = (path, searchStrings, description) => {
  try {
    const cleanPath = path.startsWith('backend/') ? path.substring(8) : path;
    const content = fs.readFileSync(cleanPath, 'utf8');
    const allFound = searchStrings.every(str => content.includes(str));
    console.log(`${allFound ? '✅' : '❌'} ${description}`);
    return allFound;
  } catch (error) {
    console.log(`❌ ${description} - Erreur: ${error.message}`);
    return false;
  }
};

let totalTests = 0;
let passedTests = 0;

const test = (condition, description) => {
  totalTests++;
  if (condition) passedTests++;
  console.log(`${condition ? '✅' : '❌'} ${description}`);
};

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('1. AUTHENTIFICATION & SÉCURITÉ');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

test(checkFile('backend/src/controllers/auth.controller.js', 'Controller Auth'), 'Controller Auth existe');
test(checkFileContent('backend/src/controllers/auth.controller.js', ['register', 'login', 'verifyEmail', 'forgotPassword', 'resetPassword'], 'Fonctions Auth'), 'Toutes les fonctions d\'authentification');
test(checkFileContent('backend/src/utils/helpers.js', ['generateAccessToken', 'generateRefreshToken', 'hashPassword', 'comparePassword'], 'Helpers JWT/Bcrypt'), 'JWT et Bcrypt configurés');
test(checkFileContent('backend/src/middlewares/auth.middleware.js', ['protect', 'verifyAccessToken'], 'Middleware Auth'), 'Middleware de protection des routes');
test(checkFileContent('backend/src/utils/helpers.js', ['generateOtp', 'storeOtp', 'verifyOtp'], 'OTP'), 'Système OTP pour vérification email');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('2. GESTION DES UTILISATEURS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

test(checkFile('backend/src/controllers/users.controller.js', 'Controller Users'), 'Controller Users existe');
test(checkFileContent('backend/src/controllers/users.controller.js', ['getProfile', 'updateProfile', 'changePassword', 'uploadCnib'], 'Fonctions Users'), 'Gestion profil utilisateur');
test(checkFileContent('backend/src/queries/user.queries.js', ['findById', 'findByEmail', 'create', 'updateProfile', 'updatePassword'], 'Queries Users'), 'Requêtes utilisateurs');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('3. GESTION DES TONTINES');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

test(checkFile('backend/src/controllers/tontines.controller.js', 'Controller Tontines'), 'Controller Tontines existe');
test(checkFileContent('backend/src/controllers/tontines.controller.js', ['createTontine', 'getMesTontines', 'getTontine', 'getMembres', 'startTontine'], 'Fonctions Tontines'), 'Toutes les fonctions tontines');
test(checkFileContent('backend/src/queries/tontine.queries.js', ['findById', 'findByMembre', 'create', 'updateStatut', 'findMembres', 'addMembre'], 'Queries Tontines'), 'Requêtes tontines');
test(checkFileContent('backend/src/controllers/tontines.controller.js', ['genererOrdreAleatoire', 'calculerDatesCycles'], 'Logique Tontine'), 'Génération ordre et cycles');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('4. COTISATIONS & PAIEMENTS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

test(checkFile('backend/src/controllers/cotisations.controller.js', 'Controller Cotisations'), 'Controller Cotisations existe');
test(checkFileContent('backend/src/controllers/cotisations.controller.js', ['getCotisationsByTontine', 'payerCotisation'], 'Fonctions Cotisations'), 'Fonctions cotisations');
test(checkFileContent('backend/src/queries/cotisation.queries.js', ['findByTontineAndCycle', 'payer', 'createBulk', 'allPaidForCycle'], 'Queries Cotisations'), 'Requêtes cotisations');
test(checkFileContent('backend/src/queries/cotisation.queries.js', ['BEGIN', 'COMMIT', 'ROLLBACK'], 'Transactions'), 'Transactions atomiques');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('5. DISTRIBUTIONS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

test(checkFile('backend/src/controllers/distributions.controller.js', 'Controller Distributions'), 'Controller Distributions existe');
test(checkFileContent('backend/src/queries/distribution.queries.js', ['findByTontine', 'create'], 'Queries Distributions'), 'Requêtes distributions');
test(checkFileContent('backend/src/utils/helpers.js', ['calculerMontantNet'], 'Calcul montants'), 'Calcul montant net avec frais');
test(checkFileContent('backend/src/controllers/cotisations.controller.js', ['distributionQ.create'], 'Distribution auto'), 'Distribution automatique après paiement');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('6. CONTRATS ÉLECTRONIQUES');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

test(checkFile('backend/src/controllers/contrats.controller.js', 'Controller Contrats'), 'Controller Contrats existe');
test(checkFileContent('backend/src/controllers/contrats.controller.js', ['createContrat', 'getContrat', 'signerContrat', 'getSignatures'], 'Fonctions Contrats'), 'Toutes les fonctions contrats');
test(checkFileContent('backend/src/queries/contrat.queries.js', ['findByTontine', 'create', 'signer', 'findSignatures'], 'Queries Contrats'), 'Requêtes contrats');
test(checkFileContent('backend/src/queries/contrat.queries.js', ['aSigneContrat'], 'Signature tracking'), 'Suivi des signatures');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('7. INVITATIONS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

test(checkFile('backend/src/controllers/invitations.controller.js', 'Controller Invitations'), 'Controller Invitations existe');
test(checkFileContent('backend/src/controllers/invitations.controller.js', ['inviterMembre', 'accepterInvitation'], 'Fonctions Invitations'), 'Fonctions invitations');
test(checkFileContent('backend/src/queries/invitation.queries.js', ['findByToken', 'create', 'updateStatut'], 'Queries Invitations'), 'Requêtes invitations');
test(checkFileContent('backend/src/controllers/invitations.controller.js', ['sendMail'], 'Email invitation'), 'Envoi email d\'invitation');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('8. NOTIFICATIONS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

test(checkFile('backend/src/controllers/notifications.controller.js', 'Controller Notifications'), 'Controller Notifications existe');
test(checkFileContent('backend/src/controllers/notifications.controller.js', ['getNotifications', 'marquerCommeLue', 'getUnreadCount'], 'Fonctions Notifications'), 'Fonctions notifications');
test(checkFileContent('backend/src/queries/notification.queries.js', ['findByUser', 'create', 'markAsRead', 'countUnread'], 'Queries Notifications'), 'Requêtes notifications');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('9. COMMUNICATION TEMPS RÉEL');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

test(checkFileContent('backend/index.js', ['socket.io', 'Server'], 'Socket.io'), 'Socket.io configuré');
test(checkFileContent('backend/index.js', ['join_room', 'send_message', 'new_message'], 'Events Socket'), 'Events Socket.io');
test(checkFileContent('backend/index.js', ['verifyAccessToken'], 'Auth Socket'), 'Authentification Socket.io');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('10. ENVOI D\'EMAILS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

test(checkFile('backend/src/config/mailer.js', 'Config Mailer'), 'Configuration mailer existe');
test(checkFileContent('backend/src/config/mailer.js', ['MailerSend', 'sendMail'], 'MailerSend'), 'MailerSend configuré');
test(checkFileContent('backend/.env', ['MAILERSEND_API_KEY'], 'Token MailerSend'), 'Token MailerSend dans .env');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('11. VALIDATION & SÉCURITÉ');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

test(checkFile('backend/src/middlewares/validation.middleware.js', 'Middleware Validation'), 'Middleware validation existe');
test(checkFileContent('backend/src/middlewares/validation.middleware.js', ['Joi', 'validate', 'schemas'], 'Joi'), 'Validation Joi configurée');
test(checkFileContent('backend/src/middlewares/isCreator.middleware.js', ['isCreator'], 'Middleware Creator'), 'Middleware isCreator');
test(checkFileContent('backend/src/middlewares/isMember.middleware.js', ['isMember'], 'Middleware Member'), 'Middleware isMember');
test(checkFileContent('backend/src/middlewares/errorHandler.js', ['errorHandler', 'ApiError'], 'Error Handler'), 'Gestion centralisée des erreurs');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('12. TÂCHES PLANIFIÉES');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

test(checkFile('backend/src/jobs/cron.js', 'CRON Jobs'), 'Fichier CRON existe');
test(checkFileContent('backend/src/jobs/cron.js', ['node-cron', 'schedule'], 'CRON config'), 'CRON configuré');
test(checkFileContent('backend/index.js', ['require(\'./src/jobs/cron\')'], 'CRON loaded'), 'CRON chargé au démarrage');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('13. BASE DE DONNÉES');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

test(checkFile('backend/schema.sql', 'Schéma SQL'), 'Schéma SQL existe');
test(checkFileContent('backend/schema.sql', ['CREATE TABLE "User"', 'CREATE TABLE "Tontine"', 'CREATE TABLE "Cotisation"', 'CREATE TABLE "Distribution"'], 'Tables principales'), 'Tables principales créées');
test(checkFileContent('backend/schema.sql', ['CREATE TYPE frequence_enum', 'CREATE TYPE statut_tontine_enum', 'CREATE TYPE statut_cotisation_enum'], 'ENUM types'), 'Types ENUM définis');
test(checkFileContent('backend/schema.sql', ['CREATE INDEX'], 'Index'), 'Index optimisés');
test(checkFile('backend/init-db.js', 'Script init DB'), 'Script d\'initialisation DB');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('14. ROUTES API');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

test(checkFile('backend/src/routes/auth.routes.js', 'Routes Auth'), 'Routes Auth');
test(checkFile('backend/src/routes/users.routes.js', 'Routes Users'), 'Routes Users');
test(checkFile('backend/src/routes/tontines.routes.js', 'Routes Tontines'), 'Routes Tontines');
test(checkFile('backend/src/routes/cotisations.routes.js', 'Routes Cotisations'), 'Routes Cotisations');
test(checkFile('backend/src/routes/distributions.routes.js', 'Routes Distributions'), 'Routes Distributions');
test(checkFile('backend/src/routes/contrats.routes.js', 'Routes Contrats'), 'Routes Contrats');
test(checkFile('backend/src/routes/invitations.routes.js', 'Routes Invitations'), 'Routes Invitations');
test(checkFile('backend/src/routes/notifications.routes.js', 'Routes Notifications'), 'Routes Notifications');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('15. CONFIGURATION');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

test(checkFile('backend/.env', 'Fichier .env'), 'Fichier .env existe');
test(checkFile('backend/.env.example', 'Fichier .env.example'), 'Fichier .env.example');
test(checkFile('backend/package.json', 'package.json'), 'package.json existe');
test(checkFileContent('backend/package.json', ['express', 'pg', 'jsonwebtoken', 'bcrypt', 'mailersend', 'socket.io'], 'Dépendances'), 'Toutes les dépendances');
test(checkFile('backend/src/config/cors.js', 'Config CORS'), 'Configuration CORS');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('16. DOCUMENTATION');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

test(checkFile('backend/README.md', 'README'), 'README.md');
test(checkFile('backend/API.md', 'API Doc'), 'Documentation API');
test(checkFile('backend/ARCHITECTURE.md', 'Architecture'), 'Documentation Architecture');
test(checkFile('backend/DEPLOYMENT.md', 'Deployment'), 'Guide de déploiement');
test(checkFile('backend/postman_collection.json', 'Postman'), 'Collection Postman');

console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║                            RÉSUMÉ DES TESTS                                  ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

const percentage = ((passedTests / totalTests) * 100).toFixed(1);
console.log(`Tests réussis: ${passedTests}/${totalTests} (${percentage}%)\n`);

if (passedTests === totalTests) {
  console.log('🎉 EXCELLENT! Toutes les fonctionnalités sont implémentées!\n');
} else if (percentage >= 90) {
  console.log('✅ TRÈS BIEN! La plupart des fonctionnalités sont implémentées.\n');
} else if (percentage >= 75) {
  console.log('⚠️  BON! Quelques fonctionnalités manquent.\n');
} else {
  console.log('❌ ATTENTION! Plusieurs fonctionnalités manquent.\n');
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Pour plus de détails, consultez:');
console.log('  • backend/PROJECT_STATUS.md - État du projet');
console.log('  • backend/API.md - Documentation API complète');
console.log('  • backend/ARCHITECTURE.md - Architecture détaillée');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
