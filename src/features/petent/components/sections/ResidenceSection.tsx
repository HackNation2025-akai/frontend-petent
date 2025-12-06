import Section from "../Section";
import { residenceFields } from "../../types/form.config";
import type { FormInstance } from "../../types/form-instance";
import { TextField } from "../TextField";
import type { FieldName } from "../../types/form";

type Props = {
  form: FormInstance;
  onAbroadChange?: (value: boolean) => void;
  errors: Partial<Record<FieldName, string>>;
  statuses?: Partial<Record<FieldName, "pending" | "success" | "objection">>;
  hints?: Partial<Record<FieldName, string>>;
  onFieldBlur?: (name: FieldName) => void;
  [key: string]: unknown;
};

export default function ResidenceSection({
  form,
  onAbroadChange,
  errors,
  statuses,
  hints,
  onFieldBlur,
}: Props) {
  return (
    <Section
      title="Adres zamieszkania osoby poszkodowanej"
      description="Wpisz adres aktualnego miejsca zamieszkania."
    >
      <div className="section-grid">
        {residenceFields.map((field) => (
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

      <div className="mt-4 flex flex-wrap items-center gap-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <form.Field
          name="residence.abroad"
          children={(field) => (
            <label className="flex items-center gap-2 font-medium text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                checked={Boolean(field.state.value)}
                onChange={(event) => {
                  field.setValue(event.target.checked);
                  onAbroadChange?.(event.target.checked);
                }}
              />
              Nie mieszkam w Polsce
            </label>
          )}
        />
        <span className="text-xs text-slate-500">
          Jeśli zaznaczysz, uzupełnij pole z nazwą państwa.
        </span>
      </div>
    </Section>
  );
}

