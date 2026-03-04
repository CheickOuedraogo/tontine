import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TextInput } from 'react-native';
import { theme } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Mail, Lock, Shield } from 'lucide-react-native';
import { apiClient } from '../../api/client';
import { useNavigation } from '@react-navigation/native';

export const LoginScreen = () => {
    const setAuth = useAuthStore((state) => state.setAuth);
    const navigation = useNavigation<any>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const passwordRef = useRef<TextInput>(null);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            setError('Veuillez remplir tous les champs.');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            const response = await apiClient.post('/auth/login', {
                email: email.trim().toLowerCase(),
                motDePasse: password,
            });

            if (response.data.success) {
                const { accessToken, refreshToken, user } = response.data;
                await setAuth(accessToken, refreshToken, user);
            } else {
                setError(response.data.message || 'Identifiants incorrects.');
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
                    {/* Logo / Brand */}
                    <View style={styles.header}>
                        <View style={styles.logoCircle}>
                            <Shield color={theme.colors.white} size={36} />
                        </View>
                        <Text style={styles.title}>TontineFit</Text>
                        <Text style={styles.subtitle}>Gérez vos tontines en toute sécurité</Text>
                    </View>

                    {/* Card */}
                    <View style={styles.card}>
                        <Text style={styles.formTitle}>Connexion</Text>
                        <Text style={styles.formSubtitle}>Accédez à votre espace personnel</Text>

                        {error ? (
                            <View style={styles.errorBanner}>
                                <Text style={styles.errorBannerText}>{error}</Text>
                            </View>
                        ) : null}

                        <Input
                            label="Adresse Email"
                            placeholder="votre@email.com"
                            value={email}
                            onChangeText={(text: string) => { setEmail(text); setError(''); }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            icon={Mail}
                            returnKeyType="next"
                            onSubmitEditing={() => passwordRef.current?.focus()}
                            blurOnSubmit={false}
                        />

                        <Input
                            ref={passwordRef}
                            label="Mot de passe"
                            placeholder="••••••••"
                            value={password}
                            onChangeText={(text: string) => { setPassword(text); setError(''); }}
                            secureTextEntry
                            icon={Lock}
                            returnKeyType="done"
                            onSubmitEditing={handleLogin}
                        />

                        <Button
                            title="Se Connecter"
                            onPress={handleLogin}
                            isLoading={isLoading}
                            style={styles.loginBtn}
                        />

                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>ou</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <Button
                            title="Créer un compte"
                            variant="outline"
                            onPress={() => navigation.navigate('Register')}
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
        maxWidth: 460,
        width: '100%',
        alignSelf: 'center',
    },
    scrollContent: {
        flexGrow: 1,
        padding: theme.spacing.lg,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    logoCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    title: {
        fontSize: 36,
        fontWeight: '900',
        color: theme.colors.primary,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 15,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginTop: 4,
    },
    card: {
        backgroundColor: theme.colors.white,
        padding: theme.spacing.xl,
        borderRadius: theme.components.borderRadius.xl,
        boxShadow: '0px 4px 24px rgba(0, 86, 210, 0.10)',
        elevation: 6,
    },
    formTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
        textAlign: 'center',
    },
    formSubtitle: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: theme.spacing.lg,
        marginTop: 4,
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
    loginBtn: {
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
