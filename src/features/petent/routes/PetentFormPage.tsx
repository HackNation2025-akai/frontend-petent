import type { FormEvent } from "react";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";

import Section from "../components/Section";
import PersonalSection from "../components/sections/PersonalSection";
import ResidenceSection from "../components/sections/ResidenceSection";
import LastResidenceSection from "../components/sections/LastResidenceSection";
import CorrespondenceSection from "../components/sections/CorrespondenceSection";
import AccidentSection from "../components/sections/AccidentSection";
import { summaryRows } from "../types/form.config";
import type { FormValues } from "../types/form";
import type { FormInstance } from "../types/form-instance";

type Step = "basic" | "accident" | "summary";

export default function PetentFormPage() {
  const [step, setStep] = useState<Step>("basic");
  const [abroad, setAbroad] = useState<boolean>(false);

  const form: FormInstance = useForm({
    defaultValues: {
      pesel: "",
      docType: "",
      docNumber: "",
      firstName: "",
      lastName: "",
      birthDate: "",
      birthPlace: "",
      phone: "",
      residence: {
        street: "",
        houseNumber: "",
        apartmentNumber: "",
        postalCode: "",
        city: "",
        country: "Polska",
        abroad: false,
      },
      lastResidence: {
        street: "",
        houseNumber: "",
        apartmentNumber: "",
        postalCode: "",
        city: "",
      },
      correspondence: {
        street: "",
        houseNumber: "",
        apartmentNumber: "",
        postalCode: "",
        city: "",
        country: "Polska",
        mode: "adres",
        onBehalf: false,
      },
      accident: {
        date: "",
        place: "",
        plannedHoursStart: "",
        plannedHoursEnd: "",
        injuryTypes: "",
        accidentDetails: "",
        authority: "",
        firstAid: false,
        medicalFacility: "",
        machineRelated: false,
        machineUsageDetails: "",
        machineCertified: false,
        machineRegistered: false,
      },
    } satisfies FormValues,
    onSubmit: ({ value }: { value: FormValues }) => {
      console.log("Podsumowanie formularza:", value);
    },
  });

  const progressText =
    step === "basic" ? "1 / 3" : step === "accident" ? "2 / 3" : "3 / 3";

  const handleNext = () => {
    setStep((prev: Step) => (prev === "basic" ? "accident" : "summary"));
  };

  const handlePrev = () => {
    setStep((prev: Step) => (prev === "summary" ? "accident" : "basic"));
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-6xl px-4 lg:px-0">
        <header className="flex flex-col gap-3 rounded-xl bg-white px-6 py-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                Formularz • {step === "summary" ? "Podsumowanie" : step === "accident" ? "Krok 2" : "Krok 1"}
              </p>
              <h1 className="text-3xl font-bold leading-tight text-slate-900">
                {step === "summary"
                  ? "Sprawdź dane przed zakończeniem"
                  : "Dane podstawowe osoby poszkodowanej"}
              </h1>
              <p className="text-sm text-slate-600">
                {step === "summary"
                  ? "Możesz wydrukować lub przesłać formularz (funkcje w przygotowaniu)."
                  : "Uzupełnij pola formularza. Wszystkie dane możesz edytować przed wysłaniem wniosku."}
              </p>
            </div>
            <div className="shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-right text-sm font-semibold text-slate-700">
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                Postęp
              </p>
              <p>{progressText}</p>
            </div>
          </div>
        </header>

        <form
          className="mt-8 space-y-6"
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
            if (step !== "summary") {
              handleNext();
            }
          }}
        >
          {step === "basic" && (
            <>
              <PersonalSection form={form} />
              <ResidenceSection form={form} onAbroadChange={setAbroad} />
              {abroad ? <LastResidenceSection form={form} /> : null}
              <CorrespondenceSection form={form} />
            </>
          )}

          {step === "accident" && <AccidentSection form={form} />}

          {step === "summary" && (
            <Section
              title="Podsumowanie i wysyłka"
              description="Zweryfikuj dane. Funkcje druku i wysyłki są w przygotowaniu – teraz prezentujemy podgląd i zapisujemy dane w konsoli."
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {summaryRows.map((row) => (
                    <div
                      key={row.name}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        {row.label}
                      </p>
                      <form.Field
                        name={row.name}
                        children={(field: any) => (
                          <p className="text-sm font-semibold text-slate-900">
                            {(field.state.value as string) || "—"}
                          </p>
                        )}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-emerald-300"
                  >
                    Drukuj (wkrótce)
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-emerald-300"
                  >
                    Wyślij (wkrótce)
                  </button>
                </div>
              </div>
            </Section>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-6 py-4 shadow-sm ring-1 ring-slate-200">
            <button
              type="button"
              disabled={step === "basic"}
              onClick={handlePrev}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Wróć
            </button>

            {step !== "summary" ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                {step === "basic" ? "Przejdź do sekcji wypadku" : "Przejdź do podsumowania"}
              </button>
            ) : (
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                Zakończ i zapisz w konsoli
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}

