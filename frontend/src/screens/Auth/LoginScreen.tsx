import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { apiClient } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import './LoginScreen.css';

export const LoginScreen = () => {
    const setAuth = useAuthStore((state) => state.setAuth);
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            setError('Veuillez remplir tous les champs.');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            const response = await apiClient.post('/auth/login', {
                email: email.trim().toLowerCase(),
                motDePasse: password,
            });

            if (response.data.success) {
                const { accessToken, refreshToken, user } = response.data;
                setAuth(accessToken, refreshToken, user);
                navigate('/');
            } else {
                setError(response.data.message || 'Identifiants incorrects.');
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Erreur de connexion au serveur.';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <div className="logo-circle">
                        <Shield className="logo-icon" size={36} />
                    </div>
                    <h1>TontineFit</h1>
                    <p>Gérez vos tontines en toute sécurité</p>
                </div>

                <div className="premium-card auth-card">
                    <h2>Connexion</h2>
                    <p className="card-subtitle">Accédez à votre espace personnel</p>

                    {error && (
                        <div className="error-banner">
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin}>
                        <Input
                            label="Adresse Email"
                            placeholder="votre@email.com"
                            type="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setError(''); }}
                            icon={Mail}
                            required
                        />

                        <Input
                            label="Mot de passe"
                            placeholder="••••••••"
                            type="password"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(''); }}
                            icon={Lock}
                            required
                        />

                        <Button
                            title="Se Connecter"
                            type="submit"
                            isLoading={isLoading}
                            className="login-btn"
                        />
                    </form>

                    <div className="divider">
                        <div className="divider-line"></div>
                        <span>ou</span>
                        <div className="divider-line"></div>
                    </div>

                    <Button
                        title="Créer un compte"
                        variant="outline"
                        onClick={() => navigate('/register')}
                    />
                </div>

                <p className="auth-footer">© 2026 TontineFit — Tous droits réservés</p>
            </div>
        </div>
    );
};
