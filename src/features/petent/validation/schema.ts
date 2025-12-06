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

export const formSchema = z.object({
  pesel: z.string().regex(peselRegex, "PESEL powinien mieć 11 cyfr"),
  docType: z.enum(["id_card", "passport", "other", ""], {
    required_error: "Wybierz rodzaj dokumentu",
  }),
  docNumber: z.string().min(3, "Podaj numer dokumentu"),
  firstName: z.string().min(2, "Imię jest wymagane"),
  lastName: z.string().min(2, "Nazwisko jest wymagane"),
  birthDate: z.string().min(4, "Data urodzenia jest wymagana"),
  birthPlace: z.string().min(2, "Miejsce urodzenia jest wymagane"),
  phone: z.string().regex(phoneRegex, "Telefon powinien mieć 7-15 cyfr"),
  residence: addressWithCountrySchema.extend({
    abroad: z.boolean(),
  }),
  lastResidence: addressSchema,
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
});

export const validateFormValues = (value: FormValues) => {
  const result = formSchema.safeParse(value);

  if (result.success) {
    return { success: true as const, errors: {} as Record<FieldName, string> };
  }

  const errors: Record<FieldName, string> = {} as Record<FieldName, string>;

  for (const issue of result.error.issues) {
    const key = issue.path.join(".") as FieldName;
    if (!key) continue;
    if (!errors[key]) {
      errors[key] = issue.message;
    }
  }

  return { success: false as const, errors };
};

