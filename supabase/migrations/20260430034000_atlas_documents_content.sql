-- Atlas OS: documents library (type + content).
-- Extends existing `public.atlas_documents` without breaking OCR page.

alter table public.atlas_documents
  add column if not exists type text not null default 'generic';

alter table public.atlas_documents
  add column if not exists content jsonb;

create index if not exists atlas_documents_type_idx on public.atlas_documents (type);

