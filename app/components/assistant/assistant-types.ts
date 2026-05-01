export type AtlasAssistantAction = {
  action: string;
  data?: Record<string, unknown>;
  confidence?: number;
  requiresConfirmation?: boolean;
};

export type AtlasAssistantResponse = {
  response: string;
  actions: AtlasAssistantAction[];
};

