import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { LogOut, Bell, Shield, User } from 'lucide-react';
import './Layout.css';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);
    const { unreadCount } = useNotificationStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="app-layout">
            <nav className="navbar">
                <div className="navbar-container">
                    <div className="navbar-brand" onClick={() => navigate('/')}>
                        <Shield className="brand-icon" size={24} />
                        <span>TontineFit</span>
                    </div>
                    
                    <div className="navbar-actions">
                        <div className="notification-bell" onClick={() => navigate('/notifications')}>
                            <Bell size={20} />
                            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
                        </div>
                        
                        <div className="user-profile clickable" onClick={() => navigate('/profile')}>
                            <div className="user-info">
                                <span className="user-name">{user?.prenom}</span>
                                <span className="user-role">Membre</span>
                            </div>
                            <div className="user-avatar">
                                <User size={20} />
                            </div>
                        </div>

                        <button className="logout-btn" onClick={handleLogout} title="Déconnexion">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </nav>
            
            <main className="main-content">
                <div className="content-container">
                    {children}
                </div>
            </main>
        </div>
    );
};
