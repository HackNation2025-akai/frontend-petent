import type { FieldConfig, FieldName, FormValues } from "../types/form";
import type { FormInstance } from "../types/form-instance";

type Props = FieldConfig & {
  form: FormInstance;
};

export function TextField({
  form,
  name,
  label,
  type = "text",
  placeholder,
  colSpan,
}: Props) {
  return (
    <form.Field
      name={name as FieldName}
      children={(field) => (
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
            onChange={(event) => field.setValue(event.target.value as FormValues[keyof FormValues])}
          />
        </div>
      )}
    />
  );
}

