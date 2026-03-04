import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, TouchableOpacity, Image, TextInput, Platform } from 'react-native';
import { theme } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { User, Mail, Phone, LogOut, Shield, Camera } from 'lucide-react-native';
import { apiClient } from '../../api/client';
import * as ImagePicker from 'expo-image-picker';
import { SOCKET_URL } from '../../constants';

export const ProfileScreen = () => {
    const user = useAuthStore(state => state.user);
    const logout = useAuthStore(state => state.logout);
    const updateUser = useAuthStore(state => state.updateUser);
    const token = useAuthStore(state => state.token);
    const refreshToken = useAuthStore(state => state.refreshToken);
    const setAuth = useAuthStore(state => state.setAuth);

    const [nom, setNom] = useState(user?.nom || '');
    const [prenom, setPrenom] = useState(user?.prenom || '');
    const [telephone, setTelephone] = useState(user?.telephone || '');
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const prenomRef = useRef<TextInput>(null);
    const telRef = useRef<TextInput>(null);

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
                await setAuth(token, refreshToken ?? '', res.data.user);
                setMessage('Profil mis à jour avec succès !');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors de la mise à jour.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePickPhoto = async () => {
        try {
            // Request permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission requise', 'Veuillez autoriser l\'accès à la galerie.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
                base64: true,
            });

            if (!result.canceled && result.assets[0]) {
                setIsUploading(true);
                const asset = result.assets[0];
                
                // Create FormData
                const formData = new FormData();
                
                // For React Native / Expo, we need to provide name, type and uri
                const localUri = asset.uri;
                const filename = localUri.split('/').pop() || 'photo.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;

                // @ts-ignore
                formData.append('photo', { uri: localUri, name: filename, type });
                
                const res = await apiClient.post('/users/me/photo', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (res.data.success && res.data.data) {
                    const photoUrl = res.data.data.photo;
                    await updateUser({ ...user!, photo: photoUrl });
                    setMessage('Photo mise à jour !');
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors de l\'upload de la photo.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleLogout = async () => {
        const confirmed = window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?');
        if (confirmed) {
            await logout();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <TouchableOpacity onPress={handlePickPhoto} style={styles.avatarContainer} disabled={isUploading}>
                        {user?.photo ? (
                            <Image 
                                source={{ uri: user.photo.startsWith('http') ? user.photo : `${SOCKET_URL}${user.photo}` }} 
                                style={styles.avatarImage} 
                            />
                        ) : (
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {(user?.prenom?.[0] || 'U').toUpperCase()}{(user?.nom?.[0] || '').toUpperCase()}
                                </Text>
                            </View>
                        )}
                        <View style={styles.cameraOverlay}>
                            <Camera color={theme.colors.white} size={16} />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.name}>{user?.prenom} {user?.nom}</Text>
                    <Text style={styles.email}>{user?.email}</Text>
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

                    <Input
                        label="Nom"
                        value={nom}
                        onChangeText={setNom}
                        icon={User}
                        returnKeyType="next"
                        onSubmitEditing={() => prenomRef.current?.focus()}
                        blurOnSubmit={false}
                    />
                    <Input
                        ref={prenomRef}
                        label="Prénom"
                        value={prenom}
                        onChangeText={setPrenom}
                        icon={User}
                        returnKeyType="next"
                        onSubmitEditing={() => telRef.current?.focus()}
                        blurOnSubmit={false}
                    />
                    <Input
                        ref={telRef}
                        label="Téléphone"
                        value={telephone}
                        onChangeText={setTelephone}
                        icon={Phone}
                        keyboardType="phone-pad"
                        returnKeyType="done"
                        onSubmitEditing={handleUpdate}
                    />
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
    avatarContainer: {
        position: 'relative',
        marginBottom: theme.spacing.md,
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImage: {
        width: 90,
        height: 90,
        borderRadius: 45,
    },
    avatarText: {
        color: theme.colors.white,
        fontSize: 30,
        fontWeight: '900',
    },
    cameraOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.white,
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
