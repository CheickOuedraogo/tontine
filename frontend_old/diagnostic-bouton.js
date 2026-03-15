#!/usr/bin/env node
/**
 * Script de diagnostic pour le bouton "Démarrer Tontine"
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNOSTIC DU BOUTON DÉMARRER TONTINE\n');

// Vérifier que les fichiers existent
const files = [
    'src/screens/Tontines/AdminTontineScreen.tsx',
    'src/components/ui/Button.tsx',
    'src/api/tontine.ts',
    'src/api/client.ts'
];

console.log('1. Vérification des fichiers...');
let allFilesExist = true;
files.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
        console.log(`   ✅ ${file}`);
    } else {
        console.log(`   ❌ ${file} - MANQUANT`);
        allFilesExist = false;
    }
});

if (!allFilesExist) {
    console.log('\n❌ Certains fichiers sont manquants !');
    process.exit(1);
}

// Vérifier le contenu des fichiers
console.log('\n2. Vérification du code...');

const adminScreen = fs.readFileSync(path.join(__dirname, 'src/screens/Tontines/AdminTontineScreen.tsx'), 'utf8');
if (adminScreen.includes('handleStart') && adminScreen.includes('onPress={handleStart}')) {
    console.log('   ✅ Fonction handleStart présente et liée au bouton');
} else {
    console.log('   ❌ Problème avec la fonction handleStart');
}

if (adminScreen.includes('apiClient.post(`/tontines/${tontineId}/start`)')) {
    console.log('   ✅ Appel API correct');
} else {
    console.log('   ❌ Appel API manquant ou incorrect');
}

const buttonComponent = fs.readFileSync(path.join(__dirname, 'src/components/ui/Button.tsx'), 'utf8');
if (buttonComponent.includes('TouchableOpacity') && buttonComponent.includes('{...props}')) {
    console.log('   ✅ Composant Button correct');
} else {
    console.log('   ❌ Problème avec le composant Button');
}

const tontineApi = fs.readFileSync(path.join(__dirname, 'src/api/tontine.ts'), 'utf8');
if (tontineApi.includes('startTontine')) {
    console.log('   ✅ Fonction startTontine présente dans l\'API');
} else {
    console.log('   ❌ Fonction startTontine manquante');
}

// Vérifier les dossiers de cache
console.log('\n3. Vérification du cache...');
const cacheDirs = [
    'node_modules/.cache',
    '.expo',
    '.expo-shared'
];

cacheDirs.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (fs.existsSync(fullPath)) {
        console.log(`   ⚠️  ${dir} existe (peut causer des problèmes)`);
    } else {
        console.log(`   ✅ ${dir} n'existe pas`);
    }
});

// Recommandations
console.log('\n📋 RECOMMANDATIONS:\n');
console.log('1. Nettoyer le cache:');
console.log('   npx expo start -c\n');
console.log('2. Vérifier que le backend est démarré:');
console.log('   cd ../backend && npm run dev\n');
console.log('3. Vérifier l\'URL de l\'API dans src/api/client.ts\n');
console.log('4. Si le problème persiste, rebuild complet:');
console.log('   rm -rf node_modules .expo');
console.log('   npm install');
console.log('   npx expo start -c\n');

console.log('✅ Diagnostic terminé\n');
