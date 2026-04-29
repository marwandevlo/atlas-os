'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Brain, Mic, MicOff, Volume2, VolumeX, StopCircle, Send, Search, Loader2, User, Globe, Sparkles } from 'lucide-react';

type Message = { role: 'user' | 'assistant'; content: string; isVoice?: boolean; isSearching?: boolean; };
type Memory = { key: string; value: string; timestamp: number; };

function loadCompanyContext(): string {
  if (typeof window === 'undefined') return '';
  try {
    const raw = localStorage.getItem('atlas_company') || localStorage.getItem('atlas_companies');
    if (!raw) return '';
    const data = JSON.parse(raw);
    const c = Array.isArray(data) ? data[0] : data;
    if (!c) return '';
    return `[Société: ${c.raisonSociale || ''} | ${c.formeJuridique || ''} | IF: ${c.if_fiscal || ''} | ICE: ${c.ice || ''} | RC: ${c.rc || ''} | TVA: ${c.regimeTVA || ''} | Ville: ${c.ville || ''}]`;
  } catch { return ''; }
}

export default function ConsultantPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: 'سلام! أنا المستشار الذكي ديالك 🤖\n\nقادر نجاوبك بالدارجة، الفرنسية أو العربية على كل شي يخص:\n• الضرائب المغربية (TVA, IS, IR, CNSS)\n• القانون التجاري والمحاسبة\n• إنشاء الشركات والإجراءات\n• البحث في أحدث المعلومات\n\nكتكلم أو كتكتب — أنا هنا! 💬🎤'
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [memory, setMemory] = useState<Memory[]>([]);
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  // Load memory from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('atlas_consultant_memory');
      if (saved) setMemory(JSON.parse(saved));
    } catch {}
  }, []);

  const saveMemory = useCallback((key: string, value: string) => {
    setMemory(prev => {
      const updated = [...prev.filter(m => m.key !== key), { key, value, timestamp: Date.now() }].slice(-20);
      localStorage.setItem('atlas_consultant_memory', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const buildSystemPrompt = useCallback(() => {
    const company = loadCompanyContext();
    const memoryContext = memory.slice(-10).map(m => `${m.key}: ${m.value}`).join('\n');
    const recentTopics = messages.slice(-6).filter(m => m.role === 'user').map(m => m.content).join(', ');

    return `أنت مستشار ضريبي ومالي مغربي محترف اسمك أطلس. خبير في القانون الجبائي والتجاري المغربي.

قواعد اللغة الصارمة:
- إذا السؤال بالدارجة المغربية → جاوب بالدارجة المغربية فقط مثل: "واه! TVA فالمغرب كتكون 20%، خاصك..."
- إذا السؤال بالفرنسية → جاوب بالفرنسية فقط، رسمية ومهنية
- إذا السؤال بالعربية الفصحى → جاوب بالعربية الفصحى
- ممنوع الإنجليزية إطلاقاً

أسلوب الدارجة المغربية:
- استخدم: واه، مزيان، خاصك، غتدير، كيكون، فالمغرب، دراهم، مليم
- مثال صحيح: "واه صاحبي، TVA ديال الخدمات كتكون 20%، ولكن كاين استثناءات. خاصك تعرف أن..."
- مثال خاطئ: "نعم، معدل TVA هو 20%"

أرقام حقيقية 2024:
- TVA: 20% عام | 14% كهرباء/ماء | 10% فندقة/مطاعم | 7% أدوية
- IS: 10% حتى 300,000 | 20% حتى 1,000,000 | 26% فوق 1,000,000
- IR: معفى حتى 30,000 | 10% حتى 50,000 | 20% حتى 60,000 | 30% حتى 80,000 | 34% فوق 80,000
- CNSS salariale: 4.48% | CNSS patronale: 21.26% | AMO: 2.26%
- Cotisation minimale IS: 0.5% من CA (minimum 3,000 MAD)

${company ? `معلومات الشركة:\n${company}` : ''}
${memoryContext ? `ما تعلمته من المحادثات السابقة:\n${memoryContext}` : ''}
${recentTopics ? `مواضيع المحادثة الحالية: ${recentTopics}` : ''}

طول الإجابة: 2-4 جمل للأسئلة البسيطة، أكثر للمعقدة. ابدأ مباشرة بالإجابة.`;
  }, [memory, messages]);

  const speak = useCallback(async (text: string) => {
    if (!voiceEnabled) return;
    try {
      if (sourceRef.current) { try { sourceRef.current.stop(); } catch {} sourceRef.current = null; }
      if (audioContextRef.current) { try { audioContextRef.current.close(); } catch {} audioContextRef.current = null; }
      setIsSpeaking(true);
      const clean = text.replace(/[*#_`•\[\]]/g, '').replace(/\n+/g, ' ').substring(0, 800);
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: clean, voice: 'echo', model: 'tts-1-hd', speed: 1.0 }),
      });
      if (!res.ok) throw new Error('TTS failed');
      const buffer = await res.arrayBuffer();
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;
      if (ctx.state === 'suspended') await ctx.resume();
      const audioBuffer = await ctx.decodeAudioData(buffer);
      const source = ctx.createBufferSource();
      sourceRef.current = source;
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => { setIsSpeaking(false); sourceRef.current = null; };
      source.start(0);
    } catch { setIsSpeaking(false); }
  }, [voiceEnabled]);

  const stopSpeaking = useCallback(() => {
    try { if (sourceRef.current) { sourceRef.current.stop(); sourceRef.current = null; } } catch {}
    try { if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; } } catch {}
    setIsSpeaking(false);
  }, []);

  const askClaude = useCallback(async (question: string, isVoice = false) => {
    setLoading(true);
    const userMsg: Message = { role: 'user', content: question, isVoice };
    setMessages(prev => [...prev, userMsg]);

    // Check if needs web search
    const needsSearch = /\b(2024|2025|2026|actualité|nouveau|récent|dernièr|جديد|حديث|دابا|هداشي)\b/i.test(question);

    let searchContext = '';
    if (needsSearch) {
      setIsSearching(true);
      try {
        const searchRes = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'consultant',
            message: `Recherche web: ${question}. Donne les informations les plus récentes sur ce sujet fiscal/juridique au Maroc en 2024-2025.`
          }),
        });
        const searchData = await searchRes.json();
        searchContext = searchData.response ? `\n[Contexte recherché]: ${searchData.response.substring(0, 500)}` : '';
      } catch {}
      setIsSearching(false);
    }

    try {
      const systemPrompt = buildSystemPrompt();
      const conversationHistory = messages.slice(-8).map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'consultant',
          message: `${systemPrompt}\n\nSUIT LA CONVERSATION:\n${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}\n\nQuestion: ${question}${searchContext}`
        }),
      });
      const data = await res.json();
      const response = data.response || 'عفواً، وقع خطأ. عاود المحاولة.';

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);

      // Auto-learn: save important info
      if (question.length > 20) {
        const topic = question.substring(0, 50);
        saveMemory(`topic_${Date.now()}`, `Q: ${topic} → A: ${response.substring(0, 100)}`);
      }

      if (isVoice || voiceEnabled) await speak(response);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'خطأ في الاتصال. عاود المحاولة.' }]);
    } finally {
      setLoading(false);
    }
  }, [buildSystemPrompt, messages, speak, voiceEnabled, saveMemory]);

  const startListening = useCallback(async () => {
    if (isSpeaking) stopSpeaking();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 } });
      audioChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setIsListening(false);
        if (blob.size < 1000) return;
        setLoading(true);
        try {
          const formData = new FormData();
          const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
          formData.append('audio', blob, `audio.${ext}`);
          const res = await fetch('/api/whisper', { method: 'POST', body: formData });
          const whisperData = await res.json();
          if (whisperData.text?.trim()) {
            setLoading(false);
            await askClaude(whisperData.text.trim(), true);
          } else {
            setLoading(false);
          }
        } catch { setLoading(false); }
      };
      recorder.start(250);
      setIsListening(true);
    } catch { alert('خاصك تسمح للميكرو'); }
  }, [isSpeaking, stopSpeaking, askClaude]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
    setIsListening(false);
  }, []);

  const handleSend = useCallback(() => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput('');
    askClaude(text, false);
  }, [input, loading, askClaude]);

  const SUGGESTIONS = [
    'شحال TVA ديال الخدمات فالمغرب؟',
    'كيفاش ندير تصريح CNSS لموظف جديد؟',
    'شحال IS ديال SARL فالمغرب؟',
    'Quelles sont les échéances TVA 2024?',
    'كيفاش نسجل شركة SARL AU فالمغرب؟',
  ];

  return (
    <div className="flex h-screen bg-[#0A1628]" dir="rtl">
      {/* Sidebar */}
      <aside className="w-56 bg-[#1B2A4A] flex flex-col shrink-0 border-l border-white/10">
        <div className="px-5 py-4 border-b border-white/10">
          <p className="text-white font-bold text-sm">Atlas OS</p>
          <p className="text-white/40 text-xs">Enterprise</p>
        </div>
        <nav className="flex-1 px-3 py-3 space-y-1">
          <button onClick={() => router.push('/')} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/50 hover:bg-white/10 hover:text-white text-sm transition-all">
            <ArrowLeft size={15} /> Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-indigo-500/20 text-indigo-300 text-sm border border-indigo-500/30">
            <Brain size={15} /> المستشار الذكي
          </button>
        </nav>
        <div className="px-4 py-3 border-t border-white/10 space-y-3">
          {/* Voice toggle */}
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-xs">الصوت</span>
            <button onClick={() => { setVoiceEnabled(!voiceEnabled); stopSpeaking(); }}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all ${voiceEnabled ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-white/30'}`}>
              {voiceEnabled ? <><Volume2 size={12} /> مفعل</> : <><VolumeX size={12} /> موقف</>}
            </button>
          </div>
          {/* Memory indicator */}
          <div className="bg-white/5 rounded-lg p-2">
            <p className="text-white/30 text-xs mb-1 flex items-center gap-1">
              <Sparkles size={10} className="text-amber-400" /> ذاكرة المستشار
            </p>
            <p className="text-white/50 text-xs">{memory.length} معلومة محفوظة</p>
          </div>
          {/* Clear memory */}
          {memory.length > 0 && (
            <button onClick={() => { setMemory([]); localStorage.removeItem('atlas_consultant_memory'); }}
              className="w-full text-xs text-white/20 hover:text-white/40 transition-colors">
              مسح الذاكرة
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-[#1B2A4A] border-b border-white/10 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
              <Brain size={18} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-white font-bold text-base">المستشار الذكي</h1>
              <p className="text-white/40 text-xs">دارجة • Français • العربية | بحث ذكي + صوت</p>
            </div>
          </div>
          {isSpeaking && (
            <button onClick={stopSpeaking} className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs border border-red-500/30 hover:bg-red-500/30">
              <StopCircle size={14} /> إيقاف الصوت
            </button>
          )}
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0 mt-1 border border-indigo-500/30">
                  {msg.isVoice ? <Mic size={14} className="text-indigo-400" /> : <User size={14} className="text-indigo-400" />}
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tl-none'
                  : 'bg-[#1B2A4A] text-white/90 border border-white/10 rounded-tr-none'
              }`}>
                {msg.content}
              </div>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0 mt-1 border border-amber-500/30">
                  <Brain size={14} className="text-amber-400" />
                </div>
              )}
            </div>
          ))}

          {/* Loading states */}
          {isSearching && (
            <div className="flex gap-3 justify-end">
              <div className="bg-[#1B2A4A] border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-2">
                <Globe size={14} className="text-blue-400 animate-pulse" />
                <span className="text-white/60 text-sm">كيبحث في الإنترنت...</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Brain size={14} className="text-amber-400" />
              </div>
            </div>
          )}
          {loading && !isSearching && (
            <div className="flex gap-3 justify-end">
              <div className="bg-[#1B2A4A] border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-2">
                <Loader2 size={14} className="text-indigo-400 animate-spin" />
                <span className="text-white/60 text-sm">كيفكر...</span>
                {isSpeaking && <Volume2 size={14} className="text-green-400 animate-pulse" />}
              </div>
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Brain size={14} className="text-amber-400" />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Voice visualizer when listening */}
        {isListening && (
          <div className="px-6 py-3 bg-[#1B2A4A] border-t border-white/10 flex items-center justify-center gap-2">
            {[3,5,8,5,9,6,4,7,5,3].map((h, i) => (
              <div key={i} className="w-1.5 bg-red-400 rounded-full animate-bounce"
                style={{ height: `${h * 4}px`, animationDelay: `${i * 0.08}s` }} />
            ))}
            <span className="text-red-400 text-sm mr-3">كيسمع...</span>
          </div>
        )}

        {/* Suggestions */}
        {messages.length <= 2 && (
          <div className="px-6 py-2 border-t border-white/5 flex gap-2 flex-wrap">
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => askClaude(s)} disabled={loading}
                className="text-xs px-3 py-1.5 bg-white/5 text-white/50 rounded-full hover:bg-indigo-500/20 hover:text-indigo-300 transition-all border border-white/10 disabled:opacity-40">
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="bg-[#1B2A4A] border-t border-white/10 px-6 py-4">
          {/* Mode toggle */}
          <div className="flex gap-2 mb-3">
            <button onClick={() => setInputMode('text')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${inputMode === 'text' ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40' : 'text-white/30 hover:text-white/50'}`}>
              <Send size={12} /> كتابة
            </button>
            <button onClick={() => setInputMode('voice')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${inputMode === 'voice' ? 'bg-red-500/30 text-red-300 border border-red-500/40' : 'text-white/30 hover:text-white/50'}`}>
              <Mic size={12} /> صوت
            </button>
          </div>

          {inputMode === 'text' ? (
            <div className="flex gap-3">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder="اكتب سؤالك بالدارجة أو الفرنسية..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-indigo-500/50"
                disabled={loading}
                autoFocus
              />
              <button onClick={handleSend} disabled={loading || !input.trim()}
                className="px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-40 transition-colors">
                <Send size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={loading}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  isListening ? 'bg-red-500 shadow-red-500/40 scale-110' :
                  loading ? 'bg-amber-500/80 cursor-not-allowed' :
                  'bg-indigo-600 hover:bg-indigo-500 hover:scale-105 active:scale-95'
                }`}
              >
                {isListening ? <MicOff size={28} className="text-white" /> :
                 loading ? <Loader2 size={28} className="text-white animate-spin" /> :
                 <Mic size={28} className="text-white" />}
              </button>
              <p className="text-white/50 text-sm">
                {isListening ? 'اضغط لإيقاف' : loading ? 'كيفكر...' : 'اضغط وتكلم'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
