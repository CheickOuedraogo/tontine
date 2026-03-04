import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { theme } from '../../theme';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    isLoading?: boolean;
}

export const Button = ({ title, variant = 'primary', isLoading, style, disabled, ...props }: ButtonProps) => {
    const getBgColor = () => {
        if (disabled) return theme.colors.border;
        switch (variant) {
            case 'secondary': return theme.colors.primaryLight;
            case 'outline': return 'transparent';
            case 'danger': return theme.colors.error;
            case 'primary':
            default: return theme.colors.primary;
        }
    };

    const getTextColor = () => {
        if (disabled) return theme.colors.textSecondary;
        switch (variant) {
            case 'secondary': return theme.colors.primaryDark;
            case 'outline': return theme.colors.primary;
            case 'danger': return theme.colors.white;
            case 'primary':
            default: return theme.colors.white;
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                { backgroundColor: getBgColor() },
                variant === 'outline' && { borderWidth: 1, borderColor: theme.colors.primary },
                style
            ]}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        width: '100%',
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.components.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    text: {
        fontSize: 16,
        fontWeight: 'bold',
    }
});
