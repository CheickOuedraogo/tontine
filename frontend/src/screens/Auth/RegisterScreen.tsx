import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, UserPlus, ArrowLeft } from 'lucide-react';
import { apiClient } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import './RegisterScreen.css';

export const RegisterScreen = () => {
    const navigate = useNavigate();
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [email, setEmail] = useState('');
    const [telephone, setTelephone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!nom.trim() || !prenom.trim() || !email.trim() || !password.trim()) {
            setError('Veuillez remplir tous les champs obligatoires.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }
        if (password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await apiClient.post('/auth/register', {
                nom: nom.trim(),
                prenom: prenom.trim(),
                email: email.trim().toLowerCase(),
                telephone: telephone.trim() || undefined,
                motDePasse: password,
            });

            if (response.data.success) {
                setSuccess('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
            } else {
                setError(response.data.message || 'Erreur lors de la création du compte.');
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
            <div className="auth-container register-container">
                <button onClick={() => navigate(-1)} className="back-btn">
                    <ArrowLeft size={20} />
                    <span>Retour</span>
                </button>

                <div className="auth-header">
                    <div className="logo-circle">
                        <UserPlus className="logo-icon" size={32} />
                    </div>
                    <h1>Créer un compte</h1>
                    <p>Rejoignez la communauté TontineFit</p>
                </div>

                <div className="premium-card auth-card">
                    {error && (
                        <div className="error-banner">
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="success-banner">
                            <span>{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleRegister}>
                        <div className="form-row">
                            <Input
                                label="Nom *"
                                placeholder="Votre nom"
                                value={nom}
                                onChange={(e) => { setNom(e.target.value); setError(''); }}
                                icon={User}
                                required
                            />
                            <Input
                                label="Prénom *"
                                placeholder="Votre prénom"
                                value={prenom}
                                onChange={(e) => { setPrenom(e.target.value); setError(''); }}
                                icon={User}
                                required
                            />
                        </div>

                        <Input
                            label="Adresse Email *"
                            placeholder="votre@email.com"
                            type="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setError(''); }}
                            icon={Mail}
                            required
                        />

                        <Input
                            label="Téléphone"
                            placeholder="+226 70 00 00 00"
                            type="tel"
                            value={telephone}
                            onChange={(e) => { setTelephone(e.target.value); setError(''); }}
                            icon={Phone}
                        />

                        <Input
                            label="Mot de passe *"
                            placeholder="Minimum 6 caractères"
                            type="password"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(''); }}
                            icon={Lock}
                            required
                        />

                        <Input
                            label="Confirmer le mot de passe *"
                            placeholder="Retapez le mot de passe"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                            icon={Lock}
                            required
                        />

                        <Button
                            title="Créer mon compte"
                            type="submit"
                            isLoading={isLoading}
                            className="register-btn"
                        />
                    </form>

                    <div className="divider">
                        <div className="divider-line"></div>
                        <span>ou</span>
                        <div className="divider-line"></div>
                    </div>

                    <Button
                        title="J'ai déjà un compte"
                        variant="outline"
                        onClick={() => navigate('/login')}
                    />
                </div>

                <p className="auth-footer">© 2026 TontineFit — Tous droits réservés</p>
            </div>
        </div>
    );
};
