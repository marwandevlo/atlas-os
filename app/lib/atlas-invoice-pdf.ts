import { jsPDF } from 'jspdf';
import type { AtlasCompany } from '@/app/types/atlas-company';

export type InvoicePdfData = {
  numero: string;
  client: string;
  montantTtc: number;
  dateEmission: string; // YYYY-MM-DD
  dateEcheance: string; // YYYY-MM-DD
  statut: string;
};

function safeLine(label: string, value: string | number | null | undefined): string {
  const v = value === null || value === undefined ? '' : String(value);
  return `${label}: ${v}`.trim();
}

export function invoicePdfFilename(numero: string): string {
  return `facture-${numero}`.replace(/[^\w.-]+/g, '_') + '.pdf';
}

export function createInvoicePdfDoc(params: {
  invoice: InvoicePdfData;
  company?: Partial<AtlasCompany> | null;
}): jsPDF {
  const { invoice, company } = params;

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;
  const contentWidth = pageWidth - margin * 2;

  // Palette
  const ink = { r: 17, g: 24, b: 39 };
  const muted = { r: 107, g: 114, b: 128 };
  const border = { r: 229, g: 231, b: 235 };
  const accent = { r: 29, g: 78, b: 216 }; // blue-700-ish

  // Header
  doc.setTextColor(ink.r, ink.g, ink.b);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(String(company?.raisonSociale || 'ZAFIRIX PRO'), margin, 64);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(muted.r, muted.g, muted.b);
  const addr = [company?.adresse, company?.ville].filter(Boolean).join(', ');
  const contact = [company?.telephone, company?.email].filter(Boolean).join(' · ');
  const ids = [
    company?.ice ? `ICE ${company.ice}` : null,
    company?.if_fiscal ? `IF ${company.if_fiscal}` : null,
    company?.rc ? `RC ${company.rc}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const companyMetaLines = [addr, contact, ids].filter((s) => typeof s === 'string' && s.trim());
  let y = 84;
  for (const line of companyMetaLines) {
    doc.text(line, margin, y);
    y += 14;
  }

  // Invoice title block (right)
  doc.setTextColor(ink.r, ink.g, ink.b);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('FACTURE', pageWidth - margin, 64, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(muted.r, muted.g, muted.b);
  doc.text(safeLine('N°', invoice.numero), pageWidth - margin, 84, { align: 'right' });
  doc.text(safeLine("Date d'émission", invoice.dateEmission), pageWidth - margin, 98, { align: 'right' });
  doc.text(safeLine("Date d'échéance", invoice.dateEcheance), pageWidth - margin, 112, { align: 'right' });

  // Divider
  doc.setDrawColor(border.r, border.g, border.b);
  doc.setLineWidth(1);
  doc.line(margin, 136, margin + contentWidth, 136);

  // Client block
  doc.setTextColor(ink.r, ink.g, ink.b);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Client', margin, 164);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(invoice.client, margin, 184);

  // Summary card
  const cardY = 212;
  const cardH = 104;
  doc.setDrawColor(border.r, border.g, border.b);
  doc.setFillColor(248, 250, 252); // subtle gray
  doc.roundedRect(margin, cardY, contentWidth, cardH, 10, 10, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(muted.r, muted.g, muted.b);
  doc.text('Montant TTC', margin + 16, cardY + 30);

  doc.setFontSize(18);
  doc.setTextColor(ink.r, ink.g, ink.b);
  doc.text(`${Math.round(invoice.montantTtc).toLocaleString()} MAD`, margin + 16, cardY + 58);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(muted.r, muted.g, muted.b);
  doc.text('Statut', margin + 16, cardY + 82);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  const statusX = margin + 64;
  const statusY = cardY + 82;
  const isOverdue = invoice.statut.toLowerCase().includes('retard');
  const statusColor = isOverdue ? { r: 185, g: 28, b: 28 } : { r: 16, g: 185, b: 129 };
  doc.setTextColor(statusColor.r, statusColor.g, statusColor.b);
  doc.text(invoice.statut, statusX, statusY);

  // Footer
  doc.setTextColor(muted.r, muted.g, muted.b);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Document généré par ZAFIRIX PRO', margin, 780);

  // Accent top line for "SaaS feel"
  doc.setDrawColor(accent.r, accent.g, accent.b);
  doc.setLineWidth(3);
  doc.line(margin, 40, margin + 120, 40);

  return doc;
}

export function downloadInvoicePdf(params: {
  invoice: InvoicePdfData;
  company?: Partial<AtlasCompany> | null;
}): void {
  const doc = createInvoicePdfDoc(params);
  doc.save(invoicePdfFilename(params.invoice.numero));
}

