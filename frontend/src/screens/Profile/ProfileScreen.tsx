import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { theme } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { User, Mail, Phone, LogOut, Shield } from 'lucide-react-native';
import { apiClient } from '../../api/client';

export const ProfileScreen = () => {
    const user = useAuthStore(state => state.user);
    const logout = useAuthStore(state => state.logout);
    const setAuth = useAuthStore(state => state.setAuth);
    const token = useAuthStore(state => state.token);

    const [nom, setNom] = useState(user?.nom || '');
    const [prenom, setPrenom] = useState(user?.prenom || '');
    const [telephone, setTelephone] = useState(user?.telephone || '');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleUpdate = async () => {
        setIsLoading(true);
        setMessage('');
        setError('');
        try {
            const res = await apiClient.put('/users/me', {
                nom: nom.trim(),
                prenom: prenom.trim(),
                telephone: telephone.trim() || undefined,
            });
            if (res.data.success && token) {
                await setAuth(token, res.data.data);
                setMessage('Profil mis à jour avec succès !');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors de la mise à jour.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Oui, me déconnecter', onPress: logout },
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {(user?.prenom?.[0] || 'U').toUpperCase()}{(user?.nom?.[0] || '').toUpperCase()}
                        </Text>
                    </View>
                    <Text style={styles.name}>{user?.prenom} {user?.nom}</Text>
                    <Text style={styles.email}>{user?.email}</Text>
                    <View style={styles.roleBadge}>
                        <Shield color={theme.colors.primary} size={14} />
                        <Text style={styles.roleText}>{user?.roleSysteme || 'Membre'}</Text>
                    </View>
                </View>

                {/* Edit Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Informations personnelles</Text>

                    {message ? (
                        <View style={styles.successBanner}>
                            <Text style={styles.successText}>{message}</Text>
                        </View>
                    ) : null}
                    {error ? (
                        <View style={styles.errorBanner}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    <Input label="Nom" value={nom} onChangeText={setNom} icon={User} />
                    <Input label="Prénom" value={prenom} onChangeText={setPrenom} icon={User} />
                    <Input label="Téléphone" value={telephone} onChangeText={setTelephone} icon={Phone} keyboardType="phone-pad" />
                    <Input label="Email" value={user?.email || ''} editable={false} icon={Mail} />

                    <Button
                        title="Sauvegarder"
                        onPress={handleUpdate}
                        isLoading={isLoading}
                        style={{ marginTop: theme.spacing.md }}
                    />
                </View>

                {/* Logout */}
                <Button
                    title="Se déconnecter"
                    variant="danger"
                    onPress={handleLogout}
                    style={{ marginTop: theme.spacing.lg }}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.surfaceDarker,
    },
    scrollContent: {
        padding: theme.spacing.lg,
        maxWidth: 520,
        width: '100%',
        alignSelf: 'center',
    },
    profileHeader: {
        alignItems: 'center',
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.white,
        borderRadius: theme.components.borderRadius.xl,
        marginBottom: theme.spacing.lg,
        boxShadow: '0px 2px 12px rgba(0,0,0,0.06)',
        elevation: 3,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    avatarText: {
        color: theme.colors.white,
        fontSize: 28,
        fontWeight: '900',
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    email: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: 4,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primaryLight,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 4,
        borderRadius: theme.components.borderRadius.round,
        marginTop: theme.spacing.sm,
        gap: 4,
    },
    roleText: {
        color: theme.colors.primaryDark,
        fontWeight: '600',
        fontSize: 12,
    },
    card: {
        backgroundColor: theme.colors.white,
        padding: theme.spacing.xl,
        borderRadius: theme.components.borderRadius.xl,
        boxShadow: '0px 2px 12px rgba(0,0,0,0.06)',
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: theme.spacing.lg,
    },
    successBanner: {
        backgroundColor: theme.colors.successLight,
        padding: theme.spacing.md,
        borderRadius: theme.components.borderRadius.md,
        marginBottom: theme.spacing.md,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.success,
    },
    successText: {
        color: theme.colors.success,
        fontWeight: '600',
    },
    errorBanner: {
        backgroundColor: theme.colors.errorLight,
        padding: theme.spacing.md,
        borderRadius: theme.components.borderRadius.md,
        marginBottom: theme.spacing.md,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.error,
    },
    errorText: {
        color: theme.colors.error,
        fontWeight: '600',
    },
});
