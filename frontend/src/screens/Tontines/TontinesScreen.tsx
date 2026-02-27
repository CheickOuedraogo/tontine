import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, RefreshControl, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';
import { useTontineStore } from '../../store/useTontineStore';
import { TontineCard } from '../../components/ui/TontineCard';
import { Button } from '../../components/ui/Button';
import { Wallet, Plus, Search, TrendingUp } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';

export const TontinesScreen = ({ navigation }: any) => {
    const { tontines, isLoading, fetchMyTontines } = useTontineStore();

    useFocusEffect(
        useCallback(() => {
            fetchMyTontines();
        }, [])
    );

    const activeTontines = (tontines || []).filter(t => t.statut === 'ACTIVE').length;
    const totalCotisations = (tontines || []).reduce((sum, t) => sum + Number(t.montantCotisation || 0), 0);

    return (
        <SafeAreaView style={styles.container}>
            {/* Premium Header */}
            <View style={styles.headerBg}>
                <View style={styles.headerContent}>
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={styles.headerTitle}>Mes Tontines</Text>
                            <Text style={styles.headerSubtitle}>
                                {tontines.length} tontine{tontines.length !== 1 ? 's' : ''} • {activeTontines} active{activeTontines !== 1 ? 's' : ''}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => navigation.navigate('CreateTontine')}
                            activeOpacity={0.8}
                        >
                            <Plus color="#FFFFFF" size={22} />
                        </TouchableOpacity>
                    </View>

                    {/* Mini stats */}
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Wallet color="#A78BFA" size={18} />
                            <Text style={styles.statNumber}>{tontines.length}</Text>
                            <Text style={styles.statLabel}>Total</Text>
                        </View>
                        <View style={styles.statCard}>
                            <TrendingUp color="#34D399" size={18} />
                            <Text style={styles.statNumber}>{activeTontines}</Text>
                            <Text style={styles.statLabel}>Actives</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Wallet color="#FBBF24" size={18} />
                            <Text style={styles.statNumber}>{totalCotisations > 0 ? totalCotisations.toLocaleString('fr-FR') : '0'}</Text>
                            <Text style={styles.statLabel}>FCFA / mois</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Explore card */}
            <TouchableOpacity
                style={styles.exploreBtn}
                onPress={() => navigation.navigate('ExploreTontines')}
                activeOpacity={0.7}
            >
                <View style={styles.exploreBtnIcon}>
                    <Search color="#FFFFFF" size={18} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.exploreBtnTitle}>Explorer les tontines ouvertes</Text>
                    <Text style={styles.exploreBtnSub}>Découvrez et rejoignez des tontines</Text>
                </View>
                <Text style={{ color: '#A5B4FC', fontSize: 18 }}>›</Text>
            </TouchableOpacity>

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
                        onPress={() => navigation.navigate('TontineDetails', { id: item.id })}
                    />
                )}
                ListEmptyComponent={
                    !isLoading ? (
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconCircle}>
                                <Wallet color="#6366F1" size={36} />
                            </View>
                            <Text style={styles.emptyTitle}>Aucune tontine</Text>
                            <Text style={styles.emptySubtext}>
                                Créez votre première tontine et invitez{'\n'}vos proches à participer.
                            </Text>
                            <Button
                                title="Créer ma première tontine"
                                onPress={() => navigation.navigate('CreateTontine')}
                                style={styles.emptyBtn}
                            />
                        </View>
                    ) : null
                }
            />
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
        maxWidth: 600,
        width: '100%',
        alignSelf: 'center',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#A5B4FC',
        marginTop: 3,
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0px 4px 12px rgba(99,102,241,0.4)',
        elevation: 4,
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
        fontSize: 18,
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
        paddingBottom: 32,
        maxWidth: 600,
        width: '100%',
        alignSelf: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 40,
        backgroundColor: theme.colors.white,
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
    emptySubtext: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    emptyBtn: {
        width: 'auto',
        paddingHorizontal: 28,
        backgroundColor: '#6366F1',
    },
    exploreBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#312E81',
        marginHorizontal: 16,
        marginTop: 10,
        marginBottom: 6,
        padding: 14,
        borderRadius: 14,
        boxShadow: '0px 2px 8px rgba(99,102,241,0.25)',
        elevation: 3,
    },
    exploreBtnIcon: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    exploreBtnTitle: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
    exploreBtnSub: {
        color: '#A5B4FC',
        fontSize: 11,
        marginTop: 1,
    },
});
