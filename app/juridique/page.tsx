'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Download, Bot, User, Send, Scale, Building2, Users, FileCheck } from 'lucide-react';

type Doc = {
  id: string;
  category: string;
  name: string;
  nameAr: string;
  description: string;
  fields: string[];
};

type Message = { role: 'user' | 'assistant'; content: string };

const docs: Doc[] = [
  { id: 'statuts_sarl', category: 'Creation', name: 'Statuts SARL', nameAr: 'النظام الأساسي SARL', description: 'Statuts constitutifs SARL conforme loi 5-96', fields: ['raison_sociale', 'capital', 'siege', 'associes', 'activite', 'gerant'] },
  { id: 'statuts_sarl_au', category: 'Creation', name: 'Statuts SARL AU', nameAr: 'النظام الأساسي SARL AU', description: 'Statuts pour associe unique SARL AU', fields: ['raison_sociale', 'capital', 'siege', 'associe_unique', 'activite', 'gerant'] },
  { id: 'statuts_sa', category: 'Creation', name: 'Statuts SA', nameAr: 'النظام الأساسي SA', description: 'Statuts pour Societe Anonyme loi 17-95', fields: ['raison_sociale', 'capital', 'siege', 'actionnaires', 'activite', 'conseil'] },
  { id: 'pv_constitution', category: 'Creation', name: 'PV Assemblee Constitutive', nameAr: 'محضر الجمعية التأسيسية', description: 'Proces-verbal de constitution de la societe', fields: ['raison_sociale', 'date', 'associes', 'decisions'] },
  { id: 'transfert_siege', category: 'Modifications', name: 'Transfert Siege Social', nameAr: 'نقل المقر الاجتماعي', description: 'Decision de transfert du siege social', fields: ['raison_sociale', 'ancien_siege', 'nouveau_siege', 'date'] },
  { id: 'changement_nom', category: 'Modifications', name: 'Changement Denomination', nameAr: 'تغيير الاسم التجاري', description: 'Modification de la denomination sociale', fields: ['ancien_nom', 'nouveau_nom', 'date', 'raison'] },
  { id: 'augmentation_capital', category: 'Modifications', name: 'Augmentation Capital', nameAr: 'الزيادة في رأس المال', description: 'Decision augmentation du capital social', fields: ['raison_sociale', 'capital_actuel', 'capital_nouveau', 'modalites'] },
  { id: 'cession_parts', category: 'Cession', name: 'Cession de Parts Sociales', nameAr: 'بيع الحصص الاجتماعية', description: 'Contrat de cession de parts entre associes', fields: ['cedant', 'cessionnaire', 'nombre_parts', 'prix', 'date'] },
  { id: 'entree_associe', category: 'Cession', name: 'Entree Nouvel Associe', nameAr: 'دخول شريك جديد', description: 'Acte entree nouvel associe', fields: ['nouvel_associe', 'apport', 'parts', 'date'] },
  { id: 'dissolution', category: 'Dissolution', name: 'Dissolution Societe', nameAr: 'حل الشركة', description: 'Decision de dissolution volontaire', fields: ['raison_sociale', 'date', 'motif', 'liquidateur'] },
  { id: 'pv_liquidation', category: 'Dissolution', name: 'PV Cloture Liquidation', nameAr: 'محضر إقفال التصفية', description: 'Proces-verbal de cloture de liquidation', fields: ['raison_sociale', 'liquidateur', 'boni', 'date'] },
  { id: 'pv_age', category: 'Decisions', name: 'PV Assemblee Generale', nameAr: 'محضر الجمعية العامة', description: 'Proces-verbal assemblee generale ordinaire', fields: ['raison_sociale', 'date', 'ordre_du_jour', 'decisions', 'participants'] },
  { id: 'pv_distribution', category: 'Decisions', name: 'Distribution Dividendes', nameAr: 'توزيع الأرباح', description: 'Decision de distribution des benefices', fields: ['raison_sociale', 'exercice', 'benefice', 'dividende_par_part'] },
  { id: 'nomination_gerant', category: 'Decisions', name: 'Nomination Gerant', nameAr: 'تعيين مدير', description: 'Decision nomination nouveau gerant', fields: ['raison_sociale', 'nom_gerant', 'date_prise_fonction', 'duree'] },
];

const categories = ['Creation', 'Modifications', 'Cession', 'Dissolution', 'Decisions'];

const fieldLabels: Record<string, string> = {
  raison_sociale: 'Raison sociale de la societe',
  capital: 'Capital social en MAD',
  siege: 'Adresse du siege social',
  associes: 'Noms et parts des associes (ex: Ahmed 50%, Sara 50%)',
  associe_unique: "Nom de l'associe unique",
  activite: 'Objet social / Activite principale',
  gerant: 'Nom complet du gerant',
  actionnaires: 'Noms et actions des actionnaires',
  conseil: "Membres du conseil d'administration",
  date: "Date de l'acte (JJ/MM/AAAA)",
  decisions: 'Decisions prises',
  ancien_siege: 'Ancienne adresse du siege',
  nouveau_siege: 'Nouvelle adresse du siege',
  ancien_nom: 'Ancienne denomination',
  nouveau_nom: 'Nouvelle denomination',
  raison: 'Motif du changement',
  capital_actuel: 'Capital actuel en MAD',
  capital_nouveau: 'Nouveau capital en MAD',
  modalites: "Modalites de l'augmentation",
  cedant: 'Nom du cedant (vendeur)',
  cessionnaire: 'Nom du cessionnaire (acheteur)',
  nombre_parts: 'Nombre de parts cedees',
  prix: 'Prix de cession en MAD',
  nouvel_associe: 'Nom du nouvel associe',
  apport: "Montant de l'apport en MAD",
  parts: 'Nombre de parts attribuees',
  motif: 'Motif de la dissolution',
  liquidateur: 'Nom du liquidateur',
  boni: 'Boni de liquidation en MAD',
  ordre_du_jour: "Points a l'ordre du jour",
  participants: 'Participants presents',
  exercice: 'Exercice fiscal (ex: 2025)',
  benefice: 'Benefice distribuable en MAD',
  dividende_par_part: 'Dividende par part en MAD',
  nom_gerant: 'Nom complet du nouveau gerant',
  date_prise_fonction: 'Date de prise de fonction',
  duree: 'Duree du mandat (ex: 3 ans)',
};

export default function JuridiquePage() {
  const router = useRouter();
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null);
  const [activeCategory, setActiveCategory] = useState('Creation');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldStep, setFieldStep] = useState(0);
  const [fieldData, setFieldData] = useState<Record<string, string>>({});
  const [docReady, setDocReady] = useState(false);
  const [docContent, setDocContent] = useState('');
  const [companyData, setCompanyData] = useState<Record<string, string>>({});

  useEffect(() => {
    const saved = localStorage.getItem('atlas_company');
    if (saved) setCompanyData(JSON.parse(saved));
  }, []);

  const selectDoc = (doc: Doc) => {
    setSelectedDoc(doc);
    setFieldStep(0);
    setFieldData({});
    setDocReady(false);
    setDocContent('');
    setMessages([{
      role: 'assistant',
      content: `📄 ${doc.name} — ${doc.nameAr}\n\n${doc.description}\n\n${companyData.raisonSociale ? `✅ Societe detectee: ${companyData.raisonSociale}\n\n` : ''}${fieldLabels[doc.fields[0]]}?`
    }]);
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedDoc || loading) return;
    const userMsg: Message = { role: 'user', content: input };
    const currentField = selectedDoc.fields[fieldStep];
    const newData = { ...fieldData, [currentField]: input };
    setFieldData(newData);
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const nextStep = fieldStep + 1;
    setFieldStep(nextStep);

    if (nextStep < selectedDoc.fields.length) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: fieldLabels[selectedDoc.fields[nextStep]] + '?' }]);
      }, 300);
    } else {
      setLoading(true);
      setMessages(prev => [...prev, { role: 'assistant', content: '⏳ Generation du document juridique...' }]);
      await generateDoc(newData);
      setLoading(false);
    }
  };

  const generateDoc = async (data: Record<string, string>) => {
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'consultant',
          message: `Tu es un expert juridique marocain specialise en droit des societes.
Genere le document: ${selectedDoc?.name}

SOCIETE:
- Raison sociale: ${companyData.raisonSociale || ''}
- IF: ${companyData.if_fiscal || ''}
- ICE: ${companyData.ice || ''}
- RC: ${companyData.rc || ''}
- Adresse: ${companyData.adresse || ''} ${companyData.ville || ''}

DONNEES:
${Object.entries(data).map(([k, v]) => `${fieldLabels[k] || k}: ${v}`).join('\n')}

EXIGENCES:
- Document formel et complet conforme loi marocaine (Loi 5-96, Loi 17-95, DOC)
- En-tete officiel avec titre en majuscules
- References aux articles de loi applicables
- Articles numerotes (ARTICLE 1, ARTICLE 2...)
- Contenu detaille et professionnel
- Section signatures avec nom, qualite, date, lieu
- Mentions legales obligatoires
- Minimum 2-3 pages de contenu

Genere UNIQUEMENT le document sans explications.`
        }),
      });
      const responseData = await res.json();
      setDocContent(responseData.response);
      setDocReady(true);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `✅ Document genere!\n\n📄 ${selectedDoc?.name} est pret.\n\nConforme aux lois marocaines:\n• Loi 5-96 (SARL)\n• Loi 17-95 (SA)\n• Code de commerce\n\n📥 Telechargez votre PDF →`
      }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erreur. Reessayez.' }]);
    }
  };

  const downloadPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    doc.setFillColor(15, 31, 61);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ATLAS OS ENTERPRISE', 15, 13);
    doc.setFontSize(11);
    doc.text(selectedDoc?.name?.toUpperCase() || '', 15, 23);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Genere le ${new Date().toLocaleDateString('fr-MA')} · Conforme droit marocain`, 15, 31);

    if (companyData.raisonSociale) {
      doc.setFillColor(245, 247, 250);
      doc.rect(15, 40, 180, 18, 'F');
      doc.setTextColor(15, 31, 61);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(companyData.raisonSociale, 20, 49);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const info = [
        companyData.if_fiscal && `IF: ${companyData.if_fiscal}`,
        companyData.ice && `ICE: ${companyData.ice}`,
        companyData.rc && `RC: ${companyData.rc}`
      ].filter(Boolean).join(' | ');
      if (info) doc.text(info, 20, 56);
    }

    doc.setTextColor(50, 50, 50);
    const lines = doc.splitTextToSize(docContent.replace(/\*\*/g, '').replace(/#{1,3} /g, ''), 180);
    let y = companyData.raisonSociale ? 68 : 45;

    lines.forEach((line: string) => {
      if (y > 275) {
        doc.addPage();
        doc.setFillColor(15, 31, 61);
        doc.rect(0, 0, 210, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        doc.text(selectedDoc?.name || '', 15, 8);
        doc.setTextColor(50, 50, 50);
        y = 20;
      }
      if (line.toUpperCase() === line && line.trim().length > 3) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(15, 31, 61);
        y += 2;
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(50, 50, 50);
      }
      doc.text(line, 15, y);
      y += 5.5;
    });

    doc.setFillColor(15, 31, 61);
    doc.rect(0, 285, 210, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.text('Atlas OS Enterprise · Document juridique · Conforme droit marocain', 15, 292);
    doc.text(`Page ${doc.getNumberOfPages()}`, 190, 292, { align: 'right' });

    doc.save(`${selectedDoc?.id}_${new Date().getFullYear()}.pdf`);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-60 bg-[#1B2A4A] flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-white/10">
          <p className="text-white font-bold text-base">Atlas OS</p>
          <p className="text-white/40 text-xs">Enterprise</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <button onClick={() => router.push('/')} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/50 hover:bg-white/10 hover:text-white text-sm transition-all">
            <ArrowLeft size={16} /> Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-white/15 text-white text-sm">
            <Scale size={16} /> Juridique
          </button>
          <div className="mt-3 space-y-0.5">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${activeCategory === cat ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'}`}>
                <FileText size={12} />
                {cat}
                <span className="ml-auto text-white/20">{docs.filter(d => d.category === cat).length}</span>
              </button>
            ))}
          </div>
        </nav>
        {companyData.raisonSociale && (
          <div className="px-4 py-3 border-t border-white/10">
            <div className="bg-white/5 rounded-lg p-2">
              <p className="text-white/30 text-xs mb-1">Societe active</p>
              <p className="text-white/70 text-xs font-medium truncate">{companyData.raisonSociale}</p>
              {companyData.if_fiscal && <p className="text-white/30 text-xs">IF: {companyData.if_fiscal}</p>}
            </div>
          </div>
        )}
      </aside>

      <main className="flex-1 flex overflow-hidden">
        <div className={`${selectedDoc ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-80 border-r border-gray-200 bg-white overflow-hidden shrink-0`}>
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-700 text-sm">{activeCategory}</h2>
            <p className="text-xs text-gray-400">{docs.filter(d => d.category === activeCategory).length} documents</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {docs.filter(d => d.category === activeCategory).map(doc => (
              <button key={doc.id} onClick={() => selectDoc(doc)}
                className={`w-full text-left p-3 rounded-xl border transition-all hover:border-blue-300 hover:shadow-sm ${selectedDoc?.id === doc.id ? 'border-blue-400 bg-blue-50' : 'border-gray-100 bg-white'}`}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#1B2A4A] rounded-lg flex items-center justify-center shrink-0">
                    <FileText size={14} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{doc.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{doc.nameAr}</p>
                    <p className="text-xs text-gray-500 mt-1">{doc.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedDoc ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedDoc(null)} className="lg:hidden text-gray-400 hover:text-gray-600">
                  <ArrowLeft size={18} />
                </button>
                <div className="w-8 h-8 bg-[#1B2A4A] rounded-lg flex items-center justify-center">
                  <FileText size={16} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{selectedDoc.name}</p>
                  <p className="text-xs text-gray-400">{selectedDoc.nameAr}</p>
                </div>
              </div>
              {docReady && (
                <button onClick={downloadPDF} className="flex items-center gap-2 px-3 py-2 bg-[#1B2A4A] text-white rounded-lg text-sm hover:bg-[#243660]">
                  <Download size={14} /> PDF
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && (
                    <div className="w-7 h-7 bg-[#1B2A4A] rounded-full flex items-center justify-center shrink-0 mt-1">
                      <Bot size={14} className="text-white" />
                    </div>
                  )}
                  <div className={`max-w-lg px-4 py-2.5 rounded-xl text-sm leading-relaxed whitespace-pre-line ${m.role === 'user' ? 'bg-[#1B2A4A] text-white rounded-tr-none' : 'bg-white text-gray-700 shadow-sm border border-gray-100 rounded-tl-none'}`}>
                    {m.content}
                  </div>
                  {m.role === 'user' && (
                    <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center shrink-0 mt-1">
                      <User size={14} className="text-gray-600" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 bg-[#1B2A4A] rounded-full flex items-center justify-center shrink-0">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="bg-white px-4 py-2.5 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay:'0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {fieldStep < selectedDoc.fields.length && (
              <div className="bg-white border-t border-gray-200 px-6 py-3">
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Votre reponse..."
                    className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"
                    autoFocus
                  />
                  <button onClick={sendMessage} disabled={loading} className="px-4 py-2.5 bg-[#1B2A4A] text-white rounded-xl hover:bg-[#243660] disabled:opacity-50">
                    <Send size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 hidden lg:flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <Scale size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Selectionnez un document</p>
              <p className="text-gray-400 text-sm mt-1">Choisissez un modele dans la liste</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}