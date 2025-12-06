import type { FormValues } from "../types/form";

const STORAGE_KEY = "petent_form_draft_v1";

export const loadFormDraft = (): FormValues | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FormValues) : null;
  } catch {
    return null;
  }
};

export const saveFormDraft = (values: FormValues) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
};

export const clearFormDraft = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
};

