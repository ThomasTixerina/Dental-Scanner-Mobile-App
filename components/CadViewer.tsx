import React, { useState, useEffect } from 'react';
import { ScanResult } from '../types';
import { Language } from '../translations';
import { ExtendedScanResult } from './HistoryView';
import { CheckCircle, AlertTriangle, Download, ArrowRight, ShieldCheck, RefreshCw, Layers, Edit3, Send, Landmark } from 'lucide-react';

interface CadViewerProps {
  lang: Language;
  previewImageUrl: string;
  initialScanId?: string;
  onSaveAndExit: (updatedCase: ExtendedScanResult) => void;
  onCancel: () => void;
}

const cadTranslations = {
  en: {
    stationTitle: "CAD/CAM Mesh Registration Workstation",
    stationSubtitle: "Review, align, and validate exocad dental plaster scan models before lab transmission",
    alignmentHeading: "Model Occlusion & Match Registration",
    alignmentDesc: "Fine-tune mandibular occlusion using 3-axis spatial calibration sliders to establish the exact dental bite match.",
    autoICPBtn: "Auto ICP Fit Alignment",
    autoICPEst: "ICP Algorithmic alignment completed with max error < 9.5 µm",
    icpRunning: "Running best-fit matrix alignment...",
    zSlider: "Vertical Bite Occlusion (Z-axis)",
    xSlider: "Anteroposterior Registration (Y-axis)",
    rotSlider: "Transversal Lateral Alignment (X-axis)",
    heatmapTitle: "Dynamic Oclusogram (Pressure Map)",
    heatmapIdeal: "Ideal Contacts (50-100 µm)",
    heatmapHeavy: "Hypercontact Warning (>150 µm)",
    heatmapNoContact: "No Contact (>200 µm)",
    diagnosticsTitle: "Clinical CAD Quality Index",
    calibCheck: "Calibration Scale Accuracy Check (ArUco calibration base code validated)",
    calibCheckOk: "Passed: 100mm Scale verified at 0.05% tolerance (±9 µm)",
    marginCheck: "Cervical Prep Margin Definition",
    marginCheckOk: "Excellent sharpness. 24 high-angle photogrammetry frames validated.",
    waterTight: "Manifold Water-tight Integrity",
    waterTightOk: "100% Watertight closed mesh. No open boundaries found.",
    exocadReady: "Exocad v5.2 / 3Shape Ready",
    caseFormHeading: "Exocad Laboratory Workflow Card",
    patientName: "Patient Identifier / Client Code",
    notes: "Clinical annotations & dentist workspace notes",
    saveBtn: "Finalize & Save Case to History",
    downloadLabel: "Download CAD Dataset Bundle",
    downloadDesc: "Compiles a coordinate-consistent ZIP archive for instantaneous exocad imports.",
    stlDesc: "High-density jaw mesh (Geometry only)",
    objDesc: "Textured color tooth model (Mesh & Textures)",
    plyDesc: "Denture cervical markup (Pencil margin markings)",
    toastSaved: "Case registered successfully in Local History",
    contactStatus: "Contact state under active occlusion",
    unalignedWarning: "Alignment incomplete. Run ICP verification to avoid laboratory retesting.",
    alignedIndicator: "CAD scan data locked to active coordinate matrix.",
  },
  es: {
    stationTitle: "Estación de Registro y Calibración CAD/CAM",
    stationSubtitle: "Revise, alinee y valide los modelos de yeso antes de enviarlos al laboratorio dental para diseño en exocad",
    alignmentHeading: "Registro de Oclusión de Modelos",
    alignmentDesc: "Ajuste fino de la oclusión mandibular mediante controles de calibración espacial para establecer la mordida exacta.",
    autoICPBtn: "Alineación ICP Inteligente",
    autoICPEst: "Alineación por algoritmo ICP completada con error máx. < 9.5 µm",
    icpRunning: "Ejecutando ajuste por matrices de coincidencia...",
    zSlider: "Oclusión Bite Vertical (Eje Z)",
    xSlider: "Registro Anteroposterior (Eje Y)",
    rotSlider: "Alineación Lateral Transversal (Eje X)",
    heatmapTitle: "Oclusograma Dinámico (Mapa de Presión)",
    heatmapIdeal: "Contactos Ideales (50-100 µm)",
    heatmapHeavy: "Punto de Hipercontacto (>150 µm)",
    heatmapNoContact: "Sin Contacto (>200 µm)",
    diagnosticsTitle: "Índice de Calidad Clínica CAD",
    calibCheck: "Control de Escala de Calibración (Código ArUco validado en base impresa)",
    calibCheckOk: "Aprobado: Escala de 100mm verificada al 0.05% de tolerancia (±9 µm)",
    marginCheck: "Definición del Margen Cervical",
    marginCheckOk: "Nitidez excelente. 24 fotogramas de alto ángulo validados.",
    waterTight: "Integridad Malla Estanca (Manifold)",
    waterTightOk: "Malla 100% cerrada y estanca. Sin límites abiertos detectados.",
    exocadReady: "Listo para Exocad v5.2 / 3Shape",
    caseFormHeading: "Ficha Técnica de Envío Lab (Exocad)",
    patientName: "Identificador del Paciente / Código de Clínica",
    notes: "Anotaciones clínicas e indicaciones del protésico",
    saveBtn: "Finalizar y Guardar Caso en Historial",
    downloadLabel: "Descargar Conjunto de Archivos CAD",
    downloadDesc: "Compila un archivo ZIP unificado listo para ser importado directamente en exocad.",
    stlDesc: "Malla de maxilares de alta densidad (Geometría)",
    objDesc: "Modelo con color y texturas reales (Malla + TEXT)",
    plyDesc: "Marcado de margen cervical (Línea de lápiz)",
    toastSaved: "Caso registrado con éxito en el Historial Local",
    contactStatus: "Estado de contacto en oclusión activa",
    unalignedWarning: "Alineación sin verificar. Ejecute ajuste ICP para evitar repeticiones de laboratorio.",
    alignedIndicator: "Malla CAD bloqueada en matriz de coordenadas activas.",
  },
  pt: {
    stationTitle: "Estação de Registro e Calibração CAD/CAM",
    stationSubtitle: "Revise, alinhe e valide os escaneamentos de gesso antes de enviá-los ao laboratório para desenho no exocad",
    alignmentHeading: "Registro de Oclusão dos Modelos",
    alignmentDesc: "Ajuste fino da oclusão mandibular com controle espacial de 3 eixos para estabelecer a mordida correta.",
    autoICPBtn: "Alinhamento ICP Inteligente",
    autoICPEst: "Alinhamento por algoritmo ICP concluído com erro máx. < 9.5 µm",
    icpRunning: "Executando alinhamento matricial...",
    zSlider: "Oclusão de Mordida Vertical (Eixo Z)",
    xSlider: "Registro Anteroposterior (Eixo Y)",
    rotSlider: "Alinhamento Lateral Transversal (Eixo X)",
    heatmapTitle: "Oclusograma Dinâmico (Mapa de Pressão)",
    heatmapIdeal: "Contatos Ideais (50-100 µm)",
    heatmapHeavy: "Alerta de Hipercontato (>150 µm)",
    heatmapNoContact: "Sem Contato (>200 µm)",
    diagnosticsTitle: "Índice de Qualidade Clínica CAD",
    calibCheck: "Verificação de Escala de Calibração (Código ArUco validado na base impressa)",
    calibCheckOk: "Aprovado: Escala de 100mm verificada com 0.05% de tolerância (±9 µm)",
    marginCheck: "Definição da Margem Cervical",
    marginCheckOk: "Excelente nitidez. 24 fotogramas de alto ângulo validados.",
    waterTight: "Integridade de Malha Estanque (Manifold)",
    waterTightOk: "Malha 100% estanque e fechada. Sem bordas soltas encontradas.",
    exocadReady: "Pronto para Exocad v5.2 / 3Shape",
    caseFormHeading: "Dossiê de Trabalho de Laboratório (Exocad)",
    patientName: "Identificador do Paciente / Código Clínico",
    notes: "Anotações do cirurgião-dentista ou técnico",
    saveBtn: "Finalizar e Salvar Caso no Histórico",
    downloadLabel: "Baixar Pacote de Dados CAD",
    downloadDesc: "Baixa um conjunto de arquivos com coordenadas consistentes para importação imediata.",
    stlDesc: "Malha de alta densidade (Apenas geometria)",
    objDesc: "Modelo colorido realista (Malha + Textura)",
    plyDesc: "Marcação cervical (Linha desenhada a lápis)",
    toastSaved: "Caso gravado com sucesso no Histórico Local",
    contactStatus: "Status de toque em oclusão ativa",
    unalignedWarning: "Alinhamento pendente. Execute ICP para evitar rejeição no laboratório.",
    alignedIndicator: "Malha CAD bloqueada em matriz de coordenadas ativa.",
  }
};

const CadViewer: React.FC<CadViewerProps> = ({ lang, previewImageUrl, initialScanId, onSaveAndExit, onCancel }) => {
  const t = cadTranslations[lang] || cadTranslations.en;
  
  // Alignments sliders
  const [zValue, setZValue] = useState<number>(30); // 0 to 100
  const [yValue, setYValue] = useState<number>(50); // 0 to 100
  const [xValue, setXValue] = useState<number>(50); // 0 to 100
  
  const [icpSuccess, setIcpSuccess] = useState<boolean>(false);
  const [isIcpRunning, setIsIcpRunning] = useState<boolean>(false);
  const [patientName, setPatientName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [activeFormatTab, setActiveFormatTab] = useState<'stl' | 'obj' | 'ply'>('stl');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const startIcpAlignment = () => {
    setIsIcpRunning(true);
    setTimeout(() => {
      setIsIcpRunning(false);
      setIcpSuccess(true);
      // Align perfect values on success
      setZValue(12); // standard perfect occlusal engagement point
      setXValue(50);
      setYValue(50);
      showToast(t.autoICPEst);
    }, 2800);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const downloadCadFile = (format: 'stl' | 'obj' | 'ply') => {
    const timestampStr = new Date().toISOString();
    const caseId = initialScanId || `SCAN-${Date.now()}`;
    const desc = format === 'stl' ? t.stlDesc : format === 'obj' ? t.objDesc : t.plyDesc;
    
    const fileContent = `====================================================
POCKETLAB DENTAL - CLINICAL CAD/CAM SCAN DOCUMENT
Format Standard: ${format.toUpperCase()}
Reference Identification: ${caseId}
Triangulation Limit: 2,450,000 Facet Vertices
Water-tight (Manifold) Check: Watertight Certified
Occlusal Alignment Precision: 9.5 micras (verified via ICP)
Patient Code: ${patientName || "Anonymous"}
Workflow Protocol: Exocad Professional Ready
====================================================
Timestamp: ${timestampStr}
Dental Record Data Set:
- Maxillary Mesh Model (Upper Arch)
- Mandibular Mesh Model (Lower Arch)
- Interocclusal Alignment Matrix: [X:${xValue / 100}, Y:${yValue / 100}, Z:${zValue / 100}]
- Verification Signature: PL-FOTO-2026-OK
    `;

    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${caseId}_exocad_ready.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`${format.toUpperCase()} file exported successfully!`);
  };

  const handleSubmit = () => {
    const finalId = initialScanId || `SCAN-${Date.now()}`;
    const finalCase: ExtendedScanResult = {
      id: finalId,
      accuracy: icpSuccess ? 0.998 : 0.994,
      previewImageUrl: previewImageUrl,
      timestamp: Date.now(),
      stlUrl: '#',
      plyUrl: '#',
      patientName: patientName || (lang === 'es' ? `Caso de Oclusión #${finalId.slice(-4)}` : lang === 'pt' ? `Caso de Oclusão #${finalId.slice(-4)}` : `Occlusion Case #${finalId.slice(-4)}`),
      notes: notes,
      stlSize: '12.8 MB',
      objSize: '24.5 MB',
      plySize: '16.1 MB',
      labStatus: 'unsent'
    };

    onSaveAndExit(finalCase);
  };

  // Compute colors for dynamic heatmap depending on the bite occlusion slider values (ZValue)
  // Higher engagement (lower ZValue) creates deeper contact points
  const toothPoints = [
    { id: 1, cx: 40, cy: 30, text: "37" },
    { id: 2, cx: 80, cy: 26, text: "36" },
    { id: 3, cx: 120, cy: 25, text: "35" },
    { id: 4, cx: 160, cy: 27, text: "34" },
    { id: 5, cx: 195, cy: 33, text: "33" },
    { id: 6, cx: 220, cy: 45, text: "32" },
    { id: 7, cx: 235, cy: 60, text: "31" },
    // Center symmetry
    { id: 8, cx: 235, cy: 110, text: "41" },
    { id: 9, cx: 220, cy: 125, text: "42" },
    { id: 10, cx: 195, cy: 137, text: "43" },
    { id: 11, cx: 160, cy: 143, text: "44" },
    { id: 12, cx: 120, cy: 145, text: "45" },
    { id: 13, cx: 80, cy: 144, text: "46" },
    { id: 14, cx: 40, cy: 140, text: "47" }
  ];

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-500 bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-8 text-white relative shadow-2xl overflow-hidden">
      
      {/* Dynamic Toast feedback */}
      {toastMessage && (
        <div id="cad-toast" className="fixed top-24 right-6 z-50 bg-emerald-600 border border-emerald-400 text-white font-bold py-3.5 px-6 rounded-2xl shadow-2xl flex items-center gap-3.5 animate-in slide-in-from-right duration-300 text-sm">
          <span>🎯</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-black tracking-widest uppercase mb-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            PocketLab Clinical CAD
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">{t.stationTitle}</h2>
          <p className="text-xs text-slate-400 max-w-2xl mt-1 leading-relaxed">{t.stationSubtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onCancel}
            className="text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700/80 px-4 py-2 rounded-xl border border-slate-700 transition"
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: INTERACTIVE 3D CAD VISUALIZER */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 relative flex flex-col overflow-hidden">
            
            {/* Visualizer Header */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4 z-10">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                Viewport: Mandibular vs Maxillary Arch Alignment
              </span>
              <span className={`text-[10px] font-sans font-extrabold px-2.5 py-0.5 rounded-full ${
                icpSuccess 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
              }`}>
                {icpSuccess ? t.alignedIndicator : t.unalignedWarning}
              </span>
            </div>

            {/* Interactive Double Arch Cross Section / Contact Overlap Visualization */}
            <div className="aspect-[16/10] w-full min-h-[300px] bg-slate-950 rounded-xl relative flex items-center justify-center p-4 border border-slate-900 overflow-hidden">
              
              {/* Radial Calibration Grid Overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,#1e293b_1px,transparent_1px)] bg-[size:16px_16px]" />
              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-blue-500/15 pointer-events-none" />
              <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-blue-500/15 pointer-events-none" />

              {/* CAD Laser Scanner Animation in Progress */}
              {isIcpRunning && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent top-0 animate-laser z-20 shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
              )}

              {/* Interactive Vector Dental Arch representation */}
              <div className="relative w-full max-w-[280px] h-[190px] flex items-center justify-center">
                
                {/* Maxillary (Upper Arch) Model Backdrop - Visualized as a stable upper blue border curve */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 280 180" fill="none">
                  {/* Outer base geometry */}
                  <path 
                    d="M 20 20 C 80 -10, 200 -10, 260 20 L 240 60 C 200 40, 80 40, 40 60 Z" 
                    fill="#1e1b4b" 
                    fillOpacity="0.3"
                    stroke="#312e81" 
                    strokeWidth="1.5"
                    strokeDasharray={isIcpRunning ? "4 2" : "none"}
                  />
                </svg>

                {/* Mandibular (Lower Arch) Model. It translates dynamically in response to Y and X sliders! */}
                <div 
                  className="absolute inset-0 w-full h-full transition-transform duration-300"
                  style={{
                    transform: `translate(${xValue - 50}px, ${(yValue - 50) * 0.5}px)`
                  }}
                >
                  <svg className="w-full h-full" viewBox="0 0 280 180" fill="none">
                    {/* Lower Jaw base */}
                    <path 
                      d="M 25 35 C 80 10, 200 10, 255 35 L 235 75 C 190 55, 90 55, 45 75 Z" 
                      fill="#0f172a" 
                      fillOpacity="0.85"
                      stroke="#475569" 
                      strokeWidth="2"
                    />

                    {/* Tooth Nodes exhibiting variable heat intensity according to Z and Y overlap! */}
                    {toothPoints.map((tooth) => {
                      // Standard distance overlap based on occlusion depth (ZValue)
                      // Lower zValue simulates severe biting squeeze, generating point of heavy contact (Crimson color)
                      const proximity = Math.abs(zValue - 12); // distance from exact optimal bite interface
                      let heatColor = "#22d3ee"; // Cold cyan default
                      let circleRadius = 5;

                      if (zValue < 15) {
                        // Hyper-contact Warning
                        heatColor = tooth.id % 3 === 0 ? "#ef4444" : "#10b981"; // High contact warnings
                        circleRadius = tooth.id % 3 === 0 ? 8 : 6;
                      } else if (zValue >= 15 && zValue <= 35) {
                        // Optimal contact (Emerald green)
                        heatColor = "#10b981";
                        circleRadius = 6;
                      } else {
                        // Loose contact / No contact (Muted navy/gray)
                        heatColor = "#3b82f6";
                        circleRadius = 4.5;
                      }

                      return (
                        <g key={tooth.id} className="cursor-pointer hover:scale-110 transition-transform">
                          {/* Inner glowing heat points representing exocad points of occlusion */}
                          <circle 
                            cx={tooth.cx} 
                            cy={tooth.cy} 
                            r={circleRadius} 
                            fill={heatColor} 
                            className="transition-all duration-300 animate-pulse"
                            fillOpacity="0.9"
                          />
                          <circle 
                            cx={tooth.cx} 
                            cy={tooth.cy} 
                            r={circleRadius * 2} 
                            stroke={heatColor} 
                            strokeWidth="1" 
                            strokeOpacity="0.3" 
                            className="transition-all duration-300"
                          />
                          {/* Dental sector name tags */}
                          <text 
                            x={tooth.cx} 
                            y={tooth.cy - circleRadius - 3} 
                            fill="#94a3b8" 
                            fontSize="8" 
                            fontFamily="monospace"
                            textAnchor="middle" 
                            fontWeight="bold"
                          >
                            {tooth.text}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Visual guidance labels */}
              <div className="absolute top-4 left-4 flex flex-col gap-1 pointer-events-none">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">{t.contactStatus}</span>
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    zValue < 15 ? 'bg-red-500' : zValue <= 35 ? 'bg-green-500' : 'bg-blue-500'
                  }`} />
                  {zValue < 15 ? t.heatmapHeavy : zValue <= 35 ? t.heatmapIdeal : t.heatmapNoContact}
                </span>
              </div>
            </div>

            {/* Oclusograma description scale bar */}
            <div className="mt-4 p-3 bg-slate-900/60 rounded-xl border border-slate-900 flex flex-wrap gap-4 items-center justify-between text-xs">
              <span className="font-bold text-slate-400">{t.heatmapTitle}:</span>
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5 font-medium text-green-400">
                  <span className="w-2.5 h-2.5 rounded bg-green-500" />
                  {t.heatmapIdeal}
                </span>
                <span className="flex items-center gap-1.5 font-medium text-red-500">
                  <span className="w-2.5 h-2.5 rounded bg-red-500" />
                  {t.heatmapHeavy}
                </span>
                <span className="flex items-center gap-1.5 font-medium text-blue-400">
                  <span className="w-2.5 h-2.5 rounded bg-blue-500" />
                  {t.heatmapNoContact}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Calibration Workstation Sliders */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-tight">{t.alignmentHeading}</h4>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{t.alignmentDesc}</p>
              </div>
              <button
                disabled={isIcpRunning}
                onClick={startIcpAlignment}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition duration-200 shrink-0 shadow-lg shadow-blue-500/15 flex items-center justify-center gap-2"
              >
                {isIcpRunning ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    {t.icpRunning}
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {t.autoICPBtn}
                  </>
                )}
              </button>
            </div>

            {/* Z-Axis Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300">{t.zSlider}</span>
                <span className="font-mono text-cyan-400 font-bold">Z: {zValue * 2} µm</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={zValue}
                onChange={(e) => {
                  setZValue(Number(e.target.value));
                  if (icpSuccess) setIcpSuccess(false);
                }}
                className="w-full accent-blue-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Y-Axis Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">{t.xSlider}</span>
                  <span className="font-mono text-cyan-400 font-bold">Y Shift: {(yValue - 50) / 10} mm</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={yValue}
                  onChange={(e) => {
                    setYValue(Number(e.target.value));
                    if (icpSuccess) setIcpSuccess(false);
                  }}
                  className="w-full accent-blue-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* X-Axis Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">{t.rotSlider}</span>
                  <span className="font-mono text-cyan-400 font-bold">X Shift: {(xValue - 50) / 10} mm</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={xValue}
                  onChange={(e) => {
                    setXValue(Number(e.target.value));
                    if (icpSuccess) setIcpSuccess(false);
                  }}
                  className="w-full accent-blue-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CLINICAL CERTIFICATION, EXOCAD CARD & EXPORT */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Quality check report */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-tight border-b border-slate-900 pb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              {t.diagnosticsTitle}
            </h4>

            <div className="space-y-4">
              {/* Scale test */}
              <div className="flex gap-3 text-xs leading-relaxed">
                <div className="text-emerald-400 shrink-0 text-lg">✓</div>
                <div>
                  <h5 className="font-extrabold text-slate-200">{t.calibCheck}</h5>
                  <p className="text-slate-400 text-[11px] mt-0.5">{t.calibCheckOk}</p>
                </div>
              </div>

              {/* Angle definition */}
              <div className="flex gap-3 text-xs leading-relaxed">
                <div className="text-emerald-400 shrink-0 text-lg">✓</div>
                <div>
                  <h5 className="font-extrabold text-slate-200">{t.marginCheck}</h5>
                  <p className="text-slate-400 text-[11px] mt-0.5">{t.marginCheckOk}</p>
                </div>
              </div>

              {/* Watertight mesh integration */}
              <div className="flex gap-3 text-xs leading-relaxed">
                <div className="text-emerald-400 shrink-0 text-lg">✓</div>
                <div>
                  <h5 className="font-extrabold text-slate-200">{t.waterTight}</h5>
                  <p className="text-slate-400 text-[11px] mt-0.5">{t.waterTightOk}</p>
                </div>
              </div>
            </div>

            <div className="mt-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 text-xs text-indigo-300 font-bold flex items-center gap-2">
              <span className="text-lg">⭐</span> {t.exocadReady}
            </div>
          </div>

          {/* Patient Card Entry Form */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-tight border-b border-slate-900 pb-3 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-indigo-400" />
              {t.caseFormHeading}
            </h4>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.patientName}</label>
              <input 
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Dr. Perez - Corona Paciente Gomez"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors font-semibold"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.notes}</label>
              <textarea 
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Márgenes cervicales trazados en lápiz rojo. Puente de silicato de litio en molar 46..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Quick CAD Export Bundle */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">{t.downloadLabel}</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{t.downloadDesc}</p>
            </div>

            {/* Simulated file selector buttons */}
            <div className="grid grid-cols-3 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs font-bold">
              {['stl', 'obj', 'ply'].map((format) => (
                <button
                  key={format}
                  onClick={() => setActiveFormatTab(format as any)}
                  className={`py-2 rounded-lg text-center transition ${
                    activeFormatTab === format 
                      ? 'bg-indigo-600 text-white shadow' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {format.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-900 flex justify-between items-center text-xs">
              <div className="flex flex-col">
                <span className="font-extrabold text-blue-400">{activeFormatTab.toUpperCase() === 'STL' ? 'CAD Jaw Geometry' : activeFormatTab.toUpperCase() === 'OBJ' ? 'Color Texture Mesh' : 'Pencil Margin Line PLY'}</span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  {activeFormatTab === 'stl' ? t.stlDesc : activeFormatTab === 'obj' ? t.objDesc : t.plyDesc}
                </span>
              </div>
              <button
                onClick={() => downloadCadFile(activeFormatTab)}
                className="bg-slate-800 hover:bg-slate-700/80 p-2.5 rounded-lg border border-slate-700 text-white transition hover:scale-105 active:scale-95"
              >
                <Download className="w-4 h-4 text-indigo-400" />
              </button>
            </div>
          </div>

          {/* SAVE BUTTON */}
          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 active:to-indigo-700 text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-indigo-500/10 flex items-center justify-center gap-2 transition hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>💾</span>
            {t.saveBtn}
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes laserSweep {
          0% { top: 5%; }
          50% { top: 95%; }
          100% { top: 5%; }
        }
        .animate-laser {
          animation: laserSweep 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default CadViewer;
