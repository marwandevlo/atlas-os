'use client';
import { useState } from 'react';
import { ArrowLeft, Plus, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Ecriture = {
  id: number;
  date: string;
  libelle: string;
  compte: string;
  debit: number;
  credit: number;
};

export default function ComptabilitePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'journal' | 'grandlivre' | 'bilan'>('journal');
  const [ecritures, setEcritures] = useState<Ecriture[]>([
    { id: 1, date: '2026-04-01', libelle: 'Vente Client Alpha', compte: '3421', debit: 18000, credit: 0 },
    { id: 2, date: '2026-04-01', libelle: 'TVA collectée', compte: '4455', debit: 0, credit: 3000 },
    { id: 3, date: '2026-04-01', libelle: 'Produits ventes', compte: '7111', debit: 0, credit: 15000 },
    { id: 4, date: '2026-04-05', libelle: 'Achat fournitures', compte: '6123', debit: 3000, credit: 0 },
    { id: 5, date: '2026-04-05', libelle: 'TVA déductible', compte: '3455', debit: 600, credit: 0 },
    { id: 6, date: '2026-04-05', libelle: 'Fournisseur X', compte: '4411', debit: 0, credit: 3600 },
  ]);

  const [form, setForm] = useState({ date: '', libelle: '', compte: '', debit: '', credit: '' });
  const [showForm, setShowForm] = useState(false);

  const totalDebit = ecritures.reduce((s, e) => s + e.debit, 0);
  const totalCredit = ecritures.reduce((s, e) => s + e.credit, 0);

  const addEcriture = () => {
    if (!form.libelle || !form.compte) return;
    setEcritures([...ecritures, {
      id: Date.now(),
      date: form.date || new Date().toISOString().split('T')[0],
      libelle: form.libelle,
      compte: form.compte,
      debit: parseFloat(form.debit) || 0,
      credit: parseFloat(form.credit) || 0,
    }]);
    setForm({ date: '', libelle: '', compte: '', debit: '', credit: '' });
    setShowForm(false);
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
          {['journal', 'grandlivre', 'bilan'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as 'journal' | 'grandlivre' | 'bilan')}
              className={`w-full