'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Download, Scale, Search, Building2, RefreshCw, ChevronRight, CheckCircle, Loader2 } from 'lucide-react';

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

type GeneratedDoc = {
  id: string;
  name: string;
  content: string;
  status: 'pending' | 'generating' | 'done' | 'error';
};

const cleanText = (text: string) => text
  .replace(/\*\*/g, '').replace(/#{1,3} /g, '').replace(/```[\s\S]*?```/g, '')
  .replace(/`/g, '').replace(/%[A-Z]/g, '').replace(/\[.*?\]/g, '')
  .replace(/&nbsp;/g, ' ').replace(/<[^>]*>/g, '').replace(/\|/g, ' ').trim();

const callAI = async (message: string) => {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'consultant', message }),
  });
  const data = await res.json();
  return data.response as string;
};

const isCenteredLine = (t: string): boolean => {
  if (!t || t.length < 2) return false;
  if (t.startsWith('SOCIETE A RESPONSABILITE')) return true;
  if (t.startsWith('SIEGE SOCIAL:')) return true;
  if (t === 'STATUTS') return true;
  if (t === 'CESSION DE PARTS SOCIALES') return true;
  if (t.startsWith('CONTRAT DE')) return true;
  if (t.startsWith('PROCES-VERBAL')) return true;
  if (t.startsWith('DECISION EXTRAORDINAIRE')) return true;
  if (t.startsWith('LETTRE DE DEMISSION')) return true;
  if (t.startsWith('ACCORD DE CONFIDENTIALITE')) return true;
  if (t.startsWith('REGISTRE DU COMMERCE')) return true;
  if (t === 'LES ASSOCIES') return true;
  if (t === "D'UNE PART") return true;
  if (t === "D'AUTRE PART") return true;
  if (t === 'DONT QUITTANCE') return true;
  const isAllCaps = t === t.toUpperCase();
  const noFiscal = !t.includes('MAD') && !t.includes(' IF') && !t.includes(' ICE') && !t.includes(' RC') && !t.includes('N°');
  const noPrefix = !t.startsWith('ARTICLE') && !t.startsWith('TITRE') && !t.startsWith('IL ') && !t.startsWith('LE ') && !t.startsWith('LA ') && !t.startsWith('FAIT') && !t.startsWith('ENTRE') && !t.startsWith('PAR ');
  return isAllCaps && noFiscal && noPrefix && t.length < 80;
};

const downloadSinglePDF = async (content: string, filename: string) => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const clean = cleanText(content);
  const lines = doc.splitTextToSize(clean, 175);
  let y = 20;
  lines.forEach((line: string) => {
    if (y > 278) { doc.addPage(); y = 20; }
    const t = line.trim();
    if (!t) { y += 3; return; }
    const centered = isCenteredLine(t);
    if (t.startsWith('TITRE')) {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(15, 31, 61); y += 4;
    } else if (t.startsWith('ARTICLE') || t.startsWith('Art.')) {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(15, 31, 61); y += 2;
    } else if (centered) {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(15, 31, 61); y += 2;
    } else {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(30, 30, 30);
    }
    doc.text(line, centered ? 105 : 15, y, { align: centered ? 'center' : 'left' });
    y += 5.5;
  });
  doc.save(filename);
};

// ==================== CREATION FORM ====================
function CreationForm({ companies }: { companies: Company[] }) {
  const [step, setStep] = useState<'select' | 'form' | 'generating' | 'done'>('select');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    associes: '', capital: '', activite: '', gerant: '', cin_gerant: '',
    adresse_gerant: '', date_naissance_gerant: '', date: new Date().toLocaleDateString('fr-FR'),
  });
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDoc[]>([]);

  const filtered = companies.filter(c => c.raisonSociale.toLowerCase().includes(search.toLowerCase()));
  const docsToGenerate = [
    { id: 'statuts', name: 'Statuts SARL' },
    { id: 'pv_constitution', name: 'PV Constitution' },
    { id: 'domiciliation', name: 'Contrat Domiciliation' },
    { id: 'depot_legal', name: 'Dépôt Légal RC' },
  ];

  const generateAll = async () => {
    if (!selectedCompany) return;
    setStep('generating');
    const docs: GeneratedDoc[] = docsToGenerate.map(d => ({ ...d, content: '', status: 'pending' as const }));
    setGeneratedDocs(docs);
    const c = selectedCompany;
    const f = formData;
    const base = `SOCIETE: ${c.raisonSociale} | SARL | Capital: ${f.capital} DH
IF: ${c.if_fiscal} | ICE: ${c.ice} | RC: ${c.rc} | CNSS: ${c.cnss}
Adresse siege: ${c.adresse} ${c.ville} | Tel: ${c.telephone}
Associes: ${f.associes} | Activite: ${f.activite}
Gerant: ${f.gerant} | CIN: ${f.cin_gerant} | Adresse: ${f.adresse_gerant} | Naissance: ${f.date_naissance_gerant}
Date acte: ${f.date}`;

    // STATUTS
    setGeneratedDocs(prev => prev.map(d => d.id === 'statuts' ? { ...d, status: 'generating' as const } : d));
    try {
      const p1 = await callAI(`Expert juridique marocain. Genere Titres I-IV statuts SARL.
${base}
EN-TETE: "${c.raisonSociale}" / "SOCIETE A RESPONSABILITE LIMITEE AU CAPITAL DE [EN LETTRES] ([CHIFFRES]) DIRHAMS" / "SIEGE SOCIAL: ${c.adresse} ${c.ville}" / "ICE: ${c.ice}   IF: ${c.if_fiscal}" / "STATUTS"
LES SOUSSIGNES: [chaque associe: NOM, nationalite marocaine, ne le [DATE] a [VILLE], demeurant [ADRESSE], CIN [N]]
"A etabli ainsi qu'il suit les statuts..."
TITRE PREMIER: Art.1 Formation (Dahir 1-97-49/loi 5-96 et Dahir 1-06-21/loi 21-05) - Art.2 Denomination ("${c.raisonSociale}" SARL + mentions ICE RC capital) - Art.3 Objet (${f.activite} en tirets) - Art.4 Siege (${c.adresse} ${c.ville}) - Art.5 Duree (99 ans)
TITRE II: Art.6 Apports - Art.7 Capital (${f.capital} DH en [N] parts 100 DH avec repartition et numerotation) - Art.8 Augmentation/reduction - Art.9 Parts sociales - Art.10 Cession (libre entre associes, agrement tiers) - Art.11 Transmission
TITRE III: Art.12 Gerance (${f.gerant} CIN ${f.cin_gerant} gerant unique duree illimitee + 8 pouvoirs) - Art.13 Signature - Art.14 Remuneration
TITRE IV: Art.15 Vote - Art.16 AGO (3 mois, quorum 75%) - Art.17 Quorum - Art.18 AGE (unanimite) - Art.19 Registre
STOP apres article 19.`);
      const p2 = await callAI(`Expert juridique marocain. Genere Titres V-VII statuts SARL pour ${c.raisonSociale}.
${base}
TITRE V: Art.20 Exercice (1jan-31dec) - Art.21 Benefices (proportionnel parts) - Art.22 Comptes courants
TITRE VI: Art.23 Deces associe - Art.24 Deces/demission gerant - Art.25 Dissolution - Art.26 Liquidation
TITRE VII: Art.27 Contestation (tribunaux ${c.ville}) - Art.28 Publications - Art.29 Frais - Art.30 Transformation
"Les presents statuts seront deposes au Tribunal de Commerce de ${c.ville}."
"Fait a ${c.ville} le ${f.date}" / "LES ASSOCIES" / [signatures]`);
      setGeneratedDocs(prev => prev.map(d => d.id === 'statuts' ? { ...d, content: p1 + '\n\n' + p2, status: 'done' as const } : d));
    } catch { setGeneratedDocs(prev => prev.map(d => d.id === 'statuts' ? { ...d, status: 'error' as const } : d)); }

    // PV CONSTITUTION
    setGeneratedDocs(prev => prev.map(d => d.id === 'pv_constitution' ? { ...d, status: 'generating' as const } : d));
    try {
      const pv = await callAI(`Expert juridique marocain. Genere PV ASSEMBLEE GENERALE CONSTITUTIVE pour ${c.raisonSociale}.
${base}
EN-TETE: "${c.raisonSociale}" / "SARL AU CAPITAL DE [EN LETTRES] DIRHAMS" / "SIEGE: ${c.adresse} ${c.ville}" / "RC: ${c.rc}"
"PROCES-VERBAL DE L'ASSEMBLEE GENERALE CONSTITUTIVE TENUE LE ${f.date}"
"L'an [EN LETTRES], le [DATE EN LETTRES] a [HEURE], les associes se sont reunis..."
PREMIERE RESOLUTION: ADOPTION DES STATUTS - unanimite
DEUXIEME RESOLUTION: NOMINATION GERANT - ${f.gerant} CIN ${f.cin_gerant} duree illimitee - unanimite
TROISIEME RESOLUTION: POUVOIRS - porteur original pour immatriculation RC et publications - unanimite
"Fait a ${c.ville} le ${f.date}" / signatures associes`);
      setGeneratedDocs(prev => prev.map(d => d.id === 'pv_constitution' ? { ...d, content: pv, status: 'done' as const } : d));
    } catch { setGeneratedDocs(prev => prev.map(d => d.id === 'pv_constitution' ? { ...d, status: 'error' as const } : d)); }

    // DOMICILIATION
    setGeneratedDocs(prev => prev.map(d => d.id === 'domiciliation' ? { ...d, status: 'generating' as const } : d));
    try {
      const dom = await callAI(`Expert juridique marocain. Genere CONTRAT DE DOMICILIATION pour ${c.raisonSociale} selon modele article 93 CRCP.
${base}
STRUCTURE:
"CONTRAT DE DOMICILIATION"
"Nous Soussignes, [DOMICILIATAIRE] SARL AU, declarant que ${c.raisonSociale} a domicilie son adresse fiscale dans nos locaux situes au ${c.adresse} ${c.ville}"
"Nous declarons avoir pris connaissance des dispositions article 93 CRCP sur responsabilite fiscale domiciliataire."
"CONDITIONS GENERALES DE DOMICILIATION JURIDIQUE ET FISCAL"
"[DOMICILIATAIRE] represente par [GERANT] CIN [N], et ${c.raisonSociale} represente par ${f.gerant} CIN ${f.cin_gerant} demeurant ${f.adresse_gerant}."
ARTICLE I CADRE LEGAL - ARTICLE II OBJET (domiciliation + courrier + fax) - ARTICLE III DUREE (1 an tacite reconduction preavis 1 mois R/AR + obligation informer greffe et impots) - ARTICLE IV OBLIGATIONS DOMICILIE (honoraires + declaration changements + copies declarations TVA bilan CNSS annuelles) - ARTICLE V RESILIATION (30 jours mise en demeure) - ARTICLE VI ELECTION DOMICILE - ARTICLE VII PROCURATION SPECIALE (${f.gerant} donne procuration domiciliataire pour reception notifications)
"Fait a ${c.ville} le ${f.date}" / signatures`);
      setGeneratedDocs(prev => prev.map(d => d.id === 'domiciliation' ? { ...d, content: dom, status: 'done' as const } : d));
    } catch { setGeneratedDocs(prev => prev.map(d => d.id === 'domiciliation' ? { ...d, status: 'error' as const } : d)); }

    // DEPOT LEGAL
    setGeneratedDocs(prev => prev.map(d => d.id === 'depot_legal' ? { ...d, status: 'generating' as const } : d));
    try {
      const depot = await callAI(`Expert juridique marocain. Genere DECLARATION D'IMMATRICULATION AU REGISTRE DU COMMERCE (modele n°2 societes commerciales).
${base}
STRUCTURE OFFICIELLE:
"ROYAUME DU MAROC   MINISTERE DE LA JUSTICE"
"TRIBUNAL DE COMMERCE DE ${c.ville}"
"REGISTRE DU COMMERCE - DECLARATION D'IMMATRICULATION"
"(Articles 45-46 du code de commerce) - SOCIETES COMMERCIALES"
"N° immatriculation: ..........   Raison sociale: ${c.raisonSociale}"
---
"DECLARATION D'IMMATRICULATION AU REGISTRE DU COMMERCE"
"- Raison sociale: ${c.raisonSociale}   Date certificat negatif: ${f.date}"
"- Objet: ${f.activite}"
"- Forme juridique: SARL   Capital: ${f.capital} DH"
"- Siege social: ${c.adresse} ${c.ville}"
"- Duree: 99 ans   Date debut exploitation: ${f.date}"
"- Gerant: ${f.gerant}   CIN: ${f.cin_gerant}   Adresse: ${f.adresse_gerant}"
"- ICE: ${c.ice}   IF: ${c.if_fiscal}"
"Pieces produites: Statuts (original+2copies) - PV Constitution - CIN gerant - Certificat negatif - Contrat domiciliation"
"Le soussigne ${f.gerant}, gerant, certifie l'exactitude des indications ci-dessus."
"Fait a ${c.ville} le ${f.date}" / "Signature: ${f.gerant}"`);
      setGeneratedDocs(prev => prev.map(d => d.id === 'depot_legal' ? { ...d, content: depot, status: 'done' as const } : d));
    } catch { setGeneratedDocs(prev => prev.map(d => d.id === 'depot_legal' ? { ...d, status: 'error' as const } : d)); }

    setStep('done');
  };

  const downloadAll = async () => {
    for (const doc of generatedDocs) {
      if (doc.status === 'done' && doc.content) {
        await downloadSinglePDF(doc.content, `${doc.id}_${selectedCompany?.raisonSociale.replace(/ /g, '_')}.pdf`);
        await new Promise(r => setTimeout(r, 500));
      }
    }
  };

  if (step === 'select') return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-white">
        <h2 className="font-bold text-gray-800">Dossier de Création</h2>
        <p className="text-xs text-gray-400 mt-0.5">Sélectionnez la société à constituer</p>
      </div>
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.map(c => (
          <button key={c.id} onClick={() => { setSelectedCompany(c); setStep('form'); }}
            className="w-full text-left p-3 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#1B2A4A] rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">{c.raisonSociale.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">{c.raisonSociale}</p>
                <p className="text-xs text-gray-400">{c.ville} · {c.formeJuridique}</p>
              </div>
              <ChevronRight size={14} className="text-gray-300" />
            </div>
          </button>
        ))}
        {filtered.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">Aucune société trouvée</div>}
      </div>
    </div>
  );

  if (step === 'form') return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center gap-3">
        <button onClick={() => setStep('select')} className="text-gray-400 hover:text-gray-600"><ArrowLeft size={16} /></button>
        <div>
          <h2 className="font-bold text-gray-800">{selectedCompany?.raisonSociale}</h2>
          <p className="text-xs text-gray-400">Données de constitution</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-xs text-blue-600 font-medium mb-2">Documents générés automatiquement</p>
          <div className="flex flex-wrap gap-2">
            {docsToGenerate.map(d => (
              <span key={d.id} className="text-xs bg-white border border-blue-200 text-blue-700 px-2 py-1 rounded-lg">{d.name}</span>
            ))}
          </div>
        </div>
        {[
          { key: 'associes', label: 'Associés (nom, date naissance, ville, CIN, adresse, nb parts)', placeholder: 'Ex: Mohammed Alami né 01/01/1980 à Casa CIN AB123456 demeurant 10 Rue... - 50 parts', multi: true },
          { key: 'capital', label: 'Capital social (MAD)', placeholder: 'Ex: 100000' },
          { key: 'activite', label: 'Objet social / Activités', placeholder: 'Ex: Commerce général, conseil en gestion...' },
          { key: 'gerant', label: 'Nom complet du gérant', placeholder: 'Ex: Mohammed Alami' },
          { key: 'cin_gerant', label: 'CIN du gérant', placeholder: 'Ex: AB123456' },
          { key: 'adresse_gerant', label: 'Adresse personnelle du gérant', placeholder: 'Ex: 10 Rue Hassan II Casablanca' },
          { key: 'date_naissance_gerant', label: 'Date et lieu de naissance du gérant', placeholder: 'Ex: 01/01/1980 à Casablanca' },
          { key: 'date', label: "Date de l'acte", placeholder: 'JJ/MM/AAAA' },
        ].map(field => (
          <div key={field.key}>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">{field.label}</label>
            {field.multi ? (
              <textarea value={formData[field.key as keyof typeof formData]} onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                placeholder={field.placeholder} rows={3} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 resize-none" />
            ) : (
              <input value={formData[field.key as keyof typeof formData]} onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                placeholder={field.placeholder} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400" />
            )}
          </div>
        ))}
        <button onClick={generateAll} className="w-full py-3 bg-[#1B2A4A] text-white rounded-xl font-semibold text-sm hover:bg-[#243660] transition-all flex items-center justify-center gap-2">
          <FileText size={16} /> Générer le dossier complet
        </button>
      </div>
    </div>
  );

  if (step === 'generating' || step === 'done') return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-800">{selectedCompany?.raisonSociale}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{step === 'done' ? '✅ Dossier complet' : '⏳ Génération en cours...'}</p>
        </div>
        {step === 'done' && (
          <button onClick={() => { setStep('select'); setGeneratedDocs([]); }} className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200">
            <RefreshCw size={12} /> Nouveau
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {generatedDocs.map(doc => (
          <div key={doc.id} className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${doc.status === 'done' ? 'bg-green-100' : doc.status === 'generating' ? 'bg-amber-100' : doc.status === 'error' ? 'bg-red-100' : 'bg-gray-100'}`}>
              {doc.status === 'done' ? <CheckCircle size={16} className="text-green-600" /> :
               doc.status === 'generating' ? <Loader2 size={16} className="text-amber-600 animate-spin" /> :
               <FileText size={16} className={doc.status === 'error' ? 'text-red-400' : 'text-gray-300'} />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">{doc.name}</p>
              <p className={`text-xs ${doc.status === 'done' ? 'text-green-500' : doc.status === 'generating' ? 'text-amber-500' : doc.status === 'error' ? 'text-red-400' : 'text-gray-300'}`}>
                {doc.status === 'done' ? 'Généré ✓' : doc.status === 'generating' ? 'En cours...' : doc.status === 'error' ? 'Erreur' : 'En attente'}
              </p>
            </div>
            {doc.status === 'done' && (
              <button onClick={() => downloadSinglePDF(doc.content, `${doc.id}_${selectedCompany?.raisonSociale.replace(/ /g, '_')}.pdf`)} className="p-2 bg-[#1B2A4A] text-white rounded-lg hover:bg-[#243660]">
                <Download size={14} />
              </button>
            )}
          </div>
        ))}
        {step === 'done' && (
          <button onClick={downloadAll} className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition-all flex items-center justify-center gap-2 mt-2">
            <Download size={16} /> Télécharger tout le dossier
          </button>
        )}
      </div>
    </div>
  );
  return null;
}

// ==================== MODIFICATIONS FORM ====================
type ModType = 'cession' | 'transfert' | 'dissolution' | 'augmentation' | null;

function ModificationsForm({ companies }: { companies: Company[] }) {
  const [modType, setModType] = useState<ModType>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [search, setSearch] = useState('');
  const [step, setStep] = useState<'select_type' | 'select_company' | 'form' | 'generating' | 'done'>('select_type');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [generatedContent, setGeneratedContent] = useState('');
  const filtered = companies.filter(c => c.raisonSociale.toLowerCase().includes(search.toLowerCase()));

  const modTypes = [
    { id: 'cession', label: 'Cession de Parts', icon: '🔄', desc: 'Transfert de parts entre associés' },
    { id: 'transfert', label: 'Transfert Siège Social', icon: '📍', desc: 'Changement adresse siège' },
    { id: 'dissolution', label: 'Dissolution & Liquidation', icon: '🔚', desc: 'Fermeture de la société' },
    { id: 'augmentation', label: 'Augmentation Capital', icon: '📈', desc: 'Augmentation du capital social' },
  ];

  const formFields: Record<string, { key: string; label: string; placeholder: string }[]> = {
    cession: [
      { key: 'cedant', label: 'Nom complet du cédant', placeholder: 'Mohammed Alami' },
      { key: 'date_naissance_cedant', label: 'Date de naissance cédant', placeholder: '17/02/1980' },
      { key: 'adresse_cedant', label: 'Adresse cédant', placeholder: 'Rue Hassan II Casablanca' },
      { key: 'cin_cedant', label: 'CIN cédant', placeholder: 'AB123456' },
      { key: 'cessionnaire', label: 'Nom complet du cessionnaire', placeholder: 'Ahmed Benali' },
      { key: 'date_naissance_cessionnaire', label: 'Date de naissance cessionnaire', placeholder: '29/07/2000' },
      { key: 'adresse_cessionnaire', label: 'Adresse cessionnaire', placeholder: 'Douar Charkaoua Settat' },
      { key: 'cin_cessionnaire', label: 'CIN cessionnaire', placeholder: 'CD789012' },
      { key: 'nombre_parts', label: 'Nombre de parts (chiffres + lettres)', placeholder: '100 (CENT)' },
      { key: 'prix', label: 'Prix cession MAD (chiffres + lettres)', placeholder: '10000 (DIX MILLE)' },
      { key: 'date', label: 'Date', placeholder: 'JJ/MM/AAAA' },
    ],
    transfert: [
      { key: 'ancien_siege', label: 'Ancien siège social', placeholder: 'Ancienne adresse complète' },
      { key: 'nouveau_siege', label: 'Nouveau siège social', placeholder: 'Nouvelle adresse complète' },
      { key: 'gerant', label: 'Nom du gérant', placeholder: 'Mohammed Alami' },
      { key: 'date', label: 'Date AGE', placeholder: 'JJ/MM/AAAA' },
    ],
    dissolution: [
      { key: 'motif', label: 'Motif de dissolution', placeholder: 'Cessation activité, accord unanime...' },
      { key: 'liquidateur', label: 'Nom du liquidateur', placeholder: 'Mohammed Alami' },
      { key: 'cin_liquidateur', label: 'CIN liquidateur', placeholder: 'AB123456' },
      { key: 'adresse_liquidateur', label: 'Adresse liquidateur', placeholder: 'Rue Hassan II Casablanca' },
      { key: 'date', label: 'Date AGE', placeholder: 'JJ/MM/AAAA' },
    ],
    augmentation: [
      { key: 'capital_actuel', label: 'Capital actuel (MAD)', placeholder: '100000' },
      { key: 'capital_nouveau', label: 'Nouveau capital (MAD)', placeholder: '200000' },
      { key: 'modalites', label: 'Modalités', placeholder: 'Apport en numéraire, incorporation réserves...' },
      { key: 'gerant', label: 'Nom du gérant', placeholder: 'Mohammed Alami' },
      { key: 'date', label: 'Date AGE', placeholder: 'JJ/MM/AAAA' },
    ],
  };

  const generateDoc = async () => {
    if (!selectedCompany || !modType) return;
    setStep('generating');
    const c = selectedCompany;
    const f = formData;
    const header = `"${c.raisonSociale}" / "SOCIETE A RESPONSABILITE LIMITEE AU CAPITAL DE [CAPITAL EN LETTRES] DIRHAMS" / "SIEGE SOCIAL: ${c.adresse} ${c.ville}" / "RC: ${c.rc}   ICE: ${c.ice}   IF: ${c.if_fiscal}"`;

    const prompts: Record<string, string> = {
      cession: `Expert juridique marocain. Genere CESSION DE PARTS SOCIALES officielle (6 exemplaires recto/verso).
SOCIETE: ${c.raisonSociale} | RC: ${c.rc} | ICE: ${c.ice} | IF: ${c.if_fiscal} | Adresse: ${c.adresse} ${c.ville}
EN-TETE: ${header}
"CESSION DE PARTS SOCIALES"
"ENTRE-LES SOUSSIGNES:"
"${f.cedant} de nationalite marocaine, nee ${f.date_naissance_cedant}, demeurant a ${f.adresse_cedant}, titulaire de la CIN N° ${f.cin_cedant}."
"D'UNE PART"
"${f.cessionnaire}, de nationalite marocaine, nee ${f.date_naissance_cessionnaire}, demeurant ${f.adresse_cessionnaire}, titulaire de la CIN N° ${f.cin_cessionnaire}."
"D'AUTRE PART"
"IL EST EXPRESSEMENT CONVENU ET ARRETE CE QUI SUIT:"
"Par les presentes, le soussigne de premiere part, cede et transporte avec toutes les garanties de fait et de droit en pareille matiere, au soussigne de seconde part, qui accepte ${f.nombre_parts} parts qu'il possedait dans la societe."
"ETANT ICI PRECISE: RC ${c.rc} - capital divise en parts 100 DH integralement liberees"
"ORIGINE DE PROPRIETE: parts acquises lors de la constitution/cessions"
"SUBROGATION DANS LES DROITS DU CEDANT: subrogation dans tous droits actions obligations"
"PROPRIETE ET JOUISSANCE: propriete et jouissance immediate + dividendes a compter de ce jour"
"PRIX DE VENTE: ${f.prix} DIRHAMS paye comptant quittance definitive sans reserve."
"DONT QUITTANCE"
"NANTISSEMENT-SAISIES: parts libres de tous nantissements saisies"
"FRAIS: a charge exclusive du cessionnaire"
"ELECTION DE DOMICILE: demeures respectives et siege ${c.adresse} ${c.ville}"
"CLAUSE PARTICULIERE: cessionnaire declare statuts valables"
"FORMALITES-POUVOIRS: tous pouvoirs porteur original"
"REQUISITION: enregistrement acte SSP"
"FAIT A ${c.ville} EN SIX EXEMPLAIRES ET EN BONNE FOI LE ${f.date}"
"LE CEDANT                    LE CESSIONNAIRE"
"${f.cedant}                    ${f.cessionnaire}"`,

      transfert: `Expert juridique marocain. Genere DECISION EXTRAORDINAIRE DU GERANT - TRANSFERT SIEGE SOCIAL (modele reel marocain).
SOCIETE: ${c.raisonSociale} | RC: ${c.rc} | ICE: ${c.ice} | IF: ${c.if_fiscal}
EN-TETE: ${header.replace(c.adresse + ' ' + c.ville, f.ancien_siege)}
"DECISION EXTRAORDINAIRE DU GERANT EN DATE DU ${f.date}"
"L'an [EN LETTRES], le [DATE EN LETTRES] a [HEURE],"
"${f.gerant}, Gerant de la societe ${c.raisonSociale}..."
"ORDRE DU JOUR: Transfert siege social - Modification statuts - Questions diverses"
"PREMIERE RESOLUTION: TRANSFERT SIEGE SOCIAL"
"Transfert de: ${f.ancien_siege} a: ${f.nouveau_siege}."
"CETTE RESOLUTION EST ADOPTEE A L'UNANIMITE"
"DEUXIEME RESOLUTION: MODIFICATION ARTICLE 4 DES STATUTS"
"ARTICLE 4 SIEGE SOCIAL: Le siege est fixe a: ${f.nouveau_siege}."
"CETTE RESOLUTION EST ADOPTEE A L'UNANIMITE"
"TROISIEME RESOLUTION: POUVOIRS - porteur original pour formalites legales"
"CETTE RESOLUTION EST ADOPTEE A L'UNANIMITE"
"Fait a ${c.ville} le ${f.date}" / "Le Gerant: ${f.gerant}"`,

      dissolution: `Expert juridique marocain. Genere PV AGE DISSOLUTION ET LIQUIDATION.
SOCIETE: ${c.raisonSociale} | RC: ${c.rc} | ICE: ${c.ice} | IF: ${c.if_fiscal} | Adresse: ${c.adresse} ${c.ville}
EN-TETE: ${header}
"PROCES-VERBAL AGE DISSOLUTION ET MISE EN LIQUIDATION - ${f.date}"
"PREMIERE RESOLUTION: DISSOLUTION - motif: ${f.motif} - a compter du ${f.date}"
"CETTE RESOLUTION EST ADOPTEE A L'UNANIMITE"
"DEUXIEME RESOLUTION: NOMINATION LIQUIDATEUR - ${f.liquidateur} CIN ${f.cin_liquidateur} demeurant ${f.adresse_liquidateur} - tous pouvoirs pour realiser actif, apurer passif, repartir boni"
"CETTE RESOLUTION EST ADOPTEE A L'UNANIMITE"
"TROISIEME RESOLUTION: POUVOIRS - porteur original pour publication et radiation RC"
"CETTE RESOLUTION EST ADOPTEE A L'UNANIMITE"
"Fait a ${c.ville} le ${f.date}" / signatures associes`,

      augmentation: `Expert juridique marocain. Genere PV AGE AUGMENTATION DU CAPITAL SOCIAL.
SOCIETE: ${c.raisonSociale} | RC: ${c.rc} | ICE: ${c.ice} | IF: ${c.if_fiscal} | Adresse: ${c.adresse} ${c.ville}
EN-TETE: ${header}
"PROCES-VERBAL AGE AUGMENTATION DU CAPITAL - ${f.date}"
"PREMIERE RESOLUTION: AUGMENTATION CAPITAL de ${f.capital_actuel} DH a ${f.capital_nouveau} DH par: ${f.modalites}. Nouveau capital [EN LETTRES] ([CHIFFRES]) DIRHAMS divise en [N] parts 100 DH."
"CETTE RESOLUTION EST ADOPTEE A L'UNANIMITE"
"DEUXIEME RESOLUTION: MODIFICATION ARTICLE 7 STATUTS - nouveau capital ${f.capital_nouveau} DH"
"CETTE RESOLUTION EST ADOPTEE A L'UNANIMITE"
"TROISIEME RESOLUTION: POUVOIRS - porteur original pour formalites legales"
"CETTE RESOLUTION EST ADOPTEE A L'UNANIMITE"
"Fait a ${c.ville} le ${f.date}" / "Le Gerant: ${f.gerant}"`,
    };

    try {
      const content = await callAI(prompts[modType]);
      setGeneratedContent(content);
      setStep('done');
    } catch { setStep('form'); }
  };

  if (step === 'select_type') return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-white">
        <h2 className="font-bold text-gray-800">Modifications Société</h2>
        <p className="text-xs text-gray-400 mt-0.5">Choisissez le type de modification</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {modTypes.map(m => (
          <button key={m.id} onClick={() => { setModType(m.id as ModType); setStep('select_company'); }}
            className="w-full text-left p-4 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-all bg-white">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{m.icon}</span>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{m.label}</p>
                <p className="text-xs text-gray-400">{m.desc}</p>
              </div>
              <ChevronRight size={14} className="text-gray-300 ml-auto" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  if (step === 'select_company') return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center gap-3">
        <button onClick={() => setStep('select_type')} className="text-gray-400 hover:text-gray-600"><ArrowLeft size={16} /></button>
        <div>
          <h2 className="font-bold text-gray-800">{modTypes.find(m => m.id === modType)?.label}</h2>
          <p className="text-xs text-gray-400">Sélectionnez la société</p>
        </div>
      </div>
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.map(c => (
          <button key={c.id} onClick={() => { setSelectedCompany(c); setStep('form'); }}
            className="w-full text-left p-3 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#1B2A4A] rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">{c.raisonSociale.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">{c.raisonSociale}</p>
                <p className="text-xs text-gray-400">{c.ville} · {c.formeJuridique}</p>
              </div>
              <ChevronRight size={14} className="text-gray-300" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  if (step === 'form') return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center gap-3">
        <button onClick={() => setStep('select_company')} className="text-gray-400 hover:text-gray-600"><ArrowLeft size={16} /></button>
        <div>
          <h2 className="font-bold text-gray-800">{selectedCompany?.raisonSociale}</h2>
          <p className="text-xs text-gray-400">{modTypes.find(m => m.id === modType)?.label}</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {(formFields[modType!] || []).map(field => (
          <div key={field.key}>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">{field.label}</label>
            <input value={formData[field.key] || ''} onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
              placeholder={field.placeholder} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400" />
          </div>
        ))}
        <button onClick={generateDoc} className="w-full py-3 bg-[#1B2A4A] text-white rounded-xl font-semibold text-sm hover:bg-[#243660] transition-all flex items-center justify-center gap-2">
          <FileText size={16} /> Générer le document
        </button>
      </div>
    </div>
  );

  if (step === 'generating') return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <Loader2 size={40} className="text-[#1B2A4A] animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Génération en cours...</p>
        <p className="text-gray-400 text-sm mt-1">{selectedCompany?.raisonSociale}</p>
      </div>
    </div>
  );

  if (step === 'done') return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-800">✅ Document généré</h2>
          <p className="text-xs text-gray-400">{selectedCompany?.raisonSociale} · {modTypes.find(m => m.id === modType)?.label}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => downloadSinglePDF(generatedContent, `${modType}_${selectedCompany?.raisonSociale.replace(/ /g, '_')}.pdf`)}
            className="flex items-center gap-1 px-3 py-2 bg-[#1B2A4A] text-white rounded-lg text-xs hover:bg-[#243660]">
            <Download size={13} /> PDF
          </button>
          <button onClick={() => { setStep('select_type'); setModType(null); setFormData({}); setGeneratedContent(''); }}
            className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200">
            <RefreshCw size={13} /> Nouveau
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-mono">
          {cleanText(generatedContent)}
        </div>
      </div>
    </div>
  );
  return null;
}

// ==================== MAIN PAGE ====================
export default function JuridiquePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'creation' | 'modifications'>('creation');
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('atlas_companies');
    if (saved) setCompanies(JSON.parse(saved));
  }, []);

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
            <Scale size={16} /> Juridique
          </button>
          <div className="mt-4 space-y-1">
            <button onClick={() => setActiveTab('creation')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${activeTab === 'creation' ? 'bg-amber-500/20 text-amber-400' : 'text-white/40 hover:text-white/70'}`}>
              <Building2 size={14} /> Création
            </button>
            <button onClick={() => setActiveTab('modifications')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${activeTab === 'modifications' ? 'bg-amber-500/20 text-amber-400' : 'text-white/40 hover:text-white/70'}`}>
              <RefreshCw size={14} /> Modifications
            </button>
          </div>
        </nav>
        <div className="px-4 py-3 border-t border-white/10">
          <div className="bg-white/5 rounded-lg p-2">
            <p className="text-white/30 text-xs">Mode automatique</p>
            <p className="text-white/50 text-xs mt-0.5">Remplissez une fois → tous les docs générés</p>
          </div>
        </div>
      </aside>
      <main className="flex-1 flex overflow-hidden">
        {activeTab === 'creation' ? <CreationForm companies={companies} /> : <ModificationsForm companies={companies} />}
      </main>
    </div>
  );
}
