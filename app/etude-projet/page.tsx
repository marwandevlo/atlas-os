'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Bot, User, Download, CheckCircle, BarChart2, Building2, TrendingUp, Users, DollarSign, AlertTriangle } from 'lucide-react';

type Message = { role: 'user' | 'assistant'; content: string; };

const questions = [
  { key: 'nom_projet', q: "Quel est le nom de votre projet?" },
  { key: 'nom_gerant', q: "Quel est votre nom complet (gérant/porteur de projet)?" },
  { key: 'cin', q: "Votre numéro de CIN?" },
  { key: 'experience', q: "Décrivez votre expérience dans ce domaine (années, postes, formations...)?" },
  { key: 'secteur', q: "Dans quel secteur d'activité?\n(Commerce, Services, Restauration, BTP, Industrie, Agriculture, Transport, Santé, IT...)" },
  { key: 'forme_juridique', q: "Forme juridique souhaitée?\n1. Auto-entrepreneur\n2. SARL AU (associé unique)\n3. SARL (plusieurs associés)\n4. SA\n5. Recommandez-moi la meilleure option" },
  { key: 'ville', q: "Dans quelle ville au Maroc?" },
  { key: 'capital', q: "Capital disponible en MAD?" },
  { key: 'loyer', q: "Loyer mensuel prévu en MAD? (0 si local propre)" },
  { key: 'employes', q: "Nombre d'employés au démarrage?" },
  { key: 'ca_prevu', q: "Chiffre d'affaires mensuel visé en MAD?" },
  { key: 'charges', q: "Autres charges mensuelles en MAD (fournitures, transport, communication...)" },
  { key: 'financement', q: "Type de financement recherché?\n1. Prêt bancaire classique\n2. Programme Intelaka (jeunes entrepreneurs)\n3. Fonds Hassan II\n4. Investisseur privé / Business Angel\n5. Autofinancement\n6. Combinaison de plusieurs sources" },
  { key: 'description', q: "Décrivez votre projet et ce qui le différencie de la concurrence (2-3 phrases)." },
];

export default function EtudeProjetPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Bonjour! 👋 Je suis votre expert en création d'entreprise au Maroc.\n\nJe vais créer une étude de faisabilité PROFESSIONNELLE prête à soumettre à une banque, un investisseur ou un programme de soutien (Intelaka, Hassan II...).\n\nRépondez à mes questions et votre dossier sera prêt en quelques minutes!\n\n" + questions[0].q }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Record<string, string>>({});
  const [etudeReady, setEtudeReady] = useState(false);
  const [etude, setEtude] = useState('');
  const [companyData, setCompanyData] = useState<Record<string, string>>({});
  const [financials, setFinancials] = useState<Record<string, number>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('atlas_company');
    if (saved) setCompanyData(JSON.parse(saved));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
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
        content: "✅ Parfait! J'ai toutes les informations.\n\n🔄 Génération de votre étude complète...\nCela peut prendre 15-30 secondes ⏳"
      }]);
      await generateEtude(newData);
      setLoading(false);
    }
  };

  const generateEtude = async (projectData: Record<string, string>) => {
    const capital = parseFloat(projectData.capital) || 0;
    const loyer = parseFloat(projectData.loyer) || 0;
    const employes = parseFloat(projectData.employes) || 0;
    const ca = parseFloat(projectData.ca_prevu) || 0;
    const charges = parseFloat(projectData.charges) || 0;
    const salaireMoyen = 4500;
    const totalSalaires = employes * salaireMoyen;
    const cnssPatronal = totalSalaires * 0.2126;
    const amoPatronal = totalSalaires * 0.0203;
    const totalCharges = loyer + totalSalaires + cnssPatronal + amoPatronal + charges;
    const resultatMensuel = ca - totalCharges;
    const resultatAnnuel = resultatMensuel * 12;
    const tva = ca * 0.20;
    const is = resultatAnnuel > 0 ? (resultatAnnuel <= 300000 ? resultatAnnuel * 0.10 : resultatAnnuel <= 1000000 ? resultatAnnuel * 0.20 : resultatAnnuel * 0.26) : 0;
    const payback = capital > 0 && resultatMensuel > 0 ? Math.ceil(capital / resultatMensuel) : 0;
    const rentabilite = ca > 0 ? ((resultatMensuel / ca) * 100).toFixed(1) : '0';
    const score = resultatMensuel > ca * 0.25 ? '🟢 EXCELLENT' : resultatMensuel > ca * 0.10 ? '🟡 BON' : resultatMensuel > 0 ? '🟠 ACCEPTABLE' : '🔴 RISQUÉ';

    setFinancials({ capital, loyer, employes, ca, charges, totalSalaires, cnssPatronal, amoPatronal, totalCharges, resultatMensuel, resultatAnnuel, tva, is, payback, rentabilite: parseFloat(rentabilite) });

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'consultant',
          message: `Tu es un expert-comptable et conseiller en création d'entreprise au Maroc. Génère une étude de faisabilité PROFESSIONNELLE et COMPLÈTE.

PORTEUR DU PROJET:
- Nom: ${projectData.nom_gerant}
- CIN: ${projectData.cin}
- Expérience: ${projectData.experience}

ENTREPRISE (si existante):
- Raison sociale: ${companyData.raisonSociale || 'À créer'}
- IF: ${companyData.if_fiscal || 'À obtenir'}
- ICE: ${companyData.ice || 'À obtenir'}
- RC: ${companyData.rc || 'À obtenir'}
- CNSS: ${companyData.cnss || 'À obtenir'}
- Adresse: ${companyData.adresse || ''} ${companyData.ville || ''}

PROJET:
- Nom: ${projectData.nom_projet}
- Secteur: ${projectData.secteur}
- Forme juridique: ${projectData.forme_juridique}
- Ville: ${projectData.ville}
- Description: ${projectData.description}
- Financement: ${projectData.financement}

ANALYSE FINANCIÈRE:
- Capital: ${capital.toLocaleString()} MAD
- CA mensuel visé: ${ca.toLocaleString()} MAD | Annuel: ${(ca*12).toLocaleString()} MAD
- Loyer: ${loyer.toLocaleString()} MAD/mois
- Salaires (${employes} emp × 4500): ${totalSalaires.toLocaleString()} MAD
- CNSS patronal: ${cnssPatronal.toFixed(0)} MAD | AMO: ${amoPatronal.toFixed(0)} MAD
- Autres charges: ${charges.toLocaleString()} MAD
- TOTAL CHARGES: ${totalCharges.toLocaleString()} MAD/mois
- RÉSULTAT NET: ${resultatMensuel.toLocaleString()} MAD/mois | ${resultatAnnuel.toLocaleString()} MAD/an
- TVA mensuelle: ${tva.toLocaleString()} MAD
- IS annuel estimé: ${is.toLocaleString()} MAD
- Seuil rentabilité: ${totalCharges.toLocaleString()} MAD/mois
- Délai retour: ${payback} mois
- Taux rentabilité: ${rentabilite}%
- Score: ${score}

GÉNÈRE L'ÉTUDE AVEC CES SECTIONS:

══════════════════════════════════════════
ÉTUDE DE FAISABILITÉ — ${projectData.nom_projet.toUpperCase()}
Préparée par Atlas OS Enterprise
Date: ${new Date().toLocaleDateString('fr-MA')}
Confidentiel — Usage bancaire et administratif
══════════════════════════════════════════

1. RÉSUMÉ EXÉCUTIF
[Synthèse projet, opportunité, montant financement demandé, viabilité]

2. PRÉSENTATION DU PORTEUR DE PROJET
[${projectData.nom_gerant}, CIN: ${projectData.cin}, expérience, compétences, motivations]

3. DESCRIPTION DU PROJET
[Concept détaillé, produits/services, valeur ajoutée, avantage concurrentiel, zone de chalandise ${projectData.ville}]

4. ANALYSE DU MARCHÉ MAROCAIN — ${projectData.secteur}
[Taille marché, tendances 2024-2026, concurrence locale à ${projectData.ville}, part de marché visée, clientèle cible]

5. FORME JURIDIQUE ET CADRE LÉGAL
[Analyse ${projectData.forme_juridique}, étapes création, documents tribunal commerce, coûts et délais, obligations fiscales et sociales]

6. PLAN FINANCIER PRÉVISIONNEL 3 ANS
Année 1: CA ${(ca*12).toLocaleString()} MAD | Charges ${(totalCharges*12).toLocaleString()} MAD | Résultat ${(resultatAnnuel).toLocaleString()} MAD
Année 2: [+20% croissance estimée]
Année 3: [+15% croissance estimée]
[Tableau détaillé investissements, BFR, flux trésorerie]

7. ANALYSE FISCALE ET SOCIALE COMPLÈTE
[TVA ${tva.toLocaleString()} MAD/mois, IS ${is.toLocaleString()} MAD/an, CNSS ${cnssPatronal.toFixed(0)} MAD/mois, déclarations DGI, avantages fiscaux applicables au secteur]

8. BESOINS EN FINANCEMENT ET SOLUTIONS DÉTAILLÉES
[Montant: ${capital.toLocaleString()} MAD, options ${projectData.financement}, conditions Intelaka/banques marocaines, garanties, tableau amortissement]

9. ANALYSE SWOT
Forces | Faiblesses | Opportunités | Menaces

10. INDICATEURS CLÉS DE PERFORMANCE (KPIs)
[Seuil rentabilité: ${totalCharges.toLocaleString()} MAD, Payback: ${payback} mois, ROI: ${rentabilite}%, score: ${score}]

11. PLAN D'ACTION — CALENDRIER DE LANCEMENT
[Mois 1-3: création, Mois 4-6: démarrage, Année 1: objectifs]

12. CONCLUSION ET RECOMMANDATION D'EXPERT
[Avis professionnel, recommandations prioritaires, conditions de succès]

Sois très précis avec des données réelles du marché marocain. Le document doit convaincre une banque.`
        }),
      });
      const responseData = await response.json();
      setEtude(responseData.response);
      setEtudeReady(true);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `🎉 Votre étude de faisabilité est prête!\n\n${score}\n\n📊 Indicateurs clés:\n• CA visé: ${ca.toLocaleString()} MAD/mois\n• Charges: ${totalCharges.toLocaleString()} MAD/mois\n• Résultat net: ${resultatMensuel.toLocaleString()} MAD/mois\n• Rentabilité: ${rentabilite}%\n• Payback: ${payback} mois\n\n✅ Document prêt pour:\n• Demande de prêt bancaire\n• Programme Intelaka\n• Présentation investisseurs\n\n📄 Téléchargez votre PDF professionnel →`
      }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erreur. Réessayez.' }]);
    }
  };

  const downloadPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF();

    // PAGE 1 — Couverture
    doc.setFillColor(15, 31, 61);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setFillColor(251, 191, 36);
    doc.rect(0, 0, 8, 297, 'F');
    
    doc.setTextColor(251, 191, 36);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('ATLAS OS ENTERPRISE', 20, 35);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(32);
    doc.text('ÉTUDE DE', 20, 80);
    doc.text('FAISABILITÉ', 20, 100);
    
    doc.setFillColor(251, 191, 36);
    doc.rect(20, 108, 120, 2, 'F');
    
    doc.setFontSize(20);
    doc.setTextColor(251, 191, 36);
    doc.text(data.nom_projet || 'Mon Projet', 20, 125);
    
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(`Secteur: ${data.secteur || ''}`, 20, 145);
    doc.text(`Forme juridique: ${data.forme_juridique || ''}`, 20, 157);
    doc.text(`Ville: ${data.ville || ''}`, 20, 169);
    doc.text(`Porteur: ${data.nom_gerant || ''}`, 20, 181);
    doc.text(`CIN: ${data.cin || ''}`, 20, 193);

    if (companyData.raisonSociale) {
      doc.setFillColor(255, 255, 255, 0.1);
      doc.rect(20, 205, 170, 35, 'F');
      doc.setTextColor(251, 191, 36);
      doc.setFontSize(9);
      doc.text('SOCIÉTÉ', 25, 215);
      doc.setTextColor(255, 255, 255);
      doc.text(companyData.raisonSociale, 25, 224);
      if (companyData.if_fiscal) doc.text(`IF: ${companyData.if_fiscal}  |  ICE: ${companyData.ice || ''}  |  RC: ${companyData.rc || ''}`, 25, 233);
    }

    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255, 0.5);
    doc.text(`Préparée le ${new Date().toLocaleDateString('fr-MA')} par Atlas OS Enterprise`, 20, 265);
    doc.text('Document confidentiel — Usage bancaire et administratif', 20, 274);

    // PAGE 2 — Tableau de bord financier
    doc.addPage();
    doc.setFillColor(15, 31, 61);
    doc.rect(0, 0, 210, 20, 'F');
    doc.setFillColor(251, 191, 36);
    doc.rect(0, 0, 8, 297, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('TABLEAU DE BORD FINANCIER', 20, 13);

    // KPI Cards
    const kpis = [
      { label: 'CA MENSUEL VISÉ', value: `${financials.ca?.toLocaleString()} MAD`, color: [37, 99, 235] },
      { label: 'RÉSULTAT NET/MOIS', value: `${financials.resultatMensuel?.toLocaleString()} MAD`, color: financials.resultatMensuel > 0 ? [21, 128, 61] : [185, 28, 28] },
      { label: 'RENTABILITÉ', value: `${financials.rentabilite}%`, color: [124, 58, 237] },
      { label: 'PAYBACK', value: `${financials.payback} mois`, color: [217, 119, 6] },
    ];

    kpis.forEach((kpi, i) => {
      const x = 15 + (i % 2) * 95;
      const y = 30 + Math.floor(i / 2) * 35;
      doc.setFillColor(kpi.color[0], kpi.color[1], kpi.color[2]);
      doc.rect(x, y, 88, 28, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(kpi.label, x + 5, y + 10);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(kpi.value, x + 5, y + 22);
    });

    // Charges breakdown table
    autoTable(doc, {
      startY: 105,
      head: [['POSTE DE CHARGES', 'MENSUEL (MAD)', 'ANNUEL (MAD)', '%']],
      body: [
        ['Loyer', financials.loyer?.toLocaleString(), (financials.loyer * 12)?.toLocaleString(), `${((financials.loyer / financials.totalCharges) * 100).toFixed(1)}%`],
        ['Salaires bruts', financials.totalSalaires?.toLocaleString(), (financials.totalSalaires * 12)?.toLocaleString(), `${((financials.totalSalaires / financials.totalCharges) * 100).toFixed(1)}%`],
        ['CNSS patronal (21.26%)', financials.cnssPatronal?.toFixed(0), (financials.cnssPatronal * 12)?.toFixed(0), `${((financials.cnssPatronal / financials.totalCharges) * 100).toFixed(1)}%`],
        ['AMO patronal (2.03%)', financials.amoPatronal?.toFixed(0), (financials.amoPatronal * 12)?.toFixed(0), `${((financials.amoPatronal / financials.totalCharges) * 100).toFixed(1)}%`],
        ['Autres charges', financials.charges?.toLocaleString(), (financials.charges * 12)?.toLocaleString(), `${((financials.charges / financials.totalCharges) * 100).toFixed(1)}%`],
        ['TOTAL CHARGES', financials.totalCharges?.toLocaleString(), (financials.totalCharges * 12)?.toLocaleString(), '100%'],
      ],
      headStyles: { fillColor: [15, 31, 61], textColor: [255, 255, 255] },
      footStyles: { fillColor: [15, 31, 61], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      styles: { fontSize: 9 },
    });

    // P&L Table
    const y2 = (doc as any).lastAutoTable.finalY + 10;
    autoTable(doc, {
      startY: y2,
      head: [['COMPTE DE RÉSULTAT', 'ANNÉE 1', 'ANNÉE 2 (+20%)', 'ANNÉE 3 (+15%)']],
      body: [
        ['Chiffre d\'affaires', `${(financials.ca * 12)?.toLocaleString()} MAD`, `${(financials.ca * 12 * 1.2)?.toLocaleString()} MAD`, `${(financials.ca * 12 * 1.2 * 1.15)?.toLocaleString()} MAD`],
        ['Total charges', `${(financials.totalCharges * 12)?.toLocaleString()} MAD`, `${(financials.totalCharges * 12 * 1.1)?.toLocaleString()} MAD`, `${(financials.totalCharges * 12 * 1.1 * 1.05)?.toLocaleString()} MAD`],
        ['Résultat avant IS', `${(financials.resultatAnnuel)?.toLocaleString()} MAD`, `${(financials.ca * 12 * 1.2 - financials.totalCharges * 12 * 1.1)?.toLocaleString()} MAD`, `${(financials.ca * 12 * 1.2 * 1.15 - financials.totalCharges * 12 * 1.1 * 1.05)?.toLocaleString()} MAD`],
        ['IS estimé', `${financials.is?.toLocaleString()} MAD`, `${(financials.is * 1.2)?.toLocaleString()} MAD`, `${(financials.is * 1.38)?.toLocaleString()} MAD`],
        ['RÉSULTAT NET', `${(financials.resultatAnnuel - financials.is)?.toLocaleString()} MAD`, `${(financials.ca * 12 * 1.2 - financials.totalCharges * 12 * 1.1 - financials.is * 1.2)?.toLocaleString()} MAD`, `${(financials.ca * 12 * 1.2 * 1.15 - financials.totalCharges * 12 * 1.1 * 1.05 - financials.is * 1.38)?.toLocaleString()} MAD`],
      ],
      headStyles: { fillColor: [15, 31, 61] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      styles: { fontSize: 9 },
    });

    // PAGE 3 — Étude complète
    doc.addPage();
    doc.setFillColor(15, 31, 61);
    doc.rect(0, 0, 210, 20, 'F');
    doc.setFillColor(251, 191, 36);
    doc.rect(0, 0, 8, 297, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('ÉTUDE DE FAISABILITÉ DÉTAILLÉE', 20, 13);

    doc.setTextColor(50, 50, 50);
    const lines = doc.splitTextToSize(etude.replace(/\*\*/g, '').replace(/#{1,3} /g, ''), 178);
    let y = 28;

    lines.forEach((line: string) => {
      if (y > 278) {
        doc.addPage();
        doc.setFillColor(15, 31, 61);
        doc.rect(0, 0, 210, 20, 'F');
        doc.setFillColor(251, 191, 36);
        doc.rect(0, 0, 8, 297, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(data.nom_projet || '', 20, 13);
        doc.setTextColor(50, 50, 50);
        y = 28;
      }

      if (line.includes('═') || line.includes('──')) {
        doc.setFillColor(15, 31, 61);
        doc.rect(15, y - 3, 180, 0.5, 'F');
        y += 4;
        return;
      }

      if (line.match(/^\d+\.\s+[A-ZÀÁÂÉÊÈÎÏÔÙÛÜ]/) || (line.toUpperCase() === line && line.trim().length > 3 && !line.includes('MAD') && !line.includes('%'))) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(15, 31, 61);
        y += 3;
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(50, 50, 50);
      }
      doc.text(line, 15, y);
      y += 5;
    });

    // Footer on all pages
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFillColor(15, 31, 61);
      doc.rect(0, 287, 210, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.text('Atlas OS Enterprise · Étude de faisabilité · Confidentiel', 15, 293);
      doc.text(`Page ${i}/${totalPages}`, 190, 293, { align: 'right' });
    }

    doc.save(`etude_${data.nom_projet || 'projet'}_${new Date().getFullYear()}.pdf`);
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
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-white/30 text-xs mb-1 flex items-center gap-1">
                <CheckCircle size={10} className="text-green-400" /> Données société
              </p>
              <p className="text-white/70 text-xs font-medium">{companyData.raisonSociale}</p>
              {companyData.if_fiscal && <p className="text-white/30 text-xs">IF: {companyData.if_fiscal}</p>}
              {companyData.ice && <p className="text-white/30 text-xs">ICE: {companyData.ice}</p>}
              {companyData.rc && <p className="text-white/30 text-xs">RC: {companyData.rc}</p>}
            </div>
          )}

          <div className="space-y-1">
            {questions.slice(0, step).map((q, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle size={10} className="text-green-400 shrink-0" />
                <p className="text-white/30 text-xs truncate">{data[q.key]}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
              <BarChart2 size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Étude de Faisabilité du Projet</h1>
              <p className="text-xs text-gray-400">Document professionnel · Prêt pour banque / investisseur / Intelaka</p>
            </div>
          </div>
          {etudeReady && (
            <button onClick={downloadPDF} className="flex items-center gap-2 px-4 py-2 bg-[#1B2A4A] text-white rounded-lg text-sm hover:bg-[#243660] transition-colors">
              <Download size={16} /> PDF Professionnel
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
              <div ref={messagesEndRef} />
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
                  <p className="text-white font-semibold text-sm">Aperçu Étude</p>
                </div>
                <button onClick={downloadPDF} className="flex items-center gap-1 text-amber-400 hover:text-amber-300 text-xs">
                  <Download size={12} /> PDF
                </button>
              </div>

              {/* KPI Summary */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 border-b border-gray-200">
                <div className="bg-blue-500 rounded-lg p-2 text-white text-center">
                  <p className="text-xs opacity-70">CA/mois</p>
                  <p className="font-bold text-sm">{financials.ca?.toLocaleString()} MAD</p>
                </div>
                <div className={`${financials.resultatMensuel > 0 ? 'bg-green-500' : 'bg-red-500'} rounded-lg p-2 text-white text-center`}>
                  <p className="text-xs opacity-70">Résultat</p>
                  <p className="font-bold text-sm">{financials.resultatMensuel?.toLocaleString()} MAD</p>
                </div>
                <div className="bg-purple-500 rounded-lg p-2 text-white text-center">
                  <p className="text-xs opacity-70">Rentabilité</p>
                  <p className="font-bold text-sm">{financials.rentabilite}%</p>
                </div>
                <div className="bg-amber-500 rounded-lg p-2 text-white text-center">
                  <p className="text-xs opacity-70">Payback</p>
                  <p className="font-bold text-sm">{financials.payback} mois</p>
                </div>
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