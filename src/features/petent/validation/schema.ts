import { z } from "zod";
import type { FieldName, FormValues } from "../types/form";

const postalCodeRegex = /^[0-9]{2}-?[0-9]{3}$/;
const peselRegex = /^[0-9]{11}$/;
const phoneRegex = /^[0-9]{7,15}$/;

const addressSchema = z.object({
  street: z.string().min(2, "Ulica jest wymagana"),
  houseNumber: z.string().min(1, "Numer domu jest wymagany"),
  apartmentNumber: z.string().optional().default(""),
  postalCode: z.string().regex(postalCodeRegex, "Podaj kod w formacie 12-345"),
  city: z.string().min(2, "Miejscowość jest wymagana"),
});

const addressWithCountrySchema = addressSchema.extend({
  country: z.string().min(2, "Podaj nazwę państwa"),
});

// Schema dla etapu "basic" (dane osobowe + adresy)
export const basicStepSchema = z.object({
  pesel: z.string().regex(peselRegex, "PESEL powinien mieć 11 cyfr"),
  docType: z.enum(["id_card", "passport", "other", ""],),
  docNumber: z.string().min(3, "Podaj numer dokumentu"),
  firstName: z.string().min(2, "Imię jest wymagane"),
  lastName: z.string().min(2, "Nazwisko jest wymagane"),
  birthDate: z.string().min(4, "Data urodzenia jest wymagana"),
  birthPlace: z.string().min(2, "Miejsce urodzenia jest wymagane"),
  phone: z.string().regex(phoneRegex, "Telefon powinien mieć 7-15 cyfr"),
  residence: addressWithCountrySchema.extend({
    abroad: z.boolean(),
  }),
  correspondence: addressWithCountrySchema.extend({
    mode: z.enum(["adres", "poste_restante", "skrytka_pocztowa", "przegrodka_pocztowa"]),
    onBehalf: z.boolean(),
  }),
});

// Schema dla etapu "basic" gdy abroad=true (dodatkowo lastResidence)
export const basicStepAbroadSchema = basicStepSchema.extend({
  lastResidence: addressSchema,
});

// Schema dla etapu "accident"
export const accidentStepSchema = z.object({
  accident: z.object({
    date: z.string().min(4, "Data wypadku jest wymagana"),
    place: z.string().min(2, "Podaj miejsce wypadku"),
    plannedHoursStart: z.string().optional().default(""),
    plannedHoursEnd: z.string().optional().default(""),
    injuryTypes: z.string().min(2, "Opisz rodzaj urazów"),
    accidentDetails: z.string().min(4, "Dodaj opis okoliczności"),
    authority: z.string().optional().default(""),
    firstAid: z.boolean(),
    medicalFacility: z.string().optional().default(""),
    machineRelated: z.boolean(),
    machineUsageDetails: z.string().optional().default(""),
    machineCertified: z.boolean(),
    machineRegistered: z.boolean(),
  }),
});

// Pełna schema (używana w summary)
export const formSchema = z
  .object({
    pesel: z.string().regex(peselRegex, "PESEL powinien mieć 11 cyfr"),
    docType: z.enum(["id_card", "passport", "other", ""],),
    docNumber: z.string().min(3, "Podaj numer dokumentu"),
    firstName: z.string().min(2, "Imię jest wymagane"),
    lastName: z.string().min(2, "Nazwisko jest wymagane"),
    birthDate: z.string().min(4, "Data urodzenia jest wymagana"),
    birthPlace: z.string().min(2, "Miejsce urodzenia jest wymagane"),
    phone: z.string().regex(phoneRegex, "Telefon powinien mieć 7-15 cyfr"),
    residence: addressWithCountrySchema.extend({
      abroad: z.boolean(),
    }),
    lastResidence: z
      .object({
        street: z.string().optional(),
        houseNumber: z.string().optional(),
        apartmentNumber: z.string().optional().default(""),
        postalCode: z.string().optional(),
        city: z.string().optional(),
      })
      .optional()
      .default(undefined),
    correspondence: addressWithCountrySchema.extend({
      mode: z.enum(["adres", "poste_restante", "skrytka_pocztowa", "przegrodka_pocztowa"]),
      onBehalf: z.boolean(),
    }),
    accident: z.object({ 
      date: z.string().min(4, "Data wypadku jest wymagana"),
      place: z.string().min(2, "Podaj miejsce wypadku"),
      plannedHoursStart: z.string().optional().default(""),
      plannedHoursEnd: z.string().optional().default(""),
      injuryTypes: z.string().min(2, "Opisz rodzaj urazów"),
      accidentDetails: z.string().min(4, "Dodaj opis okoliczności"),
      authority: z.string().optional().default(""),
      firstAid: z.boolean(),
      medicalFacility: z.string().optional().default(""),
      machineRelated: z.boolean(),
      machineUsageDetails: z.string().optional().default(""),
      machineCertified: z.boolean(),
      machineRegistered: z.boolean(),
    }),
  })
  .superRefine((value, ctx) => {
    if (value.residence.abroad && !value.lastResidence) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["lastResidence"],
        message: "Podaj ostatnie miejsce zamieszkania w Polsce",
      });
    }
  });

type Step = "basic" | "accident" | "summary";

const parseErrors = (result: z.ZodSafeParseError<unknown>) => {
  const errors: Record<FieldName, string> = {} as Record<FieldName, string>;
  for (const issue of result.error.issues) {
    const key = issue.path.join(".") as FieldName;
    if (!key) continue;
    if (!errors[key]) {
      errors[key] = issue.message;
    }
  }
  return errors;
};

// Walidacja dla danego etapu
export const validateStepValues = (
  value: FormValues,
  step: Step,
  abroad: boolean = false,
) => {
  let schema: z.ZodTypeAny;

  switch (step) {
    case "basic":
      schema = abroad ? basicStepAbroadSchema : basicStepSchema;
      break;
    case "accident":
      schema = accidentStepSchema;
      break;
    case "summary":
    default:
      schema = formSchema;
      break;
  }

  const result = schema.safeParse(value);

  if (result.success) {
    return { success: true as const, errors: {} as Record<FieldName, string> };
  }

  return { success: false as const, errors: parseErrors(result) };
};

// Walidacja pełnego formularza (backwards compatible)
export const validateFormValues = (value: FormValues) => {
  const result = formSchema.safeParse(value);

  if (result.success) {
    return { success: true as const, errors: {} as Record<FieldName, string> };
  }

  return { success: false as const, errors: parseErrors(result) };
};