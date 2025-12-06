export type SessionResponse = {
  session_id: string;
  session_token: string | null;
  expires_at: string;
  status: string;
  form_type: string;
};

export type FormValidationResult = {
  field_path: string;
  status: "success" | "objection";
  justification: string;
};

export type FormValidateResponse = {
  version: number;
  results: FormValidationResult[];
  summary: Record<string, number>;
};

export type FormSubmitResponse = {
  version: number;
  created_at: string;
};

export type VersionSummary = {
  version: number;
  source: string;
  created_at: string;
  comment: string | null;
};

export type HistoryResponse = {
  session_id: string;
  total_versions: number;
  versions: VersionSummary[];
};

export type FormSnapshotResponse = {
  version: number;
  source: string;
  payload: Record<string, unknown>;
  validations: FormValidationResult[];
  created_at: string;
};

