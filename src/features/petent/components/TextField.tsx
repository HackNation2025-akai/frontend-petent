import type { ChangeEvent } from "react";
import type { FieldConfig, FieldName, FormValues } from "../types/form";
import type { FormInstance } from "../types/form-instance";

type Props = FieldConfig & {
  form: FormInstance;
  error?: string;
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
}: Props) {
  return (
    <form.Field
      name={name as FieldName}
      children={(field: any) => (
        <div
          className={`flex flex-col gap-2 ${colSpan ?? "col-span-12 md:col-span-6"}`}
        >
          <label className="text-sm font-semibold text-slate-800" htmlFor={name}>
            {label}
          </label>
          <input
            id={name}
            className="input-base"
            type={type}
            placeholder={placeholder}
            value={(field.state.value as string) ?? ""}
            aria-invalid={Boolean(error)}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const nextRaw = event.target.value;
              const next = normalize ? normalize(nextRaw) : nextRaw;
              field.setValue(next as FormValues[keyof FormValues]);
            }}
          />
          {error ? <p className="field-error">{error}</p> : null}
        </div>
      )}
    />
  );
}

