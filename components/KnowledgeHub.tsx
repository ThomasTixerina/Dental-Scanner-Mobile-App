
import React, { useState } from 'react';
import { translations, Language } from '../translations';
import { GoogleGenAI } from "@google/genai";

interface KnowledgeHubProps {
  lang: Language;
}

const KnowledgeHub: React.FC<KnowledgeHubProps> = ({ lang }) => {
  const t = translations[lang].knowledge;
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  const askAI = async () => {
    if (!question) return;
    setIsAsking(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are a dental technical assistant. Answer the following question about dental scanning and 3D formats (STL, PLY, OBJ) for a professional dentist. Answer in ${lang === 'es' ? 'Spanish' : lang === 'pt' ? 'Portuguese' : 'English'}. Question: ${question}`,
        config: { thinkingConfig: { thinkingBudget: 0 } }
      });
      setAnswer(response.text || 'No response');
    } catch (e) {
      setAnswer('Error connecting to Assistant.');
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center">
        <h2 className="text-4xl font-black mb-4 bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent uppercase tracking-tight">
          {t.title}
        </h2>
        <p className="text-slate-400 text-lg">
          {lang === 'es' ? 'Comprenda los estándares de la odontología digital moderna.' : 'Understand the standards of modern digital dentistry.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { id: 'stl', title: t.stl, desc: t.stlDesc, icon: '📐', color: 'from-blue-600/20 to-blue-900/40' },
          { id: 'ply', title: t.ply, desc: t.plyDesc, icon: '🎨', color: 'from-purple-600/20 to-purple-900/40' },
          { id: 'obj', title: t.obj, desc: t.objDesc, icon: '🧊', color: 'from-emerald-600/20 to-emerald-900/40' },
        ].map(format => (
          <div key={format.id} className={`p-8 rounded-3xl bg-gradient-to-br ${format.color} border border-white/10 hover:border-white/30 transition-all group`}>
            <div className="text-4xl mb-6 group-hover:scale-125 transition-transform inline-block">{format.icon}</div>
            <h3 className="text-xl font-bold mb-3">{format.title}</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{format.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-800/40 rounded-3xl border border-slate-700 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold">{t.askAI}</h3>
        </div>
        
        <div className="flex flex-col gap-4">
          <textarea 
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={lang === 'es' ? '¿Cuál es la diferencia entre STL y PLY para Exocad?' : 'What is the difference between STL and PLY for Exocad?'}
            className="bg-slate-900/80 border border-slate-700 rounded-2xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none h-24"
          />
          <button 
            onClick={askAI}
            disabled={isAsking}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all self-end"
          >
            {isAsking ? '...' : (lang === 'es' ? 'Preguntar' : 'Ask Assistant')}
          </button>
          
          {answer && (
            <div className="mt-4 p-5 bg-blue-900/30 border border-blue-500/30 rounded-2xl text-blue-100 text-sm leading-relaxed animate-in fade-in zoom-in-95">
              {answer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeHub;
