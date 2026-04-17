'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, Send, Bot, User, Download, CheckCircle, BarChart2 } from 'lucide-react';

type Message = { role: 'user' | 'assistant'; content: string; };
type ProjectData = {
  nom: string; secteur: string; ville: string;
  capital: string; loyer: string; employes: string;
  ca_prevu: string; charges: string;
};

const questions = [
  { key: 'nom', q: "Quel est le nom de votre projet ou entreprise?" },
  { key: 'secteur', q: "Dans quel secteur d'activité? (Commerce, Services, Industrie, Restauration, BTP...)" },
  { key: 'ville', q: "Dans quelle ville au Maroc?" },
  { key: 'capital', q: "Quel est votre capital disponible en MAD?" },
  { key: 'loyer', q: "Quel est le loyer mensuel prévu en MAD? (0 si local propre)" },
  { key: 'employes', q: "Combien d'employés prévoyez-vous au démarrage?" },
  { key: 'ca_prevu', q: "Quel chiffre d'affaires mensuel visez-vous (en MAD)?" },
  { key: 'charges', q: "Estimez vos charges mensuelles totales en MAD (hors salaires et loyer)?" },
];

export default function EtudeProjetPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Bonjour! Je suis votre expert en études de faisabilité. Je vais vous poser quelques questions pour créer votre étude complète. Commençons! 🚀\n\n" + questions[0].q }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<ProjectData>>({});
  const [etudeReady, setEtudeReady] = useState(false);
  const [etude, setEtude] = useState('');
  const [generating, setGenerating] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', content: input };
    const currentKey = questions[step]?.key as keyof ProjectData;
    const newData = { ...data, [currentKey]: input };
    setData(newData);
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    const nextStep = step + 1;
    setStep(nextStep);

    if (nextStep < questions.length) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: questions[nextStep].q }]);
      }, 500);
    } else {
      setLoading(true);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Parfait! J'ai toutes les informations. Je génère votre étude de faisabilité complète... ⏳"
      }]);
      await generateEtude(newData as ProjectData);
      setLoading(false);
    }
  };

  const generateEtude = async (projectData: ProjectData) => {
    setGenerating(true);
    try {
      const capital = parseFloat(projectData.capital) || 0;
      const loyer = parseFloat(projectData.loyer) || 0;
      const employes = parseFloat(projectData.employes) || 0;
      const ca = parseFloat(projectData.ca_prevu) || 0;
      const charges = parseFloat(projectData.charges) || 0;
      const salaireMoyen = 4000;
      const totalSalaires = employes * salaireMoyen;
      const totalCharges = loyer + totalSalaires + charges;
      const cnss = totalSalaires * 0.2126;
      const tva = ca * 0.20;
      const resultatMensuel = ca - totalCharges;
      const resultatAnnuel = resultatMensuel * 12;
      const is = resultatAnnuel > 0 ? (resultatAnnuel <= 300000 ? resultatAnnuel * 0.10 : resultatAnnuel * 0.20) : 0;
      const payback = capital > 0 && resultatMensuel > 0 ? Math.ceil(capital / resultatMensuel) : 0;
      const rentabilite = ca > 0 ? ((resultatMensuel / ca) * 100).toFixed(1) : 0;
      const seuilRentabilite = totalCharges;
      const scoreRentabilite = resultatMensuel > 0 ? (resultatMensuel > ca * 0.2 ? 'Excellent' : 'Acceptable') : 'Risqué';
      const couleurScore = resultatMensuel > ca * 0.2 ? '🟢' : resultatMensuel > 0 ? '🟡' : '🔴';

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'consultant',
          message: `Tu es un expert en création d'entreprise au Maroc. Génère une étude de faisabilité COMPLÈTE et PROFESSIONNELLE pour ce projet:

DONNÉES DU PROJET:
- Nom: ${projectData.nom}
- Secteur: ${projectData.secteur}
- Ville: ${projectData.ville}
- Capital: ${capital.toLocaleString()} MAD
- Loyer mensuel: ${loyer.toLocaleString()} MAD
- Employés: ${employes}
- CA mensuel visé: ${ca.toLocaleString()} MAD
- Charges mensuelles: ${charges.toLocaleString()} MAD

CALCULS EFFECTUÉS:
- Total charges mensuelles: ${totalCharges.toLocaleString()} MAD
- Résultat mensuel: ${resultatMensuel.toLocaleString()} MAD
- Résultat annuel: ${resultatAnnuel.toLocaleString()} MAD
- IS estimé: ${is.toLocaleString()} MAD/an
- CNSS patronal: ${cnss.toLocaleString()} MAD/mois
- TVA mensuelle: ${tva.toLocaleString()} MAD
- Seuil de rentabilité: ${seuilRentabilite.toLocaleString()} MAD/mois
- Payback period: ${payback} mois
- Taux de rentabilité: ${rentabilite}%
- Score: ${couleurScore} ${scoreRentabilite}

Génère l'étude en français avec ces sections:
1. RÉSUMÉ EXÉCUTIF
2. PRÉSENTATION DU PROJET
3. ANALYSE DU MARCHÉ MAROCAIN (secteur ${projectData.secteur} à ${projectData.ville})
4. PLAN FINANCIER DÉTAILLÉ (tableau 3 ans)
5. ANALYSE FISCALE (TVA, IS, CNSS obligations)
6. BESOINS EN FINANCEMENT ET OPTIONS (Intelaka, CIH, banques)
7. ANALYSE DES RISQUES
8. RECOMMANDATIONS JURIDIQUES (forme juridique recommandée)
9. CONCLUSION ET DÉCISION

Sois précis, professionnel, et inclus des chiffres réels du marché marocain.`
        }),
      });
      const responseData = await response.json();
      setEtude(responseData.response);
      setEtudeReady(true);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `✅ Votre étude de faisabilité est prête!\n\n${couleurScore} **Score: ${scoreRentabilite}**\n\n📊 Résumé rapide:\n• CA visé: ${ca.toLocaleString()} MAD/mois\n• Charges totales: ${totalCharges.toLocaleString()} MAD/mois\n• Résultat net: ${resultatMensuel.toLocaleString()} MAD/mois\n• Payback: ${payback} mois\n\nScrollez pour voir l'étude complète 👇`
      }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erreur lors de la génération. Réessayez.' }]);
    }
    setGenerating(false);
  };

  const downloadPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    doc.setFillColor(15, 31, 61);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('ETUDE DE FAISABILITE', 15, 18);
    doc.setFontSize(14);
    doc.text(data.nom || 'Mon Projet', 15, 28);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Atlas OS Enterprise · ${new Date().toLocaleDateString('fr-MA')}`, 15, 36);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(etude.replace(/\*\*/g, '').replace(/#{1,3} /g, ''), 180);
    let y = 50;
    lines.forEach((line: string) => {
      if (y > 270) { doc.addPage(); y = 20; }
      if (line.toUpperCase() === line && line.trim().length > 3) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        y += 3;
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
      }
      doc.text(line, 15, y);
      y += 5;
    });

    doc.setFillColor(15, 31, 61);
    doc.rect(0, 285, 210, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.text('Atlas OS Enterprise · Etude de faisabilite · Maroc', 15, 292);

    doc.save(`etude_${data.nom || 'projet'}.pdf`);
  };

  const progress = Math.min((step / questions.length) * 100, 100);

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
            <BarChart2 size={16} /> Etude de Projet
          </button>
        </nav>
        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-white/30 text-xs mb-2">Progression</p>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div className="bg-amber-400 h-2 rounded-full transition-all" style={{width: `${progress}%`}}></div>
          </div>
          <p className="text-white/40 text-xs mt-1">{step}/{questions.length} questions</p>
          {Object.entries(data).map(([k, v]) => (
            <div key={k} className="mt-1">
              <p className="text-white/20 text-xs truncate">{k}: {v}</p>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
              <BarChart2 size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Etude de Faisabilite du Projet</h1>
              <p className="text-xs text-gray-400">IA génère votre étude complète · PDF prêt à imprimer</p>
            </div>
          </div>
          {etudeReady && (
            <button onClick={downloadPDF} className="flex items-center gap-2 px-4 py-2 bg-[#1B2A4A] text-white rounded-lg text-sm hover:bg-[#243660] transition-colors">
              <Download size={16} /> Télécharger PDF
            </button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row">
          {/* Chat */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && (
                    <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shrink-0 mt-1">
                      <Bot size={16} className="text-white" />
                    </div>
                  )}
                  <div className={`max-w-lg px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    m.role === 'user' ? 'bg-[#1B2A4A] text-white rounded-tr-none' : 'bg-white text-gray-700 shadow-sm border border-gray-100 rounded-tl-none'
                  }`}>
                    {m.content}
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
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shrink-0">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay:'0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {step < questions.length && (
              <div className="bg-white border-t border-gray-200 px-6 py-4">
                <div className="flex gap-3">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Votre réponse..."
                    className="flex-1 px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400"
                  />
                  <button onClick={sendMessage} className="px-4 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors">
                    <Send size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Etude Preview */}
          {etudeReady && (
            <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-gray-200 bg-white overflow-y-auto">
              <div className="bg-[#0F1F3D] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-400" />
                  <p className="text-white font-semibold text-sm">Etude Complète</p>
                </div>
                <button onClick={downloadPDF} className="text-amber-400 hover:text-amber-300 text-xs flex items-center gap-1">
                  <Download size={12} /> PDF
                </button>
              </div>
              <div className="p-4 text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                {etude}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}