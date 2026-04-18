'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Download, Bot, User, Send, Scale, Search, Share2 } from 'lucide-react';

type Company = {
  id: number;
  raisonSociale: string;
  formeJuridique: string;
  if_fiscal: string;
  ice: string;
  rc: string;
  cnss: string;
  adresse: string;
  ville: string;
  telephone: string;
  email: string;
  activite: string;
  regimeTVA: string;
  actif: boolean;
};

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

const cleanText = (text: string) => text
  .replace(/\*\*/g, '').replace(/#{1,3} /g, '').replace(/```[\s\S]*?```/g, '')
  .replace(/`/g, '').replace(/%[A-Z]/g, '').replace(/\[.*?\]/g, '')
  .replace(/&nbsp;/g, ' ').replace(/<[^>]*>/g, '').replace(/\|/g, ' ').trim();

export default function JuridiquePage() {
  const router = useRouter();
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null);
  const [activeCategory, setActiveCategory] = useState('Creation');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [fieldData, setFieldData] = useState<Record<string, string>>({});
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchCompany, setSearchCompany] = useState('');
  const [phase, setPhase] = useState<'select_company' | 'doc'>('select_company');
  const [docReady, setDocReady] = useState(false);
  const [docContent, setDocContent] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('atlas_companies');
    if (saved) setCompanies(JSON.parse(saved));
  }, []);

  const filteredCompanies = companies.filter(c =>
    c.raisonSociale.toLowerCase().includes(searchCompany.toLowerCase()) ||
    c.ville.toLowerCase().includes(searchCompany.toLowerCase())
  );

  const selectDoc = (doc: Doc) => {
    setSelectedDoc(doc);
    setStep(0);
    setFieldData({});
    setDocReady(false);
    setDocContent('');
    setSelectedCompany(null);
    setSearchCompany('');
    setPhase('select_company');
    setMessages([{ role: 'assistant', content: `📄 ${doc.name} — ${doc.nameAr}\n\n${doc.description}\n\nPour quelle societe souhaitez-vous ce document?\nChoisissez dans la liste.` }]);
  };

  const chooseCompany = (company: Company) => {
    setSelectedCompany(company);
    setPhase('doc');
    setStep(0);
    setMessages(prev => [...prev,
      { role: 'user', content: `✅ ${company.raisonSociale}` },
      { role: 'assistant', content: `✅ Societe: ${company.raisonSociale}\nIF: ${company.if_fiscal} | RC: ${company.rc} | ${company.ville}\n\n${fieldLabels[selectedDoc!.fields[0]]}?` }
    ]);
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedDoc || loading) return;
    const currentField = selectedDoc.fields[step];
    const newData = { ...fieldData, [currentField]: input };
    setFieldData(newData);
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    const nextStep = step + 1;
    setStep(nextStep);

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
      const company = selectedCompany!;
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'consultant',
          message: `Tu es un expert juridique marocain specialise en droit des societes.
Genere le document: ${selectedDoc?.name}

SOCIETE:
- Raison sociale: ${company.raisonSociale}
- Forme juridique: ${company.formeJuridique}
- IF: ${company.if_fiscal}
- ICE: ${company.ice}
- RC: ${company.rc}
- CNSS: ${company.cnss}
- Adresse: ${company.adresse} ${company.ville}
- Tel: ${company.telephone}
- Activite: ${company.activite}

DONNEES:
${Object.entries(data).map(([k, v]) => `${fieldLabels[k] || k}: ${v}`).join('\n')}

REGLES STRICTES:
- N'utilise JAMAIS de tableaux ASCII (%, |, +, T, Z, W, Q, P comme bordures)
- N'utilise JAMAIS de HTML ou balises
- Ecris tout en texte simple avec tirets et numeros

EXIGENCES:
1. En-tete: nom societe, adresse, IF, ICE, RC
2. Titre officiel en majuscules
3. "Fait a ${company.ville}, le [date]"
4. Articles numerotes (ARTICLE 1, ARTICLE 2...)
5. Conforme loi marocaine (Loi 5-96, Loi 17-95, DOC)
6. Minimum 12 articles pour les statuts
7. Signatures: nom, qualite, date, lieu
8. Minimum 2-3 pages

Genere UNIQUEMENT le document en texte propre, sans commentaires.`
        }),
      });
      const responseData = await res.json();
      setDocContent(responseData.response);
      setDocReady(true);
      setMessages(prev => [...prev, { role: 'assistant', content: `✅ Document juridique genere!\n\n📄 ${selectedDoc?.name}\n🏢 ${company.raisonSociale}\n\nConforme droit marocain.\n\n📥 Telechargez en PDF ou Word →` }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erreur. Reessayez.' }]);
    }
  };

  const downloadPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const clean = cleanText(docContent);
    const lines = doc.splitTextToSize(clean, 175);
    let y = 20;
    lines.forEach((line: string) => {
      if (y > 278) { doc.addPage(); y = 20; }
      const t = line.trim();
      if (!t) { y += 3; return; }
      if (t.toUpperCase() === t && t.length > 5 && !t.includes('MAD') && !t.includes(':')) {
        doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(15, 31, 61); y += 3;
      } else if (t.startsWith('ARTICLE') || t.startsWith('Art.')) {
        doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(15, 31, 61); y += 2;
      } else {
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(30, 30, 30);
      }
      doc.text(line, 15, y);
      y += 5.5;
    });
    doc.save(`${selectedDoc?.id}_${selectedCompany?.raisonSociale.replace(/ /g, '_')}.pdf`);
  };

  const downloadWord = async () => {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx');
    const clean = cleanText(docContent);
    const paragraphs = clean.split('\n').map(line => {
      const t = line.trim();
      if (!t) return new Paragraph({ text: '' });
      if (t.toUpperCase() === t && t.length > 5 && !t.includes('MAD')) {
        return new Paragraph({ text: t, heading: HeadingLevel.HEADING_2 });
      }
      if (t.startsWith('ARTICLE')) {
        return new Paragraph({ text: t, heading: HeadingLevel.HEADING_3 });
      }
      return new Paragraph({ children: [new TextRun({ text: t, size: 22 })] });
    });
    const wordDoc = new Document({ sections: [{ properties: {}, children: paragraphs }] });
    const blob = await Packer.toBlob(wordDoc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedDoc?.id}_${selectedCompany?.raisonSociale.replace(/ /g, '_')}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareDocument = async () => {
    const text = `${selectedDoc?.name}\n${selectedCompany?.raisonSociale}\n\n${docContent.substring(0, 500)}...`;
    if (navigator.share) {
      await navigator.share({ title: selectedDoc?.name, text });
    } else {
      await navigator.clipboard.writeText(text);
      alert('Copie dans le presse-papier!');
    }
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
        {selectedCompany && (
          <div className="px-4 py-3 border-t border-white/10">
            <div className="bg-white/5 rounded-lg p-2">
              <p className="text-white/30 text-xs mb-1">Societe selectionnee</p>
              <p className="text-white/70 text-xs font-medium truncate">{selectedCompany.raisonSociale}</p>
              <p className="text-white/30 text-xs">{selectedCompany.ville}</p>
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
                  <p className="text-xs text-gray-400">{selectedCompany ? selectedCompany.raisonSociale : 'Selectionnez une societe'}</p>
                </div>
              </div>
              {docReady && (
                <div className="flex gap-2">
                  <button onClick={downloadPDF} className="flex items-center gap-1 px-3 py-2 bg-[#1B2A4A] text-white rounded-lg text-xs hover:bg-[#243660]">
                    <Download size={13} /> PDF
                  </button>
                  <button onClick={downloadWord} className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-xs hover:bg-blue-600">
                    <Download size={13} /> Word
                  </button>
                  <button onClick={shareDocument} className="flex items-center gap-1 px-3 py-2 bg-amber-500 text-white rounded-lg text-xs hover:bg-amber-600">
                    <Share2 size={13} /> Partager
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-hidden flex">
              <div className="flex-1 flex flex-col overflow-hidden">
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

                {phase === 'doc' && !docReady && (
                  <div className="bg-white border-t border-gray-200 px-6 py-3">
                    <div className="flex gap-2">
                      <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        placeholder="Votre reponse..." className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400" autoFocus />
                      <button onClick={sendMessage} disabled={loading} className="px-4 py-2.5 bg-[#1B2A4A] text-white rounded-xl hover:bg-[#243660] disabled:opacity-50">
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {phase === 'select_company' && (
                <div className="w-80 border-l border-gray-200 bg-white flex flex-col overflow-hidden shrink-0">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <p className="font-semibold text-gray-700 text-sm">Choisir la societe</p>
                    <p className="text-xs text-gray-400">{companies.length} societes disponibles</p>
                  </div>
                  <div className="px-3 py-2 border-b border-gray-100">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input value={searchCompany} onChange={e => setSearchCompany(e.target.value)}
                        placeholder="Rechercher..." className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filteredCompanies.map(c => (
                      <button key={c.id} onClick={() => chooseCompany(c)}
                        className="w-full text-left p-3 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-all">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 ${c.actif ? 'bg-blue-500' : 'bg-[#1B2A4A]'}`}>
                            {c.raisonSociale.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 text-sm truncate">{c.raisonSociale}</p>
                            <p className="text-xs text-gray-400">{c.ville} · {c.formeJuridique}</p>
                            {c.if_fiscal && <p className="text-xs text-gray-300 font-mono">IF: {c.if_fiscal}</p>}
                          </div>
                          {c.actif && <span className="text-xs text-blue-500 font-medium shrink-0">Active</span>}
                        </div>
                      </button>
                    ))}
                    {filteredCompanies.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-400 text-sm">Aucune societe trouvee</p>
                        <button onClick={() => router.push('/companies')} className="mt-2 text-xs text-blue-500 hover:underline">
                          + Ajouter une societe
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 hidden lg:flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <Scale size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Selectionnez un document juridique</p>
              <p className="text-gray-400 text-sm mt-1">Statuts, PV, cessions...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}