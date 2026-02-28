import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { theme } from '../../theme';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { apiClient } from '../../api/client';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerifyEmail'>;

export const VerifyEmailScreen = ({ route, navigation }: Props) => {
    const { email } = route.params;
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const inputs = useRef<TextInput[]>([]);

    const handleInput = (text: string, index: number) => {
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        // Auto focus next
        if (text && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const fullCode = code.join('');
        if (fullCode.length !== 6) {
            Alert.alert('Erreur', 'Veuillez entrer le code complet à 6 chiffres');
            return;
        }

        setIsLoading(true);
        try {
            await apiClient.post('/auth/verify-email', { email, code: fullCode });
            Alert.alert('Succès', 'Votre email a été vérifié avec succès !', [
                { text: 'OK', onPress: () => navigation.navigate('Login') }
            ]);
        } catch (error: any) {
            Alert.alert('Erreur', error.response?.data?.message || 'Code invalide ou expiré');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            await apiClient.post('/auth/forgot-password', { email }); // Réutilise le flux de renvoi d'OTP
            Alert.alert('Code envoyé', 'Un nouveau code a été envoyé à votre adresse email.');
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de renvoyer le code.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <ArrowLeft color={theme.colors.text} size={24} />
            </TouchableOpacity>

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Mail size={40} color={theme.colors.primary} />
                </View>
                
                <Text style={styles.title}>Vérifiez votre email</Text>
                <Text style={styles.subtitle}>
                    Nous avons envoyé un code de vérification à {'\n'}
                    <Text style={{ fontWeight: 'bold', color: theme.colors.text }}>{email}</Text>
                </Text>

                <View style={styles.otpContainer}>
                    {code.map((digit, i) => (
                        <TextInput
                            key={i}
                            ref={ref => (inputs.current[i] = ref as TextInput)}
                            style={styles.otpInput}
                            keyboardType="number-pad"
                            maxLength={1}
                            value={digit}
                            onChangeText={text => handleInput(text, i)}
                            onKeyPress={e => handleKeyPress(e, i)}
                        />
                    ))}
                </View>

                <Button 
                    title="Vérifier" 
                    onPress={handleVerify} 
                    isLoading={isLoading}
                    style={styles.verifyBtn}
                />

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Vous n'avez pas reçu le code ? </Text>
                    <TouchableOpacity onPress={handleResend}>
                        <Text style={styles.resendText}>Renvoyer</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    backBtn: {
        padding: 20,
    },
    content: {
        flex: 1,
        paddingHorizontal: 30,
        alignItems: 'center',
        paddingTop: 20,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 15,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 40,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 40,
    },
    otpInput: {
        width: 45,
        height: 55,
        borderWidth: 1.5,
        borderColor: theme.colors.border,
        borderRadius: 12,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text,
        backgroundColor: theme.colors.white,
    },
    verifyBtn: {
        marginTop: 10,
    },
    footer: {
        flexDirection: 'row',
        marginTop: 30,
    },
    footerText: {
        color: theme.colors.textSecondary,
        fontSize: 14,
    },
    resendText: {
        color: theme.colors.primary,
        fontWeight: 'bold',
        fontSize: 14,
    }
});
