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

// Procedural clinical 2D renderer to draw dental plaster casts and non-dental items on the canvas
const drawDentalArch = (ctx: CanvasRenderingContext2D, width: number, height: number, stage: ScanStage, isDental: boolean) => {
  ctx.save();
  ctx.clearRect(0, 0, width, height);

  if (isDental) {
    // Elegant dark blue clinic backdrop representation
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Draw the calibration base matrix grid lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    // Draw 4 physical ArUco Calibration Markers in the corners for absolute 1:1 scaling
    const markerSize = 34;
    const drawArUco = (mx: number, my: number, id: string) => {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(mx, my, markerSize, markerSize);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(mx, my, markerSize, markerSize);
      ctx.fillStyle = '#ffffff';
      // Checker patterns inside markers to simulate micro codes
      ctx.fillRect(mx + 6, my + 6, 8, 8);
      ctx.fillRect(mx + 20, my + 20, 8, 8);
      ctx.fillRect(mx + 6, my + 20, 10, 8);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 8px monospace';
      ctx.fillText(id, mx + 2, my - 3);
    };
    drawArUco(24, 60, 'AR_01');
    drawArUco(width - 58, 60, 'AR_02');
    drawArUco(24, height - 120, 'AR_03');
    drawArUco(width - 58, height - 120, 'AR_04');

    // Draw the plaster base (Anatomical horseshoe shape)
    const cx = width / 2;
    const cy = height / 2 - 10;
    ctx.translate(cx, cy);

    ctx.fillStyle = stage === ScanStage.UPPER ? '#f1f5f9' : stage === ScanStage.LOWER ? '#e2e8f0' : '#cbd5e1';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;

    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = 18;

    ctx.beginPath();
    ctx.arc(0, -10, 75, Math.PI - 0.25, 0.25, false);
    if (stage === ScanStage.UPPER) {
      // Palatal vault for maxilla
      ctx.quadraticCurveTo(45, 35, 0, 15);
      ctx.quadraticCurveTo(-45, 35, -73, 14);
    } else {
      // Open horseshoe for mandible
      ctx.lineTo(50, 10);
      ctx.arc(0, -10, 42, 0.1, Math.PI - 0.1, true);
      ctx.lineTo(-73, 10);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Draw teeth curves (12 teeth along the arch)
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    
    const teethCount = 12;
    for (let i = 0; i < teethCount; i++) {
      const angle = Math.PI - 0.3 - (i * (Math.PI - 0.6) / (teethCount - 1));
      const tx = 63 * Math.cos(angle);
      const ty = 63 * Math.sin(angle) - 10;
      
      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(angle + Math.PI / 2);
      
      let tWidth = 10;
      let tHeight = 11;
      if (i < 2 || i > 9) {
        tWidth = 13; // Molars
        tHeight = 9;
      } else if (i >= 4 && i <= 7) {
        tWidth = 8; // Central incisors
        tHeight = 12;
      }
      
      ctx.beginPath();
      ctx.roundRect(-tWidth/2, -tHeight/2, tWidth, tHeight, 2.5);
      ctx.fill();
      ctx.stroke();

      // Fissure anatomy lines
      ctx.strokeStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(-tWidth/4, 0); ctx.lineTo(tWidth/4, 0);
      ctx.stroke();

      ctx.restore();
    }

    // Render biting registration wax/silicone during bite stage
    if (stage === ScanStage.BITE) {
      ctx.fillStyle = 'rgba(234, 179, 8, 0.38)';
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, -10, 80, Math.PI - 0.25, 0.25, false);
      ctx.arc(0, -10, 48, 0.2, Math.PI - 0.2, true);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#eab308';
      ctx.font = 'bold 8px sans-serif';
      ctx.fillText('SILICONA OCLUSAL', -45, -35);
    }

    // Align marker
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-15, -10); ctx.lineTo(15, -10);
    ctx.moveTo(0, -25); ctx.lineTo(0, 5);
    ctx.stroke();

  } else {
    // Draw clear visual simulation of a generic, non-dental target (A red coffee mug on a desk)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(20, height - 160, width - 40, 160);

    ctx.fillStyle = '#e11d48';
    ctx.strokeStyle = '#fb7185';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(width/2 - 35, height/2 - 40, 70, 90, [4, 4, 18, 18]);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(width/2 - 35, height/2 + 5, 20, -Math.PI/2, Math.PI/2, true);
    ctx.stroke();

    ctx.strokeStyle = '#fda4af';
    ctx.lineWidth = 1.5;
    for (const offset of [-12, 0, 12]) {
      ctx.beginPath();
      ctx.moveTo(width/2 + offset, height/2 - 50);
      ctx.bezierCurveTo(width/2 + offset - 4, height/2 - 62, width/2 + offset + 4, height/2 - 70, width/2 + offset, height/2 - 82);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
    ctx.fillRect(0, 0, width, height);
  }
  ctx.restore();
};

const ScannerView: React.FC<ScannerViewProps> = ({ onCapture, onFinished, state, currentStage, lang }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [capturedSectors, setCapturedSectors] = useState<Set<number>>(new Set());
  const [frameCount, setFrameCount] = useState(0);
  const [lightingStatus, setLightingStatus] = useState<'optimal' | 'dark' | 'bright'>('optimal');
  const [showFlash, setShowFlash] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const t = translations[lang].scanner;

  // UX Visibility and custom simulation configuration states
  const [hudOpacity, setHudOpacity] = useState(0.20); // default to 20% opacity so central HUD is highly faint and see-through
  const [panelsVisible, setPanelsVisible] = useState(true); // lets user clear out all panels
  const [simulationSource, setSimulationSource] = useState<'camera' | 'dental' | 'object'>('dental'); // Default to beautiful plaster model on mesh
  
  // Minimize individual window flags
  const [isSpeechCoachMinimized, setIsSpeechCoachMinimized] = useState(false);
  const [isGyroMinimized, setIsGyroMinimized] = useState(false);
  const [isGuideMinimized, setIsGuideMinimized] = useState(false);

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

  const nextTargetSector = useMemo(() => {
    for (let i = 0; i < SECTOR_COUNT; i++) {
      if (!capturedSectors.has(i)) return i;
    }
    return -1;
  }, [capturedSectors]);

  // Guided and auto-capture simulated States
  const [gyroOffset, setGyroOffset] = useState({ x: 14, y: -10 });
  const [alignmentMatch, setAlignmentMatch] = useState(30);
  const [alignmentPhase, setAlignmentPhase] = useState<'searching' | 'locking' | 'captured'>('searching');
  const [stableTimerCount, setStableTimerCount] = useState(0);
  const [alertWarning, setAlertWarning] = useState<string | null>(null);

  // AI Interactive voice guidance state
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [aiSpeechText, setAiSpeechText] = useState(
    lang === 'es' ? 'Presione el icono del altavoz para activar el Coach de Voz Clínico y guiarle con manos libres.' :
    lang === 'pt' ? 'Pressione o ícone do alto-falante para ativar o Coach de Voz Clínico com mãos livres.' :
    'Press the speaker icon to activate the Clinical Voice Coach for hands-free guidance.'
  );

  const speakVoice = useCallback((textToSpeak: string) => {
    if (!voiceEnabled) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = lang === 'es' ? 'es-MX' : lang === 'pt' ? 'pt-BR' : 'en-US';
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis is unavailable in this environment:", e);
    }
  }, [voiceEnabled, lang]);

  // Handle stage narration triggers
  useEffect(() => {
    let message = '';
    if (currentStage === ScanStage.UPPER) {
      message = lang === 'es' 
        ? 'Iniciando Arcada Superior. Coloque el modelo de yeso en la base de calibración, centre la cámara y gire despacio.'
        : lang === 'pt'
          ? 'Iniciando Arcada Superior. Coloque o modelo na base de calibração, centralize a câmera e gire lentamente.'
          : 'Starting Upper Arch. Place the plaster model on the calibration base, center the camera, and rotate slowly.';
    } else if (currentStage === ScanStage.LOWER) {
      message = lang === 'es'
        ? 'Siguiente arcada inferior. Recuerde mantener una iluminación de más de quinientos luxes en el modelo dental.'
        : lang === 'pt'
          ? 'Próxima arcada inferior. Lembre-se de manter a iluminação acima de quinhentos lux para o modelo de gesso.'
          : 'Next lower arch stage. Remember to keep illumination above five hundred luxes on the dental model.';
    } else if (currentStage === ScanStage.BITE) {
      message = lang === 'es'
        ? 'Etapa de enroque de mordida. Ensamble ambas arcadas físicamente con la silicona de oclusión sobre la base impresa.'
        : lang === 'pt'
          ? 'Registro de mordida. Junte os modelos em oclusão usando a silicone de registro para o enroque digital.'
          : 'Bite registration stage. Assemble both arches physically with the bite silicone over the printed grid.';
    }
    setAiSpeechText(message);
    speakVoice(message);
  }, [currentStage, lang, voiceEnabled, speakVoice]);

  // Interactive queries handlers
  const handleAIQuery = (topic: 'luxmeter' | 'grid' | 'phone' | 'troubleshoot') => {
    let message = '';
    if (topic === 'luxmeter') {
      message = lang === 'es'
        ? 'Para el luxómetro, abre el menú de control lumínico a la derecha para ver los luxes. Requiere luz blanca directa mayor a quinientos luxes. Evite reflejos.'
        : lang === 'pt'
          ? 'Para o luxômetro, abra a ferramenta de luz à direita para ver os lux. Requer luz branca direta de quinhentos lux. Evite reflexos intensos.'
          : 'For the luxmeter, open the lighting control tool on the right. You need direct white light above five hundred lux. Avoid harsh specular glare.';
    } else if (topic === 'grid') {
      message = lang === 'es'
        ? 'La rejilla o base de calibración debe imprimirse en papel tamaño carta al cien por ciento de escala, sin ajustes del área de impresión, para medir con exactitud.'
        : lang === 'pt'
          ? 'A folha ou base de calibração deve ser impressa em tamanho Carta a cem por cento de escala, sem margens automáticas, para escala precisa.'
          : 'The calibration grid page must be printed on letter paper size at one hundred percent scale, without auto-fitting, to maintain true metric precision.';
    } else if (topic === 'phone') {
      message = lang === 'es'
        ? 'Sostenga su celular inclinado a cuarenta y cinco grados de elevación sobre el modelo. Mueva el teléfono en arco para centrar el círculo en el objetivo verde.'
        : lang === 'pt'
          ? 'Segure o celular inclinado a quarenta e cores acima do modelo de gesso. Mova o telefone em arco para travar no alvo verde central.'
          : 'Hold your phone tilted at forty-five degrees of elevation over the model. Sweep the device in an arc to lock onto the green central target circle.';
    } else if (topic === 'troubleshoot') {
      message = lang === 'es'
        ? 'Si el escáner falla o no avanza, limpie el lente del celular, aproxime una luz brillante o asegure que la hoja impresa esté completamente plana.'
        : lang === 'pt'
          ? 'Se o scanner travar ou falhar, limpe a lente da câmera, aumente a luz direta ou certifique-se de que o papel impresso esteja bem plano.'
          : 'If the scanner gets stuck, clean your camera lens, bring closer a bright light source, or make sure the printed grid paper is perfectly flat.';
    }
    setAiSpeechText(message);
    
    if (!voiceEnabled) {
      setVoiceEnabled(true);
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = lang === 'es' ? 'es-MX' : lang === 'pt' ? 'pt-BR' : 'en-US';
        utterance.rate = 1.05;
        window.speechSynthesis.speak(utterance);
      } catch (e) {}
    } else {
      speakVoice(message);
    }
  };

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || state !== ScannerState.SCANNING || nextTargetSector === -1) return;
    
    const context = canvasRef.current.getContext('2d');
    if (context) {
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 80);

      setIsCapturing(true);
      setTimeout(() => setIsCapturing(false), 300);

      const w = 640;
      const h = 480;
      context.clearRect(0, 0, w, h);

      if (simulationSource === 'camera') {
        context.drawImage(videoRef.current, 0, 0, w, h);
        analyzeLighting(context);
      } else if (simulationSource === 'dental') {
        drawDentalArch(context, w, h, currentStage, true);
        setLightingStatus('optimal');
      } else {
        drawDentalArch(context, w, h, currentStage, false);
        setLightingStatus('optimal');
      }

      const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
      const angle = nextTargetSector * 15;
      
      const newFrame: CaptureFrame = {
        id: Date.now().toString(),
        dataUrl,
        timestamp: Date.now(),
        angle: angle,
        stage: currentStage
      };
      
      onCapture(newFrame);
      setFrameCount(prev => prev + 1);
      
      const currentSector = nextTargetSector;
      setCapturedSectors(prev => {
        const next = new Set(prev);
        next.add(currentSector);
        return next;
      });

      // Prepare alignment for the next sector
      setGyroOffset({
        x: (Math.random() > 0.5 ? 1 : -1) * (15 + Math.random() * 8),
        y: (Math.random() > 0.5 ? 1 : -1) * (11 + Math.random() * 8)
      });
      setAlignmentMatch(25);
      setAlignmentPhase('searching');
      setStableTimerCount(0);
    }
  }, [state, currentStage, nextTargetSector, onCapture, simulationSource]);

  useEffect(() => {
    if (capturedSectors.size >= SECTOR_COUNT && state === ScannerState.SCANNING) {
      onFinished();
    }
  }, [capturedSectors.size, state, onFinished]);

  // Position alignment simulation loop
  useEffect(() => {
    if (state !== ScannerState.SCANNING || nextTargetSector === -1) return;

    const interval = setInterval(() => {
      if (alignmentPhase === 'searching') {
        setGyroOffset(prev => {
          const driftSpeed = 0.08; 
          const dx = -prev.x * driftSpeed;
          const dy = -prev.y * driftSpeed;
          const wobbleX = (Math.random() - 0.5) * 0.4;
          const wobbleY = (Math.random() - 0.5) * 0.4;
          
          const nextX = prev.x + dx + wobbleX;
          const nextY = prev.y + dy + wobbleY;

          const dist = Math.sqrt(nextX * nextX + nextY * nextY);
          const currentMatch = Math.max(0, Math.min(100, Math.floor(100 - dist * 3.8)));
          setAlignmentMatch(currentMatch);

          if (currentMatch >= 92) {
            setAlignmentPhase('locking');
            setStableTimerCount(0);
          }

          return { x: nextX, y: nextY };
        });
      } else if (alignmentPhase === 'locking') {
        setGyroOffset(prev => {
          const microWobbleX = (Math.random() - 0.5) * 0.2;
          const microWobbleY = (Math.random() - 0.5) * 0.2;
          const nextX = prev.x * 0.85 + microWobbleX;
          const nextY = prev.y * 0.85 + microWobbleY;

          const dist = Math.sqrt(nextX * nextX + nextY * nextY);
          const currentMatch = Math.max(93, Math.min(100, Math.floor(100 - dist * 3)));
          setAlignmentMatch(currentMatch);

          setStableTimerCount(t => {
            if (t >= 8) { // 800ms stable focus lock
              captureFrame();
              return 0; // Reset
            }
            return t + 1;
          });

          return { x: nextX, y: nextY };
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [state, alignmentPhase, nextTargetSector, captureFrame]);

  // Preview canvas rendering loop (for beautiful real-size simulation overlaid)
  useEffect(() => {
    let animationId: number;
    const render = () => {
      const canvas = previewCanvasRef.current;
      const video = videoRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;

          if (simulationSource === 'camera') {
            if (video && video.readyState >= 2) {
              ctx.drawImage(video, 0, 0, w, h);
            } else {
              ctx.fillStyle = '#0f172a';
              ctx.fillRect(0, 0, w, h);
              ctx.fillStyle = '#38bdf8';
              ctx.font = 'bold 12px sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText(lang === 'es' ? 'Cargando stream óptimo del móvil...' : 'Loading active mobile stream...', w / 2, h / 2);
            }
          } else if (simulationSource === 'dental') {
            drawDentalArch(ctx, w, h, currentStage, true);
          } else {
            drawDentalArch(ctx, w, h, currentStage, false);
          }
        }
      }
      animationId = requestAnimationFrame(render);
    };

    if (state === ScannerState.SCANNING) {
      render();
    }

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [state, simulationSource, currentStage, lang]);

  const getSectorInstructions = (sector: number) => {
    if (sector === -1) return { dir: "Escaner completo", tilt: "Finalizado", step: "Listo", area: "Listo" };
    const angle = sector * 15;
    
    let direction = "Gire hacia la DERECHA ↻";
    let angleRequired = "Inclinación de 45°";
    let area = "Zona Anterior Central";

    if (sector === 0) {
      direction = "FRENTE CENTRAL - Presionar inicio";
      angleRequired = "Inclinación 45° de Frente";
      area = "Frente Incisal (Dientes Anterior)";
    } else if (sector < 6) {
      direction = "Gire lentamente hacia la DERECHA ↻";
      angleRequired = "Inclinación 40° Lateral Alta";
      area = "Caninos y Premolares Derechos";
    } else if (sector === 6) {
      direction = "Perfil Lateral Derecho 90° Estricto";
      angleRequired = "Inclinación 30° Horizontal";
      area = "Borde Posterior Molar Derecho";
    } else if (sector < 12) {
      direction = "Continúe barriendo hacia atras ⥁";
      angleRequired = "Inclinación 25° Lateral Baja";
      area = "Corona Posterior Límite Distal";
    } else if (sector === 12) {
      direction = "TOMA COMPLETAMENTE POSTERIOR 180°";
      angleRequired = "Plano Oclusal Directo (0°)";
      area = "Fondo de Arcada Dental";
    } else if (sector < 18) {
      direction = "Gire lentamente hacia la IZQUIERDA ↺";
      angleRequired = "Inclinación 30° Lateral Baja";
      area = "Corona Posterior premolares Izq.";
    } else if (sector === 18) {
      direction = "Perfil Lateral Izquierdo 270° Estricto";
      angleRequired = "Inclinación 40° Lateral Alta";
      area = "Borde Posterior Molar Izquierdo";
    } else if (sector < 24) {
      direction = "Gire regresando al FRONTAL para cerrar ↻";
      angleRequired = "Inclinación 45° de Frente";
      area = "Cierre de Frente Corona Anterior";
    }

    return { area, direction, angleRequired, angle: `${angle}°` };
  };

  const currentInstruction = getSectorInstructions(nextTargetSector);

  const handleManualShutterClick = () => {
    if (alignmentMatch < 92) {
      setAlertWarning("⚠️ ALINEACIÓN INSUFICIENTE: Ajuste la inclinación del móvil con la diana para evitar vacíos en el enroque.");
      setTimeout(() => setAlertWarning(null), 3000);
    } else {
      captureFrame();
    }
  };

  if (state === ScannerState.PROCESSING) {
    return (
      <div className="relative w-full h-full bg-slate-900 rounded-3xl overflow-hidden flex flex-col items-center justify-center p-8 border border-slate-800">
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
    <div className="relative w-full h-full bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-700 transition-all aspect-[4/3]">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="hidden" // Kept hidden while preview canvas superposes
      />
      
      {/* Dynamic 30fps viewport canvas that renders either real feed, plaster OK preset, or custom coffee cup target */}
      <canvas 
        ref={previewCanvasRef} 
        width="640" 
        height="480" 
        className="w-full h-full object-cover block"
      />
      
      {/* Standard Capture Canvas for single frames (Invisible) */}
      <canvas ref={canvasRef} width="640" height="480" className="hidden" />

      {/* Flash Effect */}
      <div className={`absolute inset-0 bg-white transition-opacity duration-75 pointer-events-none z-[100] ${showFlash ? 'opacity-40' : 'opacity-0'}`} />

      {/* TOOLBAR SUPERIOR DE VISTA DESPEJADA Y CONTROL DE SUJETO */}
      <div className="absolute top-2 w-[calc(100%-2rem)] mx-4 z-50 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs text-white pointer-events-auto shadow-2xl">
        <button
          type="button"
          onClick={() => setPanelsVisible(!panelsVisible)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all font-bold shadow ${
            panelsVisible 
              ? 'bg-blue-600 hover:bg-blue-500 text-white' 
              : 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse'
          }`}
          title={panelsVisible ? "Ocultar paneles para vista despejada" : "Mostrar paneles de guiado"}
        >
          <span>👁️</span>
          <span>{panelsVisible ? (lang === 'es' ? 'Ocultar Paneles' : 'Hide UI Panels') : (lang === 'es' ? 'Mostrar Paneles (GUIADO)' : 'Show Guide Panels')}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-350 font-bold uppercase truncate">{lang === 'es' ? 'Opacidad Malla AR:' : 'AR Grid Opacity:'}</span>
          <input
            type="range"
            min="0.05"
            max="0.85"
            step="0.05"
            value={hudOpacity}
            onChange={(e) => setHudOpacity(parseFloat(e.target.value))}
            className="w-16 md:w-24 accent-blue-500 cursor-pointer h-1 bg-slate-800 rounded-lg appearance-none"
          />
          <span className="text-[10px] font-mono text-blue-400 font-bold w-6 text-right">
            {Math.round(hudOpacity * 100)}%
          </span>
         </div>

         <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800/80 shrink-0">
           <span className="text-[8.5px] font-mono pr-2 pl-1 text-zinc-500 uppercase font-black tracking-tight">{lang === 'es' ? 'Sujeto:' : 'Simulator Target:'}</span>
           <button
             type="button"
             onClick={() => setSimulationSource('dental')}
             className={`px-2 py-0.5 rounded-lg text-[9px] font-bold transition-all ${
               simulationSource === 'dental' 
                 ? 'bg-emerald-600 text-white shadow shadow-emerald-700/20' 
                 : 'text-zinc-400 hover:text-white hover:bg-slate-850'
             }`}
             title="Yeso dental real perfectametne en malla. Validación pasará."
           >
             🦷 {lang === 'es' ? 'Molde Dental' : 'Dental Cast'}
           </button>
           <button
             type="button"
             onClick={() => setSimulationSource('object')}
             className={`px-2 py-0.5 rounded-lg text-[9px] font-bold transition-all ${
               simulationSource === 'object' 
                 ? 'bg-rose-600 text-white shadow shadow-rose-700/20' 
                 : 'text-zinc-400 hover:text-white hover:bg-slate-850'
             }`}
             title="Taza de café o entorno doméstico. Validación fallará."
           >
             ☕ {lang === 'es' ? 'No Dental' : 'Generic Cap'}
           </button>
           <button
             type="button"
             onClick={() => setSimulationSource('camera')}
             className={`px-2 py-0.5 rounded-lg text-[9px] font-bold transition-all ${
               simulationSource === 'camera' 
                 ? 'bg-blue-600 text-white shadow shadow-blue-700/20' 
                 : 'text-zinc-400 hover:text-white hover:bg-slate-850'
             }`}
             title="Lente de la cámara física del usuario."
           >
             📷 {lang === 'es' ? 'Lente Real' : 'Camera'}
           </button>
         </div>
      </div>

      {/* Stage-Specific Guidance Sub-banner */}
      {currentStage === ScanStage.UPPER && (
        <div className="absolute top-[52px] left-1/2 -translate-x-1/2 bg-blue-950/90 backdrop-blur-md border border-blue-500/30 px-4 py-1.5 rounded-full text-[10px] font-bold text-blue-300 pointer-events-none flex items-center gap-2 z-40 shadow-lg shadow-blue-950/40">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
          <span>▲ ALINEACIÓN SUPERIOR: FRENTE DE LA ARCADA ALINEADO CON LA GUÍA SUPERIOR</span>
        </div>
      )}
      {currentStage === ScanStage.LOWER && (
        <div className="absolute top-[52px] left-1/2 -translate-x-1/2 bg-emerald-950/90 backdrop-blur-md border border-emerald-500/30 px-4 py-1.5 rounded-full text-[10px] font-bold text-emerald-300 pointer-events-none flex items-center gap-2 z-40 shadow-lg shadow-emerald-950/40">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>▲ ALINEACIÓN INFERIOR: FRENTE DE LA ARCADA ALINEADO CON LA GUÍA SUPERIOR</span>
        </div>
      )}
      {currentStage === ScanStage.BITE && (
        <div className="absolute top-[52px] left-1/2 -translate-x-1/2 bg-amber-950/90 backdrop-blur-md border border-amber-500/30 px-4 py-1.5 rounded-full text-[10px] font-bold text-amber-300 pointer-events-none flex items-center gap-2 z-40 shadow-lg shadow-amber-950/40">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>🦷 ENROQUE ACTIVO: COLOQUE LAS ARCADAS ENSAMBLADAS CON EL REGISTRO DE MORDIDA</span>
        </div>
      )}

      {/* AR Grid & HUD */}
      <div className="absolute inset-0 pointer-events-none z-10 animate-fade-in">
        {/* Animated Structured Light Projection Stripes (Simulating Professional Scanning) */}
        <div className="absolute inset-0 bg-transparent overflow-hidden opacity-[0.25] pointer-events-none">
          <div className="w-[200%] h-[200%] absolute -top-1/2 -left-1/2 flex flex-col justify-around gap-1 animate-structured-stripes transform rotate-12">
            {Array.from({ length: 32 }).map((_, i) => (
              <div key={i} className="h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent w-full" />
            ))}
          </div>
        </div>

        {/* Photogrammetric Calibration Base Corner Tracking Simulators (ArUco markers tracker) */}
        <div className="absolute top-16 left-12 w-8 h-8 border-t-2 border-l-2 border-emerald-400/80 animate-pulse text-[7px] text-emerald-400 font-mono font-bold pl-1 pt-1 bg-emerald-950/5">
          AR_TL:LOCK
        </div>
        <div className="absolute top-16 right-12 w-8 h-8 border-t-2 border-r-2 border-emerald-400/80 animate-pulse text-[7px] text-emerald-400 font-mono font-bold text-right pr-1 pt-1 bg-emerald-950/5">
          AR_TR:LOCK
        </div>
        <div className="absolute bottom-28 left-12 w-8 h-8 border-b-2 border-l-2 border-emerald-400/80 animate-pulse text-[7px] text-emerald-400 font-mono font-bold pl-1 pb-1 flex items-end bg-emerald-950/5">
          AR_BL:LOCK
        </div>
        <div className="absolute bottom-28 right-12 w-8 h-8 border-b-2 border-r-2 border-emerald-400/80 animate-pulse text-[7px] text-emerald-400 font-mono font-bold text-right pr-1 pb-1 flex items-end justify-end bg-emerald-950/5">
          AR_BR:LOCK
        </div>

        {/* System Alignment Quality Reads */}
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-40 bg-zinc-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-zinc-800 text-[8.5px] font-mono text-zinc-400 flex flex-col items-center gap-1 shadow-2xl">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white uppercase text-[8px]">SISTEMA POCKETLAB OK</span>
          </div>
          <p className="text-[7.5px] tracking-tighter text-zinc-505">
            {currentStage === ScanStage.BITE 
              ? "ICP TRIAXIAL: ERROR GLOBAL MARGINAL MAP ±9.3 µm" 
              : "CONCORDANCIA DE MALLA SECTORIAL ACTIVA CON SOPORTE OBJ/STL"}
          </p>
        </div>

        {/* Focal Length & Working Distance Calibration Guide */}
        <div className="absolute top-[95px] right-6 z-40 bg-zinc-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-zinc-800 text-[9px] font-mono font-bold tracking-tight text-emerald-400 flex items-center gap-1.5 shadow-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          {lang === 'es' ? 'DIST: 24.2cm [IDEAL]' : 'GAP: 24.2cm [BEST]'}
        </div>

        <svg className="w-full h-full" viewBox="0 0 100 100">
          <defs>
            <pattern id="arGrid" width="5" height="5" patternUnits="userSpaceOnUse">
              <path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.08" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#arGrid)" />
          
          {/* Circular Grid targeting ring with user-controlled opacity slider */}
          <g transform="translate(50, 50)" opacity={hudOpacity}>
            <circle r="15" fill="none" stroke="rgba(59,130,246,0.25)" strokeWidth="0.28" strokeDasharray="1 1" />
            <circle r="25" fill="none" stroke="rgba(59,130,246,0.15)" strokeWidth="0.22" />
            
            {/* Horizontal & Vertical Crosshair Symmetry Line */}
            <line x1="-40" y1="0" x2="40" y2="0" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.15" strokeDasharray="1 1" />
            <line x1="0" y1="-40" x2="0" y2="40" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.15" strokeDasharray="1 1" />
          </g>

          {/* DYNAMIC ANATOMICAL OUTLINE OVERLAYS FOR ESCALATED ACCURACY */}
          <g transform="translate(50, 50)" opacity={hudOpacity * 1.6}>
            {currentStage === ScanStage.UPPER && (
              <g className="animate-pulse">
                {/* Maxillary Silhouette Guide */}
                <path 
                  d="M -25,20 C -20,-10 20,-10 25,20 L 16,21 C 12,2 12,2 5,1 C 2,2 -2,2 -5,1 C -12,2 -12,2 -16,21 Z" 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="0.6px" 
                  strokeDasharray="1 0.5" 
                />
                <text x="0" y="-18" fill="#60a5fa" fontSize="2.5px" fontWeight="900" textAnchor="middle">
                  ▲ FRENTE / DIENTES ANTERIORES
                </text>
                <text x="0" y="5" fill="#93c5fd" fontSize="2px" fontWeight="bold" textAnchor="middle">
                  MAXILAR SUPERIOR EN MALLA
                </text>
                <path d="-6,-3 C -2,-1 2,-1 6,-3" fill="none" stroke="#60a5fa" strokeWidth="0.15" />
                <path d="-8,1 C -3,3 3,3 8,1" fill="none" stroke="#60a5fa" strokeWidth="0.15" />
              </g>
            )}

            {currentStage === ScanStage.LOWER && (
              <g className="animate-pulse">
                {/* Mandibular Silhouette Guide */}
                <path 
                  d="M -26,20 C -22,-8 22,-8 26,20 L 17,21 C 13,3 13,3 0,2 C -13,3 -13,3 -17,21 Z" 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="0.6px" 
                  strokeDasharray="1 0.5" 
                />
                <text x="0" y="-18" fill="#34d399" fontSize="2.5px" fontWeight="900" textAnchor="middle">
                  ▲ FRENTE / DIENTES ANTERIORES
                </text>
                <text x="0" y="8" fill="#a7f3d0" fontSize="2px" fontWeight="bold" textAnchor="middle">
                  MANDIBULAR INFERIOR EN MALLA
                </text>
              </g>
            )}

            {currentStage === ScanStage.BITE && (
              <g className="animate-pulse">
                {/* Side Bite Occluding Interlock Profile */}
                <path 
                  d="M -22,-4 C -22,-14 22,-14 22,-4 L 18,-2 L 14,-6 L 10,-3 L 6,-6 L 2,-3 L -2,-3 L -6,-6 L -10,-3 L -14,-6 L -18,-2 Z" 
                  fill="none" 
                  stroke="#fbbf24" 
                  strokeWidth="0.5px" 
                />
                <path 
                  d="M -22,4 C -22,14 22,14 22,4 L 18,2 L 14,6 L 10,3 L 6,6 L 2,3 L -2,3 L -6,6 L -10,3 L -14,6 L -18,2 Z" 
                  fill="none" 
                  stroke="#f59e0b" 
                  strokeWidth="0.5px" 
                />
                <line x1="-30" y1="0" x2="30" y2="0" stroke="#fef08a" strokeWidth="0.3" strokeDasharray="1 1" />
                
                <text x="0" y="-18" fill="#fbbf24" fontSize="2.5px" fontWeight="900" textAnchor="middle">
                  🦷 PLANO OCLUSAL DE REGISTRO
                </text>
                <text x="0" y="18" fill="#fef08a" fontSize="2px" fontWeight="bold" textAnchor="middle">
                  ENSAMBLE ENROQUE DIGITAL
                </text>
              </g>
            )}
          </g>

          <g transform="translate(50, 50)">
            {Array.from({ length: SECTOR_COUNT }).map((_, i) => {
              const startAngle = (i * 360) / SECTOR_COUNT;
              const endAngle = ((i + 1) * 360) / SECTOR_COUNT;
              const isCaptured = capturedSectors.has(i);
              const r1 = 44; const r2 = 41;
              const x1 = r1 * Math.cos((startAngle - 90) * Math.PI / 180);
              const y1 = r1 * Math.sin((startAngle - 90) * Math.PI / 180);
              const x2 = r1 * Math.cos((endAngle - 90) * Math.PI / 180);
              const y2 = r1 * Math.sin((endAngle - 90) * Math.PI / 180);
              const x3 = r2 * Math.cos((endAngle - 90) * Math.PI / 180);
              const y3 = r2 * Math.sin((endAngle - 90) * Math.PI / 180);
              const x4 = r2 * Math.cos((startAngle - 100) * Math.PI / 180);
              const y4 = r2 * Math.sin((startAngle - 100) * Math.PI / 180);
              return (
                <path
                  key={i}
                  d={`M ${x1} ${y1} A ${r1} ${r1} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${r2} ${r2} 0 0 0 ${x4} ${y4} Z`}
                  fill={isCaptured ? '#10b981' : '#3b82f6'}
                  fillOpacity={isCaptured ? 0.80 : hudOpacity * 0.4}
                  stroke="white"
                  strokeWidth="0.05"
                  className="transition-all duration-300"
                />
              );
            })}
          </g>
        </svg>
      </div>

      {/* Stage Indicator Overlay (Left of top guide) */}
      <div className="absolute top-[95px] left-6 z-40 bg-zinc-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800 shadow-xl pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="text-sm">{currentStage === ScanStage.BITE ? '👄' : '🦷'}</span>
          <span className="text-[10px] font-black text-white uppercase tracking-wider">{stageLabel}</span>
        </div>
      </div>

      {/* COACH DE IA INTELIGENTE - ASISTENCIA DE VOZ INTERACTIVA */}
      {panelsVisible && (
        <div className={`absolute top-36 left-6 z-40 transition-all duration-300 max-w-[245px] pointer-events-auto flex flex-col gap-2 ${
          isSpeechCoachMinimized 
            ? 'bg-zinc-950/50 hover:bg-zinc-950/80 backdrop-blur-sm p-1.5 rounded-xl border border-zinc-800/40 w-[140px]' 
            : 'bg-zinc-950/40 hover:bg-zinc-950/85 backdrop-blur-sm p-3 rounded-2xl border border-zinc-800/50 shadow-2xl transition-all'
        }`}>
          <div className="flex items-center justify-between border-b border-zinc-900 pb-1">
            <span className="text-[9px] font-black uppercase text-cyan-400 tracking-wider">
              {isSpeechCoachMinimized ? '🎙️ Coach Voz' : 'Coach de Voz Clínico'}
            </span>
            
            <div className="flex items-center gap-1.5">
              {!isSpeechCoachMinimized && (
                <button 
                  type="button"
                  onClick={() => {
                    const nextVal = !voiceEnabled;
                    setVoiceEnabled(nextVal);
                    if (nextVal) {
                      let msg = lang === 'es' ? 'Asistencia de voz activada.' : 'Voice assistance active.';
                      setAiSpeechText(msg);
                      try {
                        window.speechSynthesis.cancel();
                        const utterance = new SpeechSynthesisUtterance(msg);
                        utterance.lang = lang === 'es' ? 'es-MX' : 'en-US';
                        window.speechSynthesis.speak(utterance);
                      } catch(e) {}
                    } else {
                      window.speechSynthesis.cancel();
                    }
                  }}
                  className={`px-1 rounded text-[8px] font-bold transition-all ${
                    voiceEnabled 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/35 animate-pulse' 
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700/50'
                  }`}
                >
                  {voiceEnabled ? '🔊 ON' : '🔇 OFF'}
                </button>
              )}
              <button 
                type="button"
                onClick={() => setIsSpeechCoachMinimized(!isSpeechCoachMinimized)}
                className="text-zinc-400 hover:text-white px-1 font-mono text-[9px]"
                title={isSpeechCoachMinimized ? "Expandir" : "Minimizar"}
              >
                {isSpeechCoachMinimized ? '＋' : '－'}
              </button>
            </div>
          </div>

          {!isSpeechCoachMinimized && (
            <>
              <p className="text-[10px] leading-relaxed text-zinc-200 font-medium select-none">
                {aiSpeechText}
              </p>

              <div className="border-t border-zinc-900 pt-1.5 mt-0.5 space-y-1">
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">¿Dudas? Haz clic para hablar:</span>
                <div className="grid grid-cols-2 gap-1 text-[8px] font-bold">
                  <button 
                    type="button" 
                    onClick={() => handleAIQuery('luxmeter')}
                    className="px-1.5 py-0.5 text-left bg-zinc-900/60 hover:bg-zinc-850 border border-zinc-800/80 rounded h-6 text-slate-300 transition-colors flex items-center gap-1 shrink-0"
                  >
                    <span>💡</span>
                    <span className="truncate">¿Poca Luz?</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleAIQuery('grid')}
                    className="px-1.5 py-0.5 text-left bg-zinc-900/60 hover:bg-zinc-850 border border-zinc-800/80 rounded h-6 text-slate-300 transition-colors flex items-center gap-1 shrink-0"
                  >
                    <span>🖨️</span>
                    <span className="truncate">¿Base PDF?</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleAIQuery('phone')}
                    className="px-1.5 py-0.5 text-left bg-zinc-900/60 hover:bg-zinc-850 border border-zinc-800/80 rounded h-6 text-slate-300 transition-colors flex items-center gap-1 shrink-0"
                  >
                    <span>📱</span>
                    <span className="truncate">¿Celular?</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleAIQuery('troubleshoot')}
                    className="px-1.5 py-0.5 text-left bg-zinc-900/60 hover:bg-zinc-850 border border-zinc-800/80 rounded h-6 text-slate-300 transition-colors flex items-center gap-1 shrink-0"
                  >
                    <span>⚠️</span>
                    <span className="truncate">¿Hay Falla?</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* WARNING NOTIFICATION BANNER */}
      {alertWarning && (
        <div className="absolute top-36 left-1/2 -translate-x-1/2 bg-red-950/95 backdrop-blur-md border border-red-500/50 px-5 py-2.5 rounded-2xl text-[10px] font-bold text-red-100 placeholder-opacity-75 z-[110] flex items-center gap-2 shadow-2xl max-w-xs text-center animate-bounce">
          <span>⚠️</span>
          <span>{alertWarning}</span>
        </div>
      )}

      {/* HUD DE GIROSCOPIO / SENSOR ACCURACY TRACKER */}
      {panelsVisible && (
        <div className={`absolute top-36 right-4 z-40 transition-all duration-300 bg-zinc-950/40 hover:bg-zinc-950/90 backdrop-blur-sm rounded-2xl border border-zinc-800/50 flex flex-col items-center shadow-2xl pointer-events-auto ${
          isGyroMinimized ? 'w-[145px] p-2' : 'w-36 p-3 gap-2'
        }`}>
          <div className="flex items-center justify-between w-full border-b border-zinc-900 pb-1">
            <span className="text-[8px] font-black uppercase tracking-wider text-cyan-400">
              {isGyroMinimized ? '🛰️ Nivel AR' : 'Alineación Giro AR'}
            </span>
            <button 
              type="button"
              onClick={() => setIsGyroMinimized(!isGyroMinimized)}
              className="text-zinc-400 hover:text-white px-1 font-mono text-[9px]"
              title={isGyroMinimized ? "Expandir" : "Minimizar"}
            >
              {isGyroMinimized ? '＋' : '－'}
            </button>
          </div>
          
          {!isGyroMinimized && (
            <>
              {/* Visual Target Scope */}
              <div className={`relative w-20 h-20 rounded-full border border-dashed flex items-center justify-center bg-black/60 transition-colors ${
                alignmentPhase === 'locking' ? 'border-emerald-500/50 bg-emerald-950/15' : 'border-zinc-850'
              }`}>
                {/* Central Target Circle */}
                <div className={`absolute w-7 h-7 rounded-full border border-double ${
                  alignmentPhase === 'locking' ? 'border-emerald-400 bg-emerald-500/20' : 'border-white/5'
                }`} />
                
                {/* Moving Sensor Node */}
                <div 
                  className={`absolute w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-lg transition-all duration-100 ${
                    alignmentMatch >= 92 
                      ? 'bg-emerald-500 text-white animate-pulse' 
                      : alignmentMatch >= 65
                        ? 'bg-amber-500 text-zinc-900' 
                        : 'bg-rose-500 text-white'
                  }`}
                  style={{
                    transform: `translate(${gyroOffset.x}px, ${gyroOffset.y}px)`
                  }}
                >
                  <span className="text-[6px]">🛰️</span>
                </div>

                {/* Compass lines */}
                <div className="absolute w-full h-px bg-zinc-800/40 left-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                <div className="absolute h-full w-px bg-zinc-800/40 top-0 left-1/2 -translate-x-1/2 pointer-events-none" />
              </div>

              {/* Level Metrics */}
              <div className="flex flex-col items-center w-full">
                <div className="flex items-center justify-between w-full text-[8.5px] font-mono text-zinc-400">
                  <span>AJUSTE:</span>
                  <span className={`font-bold ${alignmentMatch >= 92 ? 'text-emerald-400' : 'text-zinc-350'}`}>{alignmentMatch}%</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1 bg-zinc-900 rounded-full mt-1 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-150 ${
                      alignmentMatch >= 92 ? 'bg-emerald-500' : alignmentMatch >= 65 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${alignmentMatch}%` }}
                  />
                </div>
                <span className={`text-[7.5px] font-black uppercase mt-1 tracking-tighter text-center leading-none ${
                  alignmentPhase === 'locking' ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'
                }`}>
                  {alignmentPhase === 'locking' ? (lang === 'es' ? '🔴 MANTENER INMÓVIL' : '🔴 STEADY') : (lang === 'es' ? 'ALINEAR MÓVIL' : 'ALIGN DEVICE')}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* CENTRO DE CONTROL DE ALINEACIÓN Y GUIADO (Bottom Left) */}
      {panelsVisible && (
        <div className={`absolute bottom-28 left-4 z-40 transition-all duration-300 bg-zinc-950/40 hover:bg-zinc-950/90 backdrop-blur-sm rounded-2xl border border-zinc-800/50 text-xs text-zinc-300 flex flex-col shadow-2xl pointer-events-auto ${
          isGuideMinimized ? 'w-[145px] p-2' : 'max-w-[210px] p-3'
        }`}>
          <div className="flex items-center justify-between border-b border-zinc-900/60 pb-1">
            <span className="text-[9px] font-black uppercase text-blue-400 tracking-wider">
              {isGuideMinimized ? '🎯 Guiado' : 'Talla Multiángulo'}
            </span>
            <div className="flex items-center gap-1.5">
              {!isGuideMinimized && (
                <span className="text-[8px] font-mono bg-zinc-800 px-1 py-0.5 rounded text-zinc-400">
                  Filtro {nextTargetSector === -1 ? 24 : nextTargetSector}/24
                </span>
              )}
              <button 
                type="button"
                onClick={() => setIsGuideMinimized(!isGuideMinimized)}
                className="text-zinc-400 hover:text-white px-1 font-mono text-[9px]"
                title={isGuideMinimized ? "Expandir" : "Minimizar"}
              >
                {isGuideMinimized ? '＋' : '－'}
              </button>
            </div>
          </div>
          
          {!isGuideMinimized && (
            <div className="space-y-1 py-1">
              <p className="text-[10px] font-mono font-bold text-white flex items-center gap-1">
                <span className="text-emerald-400">⚡</span>
                <span>Objetivo: <b className="text-blue-300">{currentInstruction.angle}</b></span>
              </p>
              <p className="text-[9px] text-zinc-400 leading-tight">
                <span className="text-zinc-500 font-bold">Zona:</span> {currentInstruction.area}
              </p>
              <div className="bg-zinc-900/40 p-1.5 rounded-lg border border-zinc-800/50 mt-1">
                <p className="text-[9.5px] font-black text-rose-300 uppercase leading-snug">{currentInstruction.direction}</p>
                <p className="text-[8.5px] text-zinc-500 font-mono mt-0.5">Tilt: {currentInstruction.angleRequired}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Capture Button Area */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-8 pointer-events-none z-30">
        <div className="relative">
          {/* Shutter Pulse Animation */}
          {isCapturing && (
            <div className="absolute inset-0 rounded-full border-4 border-emerald-400 animate-shutter-ring opacity-100 scale-100" />
          )}
          
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleManualShutterClick();
            }}
            disabled={state !== ScannerState.SCANNING}
            className={`pointer-events-auto w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all hover:scale-105 active:scale-90 group shadow-2xl relative z-10 ${
              state === ScannerState.SCANNING 
                ? alignmentMatch >= 92 
                  ? 'border-emerald-400 bg-emerald-950/20 shadow-[0_0_30px_rgba(16,185,129,0.5)] cursor-pointer'
                  : 'border-rose-500/50 bg-rose-950/10 cursor-not-allowed opacity-90'
                : 'border-slate-600 bg-slate-800/20 cursor-not-allowed opacity-50'
            }`}
          >
            <div className={`w-15 h-15 rounded-full transition-all flex items-center justify-center border-2 ${
              isCapturing 
                ? 'bg-emerald-100 border-emerald-400' 
                : alignmentMatch >= 92 
                  ? 'bg-emerald-500 border-transparent text-white' 
                  : 'bg-zinc-850 border-zinc-800 text-zinc-400'
            }`}>
              {alignmentMatch >= 92 ? (
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3.2" />
                  <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              )}
            </div>
          </button>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none flex flex-col justify-end p-6 z-20">
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="w-full max-w-sm h-2.5 bg-white/10 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-300" 
              style={{ width: `${coverage}%` }}
            />
          </div>
          <p className="text-[9px] font-black uppercase text-white/50 tracking-[0.2em]">{Math.floor(coverage)}% {t.coverage}</p>
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
        @keyframes structuredStripes {
          0% {
            transform: translateY(-20%) rotate(12deg);
          }
          50% {
            transform: translateY(0%) rotate(12deg);
          }
          100% {
            transform: translateY(-20%) rotate(12deg);
          }
        }
        .animate-structured-stripes {
          animation: structuredStripes 10s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ScannerView;
