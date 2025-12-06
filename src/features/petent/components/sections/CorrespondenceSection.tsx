import Section from "../Section";
import { correspondenceFields } from "../../types/form.config";
import { correspondenceModeOptions } from "../../types/form.config";
import type { FormInstance } from "../../types/form-instance";
import { TextField } from "../TextField";
import type { FieldName } from "../../types/form";

type Props = {
  form: FormInstance;
  errors: Partial<Record<FieldName, string>>;
  statuses?: Partial<Record<FieldName, "pending" | "success" | "objection">>;
  hints?: Partial<Record<FieldName, string>>;
  onFieldBlur?: (name: FieldName) => void;
  [key: string]: unknown;
};

export default function CorrespondenceSection({ form, errors, statuses, hints, onFieldBlur }: Props) {
  return (
    <Section
      title="Adres do korespondencji osoby poszkodowanej"
      description="Wybierz formę korespondencji i wskaż dokładny adres."
    >
      <form.Field
        name="correspondence.mode"
        children={(field) => (
          <div className="mb-4 flex flex-wrap gap-3">
            {correspondenceModeOptions.map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                  field.state.value === option.value
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
                }`}
              >
                <input
                  type="radio"
                  className="sr-only"
                  value={option.value}
                  checked={field.state.value === option.value}
                  onChange={(event) =>
                    event.target.checked && field.setValue(option.value)
                  }
                />
                {option.label}
              </label>
            ))}
          </div>
        )}
      />

      <div className="section-grid">
        {correspondenceFields.map((field) => (
          <TextField
            key={field.name}
            form={form}
            error={errors[field.name]}
            status={statuses?.[field.name]}
            hint={hints?.[field.name]}
            onBlurValidate={onFieldBlur}
            {...field}
          />
        ))}
      </div>

      <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3">
        <form.Field
          name="correspondence.onBehalf"
          children={(field) => (
            <label className="flex items-start gap-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                checked={Boolean(field.state.value)}
                onChange={(event) => field.setValue(event.target.checked)}
              />
              <span>
                Składam wniosek w imieniu osoby poszkodowanej (nie jestem osobą
                poszkodowaną)
              </span>
            </label>
          )}
        />
      </div>
    </Section>
  );
}

