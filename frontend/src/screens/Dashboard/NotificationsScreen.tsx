import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNotificationStore } from '../../store/useNotificationStore';
import { Bell, Info, AlertTriangle, CheckCircle, Clock, Wallet, Users } from 'lucide-react-native';

const ICON_MAP: Record<string, { icon: any; color: string; bg: string }> = {
    PAIEMENT_RECU: { icon: CheckCircle, color: '#059669', bg: '#D1FAE5' },
    RETARD_PAIEMENT: { icon: AlertTriangle, color: '#DC2626', bg: '#FEE2E2' },
    RAPPEL_PAIEMENT: { icon: Clock, color: '#D97706', bg: '#FEF3C7' },
    TONTINE_DEMARREE: { icon: Wallet, color: '#6366F1', bg: '#EEF2FF' },
    INVITATION: { icon: Users, color: '#6366F1', bg: '#EEF2FF' },
    DEFAULT: { icon: Info, color: '#6366F1', bg: '#EEF2FF' },
};

export const NotificationsScreen = () => {
    const { notifications, isLoading, fetchNotifications, markAsRead } = useNotificationStore();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const renderItem = ({ item }: { item: any }) => {
        const config = ICON_MAP[item.type] || ICON_MAP.DEFAULT;
        const IconComponent = config.icon;

        return (
            <TouchableOpacity
                style={[styles.card, !item.estLue && styles.unreadCard]}
                onPress={() => markAsRead(item.id)}
                activeOpacity={0.7}
            >
                <View style={[styles.iconCircle, { backgroundColor: config.bg }]}>
                    <IconComponent color={config.color} size={20} />
                </View>
                <View style={styles.content}>
                    <Text style={[styles.title, !item.estLue && styles.unreadTitle]}>{item.titre}</Text>
                    <Text style={styles.message} numberOfLines={2}>{item.contenu}</Text>
                    <Text style={styles.date}>
                        {new Date(item.dateCreation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} à {new Date(item.dateCreation).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
                {!item.estLue && <View style={styles.unreadDot} />}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerIcon}>
                    <Bell color="#FFFFFF" size={22} />
                </View>
                <View>
                    <Text style={styles.headerTitle}>Alertes</Text>
                    <Text style={styles.headerSubtitle}>
                        {notifications.filter((n: any) => !n.estLue).length} non lue(s)
                    </Text>
                </View>
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIcon}>
                                <Bell color="#A5B4FC" size={32} />
                            </View>
                            <Text style={styles.emptyTitle}>Aucune alerte</Text>
                            <Text style={styles.emptyText}>Vos notifications apparaîtront ici.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F2F8' },
    // Header
    header: {
        backgroundColor: '#1E1B4B',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        gap: 12,
    },
    headerIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#A5B4FC',
        marginTop: 2,
    },
    // List
    list: {
        padding: 16,
        maxWidth: 600,
        width: '100%',
        alignSelf: 'center',
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        padding: 14,
        borderRadius: 14,
        marginBottom: 10,
        alignItems: 'center',
        gap: 12,
        boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
        elevation: 2,
    },
    unreadCard: {
        backgroundColor: '#EEF2FF',
        borderWidth: 1,
        borderColor: '#C7D2FE',
    },
    iconCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: { flex: 1 },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E1B4B',
        marginBottom: 3,
    },
    unreadTitle: {
        fontWeight: '800',
        color: '#312E81',
    },
    message: {
        fontSize: 13,
        color: '#64748B',
        lineHeight: 18,
        marginBottom: 4,
    },
    date: {
        fontSize: 11,
        color: '#94A3B8',
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#6366F1',
    },
    // Empty
    emptyContainer: {
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        boxShadow: '0px 4px 24px rgba(0,0,0,0.06)',
        elevation: 3,
        marginTop: 20,
    },
    emptyIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#E0E7FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E1B4B',
        marginBottom: 4,
    },
    emptyText: {
        color: '#64748B',
        fontSize: 13,
        textAlign: 'center',
    },
});
