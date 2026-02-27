import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { theme } from '../../theme';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Send, MessageCircle, Wifi, WifiOff, ArrowLeft } from 'lucide-react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

export const ChatScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { tontineId, tontineName } = route.params || { tontineId: '1', tontineName: 'Tontine' };

    const [messageText, setMessageText] = useState('');
    const inputRef = useRef<TextInput>(null);

    const { messages, connect, disconnect, sendMessage, isConnected } = useChatStore();
    const currentUser = useAuthStore(state => state.user);

    useEffect(() => {
        connect(tontineId);
        return () => {
            disconnect();
        };
    }, [tontineId]);

    const handleSend = () => {
        const text = messageText.trim();
        if (text) {
            sendMessage(text, tontineId);
            setMessageText('');
        }
    };

    const renderMessage = ({ item }: { item: any }) => {
        const isMe = item.senderId === currentUser?.id;
        const isSystem = item.typeMessage === 'system';

        if (isSystem) {
            return (
                <View style={styles.systemContainer}>
                    <View style={styles.systemBubble}>
                        <Text style={styles.systemText}>{item.contenu}</Text>
                    </View>
                </View>
            );
        }

        return (
            <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
                {!isMe && (
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {(item.senderName || item.senderId || '?').charAt(0).toUpperCase()}
                        </Text>
                    </View>
                )}
                <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
                    {!isMe && item.senderName && (
                        <Text style={styles.senderName}>{item.senderName}</Text>
                    )}
                    <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
                        {item.contenu}
                    </Text>
                    <Text style={[styles.timeText, isMe && styles.timeTextMe]}>
                        {new Date(item.dateEnvoi).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.flex1}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
                        <ArrowLeft color="#FFFFFF" size={22} />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <View style={styles.headerIconCircle}>
                            <MessageCircle color="#FFFFFF" size={18} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.headerTitle} numberOfLines={1}>{tontineName}</Text>
                            <View style={styles.statusRow}>
                                {isConnected ? (
                                    <>
                                        <View style={styles.dotOnline} />
                                        <Text style={styles.statusOnline}>En ligne</Text>
                                    </>
                                ) : (
                                    <>
                                        <View style={styles.dotOffline} />
                                        <Text style={styles.statusOffline}>Déconnecté</Text>
                                    </>
                                )}
                            </View>
                        </View>
                    </View>
                </View>

                {/* Messages */}
                <FlatList
                    data={messages}
                    keyExtractor={(item, index) => item.id || index.toString()}
                    renderItem={renderMessage}
                    inverted
                    contentContainerStyle={styles.messageList}
                    showsVerticalScrollIndicator={false}
                    style={styles.chatArea}
                    ListEmptyComponent={
                        <View style={styles.emptyChat}>
                            <View style={styles.emptyChatIcon}>
                                <MessageCircle color="#A5B4FC" size={32} />
                            </View>
                            <Text style={styles.emptyChatTitle}>Aucun message</Text>
                            <Text style={styles.emptyChatText}>Soyez le premier à écrire{'\n'}dans cette discussion !</Text>
                        </View>
                    }
                />

                {/* Input Bar — fixed at bottom */}
                <View style={styles.inputBar}>
                    <TextInput
                        ref={inputRef}
                        style={styles.input}
                        placeholder="Votre message..."
                        placeholderTextColor="#94A3B8"
                        value={messageText}
                        onChangeText={setMessageText}
                        onSubmitEditing={handleSend}
                        returnKeyType="send"
                        blurOnSubmit={false}
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, messageText.trim() ? styles.sendBtnActive : null]}
                        onPress={handleSend}
                        disabled={!messageText.trim() || !isConnected}
                        activeOpacity={0.7}
                    >
                        <Send color="#FFFFFF" size={18} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F2F8',
    },
    flex1: {
        flex: 1,
    },

    // Header
    header: {
        backgroundColor: '#1E1B4B',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    headerIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginTop: 2,
    },
    dotOnline: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: '#34D399',
    },
    dotOffline: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: '#F87171',
    },
    statusOnline: {
        fontSize: 11,
        color: '#34D399',
        fontWeight: '600',
    },
    statusOffline: {
        fontSize: 11,
        color: '#F87171',
        fontWeight: '600',
    },

    // Chat area
    chatArea: {
        flex: 1,
        backgroundColor: '#EEF0F5',
    },
    messageList: {
        padding: 12,
        paddingBottom: 6,
        maxWidth: 700,
        width: '100%',
        alignSelf: 'center',
    },

    // System messages
    systemContainer: {
        alignItems: 'center',
        marginVertical: 10,
    },
    systemBubble: {
        backgroundColor: 'rgba(99,102,241,0.1)',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
    },
    systemText: {
        fontSize: 12,
        color: '#6366F1',
        fontWeight: '600',
    },

    // Message rows
    messageRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 6,
        gap: 6,
    },
    messageRowMe: {
        flexDirection: 'row-reverse',
    },

    // Avatar
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#C7D2FE',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#4338CA',
    },

    // Bubbles
    bubble: {
        maxWidth: '70%',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
    },
    bubbleMe: {
        backgroundColor: '#6366F1',
        borderBottomRightRadius: 6,
    },
    bubbleOther: {
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 6,
        boxShadow: '0px 1px 4px rgba(0,0,0,0.06)',
        elevation: 1,
    },
    senderName: {
        fontSize: 11,
        fontWeight: '700',
        color: '#6366F1',
        marginBottom: 3,
    },
    messageText: {
        fontSize: 15,
        color: '#1E293B',
        lineHeight: 20,
    },
    messageTextMe: {
        color: '#FFFFFF',
    },
    timeText: {
        fontSize: 10,
        color: '#94A3B8',
        alignSelf: 'flex-end',
        marginTop: 4,
    },
    timeTextMe: {
        color: 'rgba(255,255,255,0.65)',
    },

    // Empty state (inverted list so flip)
    emptyChat: {
        alignItems: 'center',
        paddingVertical: 40,
        transform: [{ scaleY: -1 }],
    },
    emptyChatIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#E0E7FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    emptyChatTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#475569',
        marginBottom: 4,
    },
    emptyChatText: {
        fontSize: 13,
        color: '#94A3B8',
        textAlign: 'center',
    },

    // Input bar
    inputBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        gap: 8,
        maxWidth: 700,
        width: '100%',
        alignSelf: 'center',
    },
    input: {
        flex: 1,
        height: 44,
        backgroundColor: '#F1F5F9',
        borderRadius: 22,
        paddingHorizontal: 16,
        fontSize: 15,
        color: '#1E293B',
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#CBD5E1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendBtnActive: {
        backgroundColor: '#6366F1',
        boxShadow: '0px 2px 8px rgba(99,102,241,0.4)',
        elevation: 3,
    },
});
