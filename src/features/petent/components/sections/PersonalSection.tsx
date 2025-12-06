import Section from "../Section";
import type { FieldName, FormValues } from "../../types/form";
import type { FormInstance } from "../../types/form-instance";
import { docTypeOptions, personalFields } from "../../types/form.config";
import { TextField } from "../TextField";

type Props = {
  form: FormInstance;
  errors: Partial<Record<FieldName, string>>;
};

export default function PersonalSection({ form, errors }: Props) {
  return (
    <Section
      title="Dane osoby poszkodowanej"
      description="Podaj dane identyfikacyjne i kontaktowe osoby poszkodowanej."
    >
      <div className="section-grid">
        {personalFields.map((field) => (
          <TextField key={field.name} form={form} error={errors[field.name]} {...field} />
        ))}

        <form.Field
          name={"docType" as FieldName}
          children={(field) => (
            <div className="col-span-12 md:col-span-3 flex flex-col gap-2">
              <label
                className="text-sm font-semibold text-slate-800"
                htmlFor="docType"
              >
                Rodzaj dokumentu
              </label>
              <select
                id="docType"
                className="input-base"
                value={(field.state.value as string) ?? ""}
                onChange={(event) =>
                  field.setValue(event.target.value as FormValues["docType"])
                }
              >
                {docTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.docType ? <p className="field-error">{errors.docType}</p> : null}
            </div>
          )}
        />
      </div>
    </Section>
  );
}

