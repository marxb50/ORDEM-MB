
import React, { useState, useRef } from 'react';
import { Camera, MapPin, Send, AlertCircle, Loader, Sparkles } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { useAuth } from '../../hooks/useAuth';
import { GeolocationData, AddressData, Solicitation, SolicitationStatus } from '../../types';
import { addSolicitation } from '../../services/storageService';

type Step = 'idle' | 'geolocating' | 'taking_photo' | 'submitting' | 'success' | 'error';

export const FuncionarioDashboard: React.FC = () => {
    const { user } = useAuth();
    const [photo, setPhoto] = useState<string | null>(null);
    const [geolocation, setGeolocation] = useState<GeolocationData | null>(null);
    const [address, setAddress] = useState<AddressData | null>(null);
    const [observation, setObservation] = useState('');
    const [step, setStep] = useState<Step>('idle');
    const [message, setMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetState = () => {
        setPhoto(null);
        setGeolocation(null);
        setAddress(null);
        setObservation('');
        setStep('idle');
        setMessage('');
    };
    
    const startProcess = () => {
        setStep('geolocating');
        setMessage('Obtendo coordenadas GPS...');
        fetchGeolocation();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            setStep('idle'); // User cancelled file selection
            return;
        }

        setMessage('Processando foto...');
        setStep('taking_photo');

        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            const MAX_WIDTH = 1280;
            const MAX_HEIGHT = 1280;
            let { width, height } = img;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx!.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

            setPhoto(dataUrl);
            setMessage('');
            setStep('taking_photo'); // Ready to submit
            URL.revokeObjectURL(objectUrl);
        };
        img.onerror = () => {
            setStep('error');
            setMessage('O arquivo selecionado não é uma imagem válida.');
            URL.revokeObjectURL(objectUrl);
        };
        img.src = objectUrl;
    };
    
    const fetchGeolocation = () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const geoData = { latitude, longitude };
                setGeolocation(geoData);
                fetchAddress(geoData);
            },
            (error) => {
                let errorMessage = 'Não foi possível obter a localização. ';
                if (error.code === error.PERMISSION_DENIED) errorMessage += 'Permissão negada.';
                else if (error.code === error.POSITION_UNAVAILABLE) errorMessage += 'Sinal indisponível.';
                else if (error.code === error.TIMEOUT) errorMessage += 'Tempo esgotado.';
                setStep('error');
                setMessage(errorMessage);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const fetchAddress = async (geoData: GeolocationData) => {
        setMessage('Localizando endereço...');
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${geoData.latitude}&lon=${geoData.longitude}`);
            if (!response.ok) throw new Error('Serviço de mapas indisponível.');
            const data = await response.json();
            if (!data || !data.address) throw new Error('Endereço não encontrado.');

            setAddress({
                road: data.address.road || 'N/A',
                suburb: data.address.suburb || 'N/A',
                city: data.address.city || data.address.town || 'N/A',
                postcode: data.address.postcode || 'N/A',
                country: data.address.country || 'N/A',
                display_name: data.display_name || 'N/A',
            });
            setMessage('Localização OK! Agora tire a foto.');
            fileInputRef.current?.click();

        } catch (error: any) {
            setStep('error');
            setMessage(`Erro ao buscar endereço: ${error.message}`);
        }
    };

    const handleSubmit = async () => {
        if (!photo || !geolocation || !user) {
            setStep('error');
            setMessage('Foto e GPS são obrigatórios.');
            return;
        }
        setStep('submitting');
        setMessage('Enviando solicitação...');
        
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
            statusHistory: [{ status: SolicitationStatus.ENVIADO_PARA_SELIM, updatedBy: user.name, timestamp }],
        };
        
        try {
            await addSolicitation(newSolicitation);
            setStep('success');
            setMessage('Solicitação enviada com sucesso!');
            setTimeout(resetState, 3000);
        } catch (error) {
            setStep('error');
            setMessage('Falha ao enviar. Tente novamente.');
        }
    };

    const renderStatus = () => {
      if (!message) return null;
      const isLoading = step === 'geolocating' || step === 'submitting';
      return (
        <div className={`flex items-center p-3 rounded-lg my-4 text-sm ${step === 'error' ? 'text-red-600 bg-red-100' : 'text-blue-600 bg-blue-100'}`}>
            {isLoading && <Loader className="h-5 w-5 mr-2 animate-spin"/>}
            {step === 'error' && <AlertCircle className="h-5 w-5 mr-2"/>}
            {message}
        </div>
      );
    };

    if (step === 'success') {
        return (
            <div className="container mx-auto p-4 sm:p-6 lg:p-8 flex justify-center items-center">
                <Card className="text-center">
                    <Sparkles className="h-16 w-16 mx-auto text-selim-green"/>
                    <h2 className="text-2xl font-bold text-selim-dark-blue mt-4">{message}</h2>
                    <p className="text-premium-gray-500">Você será redirecionado em breve.</p>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <Card className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-selim-dark-blue mb-6 text-center">Nova Solicitação de Serviço</h2>
                
                <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

                {step === 'idle' && (
                    <Button onClick={startProcess}><Camera className="h-5 w-5 mr-2"/> Iniciar Solicitação</Button>
                )}

                {photo && (
                    <div className="mb-4">
                        <img src={photo} alt="Captura do local" className="w-full h-auto rounded-lg shadow-md" />
                    </div>
                )}

                {geolocation && (
                    <Card className="my-4 bg-premium-gray-50">
                        <div className="flex items-start space-x-4">
                            <MapPin className="h-8 w-8 text-selim-green flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-selim-dark-blue">Localização Capturada</h3>
                                {address && <p className="text-sm text-premium-gray-800 mt-1">{address.road}, {address.suburb}</p>}
                                <iframe className="mt-2 w-full h-48 rounded-lg border" title="map" src={`https://www.openstreetmap.org/export/embed.html?bbox=${geolocation.longitude-0.005},${geolocation.latitude-0.005},${geolocation.longitude+0.005},${geolocation.latitude+0.005}&layer=mapnik&marker=${geolocation.latitude},${geolocation.longitude}`} ></iframe>
                            </div>
                        </div>
                    </Card>
                )}
                
                {renderStatus()}

                {(photo || observation) && step !== 'idle' && step !== 'geolocating' && (
                     <div className="space-y-4 mt-4">
                        <Textarea id="observation" label="Observação (opcional)" value={observation} onChange={(e) => setObservation(e.target.value)} />
                        <Button onClick={handleSubmit} disabled={!photo || !geolocation || step === 'submitting'} isLoading={step === 'submitting'}>
                            <Send className="h-5 w-5 mr-2" /> Enviar para Fiscal SELIM
                        </Button>
                        <Button onClick={resetState} variant='danger' disabled={step === 'submitting'}>Cancelar</Button>
                    </div>
                )}
            </Card>
        </div>
    );
};
