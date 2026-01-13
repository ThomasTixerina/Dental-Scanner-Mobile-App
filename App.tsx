
import React, { useState, useCallback } from 'react';
import AppHeader from './components/AppHeader';
import ScannerView from './components/ScannerView';
import KnowledgeHub from './components/KnowledgeHub';
import LuxMeter from './components/LuxMeter';
import { ScannerState, CaptureFrame, ScanResult, ScanStage } from './types';
import { analyzeScanQuality } from './services/geminiScannerService';
import { translations, Language } from './translations';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('es');
  const [view, setView] = useState<'scanner' | 'knowledge'>('scanner');
  const [scannerState, setScannerState] = useState<ScannerState>(ScannerState.IDLE);
  const [scanStage, setScanStage] = useState<ScanStage>(ScanStage.UPPER);
  const [capturedFrames, setCapturedFrames] = useState<CaptureFrame[]>([]);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [showLuxMeter, setShowLuxMeter] = useState(false);

  const t = translations[lang];

  const handlePrintBase = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <html>
        <head>
          <title>PocketLab Dental - Base de Calibración Profesional</title>
          <style>
            @page { size: letter; margin: 0; }
            body { 
              font-family: 'Helvetica', sans-serif; 
              padding: 0; 
              margin: 0; 
              background: #fff;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .page {
              width: 215.9mm;
              height: 279.4mm;
              position: relative;
              box-sizing: border-box;
              padding: 10mm;
              display: flex;
              flex-direction: column;
            }
            .grid-background {
              position: absolute;
              top: 10mm; left: 10mm; right: 10mm; bottom: 10mm;
              background-image: 
                linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
              background-size: 10mm 10mm;
              border: 0.5mm solid #333;
              z-index: 0;
            }
            .content { position: relative; z-index: 10; width: 100%; height: 100%; display: flex; flex-direction: column; }
            .header { text-align: center; margin-bottom: 5mm; }
            .header h1 { margin: 0; font-size: 24px; color: #1e40af; font-weight: 900; }
            .header p { margin: 2px 0; font-size: 12px; color: #666; font-weight: bold; }
            
            .warning-box {
              background: #fee2e2;
              border: 0.5mm solid #ef4444;
              padding: 4mm;
              margin: 2mm 10mm;
              text-align: center;
              font-size: 11px;
              font-weight: bold;
              color: #b91c1c;
            }

            .main-capture-zone {
              flex: 1;
              display: grid;
              grid-template-columns: 1fr 1fr;
              grid-template-rows: 1fr 1.2fr;
              gap: 5mm;
              margin: 5mm 10mm;
            }

            .zone {
              border: 0.8mm dashed #94a3b8;
              background: rgba(255,255,255,0.8);
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              position: relative;
            }

            .zone-label {
              position: absolute;
              top: -3mm;
              left: 5mm;
              background: white;
              padding: 0 3mm;
              font-size: 10px;
              font-weight: 900;
              color: #1e40af;
              text-transform: uppercase;
            }

            .zone-icon { font-size: 30px; opacity: 0.2; margin-bottom: 5mm; }
            .zone-text { font-size: 11px; color: #64748b; font-weight: bold; text-align: center; }

            .bite-zone { grid-column: span 2; }

            .marker { position: absolute; width: 20mm; height: 20mm; background: #000; }
            .tl { top: 0; left: 0; }
            .tr { top: 0; right: 0; }
            .bl { bottom: 0; left: 0; }
            .br { bottom: 0; right: 0; }

            .ruler-container {
              margin: 5mm 10mm;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .ruler-bar {
              width: 100mm;
              height: 4mm;
              background: #000;
              position: relative;
            }
            .ruler-mark {
              position: absolute;
              top: 4mm;
              font-size: 8px;
              font-weight: bold;
            }

            .footer-info {
              font-size: 9px;
              text-align: center;
              color: #94a3b8;
              margin-top: 5mm;
            }

            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="grid-background"></div>
            
            <div class="content">
              <div class="header">
                <h1>POCKETLAB DENTAL</h1>
                <p>BASE DE CALIBRACIÓN DE FOTOGRAMETRÍA V2.0</p>
              </div>

              <div class="warning-box">
                IMPORTANTE: IMPRIMIR EN TAMAÑO "CARTA" (LETTER) AL 100% DE ESCALA.<br/>
                NO USAR "AJUSTAR A PÁGINA" - LA PRECISIÓN CLÍNICA DEPENDE DE LA ESCALA REAL.
              </div>

              <div class="main-capture-zone">
                <div class="marker tl"></div>
                <div class="marker tr"></div>
                <div class="marker bl"></div>
                <div class="marker br"></div>

                <div class="zone">
                  <span class="zone-label">PASO 1: ARCADA SUPERIOR</span>
                  <div class="zone-icon">🦷</div>
                  <div class="zone-text">Posicione el modelo<br/>de yeso superior aquí</div>
                </div>

                <div class="zone">
                  <span class="zone-label">PASO 2: ARCADA INFERIOR</span>
                  <div class="zone-icon">🦷</div>
                  <div class="zone-text">Posicione el modelo<br/>de yeso inferior aquí</div>
                </div>

                <div class="zone bite-zone">
                  <span class="zone-label">PASO 3: REGISTRO DE MORDIDA</span>
                  <div class="zone-icon">👄</div>
                  <div class="zone-text">Posicione ambos modelos ocluidos (en mordida)<br/>Asegure estabilidad para el escaneo lateral</div>
                </div>
              </div>

              <div class="ruler-container">
                <div class="ruler-bar">
                  <div class="ruler-mark" style="left: 0;">0mm</div>
                  <div class="ruler-mark" style="left: 50mm;">50mm</div>
                  <div class="ruler-mark" style="right: 0;">100mm</div>
                </div>
                <p style="font-size: 10px; font-weight: bold; margin-top: 5mm;">
                  CONTROL DE ESCALA: ESTA LÍNEA NEGRA DEBE MEDIR EXACTAMENTE 100mm (10cm)
                </p>
              </div>

              <div class="footer-info">
                Sistema de digitalización dental extraoral. PocketLab v2.0 &copy; 2024.<br/>
                Compatible con Exocad, 3Shape y MeshMixer.
              </div>
            </div>
          </div>
          <script>
            window.onload = function() { 
              setTimeout(function() { window.print(); }, 500);
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleStartScan = () => {
    setCapturedFrames([]);
    setScanStage(ScanStage.UPPER);
    setScannerState(ScannerState.SCANNING);
    setFeedback(t.scanner.stageUpper);
  };

  const handleFrameCapture = useCallback((frame: CaptureFrame) => {
    setCapturedFrames(prev => [...prev, frame]);
  }, []);

  const handleScanFinished = async () => {
    if (scanStage === ScanStage.UPPER) {
      setScanStage(ScanStage.LOWER);
      setFeedback(t.scanner.stageLower);
    } else if (scanStage === ScanStage.LOWER) {
      setScanStage(ScanStage.BITE);
      setFeedback(t.scanner.stageBite);
    } else {
      // All stages complete, start processing
      setScannerState(ScannerState.PROCESSING);
      setIsProcessing(true);
      setFeedback(t.scanner.processing);

      try {
        // Send sample from each stage for analysis
        const samples = [
          capturedFrames.find(f => f.stage === ScanStage.UPPER)?.dataUrl,
          capturedFrames.find(f => f.stage === ScanStage.LOWER)?.dataUrl,
          capturedFrames.find(f => f.stage === ScanStage.BITE)?.dataUrl
        ].filter(Boolean) as string[];

        const analysis = await analyzeScanQuality(samples, lang);
        
        if (analysis.qualityScore > 70) {
          setFeedback(t.scanner.reconstructing);
          setTimeout(() => {
            setLastResult({
              id: 'SCAN-' + Date.now(),
              accuracy: 0.994,
              previewImageUrl: capturedFrames[capturedFrames.length - 1].dataUrl,
              timestamp: Date.now(),
              stlUrl: '#',
              plyUrl: '#'
            });
            setScannerState(ScannerState.COMPLETED);
            setIsProcessing(false);
            setFeedback(t.scanner.complete);
          }, 4000);
        } else {
          setScannerState(ScannerState.IDLE);
          setIsProcessing(false);
          setFeedback(`${t.scanner.failed}: ${analysis.feedback}`);
        }
      } catch (error) {
        setScannerState(ScannerState.IDLE);
        setIsProcessing(false);
        setFeedback('Error connectivity...');
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader lang={lang} setLang={setLang} currentView={view} setView={setView} />
      
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        {view === 'knowledge' ? (
          <KnowledgeHub lang={lang} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="aspect-[4/3] w-full relative">
                {scannerState === ScannerState.IDLE && (
                  <div className="absolute inset-0 bg-slate-800/50 rounded-3xl flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-700 overflow-hidden text-center">
                    <div className="w-24 h-24 bg-blue-600/20 text-blue-500 rounded-full flex items-center justify-center mb-6 relative">
                      <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20" />
                      <span className="text-4xl">🦷</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{t.scanner.readyTitle}</h2>
                    <p className="text-slate-400 text-center max-w-sm mb-8">{t.scanner.readyDesc}</p>
                    <button 
                      onClick={handleStartScan}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-10 rounded-2xl shadow-xl shadow-blue-500/20 transition-all transform hover:scale-105 active:scale-95"
                    >
                      {t.scanner.startBtn}
                    </button>
                  </div>
                )}

                {(scannerState === ScannerState.SCANNING || scannerState === ScannerState.PROCESSING) && (
                  <ScannerView 
                    state={scannerState} 
                    currentStage={scanStage}
                    onCapture={handleFrameCapture} 
                    onFinished={handleScanFinished} 
                    lang={lang}
                  />
                )}

                {scannerState === ScannerState.COMPLETED && lastResult && (
                  <div className="absolute inset-0 bg-slate-800 rounded-3xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
                    <div className="relative flex-1">
                      <img src={lastResult.previewImageUrl} className="w-full h-full object-cover opacity-60" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 mb-4 animate-bounce">
                          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h2 className="text-3xl font-bold">{t.scanner.complete}</h2>
                        <p className="text-green-400 font-mono mt-2">{t.scanner.accuracy}</p>
                      </div>
                    </div>
                    <div className="p-6 bg-slate-900 grid grid-cols-3 gap-4 border-t border-slate-700">
                      <button className="flex flex-col items-center gap-2 p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-all group">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t.scanner.exportStl}</span>
                        <span className="font-bold">CAD/CAM</span>
                      </button>
                      <button className="flex flex-col items-center gap-2 p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-all group">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t.scanner.exportObj}</span>
                        <span className="font-bold">Textured</span>
                      </button>
                      <button className="flex flex-col items-center gap-2 p-4 bg-blue-600 rounded-xl hover:bg-blue-500 transition-all">
                        <span className="text-[10px] text-white/60 uppercase font-bold tracking-wider">{t.scanner.sendLab}</span>
                        <span className="font-bold">Upload Lab</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className={`p-6 rounded-2xl transition-all duration-500 flex items-center gap-4 ${scannerState === ScannerState.SCANNING ? 'bg-blue-600/10 border border-blue-500/30' : 'bg-slate-800/50'}`}>
                <div className={`w-3 h-3 rounded-full ${scannerState === ScannerState.SCANNING ? 'bg-blue-500 animate-pulse' : scannerState === ScannerState.PROCESSING ? 'bg-yellow-500 animate-pulse' : 'bg-slate-500'}`} />
                <p className="text-sm font-medium text-slate-200 uppercase tracking-wide">
                  {feedback}
                </p>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 overflow-hidden">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-400 uppercase tracking-tight">
                  {t.guide.title}
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-4 p-3 bg-slate-900/50 rounded-xl border border-white/5 group hover:border-white/20 transition-all">
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-xl">📄</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold">{t.guide.basePdf}</p>
                      <p className="text-xs text-slate-400">{t.guide.basePdfDesc}</p>
                      <button 
                        onClick={handlePrintBase}
                        className="text-blue-400 text-xs font-bold mt-2 hover:underline bg-blue-500/10 px-2 py-1 rounded"
                      >
                        {t.guide.download}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col p-3 bg-slate-900/50 rounded-xl border border-white/5 transition-all">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-xl">💡</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold">{t.guide.lighting}</p>
                        <p className="text-xs text-slate-400">{t.guide.lightingDesc}</p>
                        {!showLuxMeter && (
                          <button 
                            onClick={() => setShowLuxMeter(true)}
                            className="text-cyan-400 text-xs font-bold mt-2 hover:underline bg-cyan-500/10 px-2 py-1 rounded flex items-center gap-2"
                          >
                            {t.guide.luxmeter}
                          </button>
                        )}
                      </div>
                    </div>
                    {showLuxMeter && <LuxMeter lang={lang} onClose={() => setShowLuxMeter(false)} />}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 p-6 rounded-3xl border border-indigo-500/20">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-indigo-400 uppercase tracking-tight">
                  {t.guide.labTitle}
                </h3>
                <ul className="text-sm space-y-3">
                  {[t.guide.exocad, t.guide.sirona, t.guide.aiEnhance, t.guide.manifold].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-slate-300">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="p-4 border-t border-slate-800 text-center text-slate-500 text-[10px] md:text-xs">
        <p>&copy; 2024 PocketLab Dental. Democratizing digital dentistry globally.</p>
      </footer>
    </div>
  );
};

export default App;
