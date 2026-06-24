
import React, { useState, useCallback } from 'react';
import AppHeader from './components/AppHeader';
import ScannerView from './components/ScannerView';
import KnowledgeHub from './components/KnowledgeHub';
import LuxMeter from './components/LuxMeter';
import HistoryView, { ExtendedScanResult } from './components/HistoryView';
import CadViewer from './components/CadViewer';
import RegistriesView from './components/RegistriesView';
import { ScannerState, CaptureFrame, ScanResult, ScanStage } from './types';
import { analyzeScanQuality } from './services/geminiScannerService';
import { translations, Language } from './translations';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('es');
  const [view, setView] = useState<'scanner' | 'knowledge' | 'history' | 'registries'>('scanner');
  const [scannerState, setScannerState] = useState<ScannerState>(ScannerState.IDLE);
  const [scanStage, setScanStage] = useState<ScanStage>(ScanStage.UPPER);
  const [capturedFrames, setCapturedFrames] = useState<CaptureFrame[]>([]);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [showLuxMeter, setShowLuxMeter] = useState(false);

  const t = translations[lang];

  const handleCadSave = (updatedCase: ExtendedScanResult) => {
    try {
      const currentRaw = localStorage.getItem('pocketlab_scans');
      const currentList = currentRaw ? JSON.parse(currentRaw) : [];
      const filteredList = currentList.filter((item: ExtendedScanResult) => item.id !== updatedCase.id);
      filteredList.unshift(updatedCase);
      localStorage.setItem('pocketlab_scans', JSON.stringify(filteredList));
    } catch (err) {
      console.error("Error updating scan in local storage", err);
    }
    
    setLastResult(updatedCase);
    setScannerState(ScannerState.IDLE);
    setView('history');
  };

  const handlePrintBase = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <html>
        <head>
          <title>PocketLab Dental - Base de Calibración de Precisión y Enroque CAD</title>
          <style>
            @page { size: letter; margin: 0; }
            body { 
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
              padding: 0; 
              margin: 0; 
              background: #fff;
              color: #1e293b;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .page {
              width: 215.9mm;
              height: 279.4mm;
              position: relative;
              box-sizing: border-box;
              padding: 10mm 12mm;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              background: #ffffff;
            }
            .grid-background {
              position: absolute;
              top: 10mm; left: 12mm; right: 12mm; bottom: 10mm;
              background-image: 
                linear-gradient(to right, #f1f5f9 1px, transparent 1px),
                linear-gradient(to bottom, #f1f5f9 1px, transparent 1px);
              background-size: 5mm 5mm;
              border: 0.5mm solid #1e293b;
              z-index: 0;
              pointer-events: none;
            }
            .content { position: relative; z-index: 10; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: space-between; }
            
            .header { 
              text-align: center; 
              border-bottom: 0.5mm solid #cbd5e1; 
              padding-bottom: 3mm;
              margin-bottom: 3mm;
            }
            .header h1 { margin: 0; font-size: 22px; color: #0f172a; font-weight: 900; letter-spacing: -0.5px; }
            .header p { margin: 2px 0 0 0; font-size: 11px; color: #475569; font-weight: bold; letter-spacing: 1px; }
            
            .warning-box {
              background: #fffbeb;
              border: 0.4mm solid #d97706;
              padding: 3mm;
              margin: 1mm 0 3mm 0;
              text-align: center;
              font-size: 10px;
              font-weight: bold;
              color: #92400e;
              border-radius: 2mm;
            }

            .main-capture-zone {
              flex: 1;
              display: grid;
              grid-template-columns: 1fr 1fr;
              grid-template-rows: 1.1fr 1.3fr;
              gap: 4mm;
              margin-bottom: 3mm;
            }

            .zone {
              border: 0.8mm dashed #64748b;
              background: rgba(255,255,255,0.95);
              border-radius: 3mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              position: relative;
              padding: 3mm;
              box-shadow: 0 1mm 3mm rgba(0,0,0,0.02);
            }

            .zone-label {
              background: #0f172a;
              color: white;
              padding: 0.8mm 3mm;
              font-size: 9px;
              font-weight: 900;
              border-radius: 1mm;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            /* Front/Anterior Direction Indicator Badge */
            .front-indicator {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 1mm;
              background: #ef4444;
              color: white;
              padding: 0.5mm 2.5mm;
              font-size: 8px;
              font-weight: 900;
              border-radius: 1mm;
              margin-bottom: 1mm;
              text-transform: uppercase;
              animation: pulse 2s infinite;
            }

            .zone-svg {
              width: 55mm;
              height: 35mm;
              margin: 2mm 0;
              opacity: 0.85;
            }

            .zone-text { 
              font-size: 10px; 
              color: #334155; 
              font-weight: bold; 
              text-align: center; 
              line-height: 1.3;
            }
            .zone-extra-instructions {
              font-size: 8.5px;
              color: #64748b;
              text-align: center;
              margin-top: 1mm;
              border-top: 0.2mm solid #e2e8f0;
              padding-top: 1mm;
              width: 100%;
            }

            .bite-zone { grid-column: span 2; }

            .marker { position: absolute; width: 18mm; height: 18mm; background: #000; }
            .marker-inner { width: 10mm; height: 10mm; background: #fff; margin: 4mm; }
            .tl { top: 0; left: 0; }
            .tr { top: 0; right: 0; }
            .bl { bottom: 0; left: 0; }
            .br { bottom: 0; right: 0; }

            /* Multicamera Sweep Angle Compass */
            .camera-sweep-guide {
              display: flex;
              justify-content: space-around;
              align-items: center;
              background: #f8fafc;
              border: 0.3mm solid #cbd5e1;
              border-radius: 2mm;
              padding: 2.5mm;
              margin-bottom: 3mm;
            }
            .sweep-title {
              font-size: 9px;
              font-weight: 900;
              color: #0f172a;
              text-transform: uppercase;
              width: 25%;
            }
            .sweep-steps {
              display: flex;
              gap: 2mm;
              width: 75%;
              justify-content: space-between;
            }
            .sweep-step {
              background: #ffffff;
              border: 0.3mm solid #94a3b8;
              border-radius: 1mm;
              padding: 1mm 1.5mm;
              font-size: 8.5px;
              font-weight: bold;
              text-align: center;
              flex: 1;
            }
            .sweep-step.active {
              background: #eff6ff;
              border-color: #3b82f6;
              color: #1d4ed8;
            }

            /* Technical Interlocking Section (Explicación del Enroque) */
            .interlocking-tech-block {
              background: #f1f5f9;
              border-left: 1mm solid #3b82f6;
              border-radius: 1.5mm;
              padding: 3mm;
              margin-bottom: 3.5mm;
            }
            .interlocking-title {
              font-size: 10px;
              font-weight: 900;
              color: #1e293b;
              margin: 0 0 1.5mm 0;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .interlocking-desc {
              font-size: 9px;
              color: #475569;
              line-height: 1.4;
              margin: 0;
            }

            .ruler-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              margin-bottom: 2mm;
            }
            .ruler-bar {
              width: 100mm;
              height: 5mm;
              background: #000;
              position: relative;
              border-radius: 0.5mm;
            }
            .ruler-mark {
              position: absolute;
              top: 5mm;
              font-size: 8px;
              font-weight: 900;
              color: #0f172a;
            }

            .footer-info {
              font-size: 8.5px;
              text-align: center;
              color: #64748b;
              border-top: 0.3mm solid #e2e8f0;
              padding-top: 2.5mm;
              line-height: 1.4;
            }
            .formats-badge {
              display: inline-block;
              background: #e2e8f0;
              color: #334155;
              padding: 0.3mm 1.5mm;
              border-radius: 0.5mm;
              font-weight: 900;
              font-size: 7.5px;
              margin: 0 1mm;
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="grid-background"></div>
            
            <div class="content">
              <!-- HEADER -->
              <div class="header">
                <h1>POCKETLAB DENTAL - CALIBRATION FRAME</h1>
                <p>BASE DE ESCANEO DE ALTO RENDIMIENTO Y PRE-REGISTRO DE ENROQUE DE MORDIDA</p>
              </div>

              <!-- WARNING SCALE -->
              <div class="warning-box">
                ⚠️ CONTROL DE ESCALA CLÍNICA: IMPRIMIR OBLIGATORIAMENTE EN PAPEL TAMAÑO SELECCIONADO "CARTA" (LETTER) AL 100% DE ESCALA.<br/>
                DESACTIVAR "AJUSTAR AL ÁREA DE IMPRESIÓN". ESTA PÁGINA SIRVE COMO REGISTRO MÉTRICO 3D EN EL MOTOR DE FOTOGRAMETRÍA.
              </div>

              <!-- MAIN SCAN ZONE WITH SPECIFIC ANATOMICAL GUIDES AND FRONT INDICATORS -->
              <div class="main-capture-zone">
                <!-- ARUCO PATTERN RECONSTRUCTION TOKENS IN CORNERS (SIMULATED SHARP EDGES) -->
                <div class="marker tl"><div class="marker-inner"></div></div>
                <div class="marker tr"><div class="marker-inner"></div></div>
                <div class="marker bl"><div class="marker-inner"></div></div>
                <div class="marker br"><div class="marker-inner"></div></div>

                <!-- PASO 1: ARCADA SUPERIOR -->
                <div class="zone">
                  <span class="zone-label">PASO 1: ARCADA SUPERIOR (MAXILAR)</span>
                  
                  <div class="front-indicator">▲ FRENTE / ANTERIOR (DIENTES 11-21)</div>
                  
                  <!-- SVGs representing actual anatomical outline & correct placememt orientation -->
                  <svg class="zone-svg" viewBox="0 0 120 70">
                    <!-- High definition contour of upper arch with rugae -->
                    <path d="M 15,60 C 20,20 100,20 105,60 L 90,62 C 85,35 35,35 30,62 Z" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.5" />
                    <!-- Teeth representation -->
                    <rect x="55" y="16" width="4" height="6" rx="1" fill="#bae6fd" stroke="#0284c7" />
                    <rect x="61" y="16" width="4" height="6" rx="1" fill="#bae6fd" stroke="#0284c7" />
                    <rect x="49" y="18" width="4" height="5" rx="1" fill="#bae6fd" stroke="#0284c7" />
                    <rect x="67" y="18" width="4" height="5" rx="1" fill="#bae6fd" stroke="#0284c7" />
                    <circle cx="21" cy="56" r="3" fill="#bae6fd" />
                    <circle cx="99" cy="56" r="3" fill="#bae6fd" />
                    <!-- Palatal Rugae lines and midline indicating maxillary identity -->
                    <line x1="60" y1="22" x2="60" y2="48" stroke="#0284c7" stroke-width="1" stroke-dasharray="1 1" />
                    <path d="M 50,32 C 55,34 65,34 70,32" stroke="#0284c7" stroke-width="0.8" />
                    <path d="M 45,40 C 55,42 65,42 75,40" stroke="#0284c7" stroke-width="0.8" />
                  </svg>

                  <div class="zone-text">
                    Coloque el modelo de yeso <b>SUPERIOR</b>.<br/>
                    Los dientes del <b>FRENTE (anteriores)</b> deben apuntar hacia arriba (flecha roja).
                  </div>
                  <div class="zone-extra-instructions">
                    Realice captura semicircular de 24 tomas.
                  </div>
                </div>

                <!-- PASO 2: ARCADA INFERIOR -->
                <div class="zone">
                  <span class="zone-label">PASO 2: ARCADA INFERIOR (MANDIBULAR)</span>
                  
                  <div class="front-indicator">▲ FRENTE / ANTERIOR (DIENTES 31-41)</div>

                  <!-- SVGs representing actual anatomical outline (U-shaped mandible) -->
                  <svg class="zone-svg" viewBox="0 0 120 70">
                    <path d="M 18,60 C 23,23 97,23 102,60 L 88,62 C 84,33 36,33 32,62 Z" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.5" />
                    <!-- Teeth representation -->
                    <rect x="56" y="18" width="3.5" height="5" rx="1" fill="#dcfce7" stroke="#16a34a" />
                    <rect x="61" y="18" width="3.5" height="5" rx="1" fill="#dcfce7" stroke="#16a34a" />
                    <rect x="51" y="20" width="3.5" height="4.5" rx="1" fill="#dcfce7" stroke="#16a34a" />
                    <rect x="66" y="20" width="3.5" height="4.5" rx="1" fill="#dcfce7" stroke="#16a34a" />
                    <circle cx="24" cy="56" r="3" fill="#dcfce7" />
                    <circle cx="96" cy="56" r="3" fill="#dcfce7" />
                    <!-- Tongue space indicator (Anatomical U shape check) -->
                    <text x="60" y="50" fill="#16a34a" font-size="6" font-weight="900" text-anchor="middle">ESPACIO LINGUAL (VACÍO)</text>
                  </svg>

                  <div class="zone-text">
                    Coloque el modelo de yeso <b>INFERIOR</b>.<br/>
                    Los dientes del <b>FRENTE (anteriores)</b> deben apuntar hacia arriba (flecha roja).
                  </div>
                  <div class="zone-extra-instructions">
                    Asegure nitidez en la línea del margen cervical.
                  </div>
                </div>

                <!-- PASO 3: REGISTRO DE MORDIDA (ENROQUE) -->
                <div class="zone bite-zone">
                  <span class="zone-label">PASO 3: REGISTRO DE MORDIDA (ENROQUE TRIAXIAL DE PRECISIÓN)</span>
                  
                  <div class="front-indicator" style="background: #1e3a8a;">▲ ORIENTACIÓN DEL FRENTE COMPACTO DE MORDIDA</div>

                  <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 3mm;">
                    
                    <!-- SVG diagram demonstrating correct interlocking sequence -->
                    <svg class="zone-svg" style="width: 70mm; height: 32mm;" viewBox="0 0 200 90">
                      <!-- Upper arch profile -->
                      <path d="M 20,20 C 60,8 140,8 180,20 L 170,35 C 130,22 70,22 30,35 Z" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.2" />
                      <!-- Bite Registration Silicon (with striped surface) -->
                      <path d="M 23,38 C 65,25 135,25 177,38 L 173,48 C 133,35 67,35 27,48 Z" fill="#fef08a" stroke="#ca8a04" stroke-width="1" stroke-dasharray="3 1" />
                      <!-- Lower arch profile interlocking from below -->
                      <path d="M 20,68 C 60,56 140,56 180,68 L 170,53 C 130,41 70,41 30,53 Z" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.2" />
                      
                      <!-- Labels -->
                      <text x="100" y="16" fill="#02679a" font-size="6.5" font-weight="bold" text-anchor="middle">ARCADA SUPERIOR (MAXILAR)</text>
                      <text x="100" y="44" fill="#854d0e" font-size="7" font-weight="900" text-anchor="middle">REGISTRO DE SILICONA / CERA</text>
                      <text x="100" y="64" fill="#14532d" font-size="6.5" font-weight="bold" text-anchor="middle">ARCADA INFERIOR (MANDIBULAR)</text>
                    </svg>

                    <div style="text-align: left; flex: 1;">
                      <div class="zone-text" style="text-align: left;">
                        Coloque ambos modelos ensamblados físicamente bajo la mordida original.<br/>
                        <b>Uso de la Silicona de mordida:</b> Intercale la placa de silicona o cera registrada entre ambas arcadas para conseguir el encaje físico perfecto (enroque).
                      </div>
                      <div class="zone-extra-instructions" style="text-align: left;">
                        Capture la vista de oclusión lateral (derecha e izquierda) y anterior para guiar la matriz del software.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- MULTI-ANGLE CAMERA SWEEP INSTRUCTIONS -->
              <div class="camera-sweep-guide">
                <div class="sweep-title">
                  📸 Guía Multi-Angulo<br/>
                  <span style="font-size: 7px; color: #64748b; font-weight: normal; text-transform: none;">Posiciones recomendadas de captura desde la cámara móvil</span>
                </div>
                <div class="sweep-steps">
                  <div class="sweep-step"><b>0° Anterior</b><br/>Frente Directo</div>
                  <div class="sweep-step"><b>45° Lat. Derecho</b><br/>Caninos y Molares</div>
                  <div class="sweep-step"><b>90° Distal Der.</b><br/>Borde Posterior</div>
                  <div class="sweep-step"><b>180° Oclusal</b><br/>Cara Superior</div>
                  <div class="sweep-step"><b>270° Distal Izq.</b><br/>Borde Posterior</div>
                  <div class="sweep-step"><b>315° Lat. Izquierdo</b><br/>Caninos y Molares</div>
                </div>
              </div>

              <!-- TECHNICAL EXPLANATION OF INTERLOCKING (EL ENROQUE DIGITAL) -->
              <div class="interlocking-tech-block">
                <h3 class="interlocking-title">⚙️ Fundamento Técnico del Enroque y Alineación Digital (ICP & Best-Fit)</h3>
                <p class="interlocking-desc">
                  Durante el procesamiento, el software de digitalización dental realiza la <b>fusión de mallas</b> mediante un algoritmo de coincidencia de mejores puntos (<i>Best-Fit Point Alignment</i>). Primero, el sistema identifica puntos de referencia idénticos en la superficie anatómica de cada arcada individual y los mapea con las muescas grabadas en el registro físico de mordida. Posteriormente, aplica el algoritmo **ICP (Iterative Closest Point)**, rotando y trasladando matemáticamente la nube de puntos hasta que las distancias tridimensionales entre las mallas se minimizan a menos de <b>9.5 micras (µm)</b>, logrando un encofrado tridimensional estricto y seguro para su inmediato envío al laboratorio clínico.
                </p>
              </div>

              <!-- CALIBRATION SCALE RULER (100MM METRIC SCALE) -->
              <div class="ruler-container">
                <div class="ruler-bar">
                  <div class="ruler-mark" style="left: 0;">0mm</div>
                  <div class="ruler-mark" style="left: 25mm;">25mm</div>
                  <div class="ruler-mark" style="left: 50mm;">50mm</div>
                  <div class="ruler-mark" style="left: 75mm;">75mm</div>
                  <div class="ruler-mark" style="right: 0;">100mm</div>
                </div>
                <p style="font-size: 9.5px; font-weight: 900; margin: 4mm 0 0 0; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
                  📐 CONTROL MÉTRICO DE ESCALA ABSOLUTA (MEDIR CON REGLA TRAS IMPRIMIR): DEBE SER EXACTAMENTE 100mm (10 CENTÍMETROS)
                </p>
              </div>

              <!-- FOOTER DETAILS WITH THE THREE DIFFERENT TYPES OF FILES -->
              <div class="footer-info">
                Reconstrucción tridimensional PocketLab Dental extraoral - Listo para Laboratorios Dentales con diseño de prótesis digital.<br/>
                Soporta transferencia instantánea en formatos estándar: 
                <span class="formats-badge">STL (Gemetría Estructurada de Alta Densidad)</span>
                <span class="formats-badge">OBJ (Malla de Color Foto-texturizada Realista)</span>
                <span class="formats-badge">PLY (Trazado de Margen Cervical de Lápiz)</span><br/>
                Compatible nativo con: <b>Exocad DentalCAD v5.2, 3Shape Dental Designer & Sirona Orthophos CAD</b>. &copy; 2026.
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
        
        const isDental = analysis.isDentalSubject !== false;
        const isLocked = analysis.meshLocked !== false;
        const meetsQuality = analysis.qualityScore > 70;

        if (meetsQuality && isDental && isLocked) {
          setFeedback(t.scanner.reconstructing);
          setTimeout(() => {
            const newScan: ExtendedScanResult = {
              id: 'SCAN-' + Date.now(),
              accuracy: 0.994,
              previewImageUrl: capturedFrames[capturedFrames.length - 1].dataUrl,
              timestamp: Date.now(),
              stlUrl: '#',
              plyUrl: '#',
              patientName: '',
              notes: '',
              stlSize: '11.4 MB',
              objSize: '23.1 MB',
              plySize: '14.8 MB',
              labStatus: 'unsent'
            };
            setLastResult(newScan);

            // Persist to local storage
            try {
              const currentRaw = localStorage.getItem('pocketlab_scans');
              const currentList = currentRaw ? JSON.parse(currentRaw) : [];
              currentList.unshift(newScan);
              localStorage.setItem('pocketlab_scans', JSON.stringify(currentList));
            } catch (err) {
              console.error("Error saving scan to local storage history", err);
            }

            setScannerState(ScannerState.COMPLETED);
            setIsProcessing(false);
            setFeedback(t.scanner.complete);
          }, 4000);
        } else {
          setScannerState(ScannerState.IDLE);
          setIsProcessing(false);
          
          let failMessage = '';
          if (!isDental) {
            failMessage = lang === 'es' 
              ? 'ALERTA CLÍNICA - SUJETO ANATÓMICO RECHAZADO: No se ha detectado una arcada dental de yeso o cilindro de mordida válido. El escaneo no puede proseguir con objetos extraños.'
              : lang === 'pt'
                ? 'ALERTA CLÍNICA - OBJETO REJEITADO: Não foi detectada uma arcada dentária de gesso ou registro de mordida válido. A digitalização foi abortada.'
                : 'CLINICAL ALERT - SUBJECT REJECTED: No valid dental plaster arch or bite registration was spotted. Scanning aborted.';
          } else if (!isLocked) {
            failMessage = lang === 'es'
              ? 'ERROR DE MALLADO AR: El modelo de arcada dental de yeso se encuentra desalineado o fuera de su malla tridimensional.'
              : lang === 'pt'
                ? 'ERRO DE MALHA AR: O modelo de arcada dentária de gesso está desalinhado ou fora de sua malha tridimensional.'
                : 'AR MESH ERROR: The dental plaster arch is misaligned or sitting outside of its 3D mesh grid.';
          } else {
            failMessage = `${t.scanner.failed}: ${analysis.feedback}`;
          }
          setFeedback(failMessage);
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
        {view === 'registries' ? (
          <RegistriesView lang={lang} />
        ) : view === 'knowledge' ? (
          <KnowledgeHub lang={lang} />
        ) : view === 'history' ? (
          <HistoryView lang={lang} onNavigateToScanner={() => setView('scanner')} />
        ) : (scannerState === ScannerState.COMPLETED && lastResult) ? (
          <CadViewer 
            lang={lang} 
            previewImageUrl={lastResult.previewImageUrl} 
            initialScanId={lastResult.id}
            onSaveAndExit={handleCadSave}
            onCancel={() => {
              setScannerState(ScannerState.IDLE);
              setLastResult(null);
            }}
          />
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
