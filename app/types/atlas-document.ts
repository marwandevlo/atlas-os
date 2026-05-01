export type AtlasDocument = {
  id: string;
  companyId?: string | null;

  /** Document category: juridique, rh, facture, etc. */
  type: string;
  title: string;

  /** Arbitrary content (text or structured JSON). */
  content?: unknown;

  kind: string;
  source: string;
  status: string;

  metadata?: Record<string, unknown>;

  createdAt: string;
  updatedAt: string;
};

