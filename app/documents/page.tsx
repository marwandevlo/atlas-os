'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Upload, FileText, CheckCircle, Clock, Trash2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { fetchAi } from '../lib/fetch-ai';
import { addDaysYmd, todayYmd } from '@/app/lib/atlas-dates';
import { readSupplierInvoicesFromLocalStorage, writeSupplierInvoicesToLocalStorage } from '@/app/lib/atlas-supplier-invoices-repository';
import type { AtlasSupplierInvoice } from '@/app/types/atlas-supplier-invoice';
import { normalizePaymentTerms } from '@/app/types/atlas-payment-terms';
import type { AtlasDocument } from '@/app/types/atlas-document';
import { getDocuments, searchDocuments } from '@/app/lib/atlas-documents-repository';
import { createAtlasLink } from '@/app/lib/atlas-links-repository';
import { listAtlasCompanies } from '@/app/lib/atlas-companies-repository';
import { listAtlasInvoices } from '@/app/lib/atlas-invoices-repository';
import { AppSidebar } from '@/app/components/shell/AppSidebar';

type Document = {
  id: number;
  nom: string;
  statut: 'analysé' | 'en cours' | 'erreur';
  date: string;
  numero_facture?: string;
  fournisseur?: string;
  montant_ht?: number;
  montant_tva?: number;
  montant_ttc?: number;
  taux_tva?: number;
};

export default function DocumentsPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [dragging, setDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [tab, setTab] = useState<'ocr' | 'library'>('ocr');

  // Library state
  const [library, setLibrary] = useState<AtlasDocument[]>([]);
  const [libraryQuery, setLibraryQuery] = useState('');
  const [libraryType, setLibraryType] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string>('');
  const [linkCompanyId, setLinkCompanyId] = useState<string>('');
  const [linkInvoiceId, setLinkInvoiceId] = useState<string>('');
  const [linkStatus, setLinkStatus] = useState<string>('');
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [invoices, setInvoices] = useState<{ id: string; title: string }[]>([]);

  const refreshLibrary = async () => {
    const [docs, cs, invs] = await Promise.all([getDocuments(), listAtlasCompanies(), listAtlasInvoices()]);
    setLibrary(docs);
    setCompanies(cs.map((c) => ({ id: String(c.id), name: c.raisonSociale })));
    setInvoices(invs.map((i) => ({ id: String(i.id), title: `${i.number} · ${i.clientName}` })));
    if (!selectedId && docs[0]?.id) setSelectedId(String(docs[0].id));
  };

  useEffect(() => {
    if (tab !== 'library') return;
    void refreshLibrary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    if (tab !== 'library') return;
    const t = window.setTimeout(async () => {
      const docs = await searchDocuments(libraryQuery, { type: libraryType || undefined });
      setLibrary(docs);
      if (selectedId && !docs.some((d) => String(d.id) === selectedId)) setSelectedId(docs[0]?.id ?? '');
    }, 150);
    return () => window.clearTimeout(t);
  }, [libraryQuery, libraryType, selectedId, tab]);

  const selectedDoc = useMemo(() => library.find((d) => String(d.id) === String(selectedId)) ?? null, [library, selectedId]);
  const distinctTypes = useMemo(() => {
    const s = new Set<string>();
    for (const d of library) s.add(d.type);
    return Array.from(s).sort();
  }, [library]);

  const createSupplierInvoice = (doc: Document) => {
    if (!doc.fournisseur || !doc.montant_ttc) return;
    const issueDate = doc.date || todayYmd();
    const paymentTerms = normalizePaymentTerms({ kind: 'preset', days: 60 });
    const dueDate = addDaysYmd(issueDate, paymentTerms.days);

    const next: AtlasSupplierInvoice = {
      id: Date.now(),
      supplierName: doc.fournisseur,
      invoiceNumber: doc.numero_facture,
      issueDate,
      amountHT: doc.montant_ht,
      vatAmount: doc.montant_tva,
      totalTTC: doc.montant_ttc,
      paymentTerms,
      dueDate,
      status: 'unpaid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const existing = readSupplierInvoicesFromLocalStorage();
    const updated = [...existing, next];
    writeSupplierInvoicesToLocalStorage(updated);
    router.push('/clients');
  };

  const analyzeImage = async (file: File) => {
    setAnalyzing(true);
    const newDoc: Document = {
      id: Date.now(),
      nom: file.name,
      statut: 'en cours',
      date: new Date().toISOString().split('T')[0],
    };
    setDocuments(prev => [...prev, newDoc]);

    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.readAsDataURL(file);
      });

      const response = await fetchAi({ type: 'ocr', imageBase64: base64 });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setDocuments(prev => prev.map(d => d.id === newDoc.id ? { ...d, statut: 'erreur' } : d));
        setAnalyzing(false);
        return;
      }
      
      try {
        const parsed = JSON.parse(data.response);
        setDocuments(prev => prev.map(d => d.id === newDoc.id ? {
          ...d,
          statut: 'analysé',
          numero_facture: parsed.numero_facture,
          fournisseur: parsed.fournisseur,
          montant_ht: parsed.montant_ht,
          montant_tva: parsed.montant_tva,
          montant_ttc: parsed.montant_ttc,
          taux_tva: parsed.taux_tva,
        } : d));
      } catch {
        setDocuments(prev => prev.map(d => d.id === newDoc.id ? { ...d, statut: 'erreur' } : d));
      }
    } catch {
      setDocuments(prev => prev.map(d => d.id === newDoc.id ? { ...d, statut: 'erreur' } : d));
    }
    setAnalyzing(false);
  };

  const handleFile = (file: File) => {
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      analyzeImage(file);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AppSidebar variant="module">
        <button
          type="button"
          onClick={() => setTab('ocr')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${tab === 'ocr' ? 'bg-white/15 text-white' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
        >
          <Upload size={16} /> OCR
        </button>
        <button
          type="button"
          onClick={() => setTab('library')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${tab === 'library' ? 'bg-white/15 text-white' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
        >
          <FileText size={16} /> Bibliothèque
        </button>
      </AppSidebar>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                Documents — {tab === 'ocr' ? 'OCR' : 'Bibliothèque'}
              </h1>
              <p className="text-xs text-gray-400">
                {tab === 'ocr' ? 'Analyse automatique de vos factures' : 'Liste, recherche, lecture et liens'}
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {tab === 'library' && (
            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 lg:col-span-5 space-y-3">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2">
                    <input
                      value={libraryQuery}
                      onChange={(e) => setLibraryQuery(e.target.value)}
                      placeholder="Rechercher un document…"
                      className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300"
                    />
                    <select
                      value={libraryType}
                      onChange={(e) => setLibraryType(e.target.value)}
                      className="text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white"
                    >
                      <option value="">Tous types</option>
                      {distinctTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mt-3 text-xs text-gray-400 flex items-center justify-between">
                    <span>{library.length} document(s)</span>
                    <button type="button" onClick={() => void refreshLibrary()} className="text-rose-600 hover:text-rose-700 font-medium">
                      Actualiser
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="divide-y divide-gray-100">
                    {library.map((d) => (
                      <button
                        key={String(d.id)}
                        type="button"
                        onClick={() => { setSelectedId(String(d.id)); setLinkStatus(''); }}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${String(d.id) === String(selectedId) ? 'bg-rose-50' : ''}`}
                      >
                        <p className="text-sm font-medium text-gray-800 truncate">{d.title}</p>
                        <p className="text-xs text-gray-400 truncate">{d.type} · {new Date(d.createdAt).toLocaleString('fr-FR')}</p>
                      </button>
                    ))}
                    {library.length === 0 && (
                      <div className="p-6 text-center text-sm text-gray-400">Aucun document.</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-7 space-y-3">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  {selectedDoc ? (
                    <>
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-lg font-bold text-gray-900 truncate">{selectedDoc.title}</p>
                          <p className="text-xs text-gray-400">{selectedDoc.type} · {new Date(selectedDoc.createdAt).toLocaleString('fr-FR')}</p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <select value={linkCompanyId} onChange={(e) => setLinkCompanyId(e.target.value)} className="text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white">
                          <option value="">Lier à une société (optionnel)</option>
                          {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <select value={linkInvoiceId} onChange={(e) => setLinkInvoiceId(e.target.value)} className="text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white">
                          <option value="">Lier à une facture (optionnel)</option>
                          {invoices.map((i) => <option key={i.id} value={i.id}>{i.title}</option>)}
                        </select>
                        <button
                          type="button"
                          onClick={async () => {
                            setLinkStatus('');
                            try {
                              if (linkCompanyId) {
                                await createAtlasLink({
                                  fromType: 'document',
                                  fromId: String(selectedDoc.id),
                                  toType: 'company',
                                  toId: String(linkCompanyId),
                                  relation: 'attached_to',
                                  metadata: { source: 'documents_page' },
                                });
                              }
                              if (linkInvoiceId) {
                                await createAtlasLink({
                                  fromType: 'document',
                                  fromId: String(selectedDoc.id),
                                  toType: 'invoice',
                                  toId: String(linkInvoiceId),
                                  relation: 'attached_to',
                                  metadata: { source: 'documents_page' },
                                });
                              }
                              setLinkStatus('✅ Liens enregistrés.');
                            } catch {
                              setLinkStatus('❌ Impossible de créer le lien.');
                            }
                          }}
                          className="text-sm font-medium px-3 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                        >
                          Enregistrer liens
                        </button>
                      </div>
                      {linkStatus && <p className="mt-2 text-xs text-gray-500">{linkStatus}</p>}

                      <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap wrap-break-word">
                          {typeof selectedDoc.content === 'string'
                            ? selectedDoc.content
                            : JSON.stringify(selectedDoc.content ?? {}, null, 2)}
                        </pre>
                      </div>
                    </>
                  ) : (
                    <div className="p-6 text-center text-sm text-gray-400">Sélectionnez un document.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === 'ocr' && (
            <>
            <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400">Documents analysés</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{documents.filter(d => d.statut === 'analysé').length}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400">En cours</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{documents.filter(d => d.statut === 'en cours').length}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{documents.length}</p>
            </div>
            </div>

          <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); const file = e.dataTransfer.files[0]; if (file) handleFile(file); }}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${dragging ? 'border-rose-400 bg-rose-50' : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50'}`}
          >
            {analyzing ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-rose-600 font-medium">Analyse de votre facture en cours…</p>
                <p className="text-sm text-gray-400">Extraction des données en cours</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center">
                  <Upload size={28} className="text-rose-500" />
                </div>
                <p className="font-medium text-gray-700">Déposez votre facture ici</p>
                <p className="text-sm text-gray-400">Images (JPG, PNG) ou PDF</p>
                <p className="text-xs text-rose-500 font-medium">Extraction : n° de facture, fournisseur, montants, TVA</p>
              </div>
            )}
          </div>

          {documents.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3">Fichier</th>
                    <th className="px-4 py-3">N° Facture</th>
                    <th className="px-4 py-3">Fournisseur</th>
                    <th className="px-4 py-3 text-right">HT</th>
                    <th className="px-4 py-3 text-right">TVA</th>
                    <th className="px-4 py-3 text-right">TTC</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map(d => (
                    <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="text-gray-400" />
                          <span className="text-gray-700 text-xs">{d.nom.substring(0, 20)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{d.numero_facture || '-'}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{d.fournisseur || '-'}</td>
                      <td className="px-4 py-3 text-right text-gray-700 text-xs">{d.montant_ht ? d.montant_ht.toLocaleString() + ' MAD' : '-'}</td>
                      <td className="px-4 py-3 text-right text-blue-600 text-xs">{d.montant_tva ? d.montant_tva.toLocaleString() + ' MAD' : '-'}</td>
                      <td className="px-4 py-3 text-right font-medium text-xs">{d.montant_ttc ? d.montant_ttc.toLocaleString() + ' MAD' : '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium w-fit ${d.statut === 'analysé' ? 'bg-green-100 text-green-700' : d.statut === 'en cours' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                          {d.statut === 'analysé' ? <CheckCircle size={10} /> : <Clock size={10} />}
                          {d.statut}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-3">
                          {d.statut === 'analysé' && d.fournisseur && d.montant_ttc && (
                            <button
                              onClick={() => createSupplierInvoice(d)}
                              className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
                            >
                              + Facture fournisseur
                            </button>
                          )}
                          <button onClick={() => setDocuments(documents.filter(x => x.id !== d.id))} className="text-gray-300 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}