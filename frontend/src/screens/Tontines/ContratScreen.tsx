import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContratStore } from '../../store/useContratStore';
import { useAuthStore } from '../../store/useAuthStore';
import { contratApi } from '../../api/contrat';
import { apiClient } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { FileText, CheckCircle, ShieldCheck, FilePlus, ArrowLeft } from 'lucide-react';
import './ContratScreen.css';

const generateContratText = (tontine: any) => {
    return `CONTRAT D'ENGAGEMENT — TONTINE "${(tontine?.nom || 'N/A').toUpperCase()}"

Article 1 — Objet
Le présent contrat régit les conditions de participation à la tontine "${tontine?.nom || 'N/A'}" organisée via la plateforme TontineFit.

Article 2 — Cotisation
Chaque membre s'engage à verser la somme de ${Number(tontine?.montantCotisation || 0).toLocaleString('fr-FR')} FCFA selon la fréquence ${(tontine?.frequence || 'MENSUELLE').toLowerCase()} convenue.

Article 3 — Durée
La tontine se déroule sur ${tontine?.dureeTotale || 'N/A'} tours. Chaque membre s'engage à participer pour la durée totale.

Article 4 — Membres
Le nombre de membres attendus est de ${tontine?.nbMembresAttendu || 'N/A'} personnes. La tontine ne pourra démarrer qu'une fois ce nombre atteint et que tous les membres auront signé le présent contrat.

Article 5 — Ordre de distribution
L'ordre de distribution des fonds sera déterminé de manière aléatoire au démarrage de la tontine.

Article 6 — Retard de paiement
Tout retard de paiement entraînera une notification automatique. En cas de non-paiement répété, le membre pourra être exclu de la tontine.

Article 7 — Engagement
En signant électroniquement ce contrat, chaque membre s'engage à respecter l'ensemble des conditions ci-dessus et à honorer ses cotisations dans les délais impartis.

Fait sur TontineFit, le ${new Date().toLocaleDateString('fr-FR')}.`;
};

export const ContratScreen = () => {
    const { id: tontineId } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { currentContrat, signatures, isLoading, fetchContrat, fetchSignatures, signerContrat } = useContratStore();
    const user = useAuthStore(state => state.user);

    const [signing, setSigning] = useState(false);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        if (tontineId) {
            fetchContrat(tontineId);
        }
    }, [tontineId]);

    useEffect(() => {
        if (currentContrat) {
            fetchSignatures(currentContrat.id);
        }
    }, [currentContrat]);

    const handleGenerateContrat = async () => {
        setGenerating(true);
        try {
            const tontineRes = await apiClient.get(`/tontines/${tontineId}`);
            const tontine = tontineRes.data.tontine || tontineRes.data;
            const texte = generateContratText(tontine);
            await contratApi.createContrat(tontineId!, texte);
            alert('Le contrat a été créé avec succès. Les membres peuvent maintenant le signer.');
            await fetchContrat(tontineId!);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Impossible de générer le contrat.');
        } finally {
            setGenerating(false);
        }
    };

    const hasSigned = signatures.some(sig => sig.userId === user?.id);

    const handleSign = async () => {
        if (!window.confirm("En signant électroniquement ce document, vous vous engagez à respecter les conditions de la tontine.\n\nCliquez OK pour confirmer votre signature.")) return;
        if (!currentContrat) return;

        setSigning(true);
        try {
            const success = await signerContrat(currentContrat.id);
            if (success) {
                alert("Votre signature a bien été prise en compte.");
            }
        } catch (err) {
            alert("Une erreur est survenue lors de la signature.");
        } finally {
            setSigning(false);
        }
    };

    if (isLoading && !currentContrat) {
        return (
            <div className="loading-state full-page">
                <div className="spinner large"></div>
                <p>Chargement du contrat...</p>
            </div>
        );
    }

    if (!currentContrat) {
        return (
            <div className="contrat-page empty">
                <div className="contrat-container center-content">
                    <div className="empty-icon-circle large">
                        <FilePlus size={48} />
                    </div>
                    <h2>Aucun contrat</h2>
                    <p>Aucun contrat n'a encore été généré pour cette tontine.</p>
                    <div className="empty-actions">
                        <Button
                            title="Générer le contrat"
                            onClick={handleGenerateContrat}
                            isLoading={generating}
                        />
                        <Button
                            title="Retour"
                            variant="outline"
                            onClick={() => navigate(-1)}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="contrat-page">
            <header className="details-header contrat-header">
                <button onClick={() => navigate(-1)} className="back-btn-details">
                    <ArrowLeft size={20} />
                </button>
                <div className="header-titles">
                    <div className="title-with-icon-header">
                        <FileText size={20} color="white" />
                        <h1>Contrat d'Engagement</h1>
                    </div>
                    <p className="header-subtitle-web">Document officiel de la tontine</p>
                </div>
            </header>

            <div className="contrat-content-container">
                <div className="document-paper premium-card">
                    <div className="document-ribbon">OFFICIEL</div>
                    <pre className="contrat-text-web">
                        {currentContrat.texteContrat}
                    </pre>
                    <div className="document-footer">
                        <p>Généré le: {new Date(currentContrat.dateCreation).toLocaleDateString('fr-FR')}</p>
                    </div>
                </div>

                <div className="signatures-section premium-card">
                    <h3>Signatures ({signatures.length})</h3>
                    <div className="signatures-list-web">
                        {signatures.map((sig, index) => (
                            <div key={index} className="signature-row-web">
                                <CheckCircle size={18} color="#059669" />
                                <div className="sig-info">
                                    <span className="sig-name">{sig.prenom} {sig.nom}</span>
                                    <span className="sig-date">{new Date(sig.dateSignature).toLocaleDateString('fr-FR')}</span>
                                </div>
                            </div>
                        ))}
                        {signatures.length === 0 && (
                            <p className="no-sigs">En attente des premières signatures...</p>
                        )}
                    </div>
                </div>

                <div className="contrat-actions-bottom">
                    {!hasSigned ? (
                        <Button
                            title="Signer électroniquement"
                            onClick={handleSign}
                            isLoading={signing}
                            icon={ShieldCheck}
                            className="sign-btn-web"
                        />
                    ) : (
                        <div className="signed-confirmation-web">
                            <ShieldCheck size={24} />
                            <span>Vous avez signé ce contrat</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
