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
  { id: 'cession_parts', category: 'Cession', name: 'Cession de Parts Sociales', nameAr: 'بيع الحصص الاجتماعية', description: 'Contrat cession parts entre associes', fields: ['cedant', 'cin_cedant', 'adresse_cedant', 'cessionnaire', 'cin_cessionnaire', 'adresse_cessionnaire', 'nombre_parts', 'prix', 'date'] },
  { id: 'entree_associe', category: 'Cession', name: 'Entree Nouvel Associe', nameAr: 'دخول شريك جديد', description: 'Acte entree nouvel associe', fields: ['nouvel_associe', 'cin_nouvel_associe', 'adresse_nouvel_associe', 'apport', 'parts', 'date'] },
  { id: 'lettre_demission', category: 'Cession', name: 'Lettre de Demission Gerant', nameAr: 'رسالة استقالة المدير', description: 'Demission du gerant avec date effet', fields: ['gerant_demissionnaire', 'cin_gerant', 'adresse_gerant', 'destinataire', 'date_effet'] },
  { id: 'dissolution', category: 'Dissolution', name: 'PV Dissolution Societe', nameAr: 'حل الشركة', description: 'Decision de dissolution volontaire', fields: ['date', 'motif', 'liquidateur', 'cin_liquidateur'] },
  { id: 'pv_liquidation', category: 'Dissolution', name: 'PV Cloture Liquidation', nameAr: 'محضر إقفال التصفية', description: 'Cloture de liquidation', fields: ['liquidateur', 'boni', 'date'] },
  { id: 'pv_age', category: 'Decisions', name: 'PV Assemblee Generale', nameAr: 'محضر الجمعية العامة', description: 'PV assemblee generale ordinaire', fields: ['date', 'ordre_du_jour', 'decisions', 'participants'] },
  { id: 'pv_dividendes', category: 'Decisions', name: 'PV Distribution Dividendes', nameAr: 'توزيع الأرباح', description: 'Decision distribution benefices', fields: ['exercice', 'benefice', 'dividende_par_part', 'date'] },
  { id: 'contrat_bail', category: 'Contrats', name: 'Contrat de Bail Commercial', nameAr: 'عقد الكراء التجاري', description: 'Bail commercial avec toutes clauses', fields: ['bailleur', 'cin_bailleur', 'adresse_bailleur', 'adresse_local', 'loyer_mensuel', 'duree_bail', 'depot_garantie', 'date'] },
  { id: 'contrat_domiciliation', category: 'Contrats', name: 'Contrat de Domiciliation', nameAr: 'عقد التوطين', description: 'Domiciliation siege social avec art 93 CRCP', fields: ['domiciliataire', 'if_domiciliataire', 'rc_domiciliataire', 'ice_domiciliataire', 'gerant_domiciliataire', 'cin_domiciliataire', 'adresse_domiciliation', 'duree', 'honoraires_mensuels'] },
  { id: 'contrat_prestation', category: 'Contrats', name: 'Contrat de Prestation', nameAr: 'عقد الخدمات', description: 'Contrat de prestation de services', fields: ['client', 'nature_prestation', 'duree', 'honoraires', 'modalites_paiement'] },
  { id: 'nda', category: 'Contrats', name: 'Accord de Confidentialite NDA', nameAr: 'اتفاقية السرية', description: 'Non-Disclosure Agreement', fields: ['partie_2', 'objet_confidentialite', 'duree', 'date'] },
];

const categories = ['Creation', 'Modifications', 'Cession', 'Dissolution', 'Decisions', 'Contrats'];

const fieldLabels: Record<string, string> = {
  associes: 'Noms, CIN, adresses et parts de chaque associe (ex: Ahmed CIN A123 50%, Sara CIN B456 50%)',
  associe_unique: "Nom complet de l'associe unique",
  cin_associe: "CIN de l'associe unique",
  capital: 'Capital social en MAD (ex: 100000)',
  siege: 'Adresse complete du siege social',
  activite: 'Objet social / activites principales (detaillees)',
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
  ancien_gerant: 'Nom de l\'ancien gerant',
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
  destinataire: 'Nom du destinataire (associes ou nouveau gerant)',
  date_effet: 'Date de prise d\'effet de la demission',
  motif: 'Motif de la dissolution',
  liquidateur: 'Nom du liquidateur',
  cin_liquidateur: 'CIN du liquidateur',
  boni: 'Boni de liquidation en MAD',
  ordre_du_jour: "Points a l'ordre du jour",
  exercice: 'Exercice fiscal (ex: 2025)',
  benefice: 'Benefice net distribuable en MAD',
  dividende_par_part: 'Dividende par part sociale en MAD',
  bailleur: 'Nom complet du bailleur (proprietaire)',
  cin_bailleur: 'CIN du bailleur',
  adresse_bailleur: 'Adresse personnelle du bailleur',
  adresse_local: 'Adresse complete du local loue',
  loyer_mensuel: 'Loyer mensuel TTC en MAD',
  duree_bail: 'Duree du bail (ex: 2 ans)',
  depot_garantie: 'Montant caution en MAD (generalement 2 mois)',
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
  nature_prestation: 'Nature de la prestation de services',
  honoraires: 'Honoraires en MAD',
  modalites_paiement: 'Modalites de paiement',
  partie_2: 'Nom/Societe Partie 2',
  objet_confidentialite: 'Informations confidentielles concernees',
};

const cleanText = (text: string) => text
  .replace(/\*\*/g, '').replace(/#{1,3} /g, '').replace(/```[\s\S]*?```/g, '')
  .replace(/`/g, '').replace(/%[A-Z]/g, '').replace(/\[.*?\]/g, '')
  .replace(/&nbsp;/g, ' ').replace(/<[^>]*>/g, '').replace(/\|/g, ' ').trim();

const getPrompt = (docId: string, docName: string, company: Company, data: Record<string, string>) => {
  const companyInfo = `
SOCIETE:
- Raison sociale: ${company.raisonSociale}
- Forme juridique: ${company.formeJuridique}
- Capital: ${data.capital || ''} DH
- IF: ${company.if_fiscal}
- ICE: ${company.ice}
- RC: ${company.rc}
- CNSS: ${company.cnss}
- Adresse: ${company.adresse} ${company.ville}
- Tel: ${company.telephone}
- Activite: ${company.activite}`;

  const dataInfo = Object.entries(data).map(([k, v]) => `${fieldLabels[k] || k}: ${v}`).join('\n');

  const rules = `
REGLES STRICTES:
- N'utilise JAMAIS de tableaux ASCII (%, |, +, T, Z, W, Q, P comme bordures)
- N'utilise JAMAIS de HTML ou balises
- Ecris tout en texte simple structure
- Montants toujours en chiffres ET en toutes lettres`;

  if (docId === 'statuts_sarl' || docId === 'statuts_sarl_au') {
    return `Tu es un expert juridique marocain. Genere les STATUTS complets de la societe.
${companyInfo}
DONNEES: ${dataInfo}
${rules}

STRUCTURE OBLIGATOIRE (30 articles minimum, 7 pages):

En-tete: "${company.raisonSociale} - SOCIETE A RESPONSABILITE LIMITEE AU CAPITAL DE [CAPITAL] DIRHAMS - SIEGE SOCIAL: [ADRESSE] - STATUTS"

"LES SOUSSIGNES:" avec identite complete de chaque associe (nom, nationalite, date naissance, ville naissance, CIN, adresse)
"A etabli ainsi qu'il suit les statuts d'une societe a responsabilite limitee..."

TITRE PREMIER - FORMATION-DENOMINATION-OBJET-SIEGE-DUREE
Article 1: Formation - "Il est forme par les presentes, entre les soussignes... une societe a responsabilite limitee regie par le Dahir 1-97-49 du 13 fevrier 1997 portant promulgation de la loi 5-96 et le Dahir 1-06-21 du 14 fevrier 2006 portant promulgation de la loi 21-05..."
Article 2: Denomination - mentions obligatoires sur actes (SARL, capital, ICE, RC)
Article 3: Objet social - liste detaillee avec tirets de toutes les activites
Article 4: Siege social - adresse complete, possibilite transfert par AGE
Article 5: Duree - 99 ans, dissolution anticipee possible

TITRE II - APPORTS-CAPITAL-PARTS SOCIALES
Article 6: Apports en numeraire - montant par associe en chiffres et lettres
Article 7: Capital social - total, nombre parts, valeur nominale 100 DH, repartition par associe avec numerotation (Part 1 a X)
Article 8: Augmentation ou reduction du capital - conditions, commissaire apports si > 100000 DH
Article 9: Parts sociales - non negociables, copie certifiee par gerance
Article 10: Cession des parts - libre entre associes/conjoint/parents, agrement associes pour tiers, droit de preemption
Article 11: Transmission par succession - libre, mandataire dans 3 mois

TITRE III - GERANCE DE LA SOCIETE
Article 12: Gerance - "Mr/Mme [NOM GERANT], nationalite marocaine, ne le... a..., titulaire CIN N°... demeurant a... Est nomme GERANT UNIQUE pour une duree illimitee." + liste complete des pouvoirs
Article 13: Signature sociale - nom et CIN gerant
Article 14: Remuneration de la gerance - fixe ou proportionnel par AGO

TITRE IV - DECISIONS COLLECTIVES
Article 15: Droit de vote - parts = voix, vote ecrit ou assemblee, usufruit vote usufruitier
Article 16: Assemblee annuelle - dans 3 mois apres cloture, quorum 75% capital
Article 17: Quorum - majorite voix et moitie capital, seconde consultation majorite simple
Article 18: AGE - modifications statutaires unanimite
Article 19: Registre resolutions - PV signes par gerant president bureau

TITRE V - EXERCICE SOCIAL-COMPTES-RESULTATS
Article 20: Annee sociale - 1er janvier au 31 decembre
Article 21: Repartition benefices - proportionnellement aux parts
Article 22: Comptes courants - avec accord gerance, interets taux bancaire

TITRE VI - DISSOLUTION-LIQUIDATION
Article 23: Deces associe - societe continue, heritiers dans 3 mois, subrogation droits
Article 24: Deces/demission/revocation gerant - remplacement par vote majoritaire
Article 25: Dissolution - expiration ou 3/4 capital, prorogation tacite annuelle
Article 26: Liquidation - par gerant en fonction, remboursement passif puis repartition proportionnelle

TITRE VII - DISPOSITIONS DIVERSES
Article 27: Contestation - tribunaux competents circonscription siege
Article 28: Publications - pouvoir porteur original pour formalites
Article 29: Frais - timbres, redaction, enregistrement, depot a compte frais constitution
Article 30: Transformation-Fusion - decision unanime associes

"Les statuts seront deposes conformement a la loi au Tribunal de commerce de ${company.ville}."

"LES ASSOCIES"
[noms des associes]

Genere le document COMPLET en texte propre.`;
  }

  if (docId === 'cession_parts') {
    return `Tu es un expert juridique marocain. Genere une CESSION DE PARTS SOCIALES complete.
${companyInfo}
DONNEES: ${dataInfo}
${rules}

STRUCTURE OBLIGATOIRE (modele marocain officiel):

"${company.raisonSociale}
SOCIETE A RESPONSABILITE LIMITEE AU CAPITAL DE [CAPITAL] DIRHAMS
SIEGE SOCIAL: ${company.adresse} ${company.ville}
ICE: ${company.ice}   RC: ${company.rc}   IF: ${company.if_fiscal}"

"CESSION DE PARTS SOCIALES"

"ENTRE-LES SOUSSIGNES:"
Cedant: [nom], nationalite marocaine, ne le [date], demeurant a [adresse], titulaire CIN N° [cin]
"D'UNE PART"
Cessionnaire: [nom], nationalite marocaine, ne le [date], demeurant a [adresse], titulaire CIN N° [cin]
"D'AUTRE PART"

"IL EST EXPRESSEMENT CONVENU ET ARRETE CE QUI SUIT:"
Cession de [nombre] parts soit [totalite/partie] des parts au prix de [montant] DH

"ETANT ICI PRECISE:"
- RC de la societe: ${company.rc}
- Capital: [montant] DH divise en [nombre] parts de 100 DH chacune integralement liberees

"ORIGINE DE PROPRIETE:" - parts appartenant au cedant pour les avoir acquises lors...

"SUBROGATION DANS LES DROITS DU CEDANT:" - cessionnaire subroge dans tous droits...

"PROPRIETE ET JOUISSANCE:" - propriete et jouissance immediate, droit dividendes...

"PRIX DE VENTE:" - prix principal de [montant en lettres] ([chiffres]) DIRHAMS, paye comptant, quittance definitive

"DONT QUITTANCE"

"NANTISSEMENT - SAISIES:" - parts libres de tous nantissements...

"FRAIS:" - a charge exclusive du cessionnaire

"ELECTION DE DOMICILE:" - demeures respectives et siege social

"CLAUSE PARTICULIERE:" - cessionnaire declare statuts valables...

"FORMALITES - POUVOIRS:" - tous pouvoirs au porteur original

"REQUISITION:" - parties requierent chef service enregistrement...

"FAIT A ${company.ville} EN SIX EXEMPLAIRES ET EN BONNE FOI LE [DATE EN TOUTES LETTRES]"

"LE CEDANT" / "LE CESSIONNAIRE"
[noms]

Genere le document COMPLET en texte propre.`;
  }

  if (docId === 'transfert_siege' || docId === 'changement_nom' || docId === 'augmentation_capital' || docId === 'nomination_gerant' || docId === 'pv_age' || docId === 'pv_dividendes' || docId === 'pv_constitution') {
    return `Tu es un expert juridique marocain. Genere un PROCES-VERBAL D'ASSEMBLEE GENERALE EXTRAORDINAIRE.
${companyInfo}
DONNEES: ${dataInfo}
${rules}

STRUCTURE OBLIGATOIRE (modele marocain officiel):

"${company.raisonSociale}
SOCIETE A RESPONSABILITE LIMITEE AU CAPITAL DE [CAPITAL] DIRHAMS
SIEGE SOCIAL: ${company.adresse} ${company.ville}
RC: ${company.rc}"

"PROCES-VERBAL DE L'ASSEMBLEE GENERALE EXTRAORDINAIRE
TENUE LE [DATE]"

"Le [DATE], Les associes de la societe ${company.raisonSociale}, Societe a Responsabilite Limitee, au capital de [CAPITAL] DH et dont le siege social est ${company.adresse} ${company.ville}, s'est rendu audit siege sur convocation du gerant conformement aux dispositions statutaires et a la legislation en vigueur."

Pour chaque decision:
"Premiere Resolution"
[Texte de la decision detaillee]
"Cette resolution, mise au voix est adoptee a l'unanimite."

"Deuxieme Resolution"
[Adoption nouveaux statuts si modification]
"Cette resolution, mise au voix est adoptee a l'unanimite."

"Troisieme Resolution"
"L'Assemblee Generale Extraordinaire confere tous pouvoirs au porteur d'un original d'une expedition, d'une copie ou d'un extrait du present proces-verbal, pour accomplir les formalites prescrites par la loi."
"Cette resolution, mise au voix est adoptee a l'unanimite."

"L'ordre du jour etant epuise, la seance est levee. De tout ce qui precede, il a ete dresse le present Proces-verbal qui apres lecture a ete signe par Les associes."

[Signatures des associes avec noms complets]

Genere le document COMPLET en texte propre.`;
  }

  if (docId === 'lettre_demission') {
    return `Tu es un expert juridique marocain. Genere une LETTRE DE DEMISSION DE GERANT.
${companyInfo}
DONNEES: ${dataInfo}
${rules}

STRUCTURE OBLIGATOIRE (modele marocain officiel):

"${company.ville} le [DATE]"

"[NOM GERANT DEMISSIONNAIRE], nationalite marocaine, demeurant a [ADRESSE], titulaire CIN N° [CIN]"

"[NOM DESTINATAIRE], nationalite marocaine, demeurant a [ADRESSE], titulaire CIN N° [si connu]"

"OBJET: LETTRE DE DEMISSION"

"Mr/Mme [NOM DESTINATAIRE]"

"J'ai l'honneur de vous faire part de ma decision de demissionner de mes fonctions de gerant de la societe ${company.raisonSociale} RC: ${company.rc}"

"Conformement aux dispositions statutaires, cette demission prendra effet le [DATE EFFET]."

"Je tiens a vous assurer que toutes les dispositions seront prises pour la convocation d'une decision generale aux fins de nomination d'un nouveau gerant."

"Je vous prie d'agreer Mr/Mme [NOM DESTINATAIRE], l'expression de mes sentiments distingues."

"[NOM GERANT DEMISSIONNAIRE]"

Genere le document COMPLET en texte propre.`;
  }

  if (docId === 'contrat_bail') {
    return `Tu es un expert juridique marocain. Genere un CONTRAT DE BAIL COMMERCIAL.
${companyInfo}
DONNEES: ${dataInfo}
${rules}

STRUCTURE OBLIGATOIRE (modele marocain officiel):

"CONTRAT DE BAIL"

"Entre les soussignes:"
"Mr/Mme [BAILLEUR] de nationalite marocaine, titulaire de la CIN N° [CIN], demeurant a [ADRESSE] en qualite de proprietaire."
"Et"
"La societe ${company.raisonSociale}, ayant son siege social a ${company.adresse} ${company.ville}, representee par ${company.raisonSociale} marocain, titulaire de la CIN N° ${company.if_fiscal}, gerant de la societe."
"Ci-apres denomme(e)(s) le locataire"

"IL A ETE CONVENU ET ARRETE CE QUI SUIT:"

"1. Le bailleur donne en location les locaux ci-apres designes au locataire qui les accepte:"
- Local privatif: [ADRESSE LOCAL]
- Le local fait objet du titre foncier [si disponible]
- Usage: bureau/commercial

"Duree du contrat:"
"Le present bail est consenti pour une duree de [DUREE] a compter du [DATE], renouvelable par tacite reconduction pour une periode equivalente. Toute resiliation d'une ou l'autre des parties devant se faire par courrier R/AR au moins trois mois a l'avance."

"Condition:"
1. Pas de construction/demolition sans accord ecrit bailleur
2. Activite compatible bureau/commerce uniquement
3. Pas de cession ou sous-location sans accord ecrit

"Loyer et caution:"
"Le present bail est consenti et accepte moyennant le loyer mensuel TTC de [MONTANT] MAD ([EN LETTRES]), le preneur a verser un montant de [CAUTION] MAD ([EN LETTRES]) representant [X] mois de caution. Cette caution sera restituee au preneur au moment ou il quittera les lieux."

"Clause resolutoire:"
"En cas de non-paiement des termes du loyer, ou d'inexecution par le locataire d'une seule des clauses de present bail, celui-ci pourra etre resilie de plein droit, si bon semble au bailleur, et ce 30 jours apres l'envoi au locataire d'une mise en demeure."

"Frais:"
"Tous les frais des presentes, droits d'enregistrement ainsi que leurs suites et consequences seront a la charge du locataire."

"Clause attributive et juridiction:"
"Tout litige entre les parties est ressorti exclusif des tribunaux de ${company.ville}."

"Election de domicile:"
"Pour l'execution des presentes, les parties elisent domicile dans les lieux loues."

"Pouvoirs:"
"Tous les pouvoirs sont donnes au porteur d'un exemplaire pour accomplir toutes les formalites requises par la loi."

"Fait a ${company.ville} le [DATE]"
"Signatures legalises:"
"[NOM BAILLEUR] / ${company.raisonSociale} represente par [GERANT]"
"Le bailleur / Le locataire"

Genere le document COMPLET en texte propre.`;
  }

  if (docId === 'contrat_domiciliation') {
    return `Tu es un expert juridique marocain. Genere un CONTRAT DE DOMICILIATION.
${companyInfo}
DONNEES: ${dataInfo}
${rules}

STRUCTURE OBLIGATOIRE (modele marocain officiel avec article 93 CRCP):

Declaration initiale:
"Nous Soussignes, [DOMICILIATAIRE] SARL AU, declarant par la presente que la societe ${company.raisonSociale}, a domicilie son adresse fiscale dans nos locaux situes au [ADRESSE DOMICILIATION]"
"Nous declarons en outre avoir pris connaissance qu'en application des dispositions de l'article 93 du CRCP, les roles d'impots, etats de produits et autres titres de perception regulierement emis sont executoires contre les redevables..."

"CONDITIONS GENERALES DE DOMICILIATION JURIDIQUE ET FISCAL"

Identification domiciliataire avec IF, RC, ICE, gerant CIN
Identification domicilie: ${company.raisonSociale} represente par gerant CIN

"ARTICLE I - CADRE LEGAL" - loi marocaine, COC, facilitation investissement jeunes promoteurs
"ARTICLE II - OBJET" - domiciliation siege, reception courrier, fax, mises a disposition
"ARTICLE III - DUREE" - dates exactes [DEBUT] au [FIN], tacite reconduction, preavis 1 mois R/AR, obligation informer greffe et impots en cas non-renouvellement
"ARTICLE IV - OBLIGATIONS DU DOMICILIE" - paiement honoraires, declaration changements situation, remise annuelle copies depots declarations fiscales (TVA, bilan, declarations sociales)
"ARTICLE V - RESILIATION DU CONTRAT" - 30 jours mise en demeure R/AR: non-paiement, non-observation clauses, non-depot declarations, non-information changements
"ARTICLE VI - ELECTION DE DOMICILE" - adresses respectives
"ARTICLE VII - PROCURATION SPECIALE" - "[NOM GERANT DOMICILIE] agissant en qualite de Gerant de la societe ${company.raisonSociale}... donne par la presente procuration [DOMICILIATAIRE] pour la reception de toutes sortes de notifications en notre nom"

Signatures: domiciliataire / domicilie

Genere le document COMPLET en texte propre.`;
  }

  return `Tu es un expert juridique marocain. Genere le document: ${docName}
${companyInfo}
DONNEES: ${dataInfo}
${rules}

Exigences:
1. En-tete avec nom societe, capital, siege, IF, ICE, RC
2. Titre officiel en majuscules
3. "Fait a ${company.ville}, le [date]"
4. Articles numerotes
5. Conforme loi marocaine (Loi 5-96, Loi 17-95)
6. Signatures completes

Genere le document COMPLET en texte propre, sans commentaires.`;
};

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
      const prompt = getPrompt(selectedDoc!.id, selectedDoc!.name, company, data);
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'consultant', message: prompt }),
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
      } else if (t.startsWith('ARTICLE') || t.startsWith('Art.') || t.startsWith('TITRE')) {
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
      if (t.startsWith('TITRE')) return new Paragraph({ text: t, heading: HeadingLevel.HEADING_1 });
      if (t.toUpperCase() === t && t.length > 5 && !t.includes('MAD')) return new Paragraph({ text: t, heading: HeadingLevel.HEADING_2 });
      if (t.startsWith('ARTICLE') || t.startsWith('Art.')) return new Paragraph({ text: t, heading: HeadingLevel.HEADING_3 });
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
              <p className="text-gray-400 text-sm mt-1">Statuts, PV, cessions, contrats...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}