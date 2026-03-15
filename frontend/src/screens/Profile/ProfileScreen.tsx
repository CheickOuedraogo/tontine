import { useState, useRef } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { User, Mail, Phone, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { apiClient } from '../../api/client';
import { SOCKET_URL } from '../../constants';
import './ProfileScreen.css';

export const ProfileScreen = () => {
    const user = useAuthStore(state => state.user);
    const logout = useAuthStore(state => state.logout);
    const token = useAuthStore(state => state.token);
    const refreshToken = useAuthStore(state => state.refreshToken);
    const setAuth = useAuthStore(state => state.setAuth);

    const [nom, setNom] = useState(user?.nom || '');
    const [prenom, setPrenom] = useState(user?.prenom || '');
    const [telephone, setTelephone] = useState(user?.telephone || '');
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpdate = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsLoading(true);
        setMessage('');
        setError('');
        try {
            const res = await apiClient.put('/users/me', {
                nom: nom.trim(),
                prenom: prenom.trim(),
                telephone: telephone.trim() || undefined,
            });
            if (res.data.success && token) {
                // Update store
                await setAuth(token, refreshToken ?? '', res.data.user);
                setMessage('Profil mis à jour avec succès !');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors de la mise à jour.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('photo', file);

        try {
            const res = await apiClient.post('/users/me/photo', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (res.data.success && res.data.data) {
                const updatedUser = { ...user!, photo: res.data.data.photo };
                if (token) {
                    await setAuth(token, refreshToken ?? '', updatedUser);
                }
                setMessage('Photo mise à jour !');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors de l\'upload.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleLogout = () => {
        if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
            logout();
        }
    };

    return (
        <div className="profile-page">
            <div className="profile-container">
                <header className="profile-card profile-header-premium premium-card">
                    <div className="avatar-upload-section">
                        <div className="avatar-wrapper" onClick={() => fileInputRef.current?.click()}>
                            {user?.photo ? (
                                <img 
                                    src={user.photo.startsWith('http') ? user.photo : `${SOCKET_URL}${user.photo}`} 
                                    alt="Profile" 
                                    className="profile-img-large"
                                />
                            ) : (
                                <div className="avatar-placeholder-large">
                                    {(user?.prenom?.[0] || 'U').toUpperCase()}
                                    {(user?.nom?.[0] || '').toUpperCase()}
                                </div>
                            )}
                            <div className="camera-badge">
                                <Camera size={16} color="white" />
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                style={{ display: 'none' }} 
                                accept="image/*"
                            />
                        </div>
                        <div className="profile-identity">
                            <h2>{user?.prenom} {user?.nom}</h2>
                            <p>{user?.email}</p>
                        </div>
                    </div>
                </header>

                <main className="profile-card edit-card-premium premium-card">
                    <h3>Informations personnelles</h3>
                    
                    {message && (
                        <div className="status-banner success">
                            <CheckCircle size={18} />
                            <span>{message}</span>
                        </div>
                    )}
                    
                    {error && (
                        <div className="status-banner error">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleUpdate} className="profile-form">
                        <Input
                            label="Nom"
                            value={nom}
                            onChange={(e) => setNom(e.target.value)}
                            icon={User}
                        />
                        <Input
                            label="Prénom"
                            value={prenom}
                            onChange={(e) => setPrenom(e.target.value)}
                            icon={User}
                        />
                        <Input
                            label="Téléphone"
                            value={telephone}
                            onChange={(e) => setTelephone(e.target.value)}
                            icon={Phone}
                            type="tel"
                        />
                        <Input 
                            label="Email" 
                            value={user?.email || ''} 
                            disabled 
                            icon={Mail} 
                        />

                        <div className="form-actions-profile">
                            <Button
                                title="Sauvegarder les modifications"
                                type="submit"
                                isLoading={isLoading || isUploading}
                            />
                        </div>
                    </form>
                </main>

                <div className="logout-section">
                    <Button
                        title="Se déconnecter"
                        variant="danger"
                        onClick={handleLogout}
                    />
                </div>
            </div>
        </div>
    );
};
