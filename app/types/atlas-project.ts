export type AtlasProject = {
  id: string;
  companyId?: string | null;

  name: string;
  status: string;
  metadata?: Record<string, unknown>;

  createdAt: string;
  updatedAt: string;
};

