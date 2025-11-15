
import React, { useState, useRef } from 'react';
import { Camera, MapPin, Send, AlertCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { useAuth } from '../../hooks/useAuth';
import { GeolocationData, AddressData, Solicitation, SolicitationStatus, StatusUpdate } from '../../types';
import { addSolicitation } from '../../services/storageService';

export const FuncionarioDashboard: React.FC = () => {
    const { user } = useAuth();
    const [photo, setPhoto] = useState<string | null>(null);
    const [geolocation, setGeolocation] = useState<GeolocationData | null>(null);
    const [address, setAddress] = useState<AddressData | null>(null);
    const [observation, setObservation] = useState('');
    const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleTakePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPhoto(e.target?.result as string);
                fetchGeolocation();
            };
            reader.readAsDataURL(file);
        }
    };
    
    const fetchGeolocation = () => {
        setStatus({ type: 'loading', message: 'Getting GPS coordinates...' });
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const geoData = { latitude, longitude };
                setGeolocation(geoData);
                fetchAddress(geoData);
            },
            (error) => {
                setStatus({ type: 'error', message: `Geolocation error: ${error.message}` });
            }
        );
    };

    const fetchAddress = async (geoData: GeolocationData) => {
        setStatus({ type: 'loading', message: 'Finding address...' });
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${geoData.latitude}&lon=${geoData.longitude}`);
            if (!response.ok) throw new Error('Failed to fetch address.');
            const data = await response.json();
            const addr: AddressData = {
                road: data.address.road || 'N/A',
                suburb: data.address.suburb || 'N/A',
                city: data.address.city || 'N/A',
                postcode: data.address.postcode || 'N/A',
                country: data.address.country || 'N/A',
                display_name: data.display_name || 'N/A',
            };
            setAddress(addr);
            setStatus({ type: 'idle', message: '' });
        } catch (error) {
            setStatus({ type: 'error', message: 'Could not find address. Please try again.' });
            setAddress(null);
        }
    };

    const handleSubmit = () => {
        if (!photo || !geolocation || !user) {
            setStatus({ type: 'error', message: 'Photo and GPS are required.' });
            return;
        }
        setStatus({ type: 'loading', message: 'Submitting...' });
        
        const timestamp = new Date().toISOString();
        const newSolicitation: Solicitation = {
            id: `sol_${Date.now()}`,
            employeeId: user.id,
            employeeName: user.name,
            photoDataUrl: photo,
            geolocation,
            address,
            observation,
            createdAt: timestamp,
            currentStatus: SolicitationStatus.ENVIADO_PARA_SELIM,
            statusHistory: [{
                status: SolicitationStatus.ENVIADO_PARA_SELIM,
                updatedBy: user.name,
                timestamp,
            }],
        };
        
        addSolicitation(newSolicitation);
        
        // Reset form
        setPhoto(null);
        setGeolocation(null);
        setAddress(null);
        setObservation('');
        setStatus({ type: 'success', message: 'Solicitation sent successfully!' });
        
        setTimeout(() => setStatus({ type: 'idle', message: '' }), 3000);
    };

    const getStatusColor = () => {
        switch (status.type) {
            case 'loading': return 'text-blue-600';
            case 'success': return 'text-selim-green';
            case 'error': return 'text-red-600';
            default: return 'text-premium-gray-500';
        }
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <Card className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-selim-dark-blue mb-6 text-center">New Service Request</h2>
                
                <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

                {!photo ? (
                    <button onClick={handleTakePhotoClick} className="w-full h-64 border-2 border-dashed border-premium-gray-300 rounded-lg flex flex-col items-center justify-center text-premium-gray-500 hover:bg-premium-gray-50 transition-colors">
                        <Camera className="h-16 w-16" />
                        <span className="mt-2 text-lg font-semibold">Take Photo of Location</span>
                    </button>
                ) : (
                    <div className="mb-4">
                        <img src={photo} alt="Location capture" className="w-full h-auto rounded-lg shadow-md" />
                        <button onClick={() => setPhoto(null)} className="text-sm text-red-500 hover:underline mt-2">Remove photo</button>
                    </div>
                )}

                {geolocation && (
                    <Card className="my-4 bg-premium-gray-50">
                        <div className="flex items-start space-x-4">
                            <MapPin className="h-8 w-8 text-selim-green flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-selim-dark-blue">Location Captured</h3>
                                <p className="text-sm text-premium-gray-600">Lat: {geolocation.latitude.toFixed(5)}, Lon: {geolocation.longitude.toFixed(5)}</p>
                                {address && <p className="text-sm text-premium-gray-800 mt-1">{address.road}, {address.suburb}, {address.city}</p>}
                                <iframe className="mt-2 w-full h-48 rounded-lg border" title="map" src={`https://www.openstreetmap.org/export/embed.html?bbox=${geolocation.longitude-0.005},${geolocation.latitude-0.005},${geolocation.longitude+0.005},${geolocation.latitude+0.005}&layer=mapnik&marker=${geolocation.latitude},${geolocation.longitude}`} ></iframe>
                            </div>
                        </div>
                    </Card>
                )}
                
                {status.message && (
                    <div className={`flex items-center p-3 rounded-lg my-4 text-sm ${getStatusColor()} bg-opacity-10 ${status.type === 'error' ? 'bg-red-100' : 'bg-blue-100'}`}>
                        {status.type === 'error' && <AlertCircle className="h-5 w-5 mr-2"/>}
                        {status.message}
                    </div>
                )}

                <div className="space-y-4">
                    <Textarea id="observation" label="Observation (optional)" value={observation} onChange={(e) => setObservation(e.target.value)} />
                    <Button onClick={handleSubmit} disabled={!photo || !geolocation || status.type === 'loading'} isLoading={status.type === 'loading'}>
                        <Send className="h-5 w-5 mr-2" /> Send to Fiscal SELIM
                    </Button>
                </div>
            </Card>
        </div>
    );
};
