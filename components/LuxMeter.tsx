
import React, { useEffect, useRef, useState } from 'react';
import { Language, translations } from '../translations';

interface LuxMeterProps {
  lang: Language;
  onClose: () => void;
}

const LuxMeter: React.FC<LuxMeterProps> = ({ lang, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lux, setLux] = useState(0);
  const [status, setStatus] = useState<'low' | 'optimal' | 'high'>('low');
  const t = translations[lang].guide;

  useEffect(() => {
    let stream: MediaStream;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        // Camera access denied or not available
      }
    };

    startCamera();
    
    const interval = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, 100, 100);
          const imageData = ctx.getImageData(0, 0, 100, 100);
          const data = imageData.data;
          
          let totalLuminance = 0;
          for (let i = 0; i < data.length; i += 4) {
            // Relative luminance formula
            const r = data[i];
            const g = data[i+1];
            const b = data[i+2];
            totalLuminance += (0.2126 * r + 0.7152 * g + 0.0722 * b);
          }
          
          const avgLuminance = totalLuminance / (data.length / 4);
          // Scale 0-255 to roughly 0-1500 Lux for simulation
          const estimatedLux = Math.round(avgLuminance * 5.8); 
          setLux(estimatedLux);

          if (estimatedLux < 450) setStatus('low');
          else if (estimatedLux > 1100) setStatus('high');
          else setStatus('optimal');
        }
      }
    }, 100);

    return () => {
      clearInterval(interval);
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  const getStatusColor = () => {
    if (status === 'low') return 'text-amber-500';
    if (status === 'high') return 'text-red-500';
    return 'text-green-500';
  };

  const getProgressWidth = () => Math.min(100, (lux / 1500) * 100);

  return (
    <div className="mt-4 p-5 bg-slate-900 rounded-2xl border border-white/5 animate-in slide-in-from-top-2 duration-300">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">LUXÓMETRO DIGITAL</h4>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕</button>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="64" cy="64" r="58" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-800" />
            <circle 
              cx="64" cy="64" r="58" fill="transparent" stroke="currentColor" strokeWidth="8" 
              className={`transition-all duration-300 ${status === 'optimal' ? 'text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : status === 'low' ? 'text-amber-500' : 'text-red-500'}`}
              strokeDasharray={364}
              strokeDashoffset={364 - (364 * getProgressWidth()) / 100}
              strokeLinecap="round"
            />
          </svg>
          <div className="text-center">
            <span className="text-3xl font-black block">{lux}</span>
            <span className="text-[10px] font-bold text-slate-500">LUX (lx)</span>
          </div>
        </div>

        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 ${getStatusColor()}`}>
          {status === 'low' ? t.luxLow : status === 'high' ? t.luxHigh : t.luxOptimal}
        </div>

        <video ref={videoRef} autoPlay playsInline className="hidden" />
        <canvas ref={canvasRef} width="100" height="100" className="hidden" />
        
        <p className="text-[10px] text-slate-500 text-center leading-relaxed">
          {lang === 'es' 
            ? 'Para un escaneo clínico perfecto, apunte la cámara al modelo de yeso hasta que el indicador se ponga verde.' 
            : 'For a perfect clinical scan, point the camera at the plaster model until the indicator turns green.'}
        </p>
      </div>
    </div>
  );
};

export default LuxMeter;
