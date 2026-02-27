import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';
import { Wallet, Calendar, ChevronRight, Users } from 'lucide-react-native';

interface TontineCardProps {
    nom: string;
    montantCotisation: number;
    frequence: string;
    statut: string;
    onPress?: () => void;
}

const freqLabels: Record<string, string> = {
    QUOTIDIENNE: 'Quotidienne',
    HEBDOMADAIRE: 'Hebdomadaire',
    MENSUELLE: 'Mensuelle',
    TRIMESTRIELLE: 'Trimestrielle',
};

const statutLabels: Record<string, { label: string; bg: string; color: string }> = {
    ACTIVE: { label: 'Active', bg: '#D1FAE5', color: '#059669' },
    EN_ATTENTE: { label: 'En attente', bg: '#FEF3C7', color: '#D97706' },
    TERMINEE: { label: 'Terminée', bg: '#E0E7FF', color: '#4338CA' },
    ANNULEE: { label: 'Annulée', bg: '#FEE2E2', color: '#DC2626' },
};

export const TontineCard = ({ nom, montantCotisation, frequence, statut, onPress }: TontineCardProps) => {
    const statusInfo = statutLabels[statut] || statutLabels.EN_ATTENTE;

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            {/* Left accent bar */}
            <View style={[styles.accentBar, { backgroundColor: statusInfo.color }]} />

            <View style={styles.content}>
                {/* Top row: name + badge */}
                <View style={styles.topRow}>
                    <View style={styles.nameContainer}>
                        <View style={styles.avatarCircle}>
                            <Text style={styles.avatarText}>{nom.charAt(0).toUpperCase()}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.name} numberOfLines={1}>{nom}</Text>
                        </View>
                    </View>
                    <View style={[styles.badge, { backgroundColor: statusInfo.bg }]}>
                        <Text style={[styles.badgeText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                    </View>
                </View>

                {/* Details row */}
                <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                        <Wallet color="#6366F1" size={16} />
                        <Text style={styles.detailValue}>{montantCotisation.toLocaleString('fr-FR')}</Text>
                        <Text style={styles.detailUnit}>FCFA</Text>
                    </View>
                    <View style={styles.separator} />
                    <View style={styles.detailItem}>
                        <Calendar color="#8B5CF6" size={16} />
                        <Text style={styles.detailValue}>{freqLabels[frequence] || frequence}</Text>
                    </View>
                    <ChevronRight color={theme.colors.textSecondary} size={20} style={{ marginLeft: 'auto' }} />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: theme.colors.white,
        borderRadius: 16,
        marginBottom: 12,
        boxShadow: '0px 2px 12px rgba(0,0,0,0.08)',
        elevation: 4,
        overflow: 'hidden',
    },
    accentBar: {
        width: 5,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
        marginRight: 8,
    },
    avatarCircle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#4338CA',
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 10,
        padding: 10,
        gap: 8,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detailValue: {
        fontSize: 13,
        fontWeight: '700',
        color: theme.colors.text,
    },
    detailUnit: {
        fontSize: 11,
        fontWeight: '500',
        color: theme.colors.textSecondary,
    },
    separator: {
        width: 1,
        height: 16,
        backgroundColor: '#E2E8F0',
    },
});
