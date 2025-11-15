
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getSolicitations, updateSolicitation } from '../../services/storageService';
import { Solicitation, SolicitationStatus, StatusUpdate } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { Play, Pause, Check, User, Calendar, MapPin, History } from 'lucide-react';

const StatusBadge: React.FC<{ status: SolicitationStatus }> = ({ status }) => {
    const statusStyles: { [key in SolicitationStatus]: string } = {
        [SolicitationStatus.ENVIADO_PARA_SELIM]: 'bg-blue-100 text-blue-800',
        [SolicitationStatus.RECUSADO]: 'bg-red-100 text-red-800',
        [SolicitationStatus.ENVIADO_PARA_MB]: 'bg-yellow-100 text-yellow-800',
        [SolicitationStatus.INICIADA]: 'bg-indigo-100 text-indigo-800',
        [SolicitationStatus.PENDENTE]: 'bg-orange-100 text-orange-800',
        [SolicitationStatus.FINALIZADA]: 'bg-green-100 text-green-800',
    };
    return <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusStyles[status]}`}>{status}</span>;
};


const SolicitationCard: React.FC<{ solicitation: Solicitation; onUpdate: (id: string, newStatus: SolicitationStatus) => void; }> = ({ solicitation, onUpdate }) => {
    const lastSelimApprover = solicitation.statusHistory.find(h => h.status === SolicitationStatus.ENVIADO_PARA_MB)?.updatedBy || 'N/A';

    return (
        <Card className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <img src={solicitation.photoDataUrl} alt="Service location" className="rounded-lg shadow-md w-full h-64 object-cover" />
                    <div className="mt-4">
                        <StatusBadge status={solicitation.currentStatus} />
                    </div>
                </div>
                <div>
                     <div className="space-y-3 text-premium-gray-700 mb-6">
                        <p className="flex items-center"><MapPin className="h-5 w-5 mr-2 text-selim-green" /><strong>Address:</strong>&nbsp;{solicitation.address?.display_name || 'N/A'}</p>
                        <p className="flex items-center"><Calendar className="h-5 w-5 mr-2 text-selim-green" /><strong>Received:</strong>&nbsp;{new Date(solicitation.createdAt).toLocaleString()}</p>
                        <p className="flex items-center"><User className="h-5 w-5 mr-2 text-selim-green" /><strong>Sent by (Fiscal):</strong>&nbsp;{lastSelimApprover}</p>
                        {solicitation.observation && <p className="border-l-4 border-selim-green pl-4 italic">"{solicitation.observation}"</p>}
                    </div>

                    {solicitation.currentStatus !== SolicitationStatus.FINALIZADA && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <Button onClick={() => onUpdate(solicitation.id, SolicitationStatus.INICIADA)} disabled={solicitation.currentStatus === SolicitationStatus.INICIADA}><Play className="h-5 w-5 mr-2"/>Start</Button>
                            <Button onClick={() => onUpdate(solicitation.id, SolicitationStatus.PENDENTE)} variant="secondary" disabled={solicitation.currentStatus === SolicitationStatus.PENDENTE}><Pause className="h-5 w-5 mr-2"/>Pending</Button>
                            <Button onClick={() => onUpdate(solicitation.id, SolicitationStatus.FINALIZADA)} variant="primary"><Check className="h-5 w-5 mr-2"/>Finish</Button>
                        </div>
                    )}

                    <details className="mt-4 text-sm">
                        <summary className="cursor-pointer font-medium text-selim-dark-blue flex items-center"><History className="h-4 w-4 mr-1"/> View History</summary>
                        <ul className="mt-2 pl-4 border-l-2 border-premium-gray-200 space-y-2">
                            {solicitation.statusHistory.map((h, i) => (
                                <li key={i}>
                                    <p><strong>{h.status}</strong> by {h.updatedBy}</p>
                                    <p className="text-premium-gray-500 text-xs">{new Date(h.timestamp).toLocaleString()}</p>
                                </li>
                            ))}
                        </ul>
                    </details>
                </div>
            </div>
        </Card>
    )
};


export const EmpresaMbDashboard: React.FC = () => {
    const [solicitations, setSolicitations] = useState<Solicitation[]>([]);
    const { user } = useAuth();
    
    const fetchAndSetSolicitations = useCallback(() => {
        const allSolicitations = getSolicitations()
            .filter(s => s.statusHistory.some(h => h.status === SolicitationStatus.ENVIADO_PARA_MB))
            .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setSolicitations(allSolicitations);
    }, []);

    useEffect(() => {
        fetchAndSetSolicitations();
        const interval = setInterval(fetchAndSetSolicitations, 5000); // Poll for updates
        return () => clearInterval(interval);
    }, [fetchAndSetSolicitations]);

    const handleUpdate = (id: string, newStatus: SolicitationStatus) => {
        const solicitation = solicitations.find(s => s.id === id);
        if (solicitation && user) {
            const timestamp = new Date().toISOString();
            const newHistoryEntry: StatusUpdate = {
                status: newStatus,
                updatedBy: user.name,
                timestamp,
            };
            const updatedSolicitation = {
                ...solicitation,
                currentStatus: newStatus,
                statusHistory: [...solicitation.statusHistory, newHistoryEntry],
            };
            updateSolicitation(updatedSolicitation);
            fetchAndSetSolicitations();
        }
    };
    
    const { active, finished } = useMemo(() => {
        const active = solicitations.filter(s => s.currentStatus !== SolicitationStatus.FINALIZADA);
        const finished = solicitations.filter(s => s.currentStatus === SolicitationStatus.FINALIZADA);
        return { active, finished };
    }, [solicitations]);
    
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <h2 className="text-3xl font-bold text-selim-dark-blue mb-6">Empresa MB Dashboard</h2>
            
            <section>
                <h3 className="text-2xl font-semibold text-premium-gray-800 mb-4 border-b-2 border-selim-green pb-2">Active Services ({active.length})</h3>
                {active.length > 0 ? (
                     <div className="space-y-6">
                        {active.map(s => <SolicitationCard key={s.id} solicitation={s} onUpdate={handleUpdate} />)}
                    </div>
                ) : <p className="text-premium-gray-500">No active services.</p>}
            </section>
            
            <section className="mt-12">
                <h3 className="text-2xl font-semibold text-premium-gray-800 mb-4 border-b-2 border-selim-green pb-2">Finished Services ({finished.length})</h3>
                {finished.length > 0 ? (
                     <div className="space-y-6">
                        {finished.map(s => <SolicitationCard key={s.id} solicitation={s} onUpdate={handleUpdate} />)}
                    </div>
                ) : <p className="text-premium-gray-500">No services have been finished yet.</p>}
            </section>
        </div>
    );
};
