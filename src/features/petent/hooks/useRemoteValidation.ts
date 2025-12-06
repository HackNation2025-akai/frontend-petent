import { useState } from "react";
import { validateForm } from "@/shared/api/endpoints";
import { ApiError } from "@/shared/api/client";
import type { FormValidateResponse, FormValidationResult } from "@/shared/api/types";
import type { FieldName, FormValues } from "../types/form";
import { backendFieldToFormField, mapFieldsToValidate, mapFormToBackendPayload } from "../lib/mapper";

/**
 * Sanityzuje justification z backendu - usuwa surowy JSON i dziwne znaki.
 * Jeśli treść wygląda na JSON lub zawiera dziwne znaczniki, zwraca czytelny komunikat.
 */
function sanitizeJustification(raw: string, status: "success" | "objection"): string {
  if (!raw || typeof raw !== "string") {
    return status === "success" ? "Pole poprawne." : "Pole wymaga poprawy.";
  }

  let text = raw.trim();

  // Usuń markdown code blocks
  text = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "");

  // Spróbuj wyciągnąć justification z JSON-a jeśli to surowy JSON
  if (text.startsWith("{") || text.includes('{"status"')) {
    try {
      // Znajdź pierwszy kompletny JSON object
      const jsonMatch = text.match(/\{[^{}]*"justification"\s*:\s*"([^"]+)"[^{}]*\}/);
      if (jsonMatch && jsonMatch[1]) {
        text = jsonMatch[1];
      } else {
        // Próba parsowania całości
        const parsed = JSON.parse(text);
        if (parsed.justification && typeof parsed.justification === "string") {
          text = parsed.justification;
        }
      }
    } catch {
      // Nie udało się - usuń JSON-owe fragmenty
      text = text
        .replace(/\{[^}]*\}/g, "")
        .replace(/"status"\s*:\s*"[^"]*"/g, "")
        .replace(/"justification"\s*:\s*"?/g, "")
        .trim();
    }
  }

  // Usuń dziwne znaczniki typu <|constrain|>, We need JSON, itp.
  text = text
    .replace(/<\|[^|]+\|>/g, "")
    .replace(/We need JSON[^.]*\./gi, "")
    .replace(/We must output[^.]*\./gi, "")
    .replace(/Actually keys:[^.]*\./gi, "")
    .replace(/\[\s*\]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  // Jeśli zostało za mało tekstu lub same dziwne znaki, daj domyślny komunikat
  if (text.length < 3 || /^[{}[\]"':,\s]+$/.test(text)) {
    return status === "success" ? "Pole poprawne." : "Pole wymaga poprawy.";
  }

  // Skróć do 150 znaków
  if (text.length > 150) {
    text = text.slice(0, 147) + "...";
  }

  return text;
}

export type RemoteValidationResult = {
  response: FormValidateResponse | null;
  fieldErrors: Partial<Record<FieldName, string>>;
  fieldStatuses: Partial<Record<FieldName, "pending" | "success" | "objection">>;
  fieldHints: Partial<Record<FieldName, string>>;
};

export function useRemoteValidation(sessionId: string | null) {
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<RemoteValidationResult | null>(null);

  const validateFields = async (
    values: FormValues,
    requested?: string[],
  ): Promise<RemoteValidationResult> => {
    if (!sessionId) {
      throw new Error("Brak aktywnej sesji – spróbuj ponownie.");
    }
    setLoading(true);
    try {
      const payload = mapFormToBackendPayload(values);
      const fieldsToValidate = mapFieldsToValidate(payload, requested);
      if (!fieldsToValidate.length) {
        return {
          response: null,
          fieldErrors: {},
          fieldStatuses: {},
          fieldHints: {},
        };
      }
      // Walidujemy każde pole osobnym wywołaniem, żeby awaria jednego
      // nie psuła reszty i żeby logi/hinty były precyzyjne.
      const combinedResults: FormValidationResult[] = [];
      const summary = { success: 0, objection: 0 };

      const fieldErrors: Partial<Record<FieldName, string>> = {};
      const fieldStatuses: Partial<Record<FieldName, "pending" | "success" | "objection">> = {};
      const fieldHints: Partial<Record<FieldName, string>> = {};

      for (const fieldPath of fieldsToValidate) {
        try {
          const singleResponse = await validateForm(
            sessionId,
            { payload, fields_to_validate: [fieldPath] },
            { timeoutMs: 20000 },
          );
          combinedResults.push(...singleResponse.results);
          summary.success += singleResponse.summary?.success ?? 0;
          summary.objection += singleResponse.summary?.objection ?? 0;
          singleResponse.results.forEach((item) => {
            const mapped = backendFieldToFormField[item.field_path];
            if (!mapped) return;
            fieldStatuses[mapped as FieldName] = item.status;
            // Hint tylko przy objection - success = zielone obramowanie bez tekstu
            if (item.status === "objection") {
              const cleanHint = sanitizeJustification(item.justification, item.status);
              fieldHints[mapped as FieldName] = cleanHint;
              fieldErrors[mapped as FieldName] = cleanHint;
            }
          });
        } catch (error) {
          const mapped = backendFieldToFormField[fieldPath];
          if (mapped) {
            const msg =
              error instanceof ApiError
                ? `Problem walidacji (HTTP ${error.status}) — spróbuj ponownie.`
                : "Problem połączenia z serwerem walidacji — spróbuj ponownie.";
            fieldStatuses[mapped as FieldName] = "objection";
            fieldHints[mapped as FieldName] = msg;
            fieldErrors[mapped as FieldName] = msg;
            summary.objection += 1;
            combinedResults.push({
              field_path: fieldPath,
              status: "objection",
              justification: msg,
            });
          }
        }
      }

      const response: FormValidateResponse = {
        version: Date.now(), // placeholder; backend wersja nieistotna przy klienckim łączeniu
        results: combinedResults,
        summary,
      };
      const result: RemoteValidationResult = { response, fieldErrors, fieldStatuses, fieldHints };
      setLastResult(result);
      return result;
    } finally {
      setLoading(false);
    }
  };

  return { validateFields, loading, lastResult };
}

