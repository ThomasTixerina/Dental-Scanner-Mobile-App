
export type Language = 'en' | 'es' | 'pt';

export const translations = {
  en: {
    header: {
      caseHistory: "Case History",
      labConnections: "Lab Connections",
      account: "Account",
      knowledge: "Tech Hub"
    },
    scanner: {
      readyTitle: "Ready to Scan",
      readyDesc: "Place your plaster model on the printed Calibration Base. Ensure good lighting for margin detection.",
      startBtn: "Start New Session",
      resolution: "Resolution",
      coverage: "Coverage",
      guide: "Center the Plaster Model",
      processing: "Uploading to Cloud Engine...",
      reconstructing: "Reconstructing 3D Mesh (STL/PLY)...",
      complete: "Scan Complete. High accuracy achieved.",
      failed: "Scan failed",
      accuracy: "Clinical Grade Accuracy",
      exportStl: "Export STL",
      exportObj: "Export OBJ",
      sendLab: "Send to Lab",
      tooDark: "Too Dark - Increase Lighting",
      tooBright: "Too Bright - Reduce Glare",
      stageUpper: "Scanning Upper Arch",
      stageLower: "Scanning Lower Arch",
      stageBite: "Scanning Bite Registration",
      nextStage: "Next Stage"
    },
    knowledge: {
      title: "Format Guide",
      stl: "STL (Standard)",
      stlDesc: "Best for 3D printing and basic CAD. Geometrical data only.",
      ply: "PLY (Color)",
      plyDesc: "Includes color and texture. Perfect for digital smile design.",
      obj: "OBJ (Full)",
      objDesc: "Advanced realistic models. Compatible with most design software.",
      askAI: "Ask Dental Assistant"
    },
    guide: {
      title: "Calibration Guide",
      basePdf: "Calibration Base",
      basePdfDesc: "Essential for 1:1 scale. Print on Letter, 100% scale.",
      download: "Print Base Now",
      lighting: "Lighting Control",
      lightingDesc: "Ensure >500lx for optimal margin detection.",
      luxmeter: "Open Luxmeter",
      luxOptimal: "Optimal Light",
      luxLow: "Increase Light",
      luxHigh: "Reduce Glare",
      labTitle: "Lab Compatibility",
      exocad: "Exocad Professional Support",
      sirona: "3Shape / Sirona Ready",
      aiEnhance: "Marginal Line AI Enhancement",
      manifold: "Automatic Water-tight Meshes"
    }
  },
  es: {
    header: {
      caseHistory: "Historial",
      labConnections: "Conexiones Lab",
      account: "Mi Cuenta",
      knowledge: "Base Técnica"
    },
    scanner: {
      readyTitle: "Listo para Escanear",
      readyDesc: "Coloque el modelo de yeso sobre la Base de Calibración impresa. Asegure buena luz para detectar márgenes.",
      startBtn: "Iniciar Nueva Sesión",
      resolution: "Resolución",
      coverage: "Cobertura",
      guide: "Centre el Modelo de Yeso",
      processing: "Subiendo al Motor en la Nube...",
      reconstructing: "Reconstruyendo Malla 3D (STL/PLY)...",
      complete: "Escaneo Completado. Alta precisión lograda.",
      failed: "Error en escaneo",
      accuracy: "Precisión de Grado Clínico",
      exportStl: "Exportar STL",
      exportObj: "Exportar OBJ",
      sendLab: "Enviar al Laboratorio",
      tooDark: "Muy Oscuro - Aumente la luz",
      tooBright: "Muy Brillante - Evite reflejos",
      stageUpper: "Escaneando Arcada Superior",
      stageLower: "Escaneando Arcada Inferior",
      stageBite: "Escaneando Registro de Mordida",
      nextStage: "Siguiente Etapa"
    },
    knowledge: {
      title: "Guía de Formatos",
      stl: "STL (Estándar)",
      stlDesc: "Ideal para impresión 3D y CAD básico. Solo datos geométricos.",
      ply: "PLY (Color)",
      plyDesc: "Incluye color y textura. Perfecto para diseño de sonrisa.",
      obj: "OBJ (Completo)",
      objDesc: "Modelos realistas avanzados. Compatible con la mayoría de software.",
      askAI: "Consultar Asistente IA"
    },
    guide: {
      title: "Guía de Calibración",
      basePdf: "Base de Calibración",
      basePdfDesc: "Vital para escala 1:1. Imprima en Carta al 100%.",
      download: "Imprimir Base Ahora",
      lighting: "Control Lumínico",
      lightingDesc: "Requiere >500lx para detección de márgenes.",
      luxmeter: "Abrir Luxómetro",
      luxOptimal: "Luz Óptima",
      luxLow: "Aumente Luz",
      luxHigh: "Reduzca Reflejos",
      labTitle: "Compatibilidad Lab",
      exocad: "Soporte Profesional Exocad",
      sirona: "Listo para 3Shape / Sirona",
      aiEnhance: "Mejora de IA para Línea Marginal",
      manifold: "Mallas Cerradas Automáticas"
    }
  },
  pt: {
    header: {
      caseHistory: "Histórico",
      labConnections: "Conexões Lab",
      account: "Minha Conta",
      knowledge: "Centro Técnico"
    },
    scanner: {
      readyTitle: "Pronto para Escanear",
      readyDesc: "Coloque o modelo de gesso na Base de Calibração impressa. Garanta boa luz para detectar margens.",
      startBtn: "Iniciar Nueva Sessão",
      resolution: "Resolução",
      coverage: "Cobertura",
      guide: "Centralize o Modelo de Gesso",
      processing: "Enviando para Nuvem...",
      reconstructing: "Reconstruindo Malha 3D (STL/PLY)...",
      complete: "Digitalização Concluída. Alta precisão.",
      failed: "Falha na digitalização",
      accuracy: "Precisión de Grau Clínico",
      exportStl: "Exportar STL",
      exportObj: "Exportar OBJ",
      sendLab: "Enviar ao Laboratório",
      tooDark: "Muito Escuro - Aumente a luz",
      tooBright: "Muito Brilhante - Reduza o brilho",
      stageUpper: "Escaneando Arcada Superior",
      stageLower: "Escaneando Arcada Inferior",
      stageBite: "Escaneando Registro de Mordida",
      nextStage: "Próxima Etapa"
    },
    knowledge: {
      title: "Guia de Formatos",
      stl: "STL (Padrão)",
      stlDesc: "Melhor para impressão 3D e CAD básico. Apenas geometria.",
      ply: "PLY (Colorido)",
      plyDesc: "Inclui cor e textura. Perfeito para design de sorriso.",
      obj: "OBJ (Completo)",
      objDesc: "Modelos realistas avanzados. Compatível com quase todos softwares.",
      askAI: "Consultar Assistente IA"
    },
    guide: {
      title: "Guia de Calibração",
      basePdf: "Base de Calibração",
      basePdfDesc: "Vital para escala 1:1. Imprima em Carta a 100%.",
      download: "Imprimir Base Agora",
      lighting: "Controle de Luz",
      lightingDesc: "Necessário >500lx para margens nítidas.",
      luxmeter: "Abrir Luxômetro",
      luxOptimal: "Luz Ideal",
      luxLow: "Aumentar Luz",
      luxHigh: "Reduzir Brilho",
      labTitle: "Compatibilidade Lab",
      exocad: "Suporte Profissional Exocad",
      sirona: "Pronto para 3Shape / Sirona",
      aiEnhance: "Melhoria de IA para Linha Marginal",
      manifold: "Malhas Fechadas Automáticas"
    }
  }
};
