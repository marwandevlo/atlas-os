'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Brain, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

export default function ConsultantPage() {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [status, setStatus] = useState('Appuyez sur le micro pour parler');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [lang, setLang] = useState<'fr-FR' | 'ar-MA' | 'ar-SA'>('fr-FR');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = async (text: string) => {
    if (!voiceEnabled) return;
    try {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      setIsSpeaking(true);
      setStatus('En train de repondre...');
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
      audio.onended = () => {
        setIsSpeaking(false);
        setStatus('Appuyez sur le micro pour parler');
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };
      audio.onerror = () => { setIsSpeaking(false); setStatus('Appuyez sur le micro pour parler'); };
      await audio.play();
    } catch {
      setIsSpeaking(false);
      setStatus('Appuyez sur le micro pour parler');
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setIsSpeaking(false);
    setStatus('Appuyez sur le micro pour parler');
  };

  const askClaude = async (question: string) => {
    setIsThinking(true);
    setStatus('En train de reflechir...');
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'consultant',
          message: `${question}\n\nReponds dans la meme langue que la question. Si darija marocaine reponds en darija. Si français reponds en français. Si arabe reponds en arabe. Sois tres concis, max 4 phrases.`
        }),
      });
      const data = await res.json();
      setResponse(data.response);
      setIsThinking(false);
      await speak(data.response);
    } catch {
      setIsThinking(false);
      setStatus('Erreur. Reessayez.');
    }
  };

  const startListening = () => {
    if (typeof window === 'undefined') return;
    if (isSpeaking) stopSpeaking();
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert('Utilisez Chrome.'); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => { setIsListening(true); setStatus('Ecoute en cours...'); setTranscript(''); setResponse(''); };
    recognition.onresult = (event: any) => {
      const t = event.results[0][0].transcript;
      setTranscript(t);
      setIsListening(false);
      askClaude(t);
    };
    recognition.onerror = () => { setIsListening(false); setStatus('Erreur micro. Reessayez.'); };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setStatus('Appuyez sur le micro pour parler');
  };

  const getCircleColor = () => {
    if (isListening) return 'bg-red-500';
    if (isThinking) return 'bg-amber-500';
    if (isSpeaking) return 'bg-green-500';
    return 'bg-indigo-500';
  };

  const getCircleAnimation = () => {
    if (isListening || isSpeaking) return 'animate-pulse';
    if (isThinking) return 'animate-spin';
    return '';
  };

  return (
    <div className="flex h-screen bg-[#0F1F3D]">
      <aside className="w-56 bg-[#1B2A4A] flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-white/10">
          <p className="text-white font-bold text-base">Atlas OS</p>
          <p className="text-white/40 text-xs">Enterprise</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <button onClick={() => router.push('/')} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/50 hover:bg-white/10 hover:text-white text-sm transition-all">
            <ArrowLeft size={16} /> Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-white/15 text-white text-sm">
            <Brain size={16} /> Consultant Vocal
          </button>
        </nav>

        <div className="px-4 py-4 border-t border-white/10 space-y-3">
          <p className="text-white/30 text-xs font-medium">Langue</p>
          <div className="space-y-1">
            {[
              { code: 'fr-FR', label: '🇫🇷 Français' },
              { code: 'ar-MA', label: '🇲🇦 Darija' },
              { code: 'ar-SA', label: '🌍 Arabe' },
            ].map(l => (
              <button key={l.code} onClick={() => setLang(l.code as any)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${lang === l.code ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white/70'}`}>
                {l.label}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between px-1 pt-2">
            <span className="text-white/30 text-xs">Son</span>
            <button onClick={() => { setVoiceEnabled(!voiceEnabled); stopSpeaking(); }}
              className={`p-1.5 rounded-lg transition-all ${voiceEnabled ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-white/30'}`}>
              {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col items-center justify-center gap-8 px-8">
        <div className="text-center">
          <h1 className="text-white font-bold text-2xl mb-1">Consultant IA</h1>
          <p className="text-white/40 text-sm">Darija · Français · العربية</p>
        </div>

        <div className="relative flex items-center justify-center">
          <div className={`absolute w-48 h-48 rounded-full opacity-20 ${getCircleColor()} ${isListening || isSpeaking ? 'animate-ping' : ''}`}></div>
          <div className={`absolute w-36 h-36 rounded-full opacity-30 ${getCircleColor()} ${isListening || isSpeaking ? 'animate-pulse' : ''}`}></div>
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={isThinking}
            className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all shadow-2xl ${
              isListening ? 'bg-red-500 shadow-red-500/50' :
              isThinking ? 'bg-amber-500 shadow-amber-500/50 cursor-not-allowed' :
              isSpeaking ? 'bg-green-500 shadow-green-500/50' :
              'bg-indigo-500 hover:bg-indigo-400 shadow-indigo-500/50 hover:scale-105'
            }`}
          >
            {isListening ? <MicOff size={40} className="text-white" /> :
             isThinking ? <Brain size={40} className="text-white animate-pulse" /> :
             isSpeaking ? <Volume2 size={40} className="text-white animate-pulse" /> :
             <Mic size={40} className="text-white" />}
          </button>
        </div>

        <div className="text-center space-y-2">
          <p className={`text-sm font-medium transition-all ${
            isListening ? 'text-red-400' :
            isThinking ? 'text-amber-400' :
            isSpeaking ? 'text-green-400' :
            'text-white/50'
          }`}>{status}</p>

          {isListening && (
            <div className="flex justify-center gap-1">
              {[1,2,3,4,5,4,3,2,1].map((h, i) => (
                <div key={i} className="w-1 bg-red-400 rounded-full animate-bounce"
                  style={{height: `${h * 4}px`, animationDelay: `${i * 0.08}s`}}></div>
              ))}
            </div>
          )}

          {transcript && (
            <div className="mt-4 px-6 py-3 bg-white/5 rounded-2xl max-w-md">
              <p className="text-white/40 text-xs mb-1">Vous:</p>
              <p className="text-white/80 text-sm">{transcript}</p>
            </div>
          )}

          {response && !isThinking && (
            <div className="mt-2 px-6 py-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl max-w-md">
              <p className="text-indigo-300 text-xs mb-1">Consultant:</p>
              <p className="text-white/80 text-sm leading-relaxed">{response}</p>
            </div>
          )}
        </div>

        {isSpeaking && (
          <button onClick={stopSpeaking} className="px-4 py-2 bg-white/10 text-white/60 rounded-xl text-sm hover:bg-white/20 transition-all">
            ⏹ Arreter
          </button>
        )}
      </main>
    </div>
  );
}