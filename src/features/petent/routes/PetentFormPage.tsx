import type { SyntheticEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { validateFormValues, validateStepValues } from "../validation/schema";
import { logger } from "@/shared/lib/logger";
import { useToast } from "@/shared/ui/ToastProvider";
import { clearFormDraft, loadFormDraft, saveFormDraft } from "../hooks/useFormDraft";
import { useSession } from "../hooks/useSession";
import { useRemoteValidation } from "../hooks/useRemoteValidation";
import type { RemoteValidationResult } from "../hooks/useRemoteValidation";
import { submitForm } from "@/shared/api/endpoints";
import {
  mapFormToBackendPayload,
  backendFieldToFormField,
  mapFieldsToValidate,
} from "../lib/mapper";
import { useHistory } from "../hooks/useHistory";
import { getPdfUrl } from "@/shared/api/endpoints";
import { ApiError } from "@/shared/api/client";

type Step = "basic" | "accident" | "summary";

const sampleValues: FormValues = {
  pesel: "82010112345",
  docType: "id_card",
  docNumber: "ABA123456",
  firstName: "Jan",
  lastName: "Kowalski",
  birthDate: "1982-01-01",
  birthPlace: "Warszawa",
  phone: "601002003",
  residence: {
    street: "Miodowa",
    houseNumber: "10",
    apartmentNumber: "5",
    postalCode: "00-251",
    city: "Warszawa",
    country: "Polska",
    abroad: false,
  },
  lastResidence: {
    street: "Szkolna",
    houseNumber: "2",
    apartmentNumber: "1",
    postalCode: "90-001",
    city: "Łódź",
  },
  correspondence: {
    street: "Miodowa",
    houseNumber: "10",
    apartmentNumber: "5",
    postalCode: "00-251",
    city: "Warszawa",
    country: "Polska",
    mode: "adres",
    onBehalf: false,
  },
  accident: {
    date: "2024-11-05",
    place: "Warszawa",
    plannedHoursStart: "08:00",
    plannedHoursEnd: "16:00",
    injuryTypes: "Stłuczenie kolana",
    accidentDetails: "Potknięcie na magazynie podczas przenoszenia paczek.",
    authority: "BHP zakładu",
    firstAid: true,
    medicalFacility: "Przychodnia Medicover",
    machineRelated: false,
    machineUsageDetails: "",
    machineCertified: true,
    machineRegistered: true,
  },
};


export default function PetentFormPage() {
  const [step, setStep] = useState<Step>("basic");
  const [abroad, setAbroad] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [fieldStatuses, setFieldStatuses] = useState<
    Partial<Record<FieldName, "pending" | "success" | "objection">>
  >({});
  const [fieldHints, setFieldHints] = useState<Partial<Record<FieldName, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { addToast } = useToast();
  const draft = typeof window !== "undefined" ? loadFormDraft() : null;
  const sessionApi = useSession();
  const { sessionId, token, ensureSession, loading: sessionLoading, ready: sessionReady } = sessionApi;
  const resetSession = useMemo(
    () => (sessionApi as unknown as { reset?: () => void }).reset ?? (() => undefined),
    [sessionApi],
  );
  const { validateFields, loading: remoteValidating } = useRemoteValidation(sessionId);
  // useHistory tylko gdy sesja jest zweryfikowana (ready) i mamy sessionId+token
  const historyKey = sessionReady && sessionId && token ? sessionId : null;
  const {
    data: historyData,
    isLoading: historyLoading,
    mutate: refreshHistory,
  } = useHistory(historyKey, { limit: 5, offset: 0 });

  // Nie ma potrzeby resetu sesji przy historyData === null, bo ensureSession
  // waliduje sesję z backendem przed ustawieniem ready=true

  const form: FormInstance = useForm({
    defaultValues: draft ?? {
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
      logger.info("Podsumowanie formularza:", value);
      saveFormDraft(value);
      clearFormDraft();
    },
  });

  // Wywołaj ensureSession tylko raz przy pierwszym renderze
  const sessionInitRef = useRef(false);
  useEffect(() => {
    if (sessionInitRef.current) return;
    sessionInitRef.current = true;
    void ensureSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const basicPaths = useMemo(
    () => [
      "injured_person.pesel",
      "injured_person.document_number",
      "injured_person.first_name",
      "injured_person.last_name",
      "injured_address.city",
      "injured_person.phone",
    ],
    [],
  );

  const accidentPaths = useMemo(
    () => [
      "accident_info.accident_place",
      "accident_info.first_aid_facility",
      "accident_info.investigating_authority",
      "accident_info.machine_description",
      "accident_info.detailed_description",
      "accident_info.injuries_description",
    ],
    [],
  );

  const progressText =
    step === "basic" ? "1 / 3" : step === "accident" ? "2 / 3" : "3 / 3";

  const handleNext = () => {
    setStep((prev: Step) => (prev === "basic" ? "accident" : "summary"));
  };

  const handlePrev = () => {
    setStep((prev: Step) => (prev === "summary" ? "accident" : "basic"));
  };

  type LocalValidationResult = {
    fieldStatuses: Partial<Record<FieldName, "pending" | "success" | "objection">>;
    fieldHints: Partial<Record<FieldName, string>>;
    fieldErrors: Partial<Record<FieldName, string>>;
  };

  const runRemoteValidation = async (requested?: string[]) => {
    const exec = async () => {
      const validation = (await validateFields(
        form.state.values as FormValues,
        requested,
      )) as RemoteValidationResult & LocalValidationResult;
      setFieldStatuses((prev) => ({ ...prev, ...(validation.fieldStatuses || {}) }));
      setFieldHints((prev) => ({ ...prev, ...(validation.fieldHints || {}) }));
      if (validation.fieldErrors && Object.keys(validation.fieldErrors).length) {
        logger.error("LLM validation objections", {
          fields: Object.keys(validation.fieldErrors),
          details: validation.fieldErrors,
        });
        setFormErrors((prev) => ({ ...prev, ...validation.fieldErrors }));
        addToast({
          message: "LLM zgłosił uwagi — popraw pola z komunikatami.",
          type: "error",
        });
        return false;
      }
      return true;
    };

    try {
      return await exec();
    } catch (error) {
      if (error instanceof ApiError && [401, 403, 404, 422].includes(error.status)) {
        resetSession();
        await ensureSession();
        return await exec();
      }
      throw error;
    }
  };

  type CommonFieldProps = {
    form: FormInstance;
    errors: Partial<Record<FieldName, string>>;
    statuses: Partial<Record<FieldName, "pending" | "success" | "objection">>;
    hints: Partial<Record<FieldName, string>>;
    onFieldBlur: (name: FieldName) => Promise<void>;
  };

  const handleValidatedSubmit = async (event?: SyntheticEvent) => {
    event?.preventDefault();
    event?.stopPropagation();

    // Walidacja etapowa - tylko pola dla bieżącego etapu
    const validation = step === "summary"
      ? validateFormValues(form.state.values as FormValues)
      : validateStepValues(form.state.values as FormValues, step, abroad);

    if (!validation.success) {
      setFormErrors(validation.errors);
      // Loguj szczegóły błędów w konsoli
      logger.error("Local validation errors", validation.errors);
      addToast({ message: "Sprawdź wymagane pola formularza", type: "error" });
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    try {
      const session = await ensureSession();
      if (!session?.sessionId) {
        addToast({ message: "Brak aktywnej sesji", type: "error" });
        return;
      }

      if (step !== "summary") {
        handleNext();
        addToast({ message: "Zapisano krok formularza", type: "success" });
        saveFormDraft(form.state.values as FormValues);
        return;
      }

      const remoteOk = await runRemoteValidation();
      if (!remoteOk) return;

      const payload = mapFormToBackendPayload(form.state.values as FormValues);
      await submitForm(session.sessionId, { payload, source: "raw", comment: "frontend" });
      await refreshHistory();
      form.handleSubmit();
      addToast({ message: "Formularz zapisany na backendzie", type: "success" });
      clearFormDraft();
    } catch (error) {
      logger.error("Submit error", error);
      addToast({ message: "Nie udało się zapisać formularza", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraftClick = () => {
    saveFormDraft(form.state.values as FormValues);
    addToast({ message: "Szkic zapisany lokalnie", type: "success" });
  };

  const payloadMemo = useMemo(
    () => mapFormToBackendPayload(form.state.values as FormValues),
    [form.state.values],
  );

  const validationPending = useMemo(
    () => sessionLoading || remoteValidating || isSubmitting,
    [sessionLoading, remoteValidating, isSubmitting],
  );

  const canValidateBasic = useMemo(
    () => mapFieldsToValidate(payloadMemo, basicPaths).length > 0,
    [payloadMemo, basicPaths],
  );

  const canValidateAccident = useMemo(
    () => mapFieldsToValidate(payloadMemo, accidentPaths).length > 0,
    [payloadMemo, accidentPaths],
  );

  const handleFillSample = () => {
    const setMany = (entries: [FieldName, string | boolean][]) => {
      entries.forEach(([name, value]) => form.setFieldValue(name as FieldName, value));
    };

    if (step === "basic") {
      setMany([
        ["pesel", sampleValues.pesel],
        ["docType", sampleValues.docType],
        ["docNumber", sampleValues.docNumber],
        ["firstName", sampleValues.firstName],
        ["lastName", sampleValues.lastName],
        ["birthDate", sampleValues.birthDate],
        ["birthPlace", sampleValues.birthPlace],
        ["phone", sampleValues.phone],
        ["residence.street", sampleValues.residence.street],
        ["residence.houseNumber", sampleValues.residence.houseNumber],
        ["residence.apartmentNumber", sampleValues.residence.apartmentNumber],
        ["residence.postalCode", sampleValues.residence.postalCode],
        ["residence.city", sampleValues.residence.city],
        ["residence.country", sampleValues.residence.country],
        ["residence.abroad", sampleValues.residence.abroad],
        ["correspondence.street", sampleValues.correspondence.street],
        ["correspondence.houseNumber", sampleValues.correspondence.houseNumber],
        ["correspondence.apartmentNumber", sampleValues.correspondence.apartmentNumber],
        ["correspondence.postalCode", sampleValues.correspondence.postalCode],
        ["correspondence.city", sampleValues.correspondence.city],
        ["correspondence.country", sampleValues.correspondence.country],
        ["correspondence.mode", sampleValues.correspondence.mode],
        ["correspondence.onBehalf", sampleValues.correspondence.onBehalf],
      ]);
      setAbroad(sampleValues.residence.abroad);
    } else if (step === "accident") {
      setMany([
        ["accident.date", sampleValues.accident.date],
        ["accident.place", sampleValues.accident.place],
        ["accident.plannedHoursStart", sampleValues.accident.plannedHoursStart],
        ["accident.plannedHoursEnd", sampleValues.accident.plannedHoursEnd],
        ["accident.injuryTypes", sampleValues.accident.injuryTypes],
        ["accident.accidentDetails", sampleValues.accident.accidentDetails],
        ["accident.authority", sampleValues.accident.authority],
        ["accident.firstAid", sampleValues.accident.firstAid],
        ["accident.medicalFacility", sampleValues.accident.medicalFacility],
        ["accident.machineRelated", sampleValues.accident.machineRelated],
        ["accident.machineUsageDetails", sampleValues.accident.machineUsageDetails],
        ["accident.machineCertified", sampleValues.accident.machineCertified],
        ["accident.machineRegistered", sampleValues.accident.machineRegistered],
      ]);
    } else {
      // summary - w razie potrzeby nie zmieniamy kroku ani danych
      setMany([
        ["pesel", sampleValues.pesel],
        ["docType", sampleValues.docType],
        ["docNumber", sampleValues.docNumber],
        ["firstName", sampleValues.firstName],
        ["lastName", sampleValues.lastName],
        ["birthDate", sampleValues.birthDate],
        ["birthPlace", sampleValues.birthPlace],
        ["phone", sampleValues.phone],
        ["residence.street", sampleValues.residence.street],
        ["residence.houseNumber", sampleValues.residence.houseNumber],
        ["residence.apartmentNumber", sampleValues.residence.apartmentNumber],
        ["residence.postalCode", sampleValues.residence.postalCode],
        ["residence.city", sampleValues.residence.city],
        ["residence.country", sampleValues.residence.country],
        ["residence.abroad", sampleValues.residence.abroad],
        ["correspondence.street", sampleValues.correspondence.street],
        ["correspondence.houseNumber", sampleValues.correspondence.houseNumber],
        ["correspondence.apartmentNumber", sampleValues.correspondence.apartmentNumber],
        ["correspondence.postalCode", sampleValues.correspondence.postalCode],
        ["correspondence.city", sampleValues.correspondence.city],
        ["correspondence.country", sampleValues.correspondence.country],
        ["correspondence.mode", sampleValues.correspondence.mode],
        ["correspondence.onBehalf", sampleValues.correspondence.onBehalf],
        ["accident.date", sampleValues.accident.date],
        ["accident.place", sampleValues.accident.place],
        ["accident.plannedHoursStart", sampleValues.accident.plannedHoursStart],
        ["accident.plannedHoursEnd", sampleValues.accident.plannedHoursEnd],
        ["accident.injuryTypes", sampleValues.accident.injuryTypes],
        ["accident.accidentDetails", sampleValues.accident.accidentDetails],
        ["accident.authority", sampleValues.accident.authority],
        ["accident.firstAid", sampleValues.accident.firstAid],
        ["accident.medicalFacility", sampleValues.accident.medicalFacility],
        ["accident.machineRelated", sampleValues.accident.machineRelated],
        ["accident.machineUsageDetails", sampleValues.accident.machineUsageDetails],
        ["accident.machineCertified", sampleValues.accident.machineCertified],
        ["accident.machineRegistered", sampleValues.accident.machineRegistered],
      ]);
      setAbroad(sampleValues.residence.abroad);
    }

    setFormErrors({});
    addToast({ message: "Uzupełniono przykładowe dane", type: "success" });
  };

  const formFieldToBackendPaths: Record<FieldName, string[]> = {
    pesel: ["injured_person.pesel"],
    docType: [],
    docNumber: ["injured_person.document_number"],
    firstName: ["injured_person.first_name"],
    lastName: ["injured_person.last_name"],
    birthDate: [],
    birthPlace: [],
    phone: ["injured_person.phone"],
    "residence.abroad": [],
    "residence.street": [],
    "residence.houseNumber": [],
    "residence.apartmentNumber": [],
    "residence.postalCode": [],
    "residence.city": ["injured_address.city"],
    "residence.country": [],
    "lastResidence.street": [],
    "lastResidence.houseNumber": [],
    "lastResidence.apartmentNumber": [],
    "lastResidence.postalCode": [],
    "lastResidence.city": [],
    "correspondence.street": [],
    "correspondence.houseNumber": [],
    "correspondence.apartmentNumber": [],
    "correspondence.postalCode": [],
    "correspondence.city": [],
    "correspondence.country": [],
    "correspondence.mode": [],
    "correspondence.onBehalf": [],
    "accident.date": [],
    "accident.place": ["accident_info.accident_place"],
    "accident.plannedHoursStart": [],
    "accident.plannedHoursEnd": [],
    "accident.injuryTypes": ["accident_info.injuries_description"],
    "accident.accidentDetails": ["accident_info.detailed_description"],
    "accident.authority": ["accident_info.investigating_authority"],
    "accident.firstAid": [],
    "accident.medicalFacility": ["accident_info.first_aid_facility"],
    "accident.machineRelated": [],
    "accident.machineUsageDetails": ["accident_info.machine_description"],
    "accident.machineCertified": [],
    "accident.machineRegistered": [],
  };

  const handleFieldBlur = async (name: FieldName) => {
    const backendPaths = formFieldToBackendPaths[name];
    if (!backendPaths || backendPaths.length === 0) return;
    setFieldStatuses((prev) => ({ ...prev, [name]: "pending" }));
    try {
      const session = await ensureSession();
      if (!session?.sessionId) {
        addToast({ message: "Brak aktywnej sesji", type: "error" });
        return;
      }
      await runRemoteValidation(backendPaths);
    } catch (error) {
      logger.error("Field validation error", error);
      if (error instanceof ApiError && [401, 403, 404, 422].includes(error.status)) {
        resetSession();
      }
    }
  };

  const validateSection = async (paths: string[]) => {
    setFieldStatuses((prev) => {
      const next = { ...prev };
      paths.forEach((p) => {
        const mapped = backendFieldToFormField[p];
        if (mapped) {
          next[mapped as FieldName] = "pending";
        }
      });
      return next;
    });
    try {
      const session = await ensureSession();
      if (!session?.sessionId) {
        addToast({ message: "Brak aktywnej sesji", type: "error" });
        return;
      }
      await runRemoteValidation(paths);
    } catch (error) {
      logger.error("Section validation error", error);
      if (error instanceof ApiError && [401, 403, 404, 422].includes(error.status)) {
        resetSession();
      }
    }
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
                  ? "Dane trafiają na backend, możesz uruchomić walidację LLM, zapisać wersję i pobrać PDF."
                  : "Uzupełnij pola formularza. Wszystkie dane możesz edytować przed wysłaniem wniosku."}
              </p>
            </div>
            <div className="shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-right text-sm font-semibold text-slate-700">
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                Postęp
              </p>
              <p>{progressText}</p>
            </div>
            <button
              type="button"
              onClick={handleFillSample}
              className="btn shadow-sm bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Wypełnij danymi testowymi
            </button>
          </div>
        </header>

        <form className="mt-8 space-y-6" onSubmit={handleValidatedSubmit}>
          {step === "basic" && (
            <>
              {(() => {
                const props: CommonFieldProps = {
                  form,
                  errors: formErrors,
                  statuses: fieldStatuses,
                  hints: fieldHints,
                  onFieldBlur: handleFieldBlur,
                };
                return <PersonalSection {...props} />;
              })()}
              {(() => {
                const props: CommonFieldProps & { onAbroadChange: typeof setAbroad } = {
                  form,
                  errors: formErrors,
                  statuses: fieldStatuses,
                  hints: fieldHints,
                  onFieldBlur: handleFieldBlur,
                  onAbroadChange: setAbroad,
                };
                return <ResidenceSection {...props} />;
              })()}
              {abroad ? (
                (() => {
                  const props: CommonFieldProps = {
                    form,
                    errors: formErrors,
                    statuses: fieldStatuses,
                    hints: fieldHints,
                    onFieldBlur: handleFieldBlur,
                  };
                  return <LastResidenceSection {...props} />;
                })()
              ) : null}
              {(() => {
                const props: CommonFieldProps = {
                  form,
                  errors: formErrors,
                  statuses: fieldStatuses,
                  hints: fieldHints,
                  onFieldBlur: handleFieldBlur,
                };
                return <CorrespondenceSection {...props} />;
              })()}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="btn btn-ghost shadow-sm"
                disabled={validationPending || !canValidateBasic}
                onClick={async () =>
                  validateSection([
                    "injured_person.pesel",
                    "injured_person.document_number",
                    "injured_person.first_name",
                    "injured_person.last_name",
                    "injured_address.city",
                    "injured_person.phone",
                  ])
                }
              >
                Waliduj sekcję (dane podstawowe)
              </button>
            </div>
            </>
          )}

          {step === "accident" && (
            (() => {
              const props: CommonFieldProps = {
                form,
                errors: formErrors,
                statuses: fieldStatuses,
                hints: fieldHints,
                onFieldBlur: handleFieldBlur,
              };
            return (
              <>
                <AccidentSection {...props} />
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="btn btn-ghost shadow-sm"
                    disabled={validationPending || !canValidateAccident}
                    onClick={async () =>
                      validateSection([
                        "accident_info.accident_place",
                        "accident_info.first_aid_facility",
                        "accident_info.investigating_authority",
                        "accident_info.machine_description",
                        "accident_info.detailed_description",
                        "accident_info.injuries_description",
                      ])
                    }
                  >
                    Waliduj sekcję (wypadek)
                  </button>
                </div>
              </>
            );
            })()
          )}

          {step === "summary" && (
            <Section
              title="Podsumowanie i wysyłka"
              description="Zweryfikuj dane. Użyj walidacji LLM i zapisz wersję na backendzie."
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
                        children={(field: { state: { value: unknown } }) => (
                          <p className="text-sm font-semibold text-slate-900">
                            {((field.state.value as string) || "—") as string}
                          </p>
                        )}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="btn btn-ghost shadow-sm"
                    disabled={validationPending}
                    onClick={async () => {
                      try {
                        await ensureSession();
                        const ok = await runRemoteValidation();
                        if (ok) addToast({ message: "LLM nie zgłosił uwag", type: "success" });
                      } catch (error) {
                        logger.error("LLM validation error", error);
                        addToast({ message: "Nie udało się zweryfikować", type: "error" });
                      }
                    }}
                  >
                    Waliduj LLM (całość)
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost shadow-sm"
                    disabled={validationPending}
                    onClick={async () => {
                      setIsSubmitting(true);
                      try {
                        const session = await ensureSession();
                        if (!session?.sessionId) {
                          addToast({ message: "Brak aktywnej sesji", type: "error" });
                          return;
                        }
                        const payload = mapFormToBackendPayload(form.state.values as FormValues);
                        await submitForm(session.sessionId, {
                          payload,
                          source: "corrected",
                          comment: "manual save",
                        });
                        await refreshHistory();
                        addToast({ message: "Zapisano wersję na backendzie", type: "success" });
                      } catch (error) {
                        logger.error("Save version error", error);
                        addToast({ message: "Nie udało się zapisać wersji", type: "error" });
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                  >
                    Zapisz wersję (backend)
                  </button>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.08em] text-slate-500">
                        Sesja backend
                      </p>
                      <p className="text-sm font-semibold text-slate-800">
                        {sessionId ? sessionId : "Sesja nieaktywna"}
                      </p>
                    </div>
                    <div className="text-xs text-slate-500">
                      {sessionLoading ? "inicjalizuję..." : null}
                      {remoteValidating ? " • waliduję..." : null}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-semibold text-slate-700">Ostatnie wersje</p>
                    {historyLoading && <p className="text-sm text-slate-500">Ładowanie...</p>}
                    {!historyLoading && historyData?.versions?.length === 0 && (
                      <p className="text-sm text-slate-500">Brak zapisanych wersji.</p>
                    )}
                    {!historyLoading &&
                      historyData?.versions?.map((v) => (
                        <div
                          key={v.version}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-white px-3 py-2 text-sm ring-1 ring-slate-200"
                        >
                          <div className="space-y-0.5">
                            <p className="font-semibold text-slate-800">Wersja {v.version}</p>
                            <p className="text-xs text-slate-500">
                              {v.source} • {new Date(v.created_at).toLocaleString()}
                            </p>
                            {v.comment ? (
                              <p className="text-xs text-slate-600">Komentarz: {v.comment}</p>
                            ) : null}
                          </div>
                          <a
                            className="text-sm font-semibold text-emerald-700 hover:underline"
                            href={getPdfUrl(historyData.session_id, v.version)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            PDF
                          </a>
                        </div>
                      ))}
                  </div>
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
                  onClick={handleValidatedSubmit}
                  disabled={validationPending}
                  className="btn btn-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-70"
              >
                {step === "basic" ? "Przejdź do sekcji wypadku" : "Przejdź do podsumowania"}
              </button>
            ) : (
              <button
                type="submit"
                  disabled={validationPending}
                  className="btn btn-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-70"
              >
                Zakończ i zapisz na backendzie
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}

