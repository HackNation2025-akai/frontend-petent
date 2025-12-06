import type { FieldConfig, FormValues } from "./form";
import { normalizePesel, normalizePhone, normalizePostalCode } from "@/shared/lib/formatters";

const personalFields: FieldConfig[] = [
  { name: "firstName", label: "Imię", colSpan: "col-span-12 md:col-span-3" },
  { name: "lastName", label: "Nazwisko", colSpan: "col-span-12 md:col-span-3" },
  {
    name: "birthDate",
    label: "Data urodzenia",
    type: "date",
    colSpan: "col-span-12 md:col-span-3",
  },
  {
    name: "birthPlace",
    label: "Miejsce urodzenia",
    colSpan: "col-span-12 md:col-span-3",
  },
  { name: "pesel", label: "PESEL", colSpan: "col-span-12 md:col-span-3", normalize: normalizePesel },
  {
    name: "docNumber",
    label: "Seria i numer dokumentu",
    colSpan: "col-span-12 md:col-span-3",
  },
  {
    name: "phone",
    label: "Numer telefonu",
    type: "tel",
    colSpan: "col-span-12 md:col-span-3",
    normalize: normalizePhone,
  },
];

const residenceFields: FieldConfig[] = [
  {
    name: "residence.street",
    label: "Ulica",
    colSpan: "col-span-12 md:col-span-6",
  },
  {
    name: "residence.houseNumber",
    label: "Numer domu",
    colSpan: "col-span-6 md:col-span-3",
  },
  {
    name: "residence.apartmentNumber",
    label: "Numer lokalu",
    colSpan: "col-span-6 md:col-span-3",
  },
  {
    name: "residence.postalCode",
    label: "Kod pocztowy",
    colSpan: "col-span-6 md:col-span-3",
    normalize: normalizePostalCode,
  },
  {
    name: "residence.city",
    label: "Miejscowość",
    colSpan: "col-span-6 md:col-span-3",
  },
  {
    name: "residence.country",
    label: "Nazwa państwa (jeśli inne niż Polska)",
    colSpan: "col-span-12 md:col-span-6",
    placeholder: "Polska",
  },
];

const lastResidenceFields: FieldConfig[] = [
  {
    name: "lastResidence.street",
    label: "Ulica",
    colSpan: "col-span-12 md:col-span-6",
  },
  {
    name: "lastResidence.houseNumber",
    label: "Numer domu",
    colSpan: "col-span-6 md:col-span-3",
  },
  {
    name: "lastResidence.apartmentNumber",
    label: "Numer lokalu",
    colSpan: "col-span-6 md:col-span-3",
  },
  {
    name: "lastResidence.postalCode",
    label: "Kod pocztowy",
    colSpan: "col-span-6 md:col-span-3",
    normalize: normalizePostalCode,
  },
  {
    name: "lastResidence.city",
    label: "Miejscowość",
    colSpan: "col-span-6 md:col-span-3",
  },
];

const correspondenceFields: FieldConfig[] = [
  {
    name: "correspondence.street",
    label: "Ulica",
    colSpan: "col-span-12 md:col-span-6",
  },
  {
    name: "correspondence.houseNumber",
    label: "Numer domu",
    colSpan: "col-span-6 md:col-span-3",
  },
  {
    name: "correspondence.apartmentNumber",
    label: "Numer lokalu",
    colSpan: "col-span-6 md:col-span-3",
  },
  {
    name: "correspondence.postalCode",
    label: "Kod pocztowy",
    colSpan: "col-span-6 md:col-span-3",
    normalize: normalizePostalCode,
  },
  {
    name: "correspondence.city",
    label: "Miejscowość",
    colSpan: "col-span-6 md:col-span-3",
  },
  {
    name: "correspondence.country",
    label: "Nazwa państwa (jeśli inne niż Polska)",
    colSpan: "col-span-12 md:col-span-6",
    placeholder: "Polska",
  },
];

export const docTypeOptions = [
  { value: "", label: "Wybierz rodzaj dokumentu" },
  { value: "id_card", label: "Dowód osobisty" },
  { value: "passport", label: "Paszport" },
  { value: "other", label: "Inny dokument tożsamości" },
] as const;

export const correspondenceModeOptions: {
  value: FormValues["correspondence"]["mode"];
  label: string;
}[] = [
  { value: "adres", label: "Adres" },
  { value: "poste_restante", label: "Poste restante" },
  { value: "skrytka_pocztowa", label: "Skrytka pocztowa" },
  { value: "przegrodka_pocztowa", label: "Przegródka pocztowa" },
];

export const summaryRows: FieldConfig[] = [
  { name: "firstName", label: "Imię" },
  { name: "lastName", label: "Nazwisko" },
  { name: "birthDate", label: "Data urodzenia" },
  { name: "birthPlace", label: "Miejsce urodzenia" },
  { name: "pesel", label: "PESEL" },
  { name: "docType", label: "Rodzaj dokumentu" },
  { name: "docNumber", label: "Seria i numer dokumentu" },
  { name: "phone", label: "Numer telefonu" },
];

export {
  personalFields,
  residenceFields,
  lastResidenceFields,
  correspondenceFields,
};

