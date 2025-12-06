import type { ChangeEvent } from "react";
import type { FieldConfig, FieldName, FormValues } from "../types/form";
import type { FormInstance } from "../types/form-instance";

type Props = FieldConfig & {
  form: FormInstance;
  error?: string;
  status?: "pending" | "success" | "objection";
  hint?: string;
  onBlurValidate?: (name: FieldName) => void;
};

export function TextField({
  form,
  name,
  label,
  type = "text",
  placeholder,
  colSpan,
  normalize,
  error,
  status,
  hint,
  onBlurValidate,
}: Props) {
  const ringClass =
    status === "pending"
      ? "ring-2 ring-blue-300 animate-pulse"
      : status === "success"
        ? "ring-2 ring-green-400"
        : status === "objection"
          ? "ring-2 ring-amber-400"
          : "";

  return (
    <form.Field
      name={name as FieldName}
      children={(field: { state: { value: unknown }; setValue: (value: unknown) => void }) => (
        <div
          className={`flex flex-col gap-2 ${colSpan ?? "col-span-12 md:col-span-6"}`}
        >
          <label className="text-sm font-semibold text-slate-800" htmlFor={name}>
            {label}
          </label>
          <input
            id={name}
            className={`input-base ${ringClass}`}
            type={type}
            placeholder={placeholder}
            value={(field.state.value as string) ?? ""}
            aria-invalid={Boolean(error)}
            onBlur={() => onBlurValidate?.(name as FieldName)}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const nextRaw = event.target.value;
              const next = normalize ? normalize(nextRaw) : nextRaw;
              field.setValue(next as FormValues[keyof FormValues]);
            }}
          />
          {error ? <p className="field-error">{error}</p> : null}
          {!error && status === "objection" && hint ? (
            <p className="text-xs text-amber-700">{hint}</p>
          ) : null}
        </div>
      )}
    />
  );
}

