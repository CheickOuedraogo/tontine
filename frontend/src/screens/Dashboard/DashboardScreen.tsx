import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';
import { useTontineStore } from '../../store/useTontineStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { TontineCard } from '../../components/ui/TontineCard';
import { Button } from '../../components/ui/Button';
import { useNavigation } from '@react-navigation/native';
import { LogOut, Plus, Wallet, Users, Bell, TrendingUp, ArrowRight } from 'lucide-react-native';

export const DashboardScreen = () => {
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);
    const navigation = useNavigation<any>();

    const { tontines, isLoading, fetchMyTontines, error } = useTontineStore();
    const { unreadCount, fetchUnreadCount } = useNotificationStore();

    useEffect(() => {
        fetchMyTontines();
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
                            <Text style={styles.greeting}>Bonjour, {user?.prenom} 👋</Text>
                            <Text style={styles.subtitle}>Votre tableau de bord TontineFit</Text>
                        </View>
                        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.7}>
                            <LogOut color="#A5B4FC" size={20} />
                        </TouchableOpacity>
                    </View>

                    {/* Stats Cards */}
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Wallet color="#A78BFA" size={18} />
                            <Text style={styles.statNumber}>{tontines.length}</Text>
                            <Text style={styles.statLabel}>Tontines</Text>
                        </View>
                        <View style={styles.statCard}>
                            <TrendingUp color="#34D399" size={18} />
                            <Text style={styles.statNumber}>{activeTontines}</Text>
                            <Text style={styles.statLabel}>Actives</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Bell color="#FBBF24" size={18} />
                            <Text style={styles.statNumber}>{unreadCount}</Text>
                            <Text style={styles.statLabel}>Alertes</Text>
                        </View>
                    </View>
                </View>
            </View>

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
                            frequence={item.frequence}
                            statut={item.statut}
                            onPress={() => navigation.navigate('Tontines', { screen: 'TontineDetails', params: { id: item.id } })}
                        />
                    )}
                    ListHeaderComponent={
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Mes Tontines</Text>
                            <TouchableOpacity
                                style={styles.seeAllBtn}
                                onPress={() => navigation.navigate('Tontines')}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.seeAllText}>Tout voir</Text>
                                <ArrowRight color="#6366F1" size={14} />
                            </TouchableOpacity>
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
});
