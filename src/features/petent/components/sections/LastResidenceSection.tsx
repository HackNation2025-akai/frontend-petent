import Section from "../Section";
import { lastResidenceFields } from "../../types/form.config";
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

export default function LastResidenceSection({ form, errors, statuses, hints, onFieldBlur }: Props) {
  return (
    <Section
      title="Adres ostatniego miejsca zamieszkania w Polsce"
      description="Dotyczy osób, które obecnie mieszkają poza Polską."
    >
      <div className="section-grid">
        {lastResidenceFields.map((field) => (
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
    </Section>
  );
}

