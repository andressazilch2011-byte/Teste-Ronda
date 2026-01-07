
import React, { useState, useEffect, useRef } from 'react';
import { POINT_MAP } from './constants';
import { RondaRecord, GeoLocation } from './types';
import { saveRecord, getLatestRecord } from './services/db';
import { ScannerOverlay } from './components/ScannerOverlay';

// Declarando globalmente para o TypeScript reconhecer a lib externa via CDN
declare const Html5Qrcode: any;

const App: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [lastRecord, setLastRecord] = useState<RondaRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    // Carregar o último registro ao iniciar
    const last = getLatestRecord();
    if (last) setLastRecord(last);
  }, []);

  const handleScanSuccess = async (decodedText: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);

    // Parar scanner imediatamente após detectar
    stopScanner();

    // 1. Validar Identificação do Local
    const pointName = POINT_MAP[decodedText] || `Ponto Desconhecido (${decodedText})`;

    // 2. Captura obrigatória de GPS
    if (!navigator.geolocation) {
      setError("Seu navegador não suporta geolocalização.");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location: GeoLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };

        const newRecord: RondaRecord = {
          pointId: decodedText,
          pointName,
          timestamp: new Date(),
          location
        };

        try {
          // 3. Salvar no Firebase (Simulado)
          await saveRecord(newRecord);
          setLastRecord(newRecord);
          setIsLoading(false);
          alert(`Registro concluído: ${pointName}`);
        } catch (err) {
          setError("Erro ao salvar registro no banco de dados.");
          setIsLoading(false);
        }
      },
      (err) => {
        setError("GPS desativado. O registro de ronda é obrigatório com geolocalização.");
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const startScanner = () => {
    setIsScanning(true);
    setError(null);
    
    // Pequeno delay para garantir que o div #reader esteja no DOM
    setTimeout(() => {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;
      
      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        handleScanSuccess,
        (errorMessage: string) => {
          // Apenas erros de frames silenciosos
        }
      ).catch((err: any) => {
        setError("Não foi possível acessar a câmera.");
        setIsScanning(false);
      });
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        setIsScanning(false);
      }).catch(() => {
        setIsScanning(false);
      });
    } else {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center p-6 pb-20">
      {/* Header */}
      <header className="w-full max-w-md flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-900/20">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04M12 21.472a11.969 11.969 0 00-8.157-3.04m16.314 0c-2.227 0-4.283.606-6.035 1.65" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white">Vigilante Pro</h1>
        <p className="text-slate-400 text-sm">Controle de Ronda Digital</p>
      </header>

      {/* Main Action Area */}
      <main className="w-full max-w-md flex-1 flex flex-col">
        {!isScanning ? (
          <div className="flex flex-col items-center justify-center space-y-8 py-12">
            <button
              onClick={startScanner}
              disabled={isLoading}
              className={`w-56 h-56 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all flex flex-col items-center justify-center border-8 border-slate-900 shadow-[0_0_50px_rgba(37,99,235,0.3)] ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-12 h-12 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  <span className="text-white font-bold text-lg tracking-wider">ESCANEAR PONTO</span>
                </>
              )}
            </button>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex items-start space-x-3 w-full animate-shake">
                <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="relative w-full aspect-square bg-black rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-800">
            <div id="reader" className="w-full h-full"></div>
            <ScannerOverlay />
            <button
              onClick={stopScanner}
              className="absolute top-4 right-4 bg-slate-900/80 p-2 rounded-full text-white hover:bg-slate-800 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="absolute bottom-6 left-0 w-full text-center">
              <span className="bg-blue-600/90 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest animate-pulse">
                Aguardando leitura...
              </span>
            </div>
          </div>
        )}

        {/* Success Interface - Last Record Card */}
        {lastRecord && !isScanning && (
          <div className="mt-8">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3 ml-1">Último Registro</h3>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg shadow-black/20 group hover:border-blue-500/50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-white leading-tight">{lastRecord.pointName}</h4>
                  <p className="text-slate-500 text-xs mt-1">
                    {lastRecord.timestamp.toLocaleDateString('pt-BR')} às {lastRecord.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded-md">OK</span>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-center space-x-2 text-slate-500 text-[11px]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>GPS: {lastRecord.location.latitude.toFixed(5)}, {lastRecord.location.longitude.toFixed(5)}</span>
            </div>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="mt-auto w-full max-w-md pt-8 border-t border-slate-900 text-center">
        <p className="text-slate-600 text-[10px] uppercase tracking-tighter">
          Vigilante Pro v2.4 • Segurança Verificada • Localização Obrigatória
        </p>
      </footer>
    </div>
  );
};

export default App;
