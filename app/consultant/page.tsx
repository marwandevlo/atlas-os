'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Brain, Mic, MicOff, Volume2, VolumeX, StopCircle } from 'lucide-react';

export default function ConsultantPage() {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [status, setStatus] = useState('اضغط للتحدث');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const speak = async (text: string) => {
    if (!voiceEnabled) return;
    try {
      if (sourceRef.current) { sourceRef.current.stop(); sourceRef.current = null; }
      if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      setIsSpeaking(true);
      setStatus('كيجاوب...');
      const clean = text.replace(/[*#_`]/g, '').replace(/\n/g, ' ').substring(0, 600);
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: clean, voice: 'echo' }),
      });
      if (!res.ok) throw new Error('TTS failed');
      const arrayBuffer = await res.arrayBuffer();
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;
      if (audioContext.state === 'suspended') await audioContext.resume();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const source = audioContext.createBufferSource();
      sourceRef.current = source;
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.onended = () => {
        setIsSpeaking(false);
        setStatus('اضغط للتحدث');
        sourceRef.current = null;
        audioContext.close();
        audioContextRef.current = null;
      };
      source.start(0);
    } catch {
      setIsSpeaking(false);
      setStatus('اضغط للتحدث');
    }
  };

  const stopSpeaking = () => {
    try {
      if (sourceRef.current) { sourceRef.current.stop(); sourceRef.current = null; }
      if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    } catch {}
    setIsSpeaking(false);
    setStatus('اضغط للتحدث');
  };

  const askClaude = async (question: string) => {
    setIsThinking(true);
    setStatus('كيفكر...');
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'consultant',
          message: `أنت مستشار ضريبي مغربي محترف اسمك أطلس. خبير في القانون الجبائي المغربي.

السؤال: ${question}

قواعد صارمة:
- جاوب بالدارجة المغربية أو الفرنسية حسب لغة السؤال — ممنوع الإنجليزية
- بالدارجة: "واه! TVA فالمغرب كتكون 20%، كنشرح ليك..."
- بالفرنسية: réponse directe et professionnelle
- جملتين أو ثلاثة فقط — مختصر ومفيد
- أرقام حقيقية: TVA 20%/14%/10%/7%، IS 20%/31%، IR حسب الشطر
- بلا مقدمات — ابدأ مباشرة`
        }),
      });
      const data = await res.json();
      setResponse(data.response);
      setIsThinking(false);
      await speak(data.response);
    } catch {
      setIsThinking(false);
      setStatus('خطأ. حاول مرة أخرى');
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setStatus('كيحول الصوت لنص...');
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');
      const res = await fetch('/api/whisper', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Whisper failed');
      const data = await res.json();
      if (data.text && data.text.trim()) {
        setTranscript(data.text);
        await askClaude(data.text);
      } else {
        setStatus('ما سمعتك. حاول مرة أخرى');
      }
    } catch {
      setStatus('خطأ في التحويل. حاول مرة أخرى');
    }
  };

  const startListening = async () => {
    if (isSpeaking) stopSpeaking();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setIsListening(false);
        await transcribeAudio(audioBlob);
      };
      mediaRecorder.start();
      setIsListening(true);
      setStatus('كيسمع... تكلم براحتك');
      setTranscript('');
      setResponse('');
    } catch {
      setStatus('مشكل في الميكرو - سمح للمتصفح');
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
  };

  return (
    <div className="flex h-screen bg-[#0A1628]">
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
          <div className="flex items-center justify-between px-1">
            <span className="text-white/30 text-xs">الصوت</span>
            <button onClick={() => { setVoiceEnabled(!voiceEnabled); stopSpeaking(); }}
              className={`p-1.5 rounded-lg transition-all ${voiceEnabled ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-white/30'}`}>
              {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
          </div>
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-white/30 text-xs mb-2">كيفاش تستخدم</p>
            <p className="text-white/50 text-xs leading-relaxed">
              اضغط على الدائرة وتكلم براحتك. اضغط مرة ثانية باش توقف. المستشار غيجاوبك بصوت مباشرة.
            </p>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col items-center justify-center gap-10 px-8" dir="rtl">
        <div className="text-center">
          <h1 className="text-white font-bold text-3xl mb-2">المستشار الذكي</h1>
          <p className="text-white/40">تكلم بالدارجة · Français · العربية</p>
        </div>

        <div className="relative flex items-center justify-center">
          {(isListening || isSpeaking) && (
            <>
              <div className={`absolute w-64 h-64 rounded-full opacity-10 animate-ping ${isListening ? 'bg-red-500' : 'bg-green-500'}`}></div>
              <div className={`absolute w-52 h-52 rounded-full opacity-20 animate-pulse ${isListening ? 'bg-red-500' : 'bg-green-500'}`}></div>
            </>
          )}
          {isThinking && (
            <div className="absolute w-52 h-52 rounded-full border-4 border-amber-500/30 border-t-amber-500 animate-spin"></div>
          )}
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={isThinking}
            className={`relative w-40 h-40 rounded-full flex flex-col items-center justify-center gap-2 transition-all shadow-2xl ${
              isListening ? 'bg-red-500 shadow-red-500/40 scale-110' :
              isThinking ? 'bg-amber-500/80 shadow-amber-500/40 cursor-not-allowed' :
              isSpeaking ? 'bg-green-500 shadow-green-500/40' :
              'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/40 hover:scale-105 active:scale-95'
            }`}
          >
            {isListening ? (
              <>
                <MicOff size={44} className="text-white" />
                <span className="text-white/80 text-xs">اضغط للإيقاف</span>
              </>
            ) : isThinking ? (
              <>
                <Brain size={44} className="text-white animate-pulse" />
                <span className="text-white/80 text-xs">كيفكر...</span>
              </>
            ) : isSpeaking ? (
              <>
                <Volume2 size={44} className="text-white animate-pulse" />
                <span className="text-white/80 text-xs">كيتكلم</span>
              </>
            ) : (
              <>
                <Mic size={44} className="text-white" />
                <span className="text-white/80 text-xs">اضغط للكلام</span>
              </>
            )}
          </button>
        </div>

        <div className="text-center space-y-3 w-full max-w-lg">
          <p className={`text-sm font-medium ${
            isListening ? 'text-red-400' :
            isThinking ? 'text-amber-400' :
            isSpeaking ? 'text-green-400' :
            'text-white/30'
          }`}>{status}</p>

          {isListening && (
            <div className="flex justify-center gap-1">
              {[2,4,6,8,6,10,6,8,4,2].map((h, i) => (
                <div key={i} className="w-1.5 bg-red-400 rounded-full animate-bounce"
                  style={{height: `${h * 3}px`, animationDelay: `${i * 0.08}s`}}></div>
              ))}
            </div>
          )}

          {transcript && (
            <div className="px-5 py-3 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-white/40 text-xs mb-1">قلت:</p>
              <p className="text-white/80 text-sm leading-relaxed">{transcript}</p>
            </div>
          )}

          {response && !isThinking && (
            <div className="px-5 py-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
              <p className="text-indigo-300 text-xs mb-2">المستشار:</p>
              <p className="text-white/80 text-sm leading-relaxed">{response}</p>
              {isSpeaking && (
                <button onClick={stopSpeaking} className="mt-3 flex items-center gap-2 text-xs text-red-400 hover:text-red-300">
                  <StopCircle size={14} /> إيقاف الصوت
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
