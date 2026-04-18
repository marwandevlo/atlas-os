'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Download, Bot, User, Send, Users, Briefcase, Award, FileCheck } from 'lucide-react';

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
  { id: 'attestation_travail', category: 'Attestations', name: 'Attestation de travail', nameAr: 'شهادة العمل', description: 'Certifie qu\'un employe travaille dans la societe', fields: ['nom_employe', 'cin_employe', 'poste', 'date_embauche', 'type_contrat'] },
  { id: 'attestation_salaire', category: 'Attestations', name: 'Attestation de salaire', nameAr: 'شهادة الأجر', description: 'Certifie le salaire mensuel net', fields: ['nom_employe', 'cin_employe', 'poste', 'salaire_brut', 'salaire_net', 'date_embauche'] },
  { id: 'attestation_conge', category: 'Attestations', name: 'Attestation de conge', nameAr: 'شهادة الإجازة', description: 'Attestation de depart en conge annuel', fields: ['nom_employe', 'poste', 'date_debut_conge', 'date_fin_conge', 'nombre_jours'] },
  { id: 'bulletin_paie', category: 'Attestations', name: 'Bulletin de paie', nameAr: 'بيان الراتب', description: 'Bulletin de salaire mensuel avec CNSS/AMO/IR', fields: ['nom_employe', 'cin_employe', 'poste', 'mois', 'salaire_brut', 'anciennete'] },
  { id: 'cdi', category: 'Contrats de travail', name: 'Contrat CDI', nameAr: 'عقد العمل غير المحدد', description: 'Contrat a duree indeterminee', fields: ['nom_employe', 'cin_employe', 'adresse_employe', 'poste', 'salaire_brut', 'date_debut', 'lieu_travail', 'horaire'] },
  { id: 'cdd', category: 'Contrats de travail', name: 'Contrat CDD', nameAr: 'عقد العمل المحدد', description: 'Contrat a duree determinee', fields: ['nom_employe', 'cin_employe', 'adresse_employe', 'poste', 'salaire_brut', 'date_debut', 'date_fin', 'motif_cdd'] },
  { id: 'contrat_stage', category: 'Contrats de travail', name: 'Convention de Stage', nameAr: 'اتفاقية التدريب', description: 'Convention de stage PFE ou professionnel', fields: ['nom_stagiaire', 'cin_stagiaire', 'etablissement', 'niveau_etude', 'poste', 'date_debut', 'date_fin', 'indemnite'] },
  { id: 'avertissement', category: 'Fin de contrat', name: 'Lettre d\'Avertissement', nameAr: 'رسالة إنذار', description: 'Avertissement disciplinaire ecrit', fields: ['nom_employe', 'poste', 'date_faute', 'nature_faute', 'mesure'] },
  { id: 'lettre_licenciement', category: 'Fin de contrat', name: 'Lettre de Licenciement', nameAr: 'رسالة الفصل', description: 'Notification de licenciement conforme code du travail', fields: ['nom_employe', 'poste', 'date_embauche', 'motif_licenciement', 'date_effet', 'preavis'] },
  { id: 'attestation_fin', category: 'Fin de contrat', name: 'Certificat de Travail Final', nameAr: 'شهادة نهاية الخدمة', description: 'Certificat remis a la fin du contrat', fields: ['nom_employe', 'cin_employe', 'poste', 'date_embauche', 'date_fin', 'motif_depart'] },
  { id: 'recu_solde', category: 'Fin de contrat', name: 'Recu Solde de Tout Compte', nameAr: 'وصل تسوية الحساب', description: 'Recu de paiement du solde de tout compte', fields: ['nom_employe', 'date_fin', 'salaire_dernier_mois', 'conges_payes', 'indemnite_licenciement', 'total'] },
  { id: 'contrat_vente', category: 'Contrats commerciaux', name: 'Contrat de Vente', nameAr: 'عقد البيع', description: 'Contrat de vente de biens ou marchandises', fields: ['vendeur', 'acheteur', 'objet_vente', 'prix', 'date_livraison', 'conditions_paiement'] },
  { id: 'contrat_prestation', category: 'Contrats commerciaux', name: 'Contrat de Prestation', nameAr: 'عقد الخدمات', description: 'Contrat de prestation de services', fields: ['prestataire', 'client', 'nature_prestation', 'duree', 'honoraires', 'modalites_paiement'] },
  { id: 'contrat_bail', category: 'Contrats commerciaux', name: 'Contrat de Bail Commercial', nameAr: 'عقد الكراء التجاري', description: 'Contrat de location de local commercial', fields: ['bailleur', 'locataire', 'adresse_local', 'superficie', 'loyer_mensuel', 'duree_bail', 'depot_garantie'] },
  { id: 'contrat_domiciliation', category: 'Contrats commerciaux', name: 'Contrat de Domiciliation', nameAr: 'عقد التوطين', description: 'Contrat de domiciliation du siege social', fields: ['domiciliataire', 'domicilie', 'adresse', 'duree', 'honoraires_mensuels'] },
  { id: 'nda', category: 'Contrats commerciaux', name: 'Accord de Confidentialite NDA', nameAr: 'اتفاقية السرية', description: 'Non-Disclosure Agreement', fields: ['partie_1', 'partie_2', 'objet_confidentialite', 'duree', 'date'] },
];

const categories = ['Attestations', 'Contrats de travail', 'Fin de contrat', 'Contrats commerciaux'];

const fieldLabels: Record<string, string> = {
  nom_employe: "Nom complet de l'employe",
  cin_employe: "Numero CIN de l'employe",
  adresse_employe: "Adresse complete de l'employe",
  poste: 'Poste / Fonction occupee',
  date_embauche: "Date d'embauche (JJ/MM/AAAA)",
  type_contrat: 'Type de contrat (CDI/CDD/Stage)',
  salaire_brut: 'Salaire brut mensuel en MAD',
  salaire_net: 'Salaire net mensuel en MAD',
  date_debut_conge: 'Date de debut du conge',
  date_fin_conge: 'Date de fin du conge',
  nombre_jours: 'Nombre de jours de conge',
  mois: 'Mois et annee du bulletin (ex: Avril 2026)',
  anciennete: "Anciennete dans la societe (annees)",
  date_debut: 'Date de debut du contrat',
  date_fin: 'Date de fin du contrat',
  lieu_travail: 'Lieu de travail',
  horaire: 'Horaire de travail (ex: 8h-17h Lundi-Vendredi)',
  motif_cdd: 'Motif du CDD',
  nom_stagiaire: 'Nom complet du stagiaire',
  cin_stagiaire: 'CIN du stagiaire',
  etablissement: "Etablissement d'enseignement",
  niveau_etude: "Niveau d'etude (Licence, Master, BTS...)",
  indemnite: 'Indemnite de stage en MAD/mois',
  date_faute: 'Date de la faute commise',
  nature_faute: 'Nature de la faute',
  mesure: 'Mesure disciplinaire',
  motif_licenciement: 'Motif du licenciement',
  date_effet: "Date d'effet du licenciement",
  preavis: 'Duree du preavis (ex: 1 mois)',
  motif_depart: 'Motif du depart',
  salaire_dernier_mois: 'Salaire du dernier mois en MAD',
  conges_payes: 'Conges payes non pris en MAD',
  indemnite_licenciement: 'Indemnite de licenciement en MAD',
  total: 'Total solde de tout compte en MAD',
  vendeur: 'Nom/Societe du vendeur',
  acheteur: 'Nom/Societe de l\'acheteur',
  objet_vente: "Description de l'objet vendu",
  prix: 'Prix de vente en MAD',
  date_livraison: 'Date de livraison prevue',
  conditions_paiement: 'Conditions de paiement',
  prestataire: 'Nom/Societe du prestataire',
  client: 'Nom/Societe du client',
  nature_prestation: 'Nature de la prestation',
  duree: 'Duree',
  honoraires: 'Honoraires en MAD',
  modalites_paiement: 'Modalites de paiement',
  bailleur: 'Nom/Societe du bailleur',
  locataire: 'Nom/Societe du locataire',
  adresse_local: 'Adresse complete du local',
  superficie: 'Superficie en m2',
  loyer_mensuel: 'Loyer mensuel en MAD HT',
  duree_bail: 'Duree du bail (ex: 3 ans)',
  depot_garantie: 'Depot de garantie en MAD',
  domiciliataire: 'Nom/Societe domiciliataire',
  domicilie: 'Nom/Societe domiciliee',
  adresse: 'Adresse de domiciliation',
  honoraires_mensuels: 'Honoraires mensuels en MAD',
  partie_1: 'Nom/Societe Partie 1',
  partie_2: 'Nom/Societe Partie 2',
  objet_confidentialite: 'Informations confidentielles concernees',
  date: 'Date de signature',
};

export default function RHPage() {
  const router = useRouter();
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null);
  const [activeCategory, setActiveCategory] = useState('Attestations');
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
      content: `📄 ${doc.name} — ${doc.nameAr}\n\n${doc.description}\n\n${companyData.raisonSociale ? `✅ Societe: ${companyData.raisonSociale}\n\n` : ''}${fieldLabels[doc.fields[0]]}?`
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
      setMessages(prev => [...prev, { role: 'assistant', content: '⏳ Generation du document...' }]);
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
          message: `Tu es un expert RH et juridique specialise en droit du travail marocain.
Genere le document: ${selectedDoc?.name}

SOCIETE EMPLOYEUR:
- Raison sociale: ${companyData.raisonSociale || ''}
- IF: ${companyData.if_fiscal || ''}
- ICE: ${companyData.ice || ''}
- RC: ${companyData.rc || ''}
- CNSS: ${companyData.cnss || ''}
- Adresse: ${companyData.adresse || ''} ${companyData.ville || ''}
- Tel: ${companyData.telephone || ''}

DONNEES:
${Object.entries(data).map(([k, v]) => `${fieldLabels[k] || k}: ${v}`).join('\n')}

EXIGENCES:
- Document formel conforme Code du travail marocain (Loi 65-99)
- En-tete avec nom societe et coordonnees
- Contenu complet et detaille
- Calculs CNSS/AMO/IR si bulletin de paie
- Section signatures avec date, lieu, nom, qualite
- Mentions legales obligatoires
- Minimum 1-2 pages

Genere un document RH COMPLET, FORMEL et PROFESSIONNEL de haute qualite.

EXIGENCES OBLIGATOIRES:
1. En-tete avec: nom societe, adresse, tel, IF, CNSS, logo textuel
2. Titre officiel centre en majuscules et souligne
3. Reference: "Fait a [ville], le [date]" en haut a droite  
4. Corps du document detaille avec toutes les clauses legales
5. Pour les contrats: minimum 15 articles detailles
6. Pour les attestations: formules officielles et certifications
7. Pour le bulletin de paie: tableau complet CNSS/AMO/IR avec calculs
8. Mentions legales: references au Code du travail (Loi 65-99)
9. Clause de confidentialite si applicable
10. Signatures: Nom, Qualite, Date, "Lu et approuve", empreinte
11. Tampon et cachet de la societe (mentionner l'espace)
12. Le document doit faire minimum 2-3 pages

Genere UNIQUEMENT le document complet et detaille, sans commentaires.`
        }),
      });
      const responseData = await res.json();
      setDocContent(responseData.response);
      setDocReady(true);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `✅ Document genere!\n\n📄 ${selectedDoc?.name} est pret.\n\nConforme Code du travail marocain (Loi 65-99).\n\n📥 Telechargez votre PDF →`
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
    doc.text(companyData.raisonSociale || 'SOCIETE', 15, 13);
    doc.setFontSize(11);
    doc.text(selectedDoc?.name?.toUpperCase() || '', 15, 23);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`${companyData.ville || ''} · Tel: ${companyData.telephone || ''} · CNSS: ${companyData.cnss || ''}`, 15, 31);

    doc.setTextColor(50, 50, 50);
    const lines = doc.splitTextToSize(docContent.replace(/\*\*/g, '').replace(/#{1,3} /g, ''), 180);
    let y = 45;

    lines.forEach((line: string) => {
      if (y > 275) {
        doc.addPage();
        doc.setFillColor(15, 31, 61);
        doc.rect(0, 0, 210, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        doc.text(`${companyData.raisonSociale || ''} · ${selectedDoc?.name || ''}`, 15, 8);
        doc.setTextColor(50, 50, 50);
        y = 20;
      }
      if (line.toUpperCase() === line && line.trim().length > 3 && !line.includes('MAD')) {
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
    doc.text('Atlas OS Enterprise · Document RH · Conforme Code du Travail Maroc', 15, 292);
    doc.text(new Date().toLocaleDateString('fr-MA'), 185, 292, { align: 'right' });

    doc.save(`${selectedDoc?.id}_${new Date().getFullYear()}.pdf`);
  };

  const categoryIcons: Record<string, any> = {
    'Attestations': Award,
    'Contrats de travail': Briefcase,
    'Fin de contrat': FileCheck,
    'Contrats commerciaux': FileText,
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
            <Users size={16} /> Ressources Humaines
          </button>
          <div className="mt-3 space-y-0.5">
            {categories.map(cat => {
              const Icon = categoryIcons[cat];
              return (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${activeCategory === cat ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'}`}>
                  <Icon size={12} />
                  {cat}
                  <span className="ml-auto text-white/20">{docs.filter(d => d.category === cat).length}</span>
                </button>
              );
            })}
          </div>
        </nav>
        {companyData.raisonSociale && (
          <div className="px-4 py-3 border-t border-white/10">
            <div className="bg-white/5 rounded-lg p-2">
              <p className="text-white/30 text-xs mb-1">Societe employeur</p>
              <p className="text-white/70 text-xs font-medium truncate">{companyData.raisonSociale}</p>
              {companyData.cnss && <p className="text-white/30 text-xs">CNSS: {companyData.cnss}</p>}
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
                className={`w-full text-left p-3 rounded-xl border transition-all hover:border-green-300 hover:shadow-sm ${selectedDoc?.id === doc.id ? 'border-green-400 bg-green-50' : 'border-gray-100 bg-white'}`}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shrink-0">
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
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <FileText size={16} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{selectedDoc.name}</p>
                  <p className="text-xs text-gray-400">{selectedDoc.nameAr}</p>
                </div>
              </div>
              {docReady && (
                <button onClick={downloadPDF} className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600">
                  <Download size={14} /> PDF
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && (
                    <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shrink-0 mt-1">
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
                  <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="bg-white px-4 py-2.5 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-green-300 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-green-300 rounded-full animate-bounce" style={{animationDelay:'0.1s'}}></div>
                      <div className="w-2 h-2 bg-green-300 rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></div>
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
                    className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-green-400"
                    autoFocus
                  />
                  <button onClick={sendMessage} disabled={loading} className="px-4 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50">
                    <Send size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 hidden lg:flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <Users size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Selectionnez un document RH</p>
              <p className="text-gray-400 text-sm mt-1">Contrats, attestations, certificats...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}