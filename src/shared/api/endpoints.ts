import { apiFetch, getApiBaseUrl, withQuery } from "./client";
import type {
  FormSnapshotResponse,
  FormSubmitResponse,
  FormValidateResponse,
  HistoryResponse,
  SessionResponse,
} from "./types";

export type CreateSessionBody = {
  form_type?: string;
  case_ref?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type ValidateFormBody = {
  payload: Record<string, unknown>;
  fields_to_validate?: string[];
};

export type SubmitFormBody = {
  payload: Record<string, unknown>;
  source?: "raw" | "corrected";
  comment?: string | null;
};

export function createSession(body: CreateSessionBody = {}) {
  return apiFetch("/sessions", {
    method: "POST",
    body: JSON.stringify({ form_type: "EWYP", ...body }),
    skipAuth: true,
  }).then((res) => res.json() as Promise<SessionResponse>);
}

export function refreshSession(sessionId: string) {
  return apiFetch(`/sessions/${sessionId}/refresh-token`, {
    method: "POST",
  }).then((res) => res.json() as Promise<SessionResponse>);
}

export function closeSession(sessionId: string) {
  return apiFetch(`/sessions/${sessionId}/close`, { method: "POST" }).then((res) =>
    res.json() as Promise<{ session_id: string; status: string }>
  );
}

export function validateForm(sessionId: string, body: ValidateFormBody, init?: { timeoutMs?: number }) {
  return apiFetch(`/sessions/${sessionId}/validate`, {
    method: "POST",
    body: JSON.stringify(body),
    timeoutMs: init?.timeoutMs,
  }).then((res) => res.json() as Promise<FormValidateResponse>);
}

export function submitForm(sessionId: string, body: SubmitFormBody) {
  return apiFetch(`/sessions/${sessionId}/forms`, {
    method: "POST",
    body: JSON.stringify(body),
  }).then((res) => res.json() as Promise<FormSubmitResponse>);
}

export function getHistory(
  sessionId: string,
  params?: { limit?: number; offset?: number }
) {
  return apiFetch(withQuery(`/sessions/${sessionId}/history`, params)).then(
    (res) => res.json() as Promise<HistoryResponse>
  );
}

export function getFormVersion(sessionId: string, version: number) {
  return apiFetch(`/sessions/${sessionId}/forms/${version}`).then(
    (res) => res.json() as Promise<FormSnapshotResponse>
  );
}

export function getPdfUrl(sessionId: string, version: number) {
  return `${getApiBaseUrl()}/sessions/${sessionId}/forms/${version}/pdf`;
}

