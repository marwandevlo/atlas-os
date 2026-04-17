'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Brain, Send, User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const suggestions = [
  'Quel est le taux de TVA applicable pour les services informatiques?',
  'Comment calculer l\'IS pour une société avec 500 000 MAD de bénéfice?',
  'Quelles sont les obligations CNSS pour un employé à 8000 MAD?',
  'Quand est la deadline pour la déclaration TVA mensuelle?',
];

export default function ConsultantPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Bonjour! Je suis votre conseiller fiscal IA spécialisé en droit marocain. Posez-moi vos questions sur la TVA, IS, IR, CNSS ou toute autre question fiscale.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMessage: Message = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText, type: 'consultant' }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response || 'Erreur de réponse' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erreur de connexion. Réessayez.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-60 bg-[#1B2A4A] flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-white/10">
          <p className="text-white font-bold text-base">Atlas OS</p>
          <p className="text-white/40 text-xs">Enterprise</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <button onClick={() => router.push('/')} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/50 hover:bg-white/10 hover:text-white text-sm transition-all">
            <ArrowLeft size={16} /> Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-white/15 text-white text-sm">
            <Brain size={16} /> Consultant IA
          </button>
        </nav>
        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-white/30 text-xs mb-3">Questions fréquentes</p>
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => sendMessage(s)} className="w-full text-left text-white/40 hover:text-white/80 text-xs py-2 border-b border-white/5 last:border-0 transition-colors">
              {s.substring(0, 45)}...
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
              <Brain size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Consultant Fiscal IA</h1>
              <p className="text-xs text-gray-400">Spécialisé en droit fiscal marocain · DGI · CNSS · AMO</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 font-medium">En ligne</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center shrink-0 mt-1">
                  <Bot size={16} className="text-white" />
                </div>
              )}
              <div className={`max-w-2xl px-4 py-3 rounded-2xl text-sm leading-relaxed prose prose-sm max-w-none ${
                m.role === 'user'
                  ? 'bg-[#1B2A4A] text-white rounded-tr-none'
                  : 'bg-white text-gray-700 shadow-sm border border-gray-100 rounded-tl-none'
              }`}>
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
              {m.role === 'user' && (
                <div className="w-8 h-8 bg-[#1B2A4A] rounded-full flex items-center justify-center shrink-0 mt-1">
                  <User size={16} className="text-white" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center shrink-0">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border-t border-gray-200 px-8 py-4">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Posez votre question fiscale en français ou en darija..."
              className="flex-1 px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading}
              className="px-4 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}