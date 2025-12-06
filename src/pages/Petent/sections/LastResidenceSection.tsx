import Section from "../Section";
import type { FormValues } from "@/types/form";
import { lastResidenceFields } from "@/types/form";
import type { FormInstance } from "@/types/formInstance";
import { TextField } from "./TextField";

type Props = {
  form: FormInstance;
};

export default function LastResidenceSection({ form }: Props) {
  return (
    <Section
      title="Adres ostatniego miejsca zamieszkania w Polsce"
      description="Dotyczy osób, które obecnie mieszkają poza Polską."
    >
      <div className="section-grid">
        {lastResidenceFields.map((field) => (
          <TextField key={field.name} form={form} {...field} />
        ))}
      </div>
    </Section>
  );
}

