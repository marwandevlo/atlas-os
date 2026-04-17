'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Bot, User, Download, CheckCircle, BarChart2, Building2 } from 'lucide-react';

type Message = { role: 'user' | 'assistant'; content: string; };

const questions = [
  { key: 'nom_projet', q: "Quel est le nom de votre projet?" },
  { key: 'secteur', q: "Dans quel secteur d'activité? (Commerce, Services, Restauration, BTP, Industrie, Agriculture, Transport, Santé...)" },
  { key: 'forme_juridique', q: "Quelle forme juridique souhaitez-vous?\n1. Auto-entrepreneur\n2. SARL AU (associé unique)\n3. SARL (plusieurs associés)\n4. SA\n5. Je ne sais pas (je veux une recommandation)" },
  { key: 'ville', q: "Dans quelle ville au Maroc?" },
  { key: 'capital', q: "Quel est votre capital disponible en MAD?" },
  { key: 'loyer', q: "Quel est le loyer mensuel prévu en MAD? (0 si local propre)" },
  { key: 'employes', q: "Combien d'employés prévoyez-vous au démarrage?" },
  { key: 'ca_prevu', q: "Quel chiffre d'affaires mensuel visez-vous en MAD?" },
  { key: 'charges', q: "Estimez vos autres charges mensuelles en MAD (fournitures, transport, communication...)" },
  { key: 'financement', q: "Quel type de financement cherchez-vous?\n1. Prêt bancaire\n2. Programme Intelaka\n3. Fonds Hassan II\n4. Investisseur privé\n5. Autofinancement\n6. Plusieurs options" },
  { key: 'description', q: "Décrivez brièvement votre projet et ce qui le différencie de la concurrence." },
];

export default function EtudeProjetPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Bonjour! 👋 Je suis votre expert en création d'entreprise au Maroc.\n\nJe vais créer pour vous une étude de faisabilité professionnelle, prête à soumettre à une banque, un investisseur ou un programme de soutien.\n\nRépondez simplement à mes questions!\n\n" + questions[0].q }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Record<string, string>>({});
  const [etudeReady, setEtudeReady] = useState(false);
  const [etude, setEtude] = useState('');
  const [companyData, setCompanyData] = useState<Record<string, string>>({});

  useEffect(() => {
    const saved = localStorage.getItem('atlas_company');
    if (saved) setCompanyData(JSON.parse(saved));
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', content: input };
    const currentKey = questions[step]?.key;
    const newData = { ...data, [currentKey]: input };
    setData(newData);
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    const nextStep = step + 1;
    setStep(nextStep);

    if (nextStep < questions.length) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: questions[nextStep].q }]);
      }, 400);
    } else {
      setLoading(true);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "✅ Parfait! J'ai toutes les informations nécessaires.\n\n🔄 Génération de votre étude de faisabilité complète en cours...\n\nCela peut prendre quelques secondes ⏳"
      }]);
      await generateEtude(newData);
      setLoading(false);
    }
  };

  const generateEtude = async (projectData: Record<string, string>) => {
    try {
      const capital = parseFloat(projectData.capital) || 0;
      const loyer = parseFloat(projectData.loyer) || 0;
      const employes = parseFloat(projectData.employes) || 0;
      const ca = parseFloat(projectData.ca_prevu) || 0;
      const charges = parseFloat(projectData.charges) || 0;
      const salaireMoyen = 4500;
      const totalSalaires = employes * salaireMoyen;
      const cnssPatronal = totalSalaires * 0.2126;
      const totalCharges = loyer + totalSalaires + cnssPatronal + charges;
      const resultatMensuel = ca - totalCharges;
      const resultatAnnuel = resultatMensuel * 12;
      const tva = ca * 0.20;
      const is = resultatAnnuel > 0 ? (resultatAnnuel <= 300000 ? resultatAnnuel * 0.10 : resultatAnnuel * 0.20) : 0;
      const payback = capital > 0 && resultatMensuel > 0 ? Math.ceil(capital / resultatMensuel) : 0;
      const rentabilite = ca > 0 ? ((resultatMensuel / ca) * 100).toFixed(1) : '0';
      const score = resultatMensuel > ca * 0.25 ? '🟢 EXCELLENT' : resultatMensuel > ca * 0.10 ? '🟡 BON' : resultatMensuel > 0 ? '🟠 ACCEPTABLE' : '🔴 RISQUÉ';

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'consultant',
          message: `Tu es un expert-comptable et conseiller en création d'entreprise au Maroc. 
Génère une étude de faisabilité PROFESSIONNELLE et COMPLÈTE pour ce projet, destinée à être présentée à une banque, un investisseur ou un programme de soutien gouvernemental.

INFORMATIONS DU PORTEUR DE PROJET:
${companyData.raisonSociale ? `Raison sociale: ${companyData.raisonSociale}` : ''}
${companyData.if_fiscal ? `IF: ${companyData.if_fiscal}` : ''}
${companyData.ice ? `ICE: ${companyData.ice}` : ''}
${companyData.rc ? `RC: ${companyData.rc}` : ''}

DONNÉES DU PROJET:
- Nom du projet: ${projectData.nom_projet}
- Secteur: ${projectData.secteur}
- Forme juridique choisie: ${projectData.forme_juridique}
- Ville: ${projectData.ville}
- Capital disponible: ${capital.toLocaleString()} MAD
- Loyer mensuel: ${loyer.toLocaleString()} MAD
- Nombre d'employés: ${employes}
- CA mensuel visé: ${ca.toLocaleString()} MAD
- Charges mensuelles autres: ${charges.toLocaleString()} MAD
- Financement recherché: ${projectData.financement}
- Description: ${projectData.description}

ANALYSE FINANCIÈRE:
- Total charges mensuelles: ${totalCharges.toLocaleString()} MAD
  • Loyer: ${loyer.toLocaleString()} MAD
  • Salaires bruts: ${totalSalaires.toLocaleString()} MAD
  • CNSS patronal (21.26%): ${cnssPatronal.toFixed(0)} MAD
  • Autres charges: ${charges.toLocaleString()} MAD
- Résultat mensuel net: ${resultatMensuel.toLocaleString()} MAD
- Résultat annuel: ${resultatAnnuel.toLocaleString()} MAD
- TVA mensuelle (20%): ${tva.toLocaleString()} MAD
- IS estimé annuel: ${is.toLocaleString()} MAD
- Seuil de rentabilité: ${totalCharges.toLocaleString()} MAD/mois
- Délai de récupération: ${payback} mois
- Taux de rentabilité: ${rentabilite}%
- Score global: ${score}

GÉNÈRE L'ÉTUDE AVEC CES SECTIONS OBLIGATOIRES:

═══════════════════════════════════════
ÉTUDE DE FAISABILITÉ - ${projectData.nom_projet.toUpperCase()}
Préparée par Atlas OS Enterprise
Date: ${new Date().toLocaleDateString('fr-MA')}
═══════════════════════════════════════

1. RÉSUMÉ EXÉCUTIF
[Synthèse du projet, opportunité, viabilité, besoins en financement]

2. PRÉSENTATION DU PORTEUR DE PROJET
[Profil, compétences requises, expérience]

3. DESCRIPTION DU PROJET
[Concept, produits/services, valeur ajoutée, avantage concurrentiel]

4. ANALYSE DU MARCHÉ MAROCAIN
[Taille du marché ${projectData.secteur} à ${projectData.ville}, concurrence, opportunités, tendances 2024-2025]

5. FORME JURIDIQUE ET CADRE LÉGAL
[Analyse ${projectData.forme_juridique}, procédures création, documents requis tribunal de commerce, coûts, délais, obligations fiscales]

6. PLAN FINANCIER DÉTAILLÉ
[Tableau investissements, compte d'exploitation prévisionnel 3 ans, flux de trésorerie, bilan prévisionnel]

7. ANALYSE FISCALE ET SOCIALE
[TVA, IS, IR, CNSS, AMO, obligations déclaratives DGI, avantages fiscaux applicables]

8. BESOINS EN FINANCEMENT ET SOLUTIONS
[Montant exact, options: ${projectData.financement}, conditions Intelaka/Hassan II/banques marocaines, tableau remboursement]

9. ANALYSE SWOT ET RISQUES
[Forces, faiblesses, opportunités, menaces, mesures d'atténuation]

10. PLAN D'ACTION ET CALENDRIER
[Étapes de création, démarrage, objectifs 6 mois / 1 an / 3 ans]

11. CONCLUSION ET RECOMMANDATION
[Avis d'expert, recommandations, score de viabilité]

Sois très précis avec des chiffres réels du marché marocain. Le document doit être prêt à soumettre à une banque.`
        }),
      });
      const responseData = await response.json();
      setEtude(responseData.response);
      setEtudeReady(true);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `🎉 Votre étude de faisabilité est prête!\n\n${score}\n\n📊 Synthèse financière:\n• CA visé: ${ca.toLocaleString()} MAD/mois\n• Charges totales: ${totalCharges.toLocaleString()} MAD/mois\n• Résultat net: ${resultatMensuel.toLocaleString()} MAD/mois\n• Délai retour sur investissement: ${payback} mois\n• Taux de rentabilité: ${rentabilite}%\n\n📄 Téléchargez votre étude PDF prête pour la banque! →`
      }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erreur lors de la génération. Réessayez.' }]);
    }
  };

  const downloadPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    // Cover page
    doc.setFillColor(15, 31, 61);
    doc.rect(0, 0, 210, 297, 'F');
    
    doc.setTextColor(251, 191, 36);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('ATLAS OS ENTERPRISE', 105, 40, { align: 'center' });
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.text('ÉTUDE DE', 105, 100, { align: 'center' });
    doc.text('FAISABILITÉ', 105, 118, { align: 'center' });
    
    doc.setFontSize(18);
    doc.setTextColor(251, 191, 36);
    doc.text(data.nom_projet || 'Mon Projet', 105, 145, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(`Secteur: ${data.secteur || ''}`, 105, 170, { align: 'center' });
    doc.text(`Ville: ${data.ville || ''}`, 105, 182, { align: 'center' });
    doc.text(`Forme juridique: ${data.forme_juridique || ''}`, 105, 194, { align: 'center' });
    
    if (companyData.raisonSociale) {
      doc.text(`Société: ${companyData.raisonSociale}`, 105, 210, { align: 'center' });
    }
    if (companyData.if_fiscal) {
      doc.text(`IF: ${companyData.if_fiscal}`, 105, 220, { align: 'center' });
    }
    
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255, 0.5);
    doc.text(`Document préparé le ${new Date().toLocaleDateString('fr-MA')}`, 105, 260, { align: 'center' });
    doc.text('Confidentiel — Pour usage bancaire et administratif', 105, 270, { align: 'center' });

    // Content pages
    doc.addPage();
    doc.setFillColor(15, 31, 61);
    doc.rect(0, 0, 210, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(`Atlas OS Enterprise · Étude de faisabilité · ${data.nom_projet}`, 15, 10);
    doc.text(new Date().toLocaleDateString('fr-MA'), 185, 10, { align: 'right' });

    doc.setTextColor(0, 0, 0);
    const lines = doc.splitTextToSize(etude.replace(/\*\*/g, '').replace(/#{1,3} /g, ''), 180);
    let y = 25;
    
    lines.forEach((line: string) => {
      if (y > 275) {
        doc.addPage();
        doc.setFillColor(15, 31, 61);
        doc.rect(0, 0, 210, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text(`Atlas OS Enterprise · ${data.nom_projet}`, 15, 10);
        doc.setTextColor(0, 0, 0);
        y = 25;
      }
      
      if (line.includes('═') || (line.toUpperCase() === line && line.trim().length > 5 && !line.includes('MAD'))) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(15, 31, 61);
        y += 4;
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(50, 50, 50);
      }
      doc.text(line, 15, y);
      y += 5.5;
    });

    // Footer on last page
    doc.setFillColor(15, 31, 61);
    doc.rect(0, 282, 210, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.text('Atlas OS Enterprise · Logiciel de comptabilité et gestion · Maroc', 15, 291);
    doc.text(`Page ${doc.getNumberOfPages()}`, 190, 291);

    doc.save(`etude_faisabilite_${data.nom_projet || 'projet'}.pdf`);
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
        <div className="px-4 py-4 border-t border-white/10 space-y-3">
          <div>
            <p className="text-white/30 text-xs mb-1">Progression</p>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-amber-400 h-2 rounded-full transition-all duration-500" style={{width: `${progress}%`}}></div>
            </div>
            <p className="text-white/40 text-xs mt-1">{step}/{questions.length} questions</p>
          </div>
          {companyData.raisonSociale && (
            <div className="bg-white/5 rounded-lg p-2">
              <p className="text-white/30 text-xs mb-1">Société détectée</p>
              <div className="flex items-center gap-2">
                <Building2 size={12} className="text-amber-400" />
                <p className="text-white/60 text-xs">{companyData.raisonSociale}</p>
              </div>
              {companyData.if_fiscal && <p className="text-white/30 text-xs mt-0.5">IF: {companyData.if_fiscal}</p>}
            </div>
          )}
          {Object.entries(data).slice(-3).map(([k, v]) => (
            <div key={k} className="flex items-start gap-1">
              <CheckCircle size={10} className="text-green-400 mt-0.5 shrink-0" />
              <p className="text-white/30 text-xs truncate">{v}</p>
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
              <h1 className="text-xl font-bold text-gray-800">Étude de Faisabilité du Projet</h1>
              <p className="text-xs text-gray-400">Document professionnel · Prêt pour banque / investisseur / Intelaka</p>
            </div>
          </div>
          {etudeReady && (
            <button onClick={downloadPDF} className="flex items-center gap-2 px-4 py-2 bg-[#1B2A4A] text-white rounded-lg text-sm hover:bg-[#243660] transition-colors">
              <Download size={16} /> Télécharger PDF
            </button>
          )}
        </header>

        <div className="flex-1 overflow-hidden flex">
          <div className="flex-1 flex flex-col overflow-hidden">
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
                    <div className="flex gap-1 items-center">
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{animationDelay:'0.1s'}}></div>
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></div>
                      <span className="text-xs text-gray-400 ml-2">Génération en cours...</span>
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
                    autoFocus
                  />
                  <button onClick={sendMessage} disabled={loading} className="px-4 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50">
                    <Send size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {etudeReady && (
            <div className="w-96 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
              <div className="bg-[#0F1F3D] px-4 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-400" />
                  <p className="text-white font-semibold text-sm">Étude Complète</p>
                </div>
                <button onClick={downloadPDF} className="flex items-center gap-1 text-amber-400 hover:text-amber-300 text-xs">
                  <Download size={12} /> PDF
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                {etude}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}