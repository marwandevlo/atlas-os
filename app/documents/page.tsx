'use client';
import { useState } from 'react';
import { ArrowLeft, Upload, FileText, CheckCircle, Clock, AlertCircle, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Document = {
  id: number;
  nom: string;
  type: string;
  taille: string;
  statut: 'analysé' | 'en cours' | 'erreur';
  date: string;
  montant?: number;
  tva?: number;
};

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([
    { id: 1, nom: 'Facture-Fournisseur-Mars.pdf', type: 'Facture achat', taille: '245 KB', statut: 'analysé', date: '2026-04-10', montant: 5000, tva: 1000 },
    { id: 2, nom: 'Releve-Bancaire-Avril.pdf', type: 'Relevé bancaire', taille: '1.2 MB', statut: 'analysé', date: '2026-04-12', montant: 45000 },
    { id: 3, nom: 'Facture-Client-001.pdf', type: 'Facture vente', taille: '180 KB', statut: 'en cours', date: '2026-04-14' },
  ]);

  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const simulateUpload = (fileName: string) => {
    setUploading(true);
    const newDoc: Document = {
      id: Date.now(),
      nom: fileName,
      type: 'Document',
      taille: '320 KB',
      statut: 'en cours',
      date: new Date().toISOString().split('T')[0],
    };
    setDocuments(prev => [...prev, newDoc]);
    setTimeout(() => {
      setDocuments(prev => prev.map(d => d.id === newDoc.id ? { ...d, statut: 'analysé', montant: 8500, tva: 1700 } : d));
      setUploading(false);
    }, 3000);
  };

  const statutIcon = (s: string) => {
    if (s === 'analysé') return <CheckCircle size={14} className="text-green-500" />;
    if (s === 'en cours') return <Clock size={14} className="text-amber-500 animate-spin" />;
    return <AlertCircle size={14} className="text-red-500" />;
  };

  const statutColor = (s: string) => {
    if (s === 'analysé') return 'bg-green-100 text-green-700';
    if (s === 'en cours') return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
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
          <h1 className="text-xl font-bold text-gray-800">Documents IA</h1>
          <p className="text-xs text-gray-400 mt-0.5">Import et analyse automatique par intelligence artificielle</p>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400">Documents analysés</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{documents.filter(d => d.statut === 'analysé').length}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400">En cours d'analyse</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{documents.filter(d => d.statut === 'en cours').length}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400">Total documents</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{documents.length}</p>
            </div>
          </div>

          {/* Zone Upload */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); const file = e.dataTransfer.files[0]; if (file) simulateUpload(file.name); }}
            onClick={() => simulateUpload('Document-' + Date.now() + '.pdf')}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-blue-600 font-medium">Analyse IA en cours...</p>
                <p className="text-sm text-gray-400">Extraction des données TVA, montants, dates</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                  <Upload size={28} className="text-blue-500" />
                </div>
                <p className="font-medium text-gray-700">Déposez vos documents ici</p>
                <p className="text-sm text-gray-400">Factures, relevés bancaires, bons de livraison (PDF, JPG, PNG)</p>
                <p className="text-xs text-blue-500 font-medium">L'IA extrait automatiquement: montants, TVA, fournisseurs, dates</p>
              </div>
            )}
          </div>

          {/* Documents List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-700">Documents importés</h2>
              <span className="text-xs text-gray-400">{documents.length} documents</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3">Document</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Montant</th>
                  <th className="px-4 py-3 text-right">TVA</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {documents.map(d => (
                  <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-gray-400" />
                        <span className="text-gray-700 font-medium">{d.nom}</span>
                        <span className="text-xs text-gray-400">{d.taille}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{d.type}</td>
                    <td className="px-4 py-3 text-gray-500">{d.date}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{d.montant ? d.montant.toLocaleString() + ' MAD' : '-'}</td>
                    <td className="px-4 py-3 text-right text-blue-600">{d.tva ? d.tva.toLocaleString() + ' MAD' : '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium w-fit ${statutColor(d.statut)}`}>
                        {statutIcon(d.statut)} {d.statut}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setDocuments(documents.filter(x => x.id !== d.id))} className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}