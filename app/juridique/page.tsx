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
  { id: 'statuts_sarl', category: 'Creation', name: 'Statuts SARL', nameAr: 'النظام الأساسي SARL', description: 'Statuts constitutifs SARL - 30 articles - 7 titres', fields: ['associes', 'capital', 'siege', 'activite', 'gerant', 'cin_gerant'] },
  { id: 'statuts_sarl_au', category: 'Creation', name: 'Statuts SARL AU', nameAr: 'النظام الأساسي SARL AU', description: 'Statuts associe unique - 30 articles', fields: ['associe_unique', 'cin_associe', 'capital', 'siege', 'activite', 'gerant'] },
  { id: 'pv_constitution', category: 'Creation', name: 'PV Assemblee Constitutive', nameAr: 'محضر الجمعية التأسيسية', description: 'Proces-verbal de constitution', fields: ['date', 'associes', 'decisions'] },
  { id: 'transfert_siege', category: 'Modifications', name: 'PV Transfert Siege Social', nameAr: 'نقل المقر الاجتماعي', description: 'PV AGE + modification statuts', fields: ['ancien_siege', 'nouveau_siege', 'date'] },
  { id: 'changement_nom', category: 'Modifications', name: 'PV Changement Denomination', nameAr: 'تغيير الاسم التجاري', description: 'PV AGE modification denomination', fields: ['ancien_nom', 'nouveau_nom', 'date', 'raison'] },
  { id: 'augmentation_capital', category: 'Modifications', name: 'PV Augmentation Capital', nameAr: 'الزيادة في رأس المال', description: 'Decision augmentation capital social', fields: ['capital_actuel', 'capital_nouveau', 'modalites', 'date'] },
  { id: 'nomination_gerant', category: 'Modifications', name: 'PV Nomination Gerant', nameAr: 'تعيين مدير جديد', description: 'Decision nomination nouveau gerant', fields: ['ancien_gerant', 'nouveau_gerant', 'cin_nouveau_gerant', 'adresse_gerant', 'date_prise_fonction'] },
  { id: 'cession_parts', category: 'Cession', name: 'Cession de Parts Sociales', nameAr: 'بيع الحصص الاجتماعية', description: 'Contrat cession parts - 2 pages', fields: ['cedant', 'cin_cedant', 'adresse_cedant', 'cessionnaire', 'cin_cessionnaire', 'adresse_cessionnaire', 'nombre_parts', 'prix', 'date'] },
  { id: 'entree_associe', category: 'Cession', name: 'Entree Nouvel Associe', nameAr: 'دخول شريك جديد', description: 'Acte entree nouvel associe', fields: ['nouvel_associe', 'cin_nouvel_associe', 'adresse_nouvel_associe', 'apport', 'parts', 'date'] },
  { id: 'lettre_demission', category: 'Cession', name: 'Lettre de Demission Gerant', nameAr: 'رسالة استقالة المدير', description: 'Demission du gerant - 1 page', fields: ['gerant_demissionnaire', 'cin_gerant', 'adresse_gerant', 'destinataire', 'date_effet'] },
  { id: 'dissolution', category: 'Dissolution', name: 'PV Dissolution Societe', nameAr: 'حل الشركة', description: 'Decision de dissolution volontaire', fields: ['date', 'motif', 'liquidateur', 'cin_liquidateur'] },
  { id: 'pv_liquidation', category: 'Dissolution', name: 'PV Cloture Liquidation', nameAr: 'محضر إقفال التصفية', description: 'Cloture de liquidation', fields: ['liquidateur', 'boni', 'date'] },
  { id: 'pv_age', category: 'Decisions', name: 'PV Assemblee Generale', nameAr: 'محضر الجمعية العامة', description: 'PV assemblee generale ordinaire', fields: ['date', 'ordre_du_jour', 'decisions', 'participants'] },
  { id: 'pv_dividendes', category: 'Decisions', name: 'PV Distribution Dividendes', nameAr: 'توزيع الأرباح', description: 'Decision distribution benefices', fields: ['exercice', 'benefice', 'dividende_par_part', 'date'] },
  { id: 'contrat_bail', category: 'Contrats', name: 'Contrat de Bail Commercial', nameAr: 'عقد الكراء التجاري', description: 'Bail commercial - 2 pages', fields: ['bailleur', 'cin_bailleur', 'adresse_bailleur', 'adresse_local', 'loyer_mensuel', 'duree_bail', 'depot_garantie', 'date'] },
  { id: 'contrat_domiciliation', category: 'Contrats', name: 'Contrat de Domiciliation', nameAr: 'عقد التوطين', description: 'Domiciliation siege - 2 pages', fields: ['domiciliataire', 'if_domiciliataire', 'rc_domiciliataire', 'ice_domiciliataire', 'gerant_domiciliataire', 'cin_domiciliataire', 'adresse_domiciliation', 'duree', 'honoraires_mensuels'] },
  { id: 'contrat_prestation', category: 'Contrats', name: 'Contrat de Prestation', nameAr: 'عقد الخدمات', description: 'Contrat de prestation de services', fields: ['client', 'nature_prestation', 'duree', 'honoraires', 'modalites_paiement'] },
  { id: 'nda', category: 'Contrats', name: 'Accord de Confidentialite NDA', nameAr: 'اتفاقية السرية', description: 'Non-Disclosure Agreement', fields: ['partie_2', 'objet_confidentialite', 'duree', 'date'] },
];

const categories = ['Creation', 'Modifications', 'Cession', 'Dissolution', 'Decisions', 'Contrats'];

const fieldLabels: Record<string, string> = {
  associes: 'Noms, CIN, adresses et parts de chaque associe',
  associe_unique: "Nom complet de l'associe unique",
  cin_associe: "CIN de l'associe unique",
  capital: 'Capital social en MAD (ex: 100000)',
  siege: 'Adresse complete du siege social',
  activite: 'Objet social / activites principales',
  gerant: 'Nom complet du gerant',
  cin_gerant: 'CIN du gerant',
  date: "Date de l'acte (JJ/MM/AAAA)",
  decisions: 'Decisions prises en assemblee',
  participants: 'Noms des participants presents',
  ancien_siege: 'Ancienne adresse du siege social',
  nouveau_siege: 'Nouvelle adresse du siege social',
  ancien_nom: 'Ancienne denomination sociale',
  nouveau_nom: 'Nouvelle denomination sociale',
  raison: 'Motif du changement',
  capital_actuel: 'Capital actuel en MAD',
  capital_nouveau: 'Nouveau capital en MAD',
  modalites: "Modalites de l'augmentation",
  ancien_gerant: "Nom de l'ancien gerant",
  nouveau_gerant: 'Nom complet du nouveau gerant',
  cin_nouveau_gerant: 'CIN du nouveau gerant',
  adresse_gerant: 'Adresse du gerant',
  date_prise_fonction: 'Date de prise de fonction',
  cedant: 'Nom complet du cedant',
  cin_cedant: 'CIN du cedant',
  adresse_cedant: 'Adresse du cedant',
  cessionnaire: 'Nom complet du cessionnaire',
  cin_cessionnaire: 'CIN du cessionnaire',
  adresse_cessionnaire: 'Adresse du cessionnaire',
  nombre_parts: 'Nombre de parts cedees',
  prix: 'Prix de cession en MAD',
  nouvel_associe: 'Nom complet du nouvel associe',
  cin_nouvel_associe: 'CIN du nouvel associe',
  adresse_nouvel_associe: 'Adresse du nouvel associe',
  apport: "Montant de l'apport en MAD",
  parts: 'Nombre de parts attribuees',
  gerant_demissionnaire: 'Nom complet du gerant demissionnaire',
  destinataire: 'Nom du destinataire',
  date_effet: "Date d'effet de la demission",
  motif: 'Motif de la dissolution',
  liquidateur: 'Nom du liquidateur',
  cin_liquidateur: 'CIN du liquidateur',
  boni: 'Boni de liquidation en MAD',
  ordre_du_jour: "Points a l'ordre du jour",
  exercice: 'Exercice fiscal (ex: 2025)',
  benefice: 'Benefice net distribuable en MAD',
  dividende_par_part: 'Dividende par part sociale en MAD',
  bailleur: 'Nom complet du bailleur',
  cin_bailleur: 'CIN du bailleur',
  adresse_bailleur: 'Adresse personnelle du bailleur',
  adresse_local: 'Adresse complete du local loue',
  loyer_mensuel: 'Loyer mensuel TTC en MAD',
  duree_bail: 'Duree du bail (ex: 2 ans)',
  depot_garantie: 'Montant caution en MAD',
  domiciliataire: 'Nom/Societe du domiciliataire',
  if_domiciliataire: 'IF du domiciliataire',
  rc_domiciliataire: 'RC du domiciliataire',
  ice_domiciliataire: 'ICE du domiciliataire',
  gerant_domiciliataire: 'Nom gerant domiciliataire',
  cin_domiciliataire: 'CIN gerant domiciliataire',
  adresse_domiciliation: 'Adresse complete de domiciliation',
  duree: 'Duree (ex: du 01/01/2026 au 01/01/2027)',
  honoraires_mensuels: 'Honoraires mensuels en MAD',
  client: 'Nom/Societe du client',
  nature_prestation: 'Nature de la prestation',
  honoraires: 'Honoraires en MAD',
  modalites_paiement: 'Modalites de paiement',
  partie_2: 'Nom/Societe Partie 2',
  objet_confidentialite: 'Informations confidentielles concernees',
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

const getBaseInfo = (company: Company, data: Record<string, string>) => `
SOCIETE: ${company.raisonSociale} | ${company.formeJuridique} | Capital: ${data.capital || ''} DH
IF: ${company.if_fiscal} | ICE: ${company.ice} | RC: ${company.rc} | CNSS: ${company.cnss}
Adresse: ${company.adresse} ${company.ville} | Tel: ${company.telephone}
Activite: ${company.activite}
DONNEES: ${Object.entries(data).map(([k, v]) => `${fieldLabels[k] || k}: ${v}`).join(' | ')}
REGLES: Texte simple uniquement. Pas de tableaux ASCII. Montants en chiffres ET lettres.`;

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
    setMessages([{ role: 'assistant', content: `📄 ${doc.name} — ${doc.nameAr}\n\n${doc.description}\n\nPour quelle societe?\nChoisissez dans la liste.` }]);
  };

  const chooseCompany = (company: Company) => {
    setSelectedCompany(company);
    setPhase('doc');
    setStep(0);
    setMessages(prev => [...prev,
      { role: 'user', content: `✅ ${company.raisonSociale}` },
      { role: 'assistant', content: `✅ ${company.raisonSociale}\nIF: ${company.if_fiscal} | RC: ${company.rc}\n\n${fieldLabels[selectedDoc!.fields[0]]}?` }
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
      setMessages(prev => [...prev, { role: 'assistant', content: '⏳ Generation du document...' }]);
      await generateDoc(newData);
      setLoading(false);
    }
  };

  const generateDoc = async (data: Record<string, string>) => {
    try {
      const company = selectedCompany!;
      const base = getBaseInfo(company, data);
      const isStatuts = selectedDoc!.id === 'statuts_sarl' || selectedDoc!.id === 'statuts_sarl_au';

      let content = '';

      if (isStatuts) {
        setMessages(prev => [...prev, { role: 'assistant', content: '⏳ Generation partie 1/2 (Titres I-IV)...' }]);

        const p1 = await callAI(`Tu es expert juridique marocain. Genere EXACTEMENT les Titres I a IV des statuts SARL.
${base}
FORMAT EXACT (copier ce modele):
En-tete: "${company.raisonSociale} - SOCIETE A RESPONSABILITE LIMITEE AU CAPITAL DE [CAPITAL EN LETTRES] ([CHIFFRES]) DIRHAMS - SIEGE SOCIAL: [ADRESSE] - STATUTS"
"LES SOUSSIGNES:" [identite complete chaque associe: nom, nationalite, date naissance, ville, CIN, adresse]
"A etabli ainsi qu'il suit les statuts..."

TITRE PREMIER - FORMATION-DENOMINATION-OBJET-SIEGE-DUREE
Article 1: Formation - reference Dahir 1-97-49 du 13 fevrier 1997 loi 5-96 et Dahir 1-06-21 du 14 fevrier 2006 loi 21-05 - 3 lignes max
Article 2: Denomination - mentions obligatoires sur actes - 3 lignes max
Article 3: Objet social - liste activites avec tirets - 5 lignes max
Article 4: Siege social - adresse + possibilite transfert AGE - 2 lignes max
Article 5: Duree - 99 ans + dissolution anticipee - 2 lignes max

TITRE II - APPORTS-CAPITAL-PARTS SOCIALES
Article 6: Apports - montants par associe en chiffres et lettres
Article 7: Capital - total, nombre parts 100 DH chacune, repartition par associe avec numerotation
Article 8: Augmentation/reduction capital - 3 lignes max
Article 9: Parts sociales - 2 lignes max
Article 10: Cession des parts - libre entre associes, agrement tiers, droit preemption - 4 lignes max
Article 11: Transmission succession - libre, mandataire 3 mois - 2 lignes max

TITRE III - GERANCE
Article 12: Gerance - "[NOM], CIN [N°], nomme GERANT UNIQUE duree illimitee" + liste pouvoirs en 8 tirets
Article 13: Signature sociale - 1 ligne
Article 14: Remuneration gerance - 1 ligne

TITRE IV - DECISIONS COLLECTIVES
Article 15: Droit de vote - 2 lignes
Article 16: Assemblee annuelle - dans 3 mois apres cloture, quorum 75% - 2 lignes
Article 17: Quorum - majorite voix et moitie capital - 2 lignes
Article 18: AGE modifications - unanimite - 1 ligne
Article 19: Registre resolutions - PV signes - 1 ligne

ARRETE-TOI APRES ARTICLE 19. Ne continue pas.`);

        content += p1;

        setMessages(prev => [...prev, { role: 'assistant', content: '⏳ Generation partie 2/2 (Titres V-VII)...' }]);

        const p2 = await callAI(`Tu es expert juridique marocain. Genere EXACTEMENT les Titres V, VI et VII des statuts SARL pour ${company.raisonSociale}.
${base}
COMMENCE DIRECTEMENT PAR TITRE V (pas d'en-tete):

TITRE V - EXERCICE SOCIAL-COMPTES-RESULTATS
Article 20: Annee sociale - 1er janvier au 31 decembre - 2 lignes max
Article 21: Repartition benefices - proportionnellement aux parts - 2 lignes max
Article 22: Comptes courants - avec accord gerance, interets taux bancaire - 3 lignes max

TITRE VI - DISSOLUTION-LIQUIDATION
Article 23: Deces associe - societe continue, heritiers dans 3 mois - 3 lignes max
Article 24: Deces/demission/revocation gerant - remplacement par vote - 2 lignes max
Article 25: Dissolution - expiration ou 3/4 capital - 2 lignes max
Article 26: Liquidation - par gerant en fonction, remboursement passif puis repartition - 3 lignes max

TITRE VII - DISPOSITIONS DIVERSES
Article 27: Contestation - tribunaux competents ${company.ville} - 1 ligne
Article 28: Publications - pouvoir porteur original - 1 ligne
Article 29: Frais - a compte frais constitution - 1 ligne
Article 30: Transformation-Fusion - decision unanime - 1 ligne

"Les statuts seront deposes au Tribunal de commerce de ${company.ville}."

"LES ASSOCIES"
[noms associes sur deux colonnes]`);

        content += '\n\n' + p2;

      } else if (selectedDoc!.id === 'cession_parts') {
        content = await callAI(`Expert juridique marocain. Genere CESSION DE PARTS SOCIALES - exactement 2 pages.
${base}
STRUCTURE EXACTE (modele officiel marocain):

"${company.raisonSociale}
SOCIETE A RESPONSABILITE LIMITEE AU CAPITAL DE [CAPITAL EN LETTRES] DIRHAMS
SIEGE SOCIAL: ${company.adresse} ${company.ville}
ICE: ${company.ice}   RC: ${company.rc}   IF: ${company.if_fiscal}"

"CESSION DE PARTS SOCIALES"

"ENTRE-LES SOUSSIGNES:"
[NOM CEDANT], nationalite marocaine, demeurant a [ADRESSE CEDANT], titulaire CIN N° [CIN CEDANT]
"D'UNE PART"
[NOM CESSIONNAIRE], nationalite marocaine, demeurant a [ADRESSE CESSIONNAIRE], titulaire CIN N° [CIN CESSIONNAIRE]
"D'AUTRE PART"

"IL EST EXPRESSEMENT CONVENU ET ARRETE CE QUI SUIT:"
Cession de [NOMBRE] ([EN LETTRES]) parts au cessionnaire.

"ETANT ICI PRECISE:"
- RC: ${company.rc} - Capital: [MONTANT] DH divise en [NOMBRE] parts de 100 DH integralement liberees

"ORIGINE DE PROPRIETE:" parts appartenant au cedant pour les avoir acquises lors de la constitution.

"SUBROGATION DANS LES DROITS DU CEDANT:" cessionnaire subroge dans tous droits et obligations.

"PROPRIETE ET JOUISSANCE:" propriete et jouissance immediate, droit dividendes a compter de ce jour.

"PRIX DE VENTE:" prix principal de [MONTANT EN LETTRES] ([CHIFFRES]) DIRHAMS, paye comptant, quittance definitive sans reserve.
"DONT QUITTANCE"

"NANTISSEMENT - SAISIES:" parts libres de tous nantissements, saisies ou autres droits.

"FRAIS:" a charge exclusive du cessionnaire.

"ELECTION DE DOMICILE:" demeures respectives et siege social ${company.adresse} ${company.ville}.

"CLAUSE PARTICULIERE:" cessionnaire declare statuts valables et engage sa responsabilite.

"FORMALITES - POUVOIRS:" tous pouvoirs au porteur original.

"REQUISITION:" parties requierent chef service enregistrement d'enregistrer cet acte SSP.

"FAIT A ${company.ville} EN SIX EXEMPLAIRES ET EN BONNE FOI LE [DATE EN TOUTES LETTRES]"

"LE CEDANT"                    "LE CESSIONNAIRE"
[NOM CEDANT]                   [NOM CESSIONNAIRE]`);

      } else if (selectedDoc!.id === 'lettre_demission') {
        content = await callAI(`Expert juridique marocain. Genere LETTRE DE DEMISSION GERANT - exactement 1 page.
${base}
STRUCTURE EXACTE:
"${company.ville} le [DATE]"

"[NOM GERANT], nationalite marocaine, demeurant a [ADRESSE], titulaire CIN N° [CIN]"
"[NOM DESTINATAIRE], nationalite marocaine..."

"OBJET: LETTRE DE DEMISSION"

"Mr/Mme [DESTINATAIRE]"

"J'ai l'honneur de vous faire part de ma decision de demissionner de mes fonctions de gerant de la societe ${company.raisonSociale} RC: ${company.rc}"
"Conformement aux dispositions statutaires, cette demission prendra effet le [DATE EFFET]."
"Je tiens a vous assurer que toutes les dispositions seront prises pour la convocation d'une decision generale aux fins de nomination d'un nouveau gerant."
"Je vous prie d'agreer Mr/Mme [DESTINATAIRE], l'expression de mes sentiments distingues."

"[NOM GERANT DEMISSIONNAIRE]"`);

      } else if (selectedDoc!.id === 'contrat_bail') {
        content = await callAI(`Expert juridique marocain. Genere CONTRAT DE BAIL COMMERCIAL - exactement 2 pages.
${base}
STRUCTURE EXACTE (modele officiel marocain):
"CONTRAT DE BAIL"
"Entre les soussignes:"
"[BAILLEUR] de nationalite marocaine, titulaire CIN N° [CIN], demeurant a [ADRESSE], en qualite de proprietaire."
"Et"
"La societe ${company.raisonSociale}, siege ${company.adresse} ${company.ville}, representee par son gerant titulaire CIN N° [CIN GERANT]."
"Ci-apres denomme le locataire"

"IL A ETE CONVENU ET ARRETE CE QUI SUIT:"
"1. Local: [ADRESSE LOCAL] - usage bureau/commercial"
"Duree: [DUREE] a compter du [DATE], tacite reconduction, preavis 3 mois R/AR."
"Conditions: 1- pas construction sans accord 2- activite compatible 3- pas sous-location sans accord"
"Loyer et caution: [MONTANT] MAD/mois TTC, caution [CAUTION] MAD ([X] mois). Restituee au depart."
"Clause resolutoire: non-paiement = resiliation 30 jours apres mise en demeure."
"Frais: droits enregistrement a charge locataire."
"Juridiction: tribunaux de ${company.ville}."
"Election de domicile: lieux loues."
"Pouvoirs: porteur exemplaire pour formalites."
"Fait a ${company.ville} le [DATE] - Signatures legalises"
"[BAILLEUR] / ${company.raisonSociale} represente par gerant"
"Le bailleur / Le locataire"`);

      } else if (selectedDoc!.id === 'contrat_domiciliation') {
        content = await callAI(`Expert juridique marocain. Genere CONTRAT DE DOMICILIATION - exactement 2 pages.
${base}
STRUCTURE EXACTE (modele officiel avec article 93 CRCP):
"Nous Soussignes, [DOMICILIATAIRE] SARL AU IF:[IF] RC:[RC] ICE:[ICE], declarant que ${company.raisonSociale} a domicilie son adresse fiscale dans nos locaux situes au [ADRESSE]."
"Nous declarons avoir pris connaissance des dispositions article 93 CRCP sur la responsabilite fiscale du domiciliataire."

"CONDITIONS GENERALES DE DOMICILIATION JURIDIQUE ET FISCAL"
"[DOMICILIATAIRE] represente par [GERANT] CIN [CIN], et ${company.raisonSociale} represente par son gerant."

"ARTICLE I - CADRE LEGAL" loi marocaine, COC, facilitation investissement.
"ARTICLE II - OBJET" domiciliation siege, reception courrier, fax.
"ARTICLE III - DUREE" [DEBUT] au [FIN], tacite reconduction, preavis 1 mois R/AR, obligation informer greffe et impots.
"ARTICLE IV - OBLIGATIONS DU DOMICILIE" paiement honoraires, declaration changements, remise annuelle copies declarations fiscales TVA bilan CNSS.
"ARTICLE V - RESILIATION" 30 jours mise en demeure: non-paiement, non-observation, non-depot declarations.
"ARTICLE VI - ELECTION DE DOMICILE" adresses respectives.
"ARTICLE VII - PROCURATION SPECIALE" gerant ${company.raisonSociale} donne procuration [DOMICILIATAIRE] pour reception notifications.
Signatures: domiciliataire / gerant domicilie`);

      } else if (selectedDoc!.id.startsWith('pv_') || selectedDoc!.id === 'transfert_siege' || selectedDoc!.id === 'changement_nom' || selectedDoc!.id === 'augmentation_capital' || selectedDoc!.id === 'nomination_gerant') {
        content = await callAI(`Expert juridique marocain. Genere PV ASSEMBLEE GENERALE EXTRAORDINAIRE - exactement 1-2 pages.
${base}
STRUCTURE EXACTE (modele officiel marocain):
"${company.raisonSociale}
SOCIETE A RESPONSABILITE LIMITEE AU CAPITAL DE [CAPITAL] DIRHAMS
SIEGE SOCIAL: ${company.adresse} ${company.ville}
RC: ${company.rc}"

"PROCES-VERBAL DE L'ASSEMBLEE GENERALE EXTRAORDINAIRE
TENUE LE [DATE]"

"Le [DATE], Les associes de la societe ${company.raisonSociale}, SARL au capital de [CAPITAL] DH, siege ${company.adresse} ${company.ville}, se sont reunis audit siege sur convocation du gerant conformement aux dispositions statutaires."

"Premiere Resolution"
[Decision detaillee avec ancien et nouveau texte si modification]
"Cette resolution, mise au voix est adoptee a l'unanimite."

"Deuxieme Resolution"
"L'AGE decide d'adopter de nouveaux statuts en consequence."
"Cette resolution, mise au voix est adoptee a l'unanimite."

"Troisieme Resolution"
"L'AGE confere tous pouvoirs au porteur d'un original du present PV pour accomplir les formalites prescrites par la loi."
"Cette resolution, mise au voix est adoptee a l'unanimite."

"L'ordre du jour etant epuise, la seance est levee."
"De tout ce qui precede, il a ete dresse le present PV qui apres lecture a ete signe par les associes."

[Signatures associes]`);

      } else {
        content = await callAI(`Expert juridique marocain. Genere: ${selectedDoc!.name}
${base}
Document conforme droit marocain. Titre officiel. Articles numerotes. Signatures. 2 pages max. Texte simple.`);
      }

      setDocContent(content);
      setDocReady(true);
      setMessages(prev => [...prev, { role: 'assistant', content: `✅ Document genere!\n\n📄 ${selectedDoc?.name}\n🏢 ${company.raisonSociale}\n\n📥 PDF · Word · Partager →` }]);
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
      if (t.startsWith('TITRE')) { doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(15, 31, 61); y += 4; }
      else if (t.startsWith('ARTICLE') || t.startsWith('Art.')) { doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(15, 31, 61); y += 2; }
      else if (t.toUpperCase() === t && t.length > 5 && !t.includes('MAD') && !t.includes(':')) { doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(15, 31, 61); y += 2; }
      else { doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(30, 30, 30); }
      const isHeader = y < 40;
doc.text(line, isHeader ? 105 : 15, y, { align: isHeader ? 'center' : 'left' });
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
      if (t.startsWith('TITRE')) return new Paragraph({ text: t, heading: HeadingLevel.HEADING_1 });
      if (t.startsWith('ARTICLE')) return new Paragraph({ text: t, heading: HeadingLevel.HEADING_2 });
      if (t.toUpperCase() === t && t.length > 5 && !t.includes('MAD')) return new Paragraph({ text: t, heading: HeadingLevel.HEADING_3 });
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
    if (navigator.share) await navigator.share({ title: selectedDoc?.name, text });
    else { await navigator.clipboard.writeText(text); alert('Copie dans le presse-papier!'); }
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
                <FileText size={12} /> {cat}
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
                        <button onClick={() => router.push('/companies')} className="mt-2 text-xs text-blue-500 hover:underline">+ Ajouter</button>
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
              <p className="text-gray-400 text-sm mt-1">Statuts, PV, cessions, contrats...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}