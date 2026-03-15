import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { theme } from '../../theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Mail, Lock, User, Phone, UserPlus, ArrowLeft } from 'lucide-react-native';
import { apiClient } from '../../api/client';
import { useNavigation } from '@react-navigation/native';

export const RegisterScreen = () => {
    const navigation = useNavigation<any>();
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [email, setEmail] = useState('');
    const [telephone, setTelephone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Refs for keyboard navigation
    const prenomRef = useRef<TextInput>(null);
    const emailRef = useRef<TextInput>(null);
    const telRef = useRef<TextInput>(null);
    const passRef = useRef<TextInput>(null);
    const confirmRef = useRef<TextInput>(null);

    const handleRegister = async () => {
        setError('');
        setSuccess('');

        if (!nom.trim() || !prenom.trim() || !email.trim() || !password.trim()) {
            setError('Veuillez remplir tous les champs obligatoires.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }
        if (password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await apiClient.post('/auth/register', {
                nom: nom.trim(),
                prenom: prenom.trim(),
                email: email.trim().toLowerCase(),
                telephone: telephone.trim() || undefined,
                motDePasse: password,
            });

            if (response.data.success) {
                setSuccess('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
                setTimeout(() => {
                    navigation.navigate('Login');
                }, 1500);
            } else {
                setError(response.data.message || 'Erreur lors de la création du compte.');
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Erreur de connexion au serveur.';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.pageContainer}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    {/* Back button */}
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <ArrowLeft color={theme.colors.text} size={24} />
                        <Text style={styles.backText}>Retour</Text>
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <View style={styles.logoCircle}>
                            <UserPlus color={theme.colors.white} size={32} />
                        </View>
                        <Text style={styles.title}>Créer un compte</Text>
                        <Text style={styles.subtitle}>Rejoignez la communauté TontineFit</Text>
                    </View>

                    <View style={styles.card}>
                        {error ? (
                            <View style={styles.errorBanner}>
                                <Text style={styles.errorBannerText}>{error}</Text>
                            </View>
                        ) : null}

                        {success ? (
                            <View style={styles.successBanner}>
                                <Text style={styles.successBannerText}>{success}</Text>
                            </View>
                        ) : null}

                        <View style={styles.row}>
                            <View style={styles.halfInput}>
                                <Input
                                    label="Nom *"
                                    placeholder="Votre nom"
                                    value={nom}
                                    onChangeText={(t: string) => { setNom(t); setError(''); }}
                                    icon={User}
                                    returnKeyType="next"
                                    onSubmitEditing={() => prenomRef.current?.focus()}
                                    blurOnSubmit={false}
                                />
                            </View>
                            <View style={styles.halfInput}>
                                <Input
                                    ref={prenomRef}
                                    label="Prénom *"
                                    placeholder="Votre prénom"
                                    value={prenom}
                                    onChangeText={(t: string) => { setPrenom(t); setError(''); }}
                                    icon={User}
                                    returnKeyType="next"
                                    onSubmitEditing={() => emailRef.current?.focus()}
                                    blurOnSubmit={false}
                                />
                            </View>
                        </View>

                        <Input
                            ref={emailRef}
                            label="Adresse Email *"
                            placeholder="votre@email.com"
                            value={email}
                            onChangeText={(t: string) => { setEmail(t); setError(''); }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            icon={Mail}
                            returnKeyType="next"
                            onSubmitEditing={() => telRef.current?.focus()}
                            blurOnSubmit={false}
                        />

                        <Input
                            ref={telRef}
                            label="Téléphone"
                            placeholder="+226 70 00 00 00"
                            value={telephone}
                            onChangeText={(t: string) => { setTelephone(t); setError(''); }}
                            keyboardType="phone-pad"
                            icon={Phone}
                            returnKeyType="next"
                            onSubmitEditing={() => passRef.current?.focus()}
                            blurOnSubmit={false}
                        />

                        <Input
                            ref={passRef}
                            label="Mot de passe *"
                            placeholder="Minimum 6 caractères"
                            value={password}
                            onChangeText={(t: string) => { setPassword(t); setError(''); }}
                            secureTextEntry
                            icon={Lock}
                            returnKeyType="next"
                            onSubmitEditing={() => confirmRef.current?.focus()}
                            blurOnSubmit={false}
                        />

                        <Input
                            ref={confirmRef}
                            label="Confirmer le mot de passe *"
                            placeholder="Retapez le mot de passe"
                            value={confirmPassword}
                            onChangeText={(t: string) => { setConfirmPassword(t); setError(''); }}
                            secureTextEntry
                            icon={Lock}
                            returnKeyType="done"
                            onSubmitEditing={handleRegister}
                        />

                        <Button
                            title="Créer mon compte"
                            onPress={handleRegister}
                            isLoading={isLoading}
                            style={styles.registerBtn}
                        />

                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>ou</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <Button
                            title="J'ai déjà un compte"
                            variant="outline"
                            onPress={() => navigation.navigate('Login')}
                        />
                    </View>

                    <Text style={styles.footerText}>© 2026 TontineFit — Tous droits réservés</Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    pageContainer: {
        flex: 1,
        backgroundColor: '#EEF2FF',
    },
    container: {
        flex: 1,
        maxWidth: 520,
        width: '100%',
        alignSelf: 'center',
    },
    scrollContent: {
        flexGrow: 1,
        padding: theme.spacing.lg,
        justifyContent: 'center',
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
        gap: 8,
    },
    backText: {
        fontSize: 16,
        color: theme.colors.text,
        fontWeight: '600',
    },
    header: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    logoCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: theme.colors.primary,
    },
    subtitle: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: 4,
    },
    card: {
        backgroundColor: theme.colors.white,
        padding: theme.spacing.xl,
        borderRadius: theme.components.borderRadius.xl,
        boxShadow: '0px 4px 24px rgba(0, 86, 210, 0.10)',
        elevation: 6,
    },
    errorBanner: {
        backgroundColor: theme.colors.errorLight,
        padding: theme.spacing.md,
        borderRadius: theme.components.borderRadius.md,
        marginBottom: theme.spacing.md,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.error,
    },
    errorBannerText: {
        color: theme.colors.error,
        fontSize: 14,
        fontWeight: '600',
    },
    successBanner: {
        backgroundColor: theme.colors.successLight,
        padding: theme.spacing.md,
        borderRadius: theme.components.borderRadius.md,
        marginBottom: theme.spacing.md,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.success,
    },
    successBannerText: {
        color: theme.colors.success,
        fontSize: 14,
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    halfInput: {
        flex: 1,
    },
    registerBtn: {
        marginTop: theme.spacing.sm,
        marginBottom: theme.spacing.md,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: theme.colors.border,
    },
    dividerText: {
        color: theme.colors.textSecondary,
        paddingHorizontal: theme.spacing.md,
        fontSize: 13,
    },
    footerText: {
        textAlign: 'center',
        color: theme.colors.textSecondary,
        fontSize: 12,
        marginTop: theme.spacing.xl,
    }
});
