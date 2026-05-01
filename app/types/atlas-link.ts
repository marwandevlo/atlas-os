export type AtlasLink = {
  id: string;
  companyId?: string | null;

  fromType: string;
  fromId: string;
  toType: string;
  toId: string;
  relation: string;

  metadata?: Record<string, unknown>;
  createdAt: string;
};

