import type { ChangeEvent } from "react";
import Section from "../Section";
import type { FieldName } from "../../types/form";
import type { FormInstance } from "../../types/form-instance";
import { TextField } from "../TextField";

type Props = {
  form: FormInstance;
  errors: Partial<Record<FieldName, string>>;
};

export default function AccidentSection({ form, errors }: Props) {
  return (
    <Section
      title="Czas i miejsce"
      description="Uzupełnij informacje dotyczące wypadku oraz obsługi maszyn."
    >
      <div className="section-grid">
        <TextField
          form={form}
          name={"accident.date" as FieldName}
          label="Data wypadku"
          type="date"
          colSpan="col-span-12 md:col-span-4"
          error={errors["accident.date"]}
        />
        <TextField
          form={form}
          name={"accident.place" as FieldName}
          label="Miejsce wypadku"
          colSpan="col-span-12 md:col-span-4"
          error={errors["accident.place"]}
        />
        <div className="col-span-12 md:col-span-4 flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-800">
            Planowane godziny pracy
          </label>
          <div className="grid grid-cols-2 gap-3">
            <form.Field
              name={"accident.plannedHoursStart" as FieldName}
              children={(field: any) => (
                <div className="flex flex-col gap-1">
                  <input
                    className="input-base"
                    placeholder="Początek"
                    value={(field.state.value as string) ?? ""}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      field.setValue(event.target.value)
                    }
                  />
                  {errors["accident.plannedHoursStart"] ? (
                    <p className="field-error">{errors["accident.plannedHoursStart"]}</p>
                  ) : null}
                </div>
              )}
            />
            <form.Field
              name={"accident.plannedHoursEnd" as FieldName}
              children={(field: any) => (
                <div className="flex flex-col gap-1">
                  <input
                    className="input-base"
                    placeholder="Koniec"
                    value={(field.state.value as string) ?? ""}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      field.setValue(event.target.value)
                    }
                  />
                  {errors["accident.plannedHoursEnd"] ? (
                    <p className="field-error">{errors["accident.plannedHoursEnd"]}</p>
                  ) : null}
                </div>
              )}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <h3 className="text-base font-semibold text-slate-900">
          Szczegóły wypadku
        </h3>
        <div className="section-grid">
          <TextField
            form={form}
            name={"accident.injuryTypes" as FieldName}
            label="Rodzaj doznanych urazów"
            colSpan="col-span-12 md:col-span-4"
          error={errors["accident.injuryTypes"]}
          />
          <TextField
            form={form}
            name={"accident.accidentDetails" as FieldName}
            label="Szczegółowy opis okoliczności miejsca i przyczyn wypadku"
            colSpan="col-span-12 md:col-span-4"
          error={errors["accident.accidentDetails"]}
          />
          <TextField
            form={form}
            name={"accident.authority" as FieldName}
            label="Organ, który prowadził postępowanie w sprawie wypadku"
            colSpan="col-span-12 md:col-span-4"
            placeholder="np. policja lub prokuratura"
          />
        </div>

        <div className="flex flex-col gap-3">
          <form.Field
            name={"accident.firstAid" as FieldName}
            children={(field: any) => (
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    checked={Boolean(field.state.value)}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      field.setValue(event.target.checked)
                    }
                  />
                  Udzielona pierwsza pomoc medyczna
                </label>
                {field.state.value ? (
                  <TextField
                    form={form}
                    name={"accident.medicalFacility" as FieldName}
                    label="Placówka"
                    colSpan="col-span-12"
                    error={errors["accident.medicalFacility"]}
                  />
                ) : null}
              </div>
            )}
          />

          <form.Field
            name={"accident.machineRelated" as FieldName}
            children={(field: any) => (
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    checked={Boolean(field.state.value)}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      field.setValue(event.target.checked)
                    }
                  />
                  Wypadek powstał podczas obsługi maszyn, urządzeń
                </label>

                {field.state.value ? (
                  <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                    <h4 className="text-sm font-semibold text-slate-900">
                      Szczegóły obsługi maszyny, urządzenia
                    </h4>
                    <form.Field
                      name={"accident.machineUsageDetails" as FieldName}
                      children={(machineField: any) => (
                        <div className="flex flex-col gap-1">
                          <textarea
                            className="input-base min-h-[80px] resize-vertical"
                            placeholder="Czy maszyna była sprawna, używana zgodnie z zasadami producenta, w jaki sposób"
                            value={(machineField.state.value as string) ?? ""}
                            onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                              machineField.setValue(event.target.value)
                            }
                          />
                          {errors["accident.machineUsageDetails"] ? (
                            <p className="field-error">{errors["accident.machineUsageDetails"]}</p>
                          ) : null}
                        </div>
                      )}
                    />

                    <div className="flex flex-wrap gap-4 text-sm text-slate-800">
                      <form.Field
                        name={"accident.machineCertified" as FieldName}
                        children={(certField: any) => (
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                              checked={Boolean(certField.state.value)}
                              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                certField.setValue(event.target.checked)
                              }
                            />
                            Maszyna, urządzenie posiada atest/deklarację zgodności
                          </label>
                        )}
                      />
                      <form.Field
                        name={"accident.machineRegistered" as FieldName}
                        children={(regField: any) => (
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                              checked={Boolean(regField.state.value)}
                              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                regField.setValue(event.target.checked)
                              }
                            />
                            Maszyna, urządzenie zostało wpisane do ewidencji środków trwałych
                          </label>
                        )}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          />
        </div>
      </div>
    </Section>
  );
}

