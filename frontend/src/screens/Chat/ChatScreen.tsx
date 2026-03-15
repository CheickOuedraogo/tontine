import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Send, MessageCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import './ChatScreen.css';

export const ChatScreen = () => {
    const { id: tontineId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [messageText, setMessageText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { messages, connect, disconnect, sendMessage, isConnected } = useChatStore();
    const currentUser = useAuthStore(state => state.user);

    // Get tontineName from state or a store if possible, otherwise placeholder
    // For now, we assume it might be passed via state or we can just use a generic title
    const tontineName = "Discussion Groupe"; 

    useEffect(() => {
        if (tontineId) {
            connect(tontineId);
        }
        return () => {
            disconnect();
        };
    }, [tontineId, connect, disconnect]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const text = messageText.trim();
        if (text && tontineId) {
            sendMessage(text, tontineId);
            setMessageText('');
        }
    };

    const renderMessage = (item: any, index: number) => {
        const isMe = item.senderId === currentUser?.id;
        const isSystem = item.typeMessage === 'system';

        if (isSystem) {
            return (
                <div key={item.id || index} className="system-message">
                    <span className="system-bubble">{item.contenu}</span>
                </div>
            );
        }

        return (
            <div key={item.id || index} className={`message-row ${isMe ? 'me' : 'other'}`}>
                {!isMe && (
                    <div className="avatar">
                        {(item.senderName || item.senderNom || '?').charAt(0).toUpperCase()}
                    </div>
                )}
                <div className={`message-bubble ${isMe ? 'my-bubble' : 'other-bubble'}`}>
                    {!isMe && (item.senderName || item.senderNom) && (
                        <div className="sender-name">
                            {item.senderName || `${item.senderPrenom} ${item.senderNom}`}
                        </div>
                    )}
                    <div className="message-text">{item.contenu}</div>
                    <div className="message-footer">
                        <span className="time">
                            {new Date(item.dateEnvoi).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMe && <CheckCircle2 size={10} className="status-icon" />}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="chat-screen">
            <header className="chat-header">
                <button onClick={() => navigate(-1)} className="back-btn-chat">
                    <ArrowLeft size={20} />
                </button>
                <div className="header-info-chat">
                    <div className="header-icon-circle">
                        <MessageCircle size={20} />
                    </div>
                    <div className="header-text-chat">
                        <h2>{tontineName}</h2>
                        <div className="status-indicator">
                            <div className={`status-dot ${isConnected ? 'online' : 'offline'}`}></div>
                            <span>{isConnected ? 'En ligne' : 'Déconnecté'}</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="messages-area">
                <div className="messages-container">
                    {messages.length === 0 ? (
                        <div className="empty-chat">
                            <div className="empty-icon-chat">
                                <MessageCircle size={40} />
                            </div>
                            <h3>Aucun message</h3>
                            <p>Soyez le premier à écrire dans cette discussion !</p>
                        </div>
                    ) : (
                        [...messages].reverse().map((msg, idx) => renderMessage(msg, idx))
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <form className="chat-input-bar" onSubmit={handleSend}>
                <input
                    type="text"
                    placeholder="Votre message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    disabled={!isConnected}
                />
                <button 
                    type="submit" 
                    className={`send-btn ${messageText.trim() ? 'active' : ''}`}
                    disabled={!messageText.trim() || !isConnected}
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};
