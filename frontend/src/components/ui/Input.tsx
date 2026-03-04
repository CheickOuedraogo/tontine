import React, { forwardRef } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { theme } from '../../theme';
import { LucideIcon } from 'lucide-react-native';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    icon?: LucideIcon;
}

export const Input = forwardRef<TextInput, InputProps>(({ label, error, icon: Icon, style, ...props }, ref) => {
    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={[styles.inputContainer, error && styles.inputError]}>
                {Icon && <Icon color={theme.colors.textSecondary} size={20} style={styles.icon} />}
                <TextInput
                    ref={ref}
                    style={styles.input}
                    placeholderTextColor={theme.colors.textSecondary}
                    {...props}
                />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
});

Input.displayName = 'Input';

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: theme.spacing.md,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.components.borderRadius.md,
        paddingHorizontal: theme.spacing.sm,
    },
    inputError: {
        borderColor: theme.colors.error,
    },
    icon: {
        marginRight: theme.spacing.sm,
    },
    input: {
        flex: 1,
        paddingVertical: theme.spacing.md,
        fontSize: 16,
        color: theme.colors.text,
    },
    errorText: {
        fontSize: 12,
        color: theme.colors.error,
        marginTop: theme.spacing.xs,
    }
});
