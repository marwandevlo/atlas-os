'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Brain, Send, Mic, MicOff, Volume2, VolumeX, Bot, User } from 'lucide-react';

type Message = { role: 'user' | 'assistant'; content: string };

export default function ConsultantPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: 'Salam! Ana consultant fiscal dyalek. Tqder tsewelni b darija, français aw arabi. Ash bghiti t3ref?'
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [lang, setLang] = useState<'fr-FR' | 'ar-MA' | 'ar-SA'>('fr-FR');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speak = async (text: string) => {
    if (!voiceEnabled) return;
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsSpeaking(true);
      const clean = text.replace(/[*#_`]/g, '').replace(/\n/g, ' ').substring(0, 500);
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: clean, voice: 'nova' }),
      });
      if (!res.ok) throw new Error('TTS failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setIsSpeaking(false); URL.revokeObjectURL(url); audioRef.current = null; };
      audio.onerror = () => { setIsSpeaking(false); audioRef.current = null; };
      await audio.play();
    } catch {
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
  };

  const startListening = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Utilisez Chrome pour la reconnaissance vocale.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const sendMessage = async (text?: string) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'consultant',
          message: `${msg}\n\nReponds dans la meme langue que la question. Si darija marocaine reponds en darija. Si français reponds en français. Si arabe reponds en arabe. Sois concis (max 3 paragraphes).`
        }),
      });
      const data = await res.json();
      const response = data.response;
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      if (voiceEnabled) setTimeout(() => speak(response), 300);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erreur. Reessayez.' }]);
    }
    setLoading(false);
  };

  const suggestions = [
    'TVA 20% kif katkhasem?',
    'IS 2026 barème?',
    'CNSS declaration comment?',
    'IR salaire calcul',
  ];

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

        <div className="px-4 py-4 border-t border-white/10 space-y-3">
          <p className="text-white/30 text-xs font-medium">Langue vocale</p>
          <div className="space-y-1">
            {[
              { code: 'fr-FR', label: '🇫🇷 Français' },
              { code: 'ar-MA', label: '🇲🇦 Darija / عربية' },
              { code: 'ar-SA', label: '🌍 Arabe classique' },
            ].map(l => (
              <button key={l.code} onClick={() => setLang(l.code as any)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${lang === l.code ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white/70'}`}>
                {l.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between px-1">
            <span className="text-white/30 text-xs">Reponse vocale</span>
            <button onClick={() => { setVoiceEnabled(!voiceEnabled); stopSpeaking(); }}
              className={`p-1.5 rounded-lg transition-all ${voiceEnabled ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-white/30'}`}>
              {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
              <Brain size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800">Consultant IA Vocal</h1>
              <p className="text-xs text-gray-400">Darija · Français · العربية</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSpeaking && (
              <button onClick={stopSpeaking} className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-500 rounded-lg text-sm hover:bg-red-100">
                <VolumeX size={16} /> Arreter
              </button>
            )}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${isSpeaking ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
              {isSpeaking ? 'En train de parler...' : 'En attente'}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 1 && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => sendMessage(s)}
                  className="text-left p-3 bg-white rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-sm text-sm text-gray-600 transition-all">
                  💬 {s}
                </button>
              ))}
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center shrink-0 mt-1">
                  <Bot size={16} className="text-white" />
                </div>
              )}
              <div className={`max-w-2xl px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                m.role === 'user' ? 'bg-[#1B2A4A] text-white rounded-tr-none' : 'bg-white text-gray-700 shadow-sm border border-gray-100 rounded-tl-none'
              }`}>
                {m.content}
                {m.role === 'assistant' && voiceEnabled && (
                  <button onClick={() => speak(m.content)} className="mt-2 flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-600">
                    <Volume2 size={12} /> Rejouer
                  </button>
                )}
              </div>
              {m.role === 'user' && (
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shrink-0 mt-1">
                  <User size={16} className="text-gray-600" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center shrink-0">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex gap-1 items-center">
                  <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{animationDelay:'0.15s'}}></div>
                  <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{animationDelay:'0.3s'}}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder={isListening ? '🎤 En train d\'ecouter...' : 'Posez votre question (Darija, Français, Arabe)...'}
                rows={2}
                className={`w-full px-4 py-3 text-sm border rounded-2xl focus:outline-none resize-none transition-all ${
                  isListening ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-400'
                }`}
              />
            </div>

            <button
              onClick={isListening ? stopListening : startListening}
              className={`p-3 rounded-2xl transition-all shrink-0 ${
                isListening ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200' : 'bg-gray-100 text-gray-500 hover:bg-indigo-100 hover:text-indigo-600'
              }`}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="p-3 bg-indigo-500 text-white rounded-2xl hover:bg-indigo-600 disabled:opacity-50 shrink-0"
            >
              <Send size={20} />
            </button>
          </div>

          {isListening && (
            <div className="mt-2 flex items-center gap-2 text-red-500 text-xs">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="w-1 bg-red-400 rounded-full animate-bounce"
                    style={{height: `${8 + i * 3}px`, animationDelay: `${i * 0.1}s`}}></div>
                ))}
              </div>
              Ecoute en cours... Parlez maintenant
            </div>
          )}
        </div>
      </main>
    </div>
  );
}