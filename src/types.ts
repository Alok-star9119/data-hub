export interface BlogPost {
  id: string;
  title: string;
  content: string;
  author?: string;
  category?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface RequestLog {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | string;
  path: string;
  formattedTime: string;
  rawTimestamp: number;
  status: number;
  durationMs: number;
  ip?: string;
}

export interface EndpointDoc {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  phase: 'Phase 1' | 'Phase 2' | 'Phase 3';
  description: string;
  sampleBody?: string;
  expectedStatus: number;
}

export interface QaTestStep {
  id: string;
  name: string;
  phase: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  payload?: any;
  expectedStatus: number;
  description: string;
}

export interface QaTestResult {
  stepId: string;
  name: string;
  passed: boolean;
  status: number;
  expectedStatus: number;
  durationMs: number;
  details: string;
  responsePayload?: any;
}
