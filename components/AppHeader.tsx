
import React from 'react';
import { translations, Language } from '../translations';

interface AppHeaderProps {
  lang: Language;
  setLang: (lang: Language) => void;
  currentView: 'scanner' | 'knowledge';
  setView: (view: 'scanner' | 'knowledge') => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ lang, setLang, currentView, setView }) => {
  const t = translations[lang].header;

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('scanner')}>
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="hidden sm:block">
          <h1 className="text-xl font-bold tracking-tight">PocketLab</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">Extraoral Scanner v2.0</p>
        </div>
      </div>
      
      <nav className="flex items-center gap-4 md:gap-6">
        <div className="flex items-center gap-2 md:gap-4 mr-2 md:mr-6">
          <button 
            onClick={() => setView('scanner')}
            className={`text-sm font-bold transition-all px-3 py-1.5 rounded-lg ${currentView === 'scanner' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-white'}`}
          >
            Scanner
          </button>
          <button 
            onClick={() => setView('knowledge')}
            className={`text-sm font-bold transition-all px-3 py-1.5 rounded-lg ${currentView === 'knowledge' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-white'}`}
          >
            {t.knowledge}
          </button>
        </div>

        <div className="flex bg-slate-800/80 rounded-lg p-1">
          {(['es', 'en', 'pt'] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-2 md:px-3 py-1 rounded-md text-[10px] md:text-xs font-bold transition-all ${
                lang === l ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-6">
          <a href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">{t.caseHistory}</a>
          <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all">
            {t.account}
          </button>
        </div>
      </nav>
    </header>
  );
};

export default AppHeader;
