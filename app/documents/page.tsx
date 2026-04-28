'use client';
import { useState, useRef } from 'react';
import { ArrowLeft, Upload, FileText, CheckCircle, Clock, Trash2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { fetchAi } from '../lib/fetch-ai';
import { addDaysYmd, todayYmd } from '@/app/lib/atlas-dates';
import { readSupplierInvoicesFromLocalStorage, writeSupplierInvoicesToLocalStorage } from '@/app/lib/atlas-supplier-invoices-repository';
import type { AtlasSupplierInvoice } from '@/app/types/atlas-supplier-invoice';
import { normalizePaymentTerms } from '@/app/types/atlas-payment-terms';

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
            <Upload size={16} /> Documents IA
          </button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Documents IA — OCR</h1>
              <p className="text-xs text-gray-400">Analyse automatique de vos factures</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
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
        </div>
      </main>
    </div>
  );
}