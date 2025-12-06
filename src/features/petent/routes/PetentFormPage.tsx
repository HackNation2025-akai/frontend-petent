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
import type { FieldName, FormValues } from "../types/form";
import type { FormInstance } from "../types/form-instance";
import { validateFormValues } from "../validation/schema";
import { logger } from "@/shared/lib/logger";
import { useToast } from "@/shared/ui/ToastProvider";
import { clearFormDraft, loadFormDraft, saveFormDraft } from "../hooks/useFormDraft";

type Step = "basic" | "accident" | "summary";

export default function PetentFormPage() {
  const initialValues: FormValues = {
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
  };
  const draftFromStorage =
    typeof window !== "undefined" ? loadFormDraft() : null;

  const [step, setStep] = useState<Step>("basic");
  const [abroad, setAbroad] = useState<boolean>(
    draftFromStorage?.residence.abroad ?? false,
  );
  const [formErrors, setFormErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showDraftModal, setShowDraftModal] = useState<boolean>(
    Boolean(draftFromStorage),
  );
  const [draftData, setDraftData] = useState<FormValues | null>(draftFromStorage);
  const { addToast } = useToast();

  const form: FormInstance = useForm({
    defaultValues: draftFromStorage ?? initialValues,
    onSubmit: ({ value }: { value: FormValues }) => {
      logger.info("Podsumowanie formularza:", value);
      saveFormDraft(value);
      clearFormDraft();
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

  const handleValidatedSubmit = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    event?.stopPropagation();

    const validation = validateFormValues(form.state.values as FormValues, step);
    if (!validation.success) {
      setFormErrors(validation.errors);
      const firstErrorKey = Object.keys(validation.errors)[0];
      const firstErrorMessage = firstErrorKey ? validation.errors[firstErrorKey as FieldName] : null;

      // W krokach pośrednich pozwalamy przejść dalej mimo błędów, ale pokazujemy komunikat
      addToast({
        message: firstErrorMessage
          ? `Uzupełnij później: ${firstErrorMessage}`
          : "Możesz przejść dalej, ale uzupełnij brakujące pola przed wysłaniem",
        type: "info",
      });

      if (step !== "summary") {
        setIsSubmitting(true);
        try {
          handleNext();
          saveFormDraft(form.state.values as FormValues);
        } finally {
          setIsSubmitting(false);
        }
        return;
      }

      // W podsumowaniu blokujemy wysłanie/druk
      addToast({
        message: "Uzupełnij wymagane pola przed zakończeniem",
        type: "error",
      });
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    try {
      if (step !== "summary") {
        handleNext();
        addToast({ message: "Przechodzisz dalej — szkic zapisany", type: "success" });
        saveFormDraft(form.state.values as FormValues);
        return;
      }

      form.handleSubmit();
      addToast({ message: "Formularz zapisany (podgląd w konsoli)", type: "success" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraftClick = () => {
    saveFormDraft(form.state.values as FormValues);
    addToast({ message: "Szkic zapisany lokalnie", type: "success" });
  };

  const handleValidatedSubmitClick = () => {
    handleValidatedSubmit();
  };

  const handleStartOver = () => {
    clearFormDraft();
    setDraftData(null);
    form.reset(initialValues);
    setAbroad(initialValues.residence.abroad);
    setStep("basic");
    setShowDraftModal(false);
    addToast({ message: "Rozpoczęto nowy formularz", type: "info" });
  };

  const handleContinueDraft = () => {
    if (draftData) {
      form.reset(draftData);
      setAbroad(draftData.residence.abroad ?? false);
    }
    setShowDraftModal(false);
  };

  const handleCloseDraftModal = () => {
    setShowDraftModal(false);
  };

  const summaryValidation = validateFormValues(form.state.values as FormValues, "summary");
  const isSummaryValid = summaryValidation.success;

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-6xl px-4 lg:px-0">
        {showDraftModal ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4"
            onClick={handleCloseDraftModal}
          >
            <div
              className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
              onClick={(event) => event.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Znaleziono zapisany szkic
              </h2>
              <p className="text-sm text-slate-700 mb-6">
                Czy chcesz kontynuować wypełnienie, czy zacząć od nowa?
              </p>
              <div className="flex flex-wrap gap-3 justify-end">
                <button
                  type="button"
                  className="btn btn-ghost shadow-sm"
                  onClick={handleStartOver}
                >
                  Zacznij od nowa
                </button>
                <button
                  type="button"
                  className="btn btn-primary shadow-sm"
                  onClick={handleContinueDraft}
                >
                  Kontynuuj
                </button>
              </div>
            </div>
          </div>
        ) : null}

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

        <form className="mt-8 space-y-6" onSubmit={handleValidatedSubmit}>
          {step === "basic" && (
            <>
              <PersonalSection form={form} errors={formErrors} />
              <ResidenceSection form={form} errors={formErrors} onAbroadChange={setAbroad} />
              {abroad ? <LastResidenceSection form={form} errors={formErrors} /> : null}
              <CorrespondenceSection form={form} errors={formErrors} />
            </>
          )}

          {step === "accident" && <AccidentSection form={form} errors={formErrors} />}

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
                    className="btn btn-ghost shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!isSummaryValid}
                    onClick={() => logger.info("Stub drukowania – w przygotowaniu")}
                  >
                    Drukuj (wkrótce)
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!isSummaryValid}
                    onClick={() => logger.info("Stub wysyłki – w przygotowaniu")}
                  >
                    Wyślij (wkrótce)
                  </button>
                </div>
              </div>
            </Section>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-6 py-4 shadow-sm ring-1 ring-slate-200">
              <button type="button" onClick={handleSaveDraftClick} className="btn btn-ghost shadow-sm">
                Zapisz szkic
              </button>
            <button
              type="button"
                disabled={step === "basic" || isSubmitting}
              onClick={handlePrev}
                className="btn btn-ghost shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              Wróć
            </button>

            {step !== "summary" ? (
              <button
                type="button"
                  onClick={handleValidatedSubmitClick}
                  disabled={isSubmitting}
                  className="btn btn-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-70"
              >
                {step === "basic" ? "Przejdź do sekcji wypadku" : "Przejdź do podsumowania"}
              </button>
            ) : (
              <button
                type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-70"
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

