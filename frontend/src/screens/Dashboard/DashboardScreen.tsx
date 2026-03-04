import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, ActivityIndicator, RefreshControl, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { theme } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';
import { useTontineStore } from '../../store/useTontineStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { TontineCard } from '../../components/ui/TontineCard';
import { Button } from '../../components/ui/Button';
import { useNavigation } from '@react-navigation/native';
import { LogOut, Plus, Wallet, Users, Bell, TrendingUp, ArrowRight } from 'lucide-react-native';
import { apiClient } from '../../api/client';

export const DashboardScreen = () => {
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);
    const navigation = useNavigation<any>();

    const { tontines, invitations, isLoading, fetchMyTontines, fetchInvitations, respondToInvitation, error } = useTontineStore();
    const { unreadCount, fetchUnreadCount } = useNotificationStore();

    useEffect(() => {
        fetchMyTontines();
        fetchInvitations();
        fetchUnreadCount();
    }, []);

    const activeTontines = (tontines || []).filter(t => t.statut === 'ACTIVE').length;
    const totalCotisation = (tontines || []).reduce((sum, t) => sum + Number(t.montantCotisation || 0), 0);

    return (
        <SafeAreaView style={styles.container}>
            {/* Premium Header */}
            <View style={styles.headerBg}>
                <View style={styles.headerContent}>
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={styles.greeting}>Bonjour, {user?.prenom}</Text>
                            <Text style={styles.subtitle}>Votre tableau de bord TontineFit</Text>
                        </View>
                        <View style={styles.headerActions}>
                            <TouchableOpacity 
                                style={styles.createBtnHeader}
                                onPress={() => navigation.navigate('Tontines', { screen: 'CreateTontine' })}
                            >
                                <Plus color="#FFFFFF" size={24} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>

            {/* Invitations Section */}
            {invitations && invitations.length > 0 && (
                <View style={styles.invitationSection}>
                    <Text style={styles.sectionTitle}>Invitations reçues ({invitations.length})</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.invitationScroll}>
                        {invitations.map(inv => (
                            <View key={inv.id} style={styles.invitationCard}>
                                <View style={styles.invitationInfo}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={styles.invitationTontine}>{inv.tontineNom}</Text>
                                        <View style={styles.invitationBadge}><Text style={styles.invBadgeText}>Nouveau</Text></View>
                                    </View>
                                    <Text style={styles.invitationCreator}>Par {inv.creatorPrenom} {inv.creatorNom}</Text>
                                    <Text style={styles.invitationAmount}>{Number(inv.montantCotisation).toLocaleString('fr-FR')} F • {inv.intervalleJours}j</Text>
                                </View>
                                <View style={styles.invitationActions}>
                                    <TouchableOpacity 
                                        style={[styles.invBtn, styles.accBtn]} 
                                        onPress={() => respondToInvitation(inv.id, 'accepter')}
                                    >
                                        <Text style={styles.invBtnText}>Accepter</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[styles.invBtn, styles.refBtn]}
                                        onPress={() => respondToInvitation(inv.id, 'refuser')}
                                    >
                                        <Text style={[styles.invBtnText, styles.invBtnTextRef]}>Refuser</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}

            {error ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <Button title="Réessayer" onPress={fetchMyTontines} style={{ marginTop: 16, backgroundColor: '#6366F1' }} />
                </View>
            ) : (
                <FlatList
                    data={tontines}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl refreshing={isLoading} onRefresh={fetchMyTontines} colors={['#6366F1']} />
                    }
                    renderItem={({ item }) => (
                        <TontineCard
                            nom={item.nom}
                            montantCotisation={Number(item.montantCotisation)}
                            intervalleJours={(item as any).intervalleJours}
                            statut={item.statut}
                            onPress={() => navigation.navigate('Tontines', { screen: 'TontineDetails', params: { id: item.id } })}
                        />
                    )}
                    ListHeaderComponent={
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Mes Tontines</Text>
                        </View>
                    }
                    ListEmptyComponent={
                        !isLoading ? (
                            <View style={styles.emptyContainer}>
                                <View style={styles.emptyIconCircle}>
                                    <Wallet color="#6366F1" size={36} />
                                </View>
                                <Text style={styles.emptyTitle}>Aucune tontine</Text>
                                <Text style={styles.emptyText}>
                                    Créez votre première tontine et invitez{'\n'}vos proches à participer.
                                </Text>
                                <Button
                                    title="Créer une Tontine"
                                    onPress={() => navigation.navigate('Tontines', { screen: 'CreateTontine' })}
                                    style={styles.createBtn}
                                />
                            </View>
                        ) : null
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F2F8',
    },
    headerBg: {
        backgroundColor: '#1E1B4B',
    },
    headerContent: {
        padding: 20,
        maxWidth: 800,
        width: '100%',
        alignSelf: 'center',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    greeting: {
        fontSize: 22,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -0.3,
    },
    subtitle: {
        fontSize: 13,
        color: '#A5B4FC',
        marginTop: 3,
    },
    logoutBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 10,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    statNumber: {
        fontSize: 20,
        fontWeight: '900',
        color: '#FFFFFF',
        marginTop: 4,
    },
    statLabel: {
        fontSize: 10,
        color: '#A5B4FC',
        marginTop: 2,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    listContainer: {
        padding: 16,
        paddingBottom: 40,
        maxWidth: 800,
        width: '100%',
        alignSelf: 'center',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: theme.colors.text,
    },
    seeAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    seeAllText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6366F1',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    errorText: {
        color: theme.colors.error,
        textAlign: 'center',
        fontSize: 16,
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        boxShadow: '0px 4px 24px rgba(0,0,0,0.06)',
        elevation: 3,
        marginTop: 8,
    },
    emptyIconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: theme.colors.text,
        marginBottom: 6,
    },
    emptyText: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    createBtn: {
        width: 'auto',
        paddingHorizontal: 28,
        backgroundColor: '#6366F1',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    notificationBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    createBtnHeader: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0px 4px 12px rgba(99, 102, 241, 0.4)',
        elevation: 4,
    },
    invitationSection: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 4,
    },
    invitationScroll: {
        paddingVertical: 8,
        gap: 12,
    },
    invitationCard: {
        width: 280,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        boxShadow: '0px 4px 12px rgba(0,0,0,0.05)',
        elevation: 3,
        borderWidth: 1,
        borderColor: '#EEF2FF',
        marginRight: 12,
    },
    invitationInfo: {
        marginBottom: 12,
    },
    invitationTontine: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1E1B4B',
    },
    invitationBadge: {
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    invBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#6366F1',
        textTransform: 'uppercase',
    },
    invitationCreator: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    invitationAmount: {
        fontSize: 14,
        fontWeight: '700',
        color: '#6366F1',
        marginTop: 4,
    },
    invitationActions: {
        flexDirection: 'row',
        gap: 8,
    },
    invBtn: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    accBtn: {
        backgroundColor: '#6366F1',
    },
    refBtn: {
        backgroundColor: '#F1F5F9',
    },
    invBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    invBtnTextRef: {
        color: '#64748B',
    },
});
