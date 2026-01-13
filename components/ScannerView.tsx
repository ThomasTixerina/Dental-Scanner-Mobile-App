
import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { ScannerState, CaptureFrame, ScanStage } from '../types';
import { translations, Language } from '../translations';

interface ScannerViewProps {
  onCapture: (frame: CaptureFrame) => void;
  onFinished: () => void;
  state: ScannerState;
  currentStage: ScanStage;
  lang: Language;
}

const SECTOR_COUNT = 24; // 15 degrees each
const LIGHT_THRESHOLDS = {
  DARK: 65,
  BRIGHT: 220
};

const ScannerView: React.FC<ScannerViewProps> = ({ onCapture, onFinished, state, currentStage, lang }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturedSectors, setCapturedSectors] = useState<Set<number>>(new Set());
  const [frameCount, setFrameCount] = useState(0);
  const [lightingStatus, setLightingStatus] = useState<'optimal' | 'dark' | 'bright'>('optimal');
  const [showFlash, setShowFlash] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const t = translations[lang].scanner;

  const coverage = useMemo(() => {
    return (capturedSectors.size / SECTOR_COUNT) * 100;
  }, [capturedSectors.size]);

  useEffect(() => {
    async function setupCamera() {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Camera access denied", err);
        }
      }
    }
    if (state === ScannerState.SCANNING) {
      setupCamera();
      // Reset sectors when changing stage
      setCapturedSectors(new Set());
      setFrameCount(0);
    }
    
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [state, currentStage]);

  const analyzeLighting = (context: CanvasRenderingContext2D) => {
    const imageData = context.getImageData(0, 0, 640, 480);
    const data = imageData.data;
    let brightness = 0;
    const sampleSize = 20; 
    
    for (let i = 0; i < data.length; i += 4 * sampleSize) {
      brightness += (data[i] + data[i+1] + data[i+2]) / 3;
    }
    
    const avgBrightness = brightness / (data.length / (4 * sampleSize));
    
    if (avgBrightness < LIGHT_THRESHOLDS.DARK) {
      setLightingStatus('dark');
    } else if (avgBrightness > LIGHT_THRESHOLDS.BRIGHT) {
      setLightingStatus('bright');
    } else {
      setLightingStatus('optimal');
    }
  };

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || state !== ScannerState.SCANNING) return;
    
    const context = canvasRef.current.getContext('2d');
    if (context) {
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 80);

      setIsCapturing(true);
      setTimeout(() => setIsCapturing(false), 300);

      context.drawImage(videoRef.current, 0, 0, 640, 480);
      analyzeLighting(context);

      const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
      
      const angle = (frameCount * 15) % 360;
      const sectorIndex = Math.floor(angle / (360 / SECTOR_COUNT));
      
      const newFrame: CaptureFrame = {
        id: Date.now().toString(),
        dataUrl,
        timestamp: Date.now(),
        angle: angle,
        stage: currentStage
      };
      
      onCapture(newFrame);
      setFrameCount(prev => prev + 1);
      
      setCapturedSectors(prev => {
        const next = new Set(prev);
        next.add(sectorIndex);
        
        if (next.size >= SECTOR_COUNT) {
          onFinished();
        }
        return next;
      });
    }
  }, [frameCount, state, currentStage, onCapture, onFinished]);

  useEffect(() => {
    let interval: number;
    if (state === ScannerState.SCANNING) {
      interval = window.setInterval(captureFrame, 1500); 
    }
    return () => clearInterval(interval);
  }, [state, captureFrame]);

  const nextTargetSector = useMemo(() => {
    for (let i = 0; i < SECTOR_COUNT; i++) {
      if (!capturedSectors.has(i)) return i;
    }
    return -1;
  }, [capturedSectors]);

  if (state === ScannerState.PROCESSING) {
    return (
      <div className="relative w-full h-full bg-slate-900 rounded-3xl overflow-hidden flex flex-col items-center justify-center p-8">
        <div className="relative w-48 h-48 mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            {Array.from({ length: 12 }).map((_, i) => (
              <div 
                key={i}
                className="absolute w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                style={{
                  transform: `rotate(${i * 30}deg) translateY(-40px)`,
                  animationDelay: `${i * 0.1}s`,
                  opacity: 0.4 + Math.random() * 0.6
                }}
              />
            ))}
            <div className="w-24 h-24 border-2 border-blue-500/20 rounded-full animate-spin duration-[3000ms]" />
            <div className="absolute w-16 h-16 border-2 border-cyan-400/30 rounded-full animate-reverse-spin duration-[2000ms]" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
             <span className="text-4xl">🦷</span>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2 animate-pulse">{t.processing}</h3>
        <p className="text-slate-400 text-sm font-mono tracking-tighter uppercase">{t.reconstructing}</p>
        <style>{`
          @keyframes reverse-spin {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }
          .animate-reverse-spin {
            animation: reverse-spin linear infinite;
          }
        `}</style>
      </div>
    );
  }

  const stageLabel = currentStage === ScanStage.UPPER ? t.stageUpper : currentStage === ScanStage.LOWER ? t.stageLower : t.stageBite;

  return (
    <div className="relative w-full h-full bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-700 transition-all">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="w-full h-full object-cover"
      />
      
      <canvas ref={canvasRef} width="640" height="480" className="hidden" />

      {/* Flash Effect */}
      <div className={`absolute inset-0 bg-white transition-opacity duration-75 pointer-events-none z-[100] ${showFlash ? 'opacity-40' : 'opacity-0'}`} />

      {/* AR Grid & HUD */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <defs>
            <pattern id="arGrid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.1" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#arGrid)" />
          
          <g transform="translate(50, 50)" opacity="0.6">
            <circle r="15" fill="none" stroke="rgba(59,130,246,0.3)" strokeWidth="0.2" strokeDasharray="1 1" />
            <rect x="-15" y="-15" width="30" height="30" fill="none" stroke="white" strokeWidth="0.2" strokeDasharray="1 1" />
          </g>

          <g transform="translate(50, 50)">
            {Array.from({ length: SECTOR_COUNT }).map((_, i) => {
              const startAngle = (i * 360) / SECTOR_COUNT;
              const endAngle = ((i + 1) * 360) / SECTOR_COUNT;
              const isCaptured = capturedSectors.has(i);
              const r1 = 42; const r2 = 38;
              const x1 = r1 * Math.cos((startAngle - 90) * Math.PI / 180);
              const y1 = r1 * Math.sin((startAngle - 90) * Math.PI / 180);
              const x2 = r1 * Math.cos((endAngle - 90) * Math.PI / 180);
              const y2 = r1 * Math.sin((endAngle - 90) * Math.PI / 180);
              const x3 = r2 * Math.cos((endAngle - 90) * Math.PI / 180);
              const y3 = r2 * Math.sin((endAngle - 90) * Math.PI / 180);
              const x4 = r2 * Math.cos((startAngle - 90) * Math.PI / 180);
              const y4 = r2 * Math.sin((startAngle - 90) * Math.PI / 180);
              return (
                <path
                  key={i}
                  d={`M ${x1} ${y1} A ${r1} ${r1} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${r2} ${r2} 0 0 0 ${x4} ${y4} Z`}
                  fill={isCaptured ? '#10b981' : '#ef4444'}
                  fillOpacity={isCaptured ? 0.8 : 0.2}
                  stroke="white"
                  strokeWidth="0.05"
                  className="transition-all duration-300"
                />
              );
            })}
          </g>
        </svg>
      </div>

      {/* Stage Indicator Overlay */}
      <div className="absolute top-6 left-6 z-40 bg-blue-600/90 backdrop-blur-md px-4 py-2 rounded-xl border border-blue-400 shadow-xl">
        <div className="flex items-center gap-3">
          <span className="text-xl">{currentStage === ScanStage.BITE ? '👄' : '🦷'}</span>
          <span className="text-sm font-black text-white uppercase tracking-wider">{stageLabel}</span>
        </div>
      </div>

      {/* Capture Button Area */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-8 pointer-events-none z-30">
        <div className="relative">
          {/* Shutter Pulse Animation */}
          {isCapturing && (
            <div className="absolute inset-0 rounded-full border-4 border-blue-400 animate-shutter-ring opacity-100 scale-100" />
          )}
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              captureFrame();
            }}
            disabled={state !== ScannerState.SCANNING}
            className={`pointer-events-auto w-24 h-24 rounded-full border-4 flex items-center justify-center transition-all hover:scale-105 active:scale-90 group shadow-2xl relative z-10 ${
              state === ScannerState.SCANNING 
                ? `${isCapturing ? 'border-blue-400 scale-105 shadow-[0_0_30px_rgba(59,130,246,0.6)]' : 'border-white/50 shadow-black/50'} bg-white/10 backdrop-blur-md cursor-pointer` 
                : 'border-slate-600 bg-slate-800/20 cursor-not-allowed opacity-50'
            }`}
          >
            <div className={`w-18 h-18 rounded-full transition-all flex items-center justify-center border-2 ${
              isCapturing ? 'bg-blue-100 border-blue-400' : 'bg-white border-transparent group-hover:bg-blue-50'
            }`}>
              <svg className={`w-8 h-8 transition-colors ${isCapturing ? 'text-blue-600' : 'text-slate-700'}`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" className="hidden"/>
                <circle cx="12" cy="12" r="3.2" />
                <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
              </svg>
            </div>
          </button>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none flex flex-col justify-end p-6 z-20">
        <div className="flex flex-col items-center gap-4 mb-4">
          <div className="w-full max-w-sm h-3 bg-white/10 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-300" 
              style={{ width: `${coverage}%` }}
            />
          </div>
          <p className="text-[10px] font-black uppercase text-white/50 tracking-[0.2em]">{Math.floor(coverage)}% {t.coverage}</p>
        </div>
      </div>

      <style>{`
        @keyframes shutter-ring {
          0% {
            transform: scale(0.8);
            opacity: 1;
            border-width: 8px;
          }
          100% {
            transform: scale(2);
            opacity: 0;
            border-width: 1px;
          }
        }
        .animate-shutter-ring {
          animation: shutter-ring 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ScannerView;
