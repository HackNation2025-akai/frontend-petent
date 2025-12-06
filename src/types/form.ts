export type Address = {
  street: string;
  houseNumber: string;
  apartmentNumber: string;
  postalCode: string;
  city: string;
};

export type AddressWithCountry = Address & { country: string };

export type FormValues = {
  pesel: string;
  docType: "id_card" | "passport" | "other" | "";
  docNumber: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  birthPlace: string;
  phone: string;
  residence: AddressWithCountry & { abroad: boolean };
  lastResidence: Address;
  correspondence: AddressWithCountry & {
    mode:
      | "adres"
      | "poste_restante"
      | "skrytka_pocztowa"
      | "przegrodka_pocztowa";
    onBehalf: boolean;
  };
  accident: {
    date: string;
    place: string;
    plannedHoursStart: string;
    plannedHoursEnd: string;
    injuryTypes: string;
    accidentDetails: string;
    authority: string;
    firstAid: boolean;
    medicalFacility: string;
    machineRelated: boolean;
    machineUsageDetails: string;
    machineCertified: boolean;
    machineRegistered: boolean;
  };
};

type AddressKeys = keyof Address;

export type FieldName =
  | "pesel"
  | "docType"
  | "docNumber"
  | "firstName"
  | "lastName"
  | "birthDate"
  | "birthPlace"
  | "phone"
  | "residence.abroad"
  | `residence.${AddressKeys}`
  | "residence.country"
  | `lastResidence.${AddressKeys}`
  | `correspondence.${AddressKeys}`
  | "correspondence.country"
  | "correspondence.mode"
  | "correspondence.onBehalf"
  | "accident.date"
  | "accident.place"
  | "accident.plannedHoursStart"
  | "accident.plannedHoursEnd"
  | "accident.injuryTypes"
  | "accident.accidentDetails"
  | "accident.authority"
  | "accident.firstAid"
  | "accident.medicalFacility"
  | "accident.machineRelated"
  | "accident.machineUsageDetails"
  | "accident.machineCertified"
  | "accident.machineRegistered";

export type FieldConfig = {
  name: FieldName;
  label: string;
  type?: "text" | "date" | "tel";
  colSpan?: string;
  placeholder?: string;
};

export const personalFields: FieldConfig[] = [
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
  { name: "pesel", label: "PESEL", colSpan: "col-span-12 md:col-span-3" },
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
  },
];

export const residenceFields: FieldConfig[] = [
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

export const lastResidenceFields: FieldConfig[] = [
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
  },
  {
    name: "lastResidence.city",
    label: "Miejscowość",
    colSpan: "col-span-6 md:col-span-3",
  },
];

export const correspondenceFields: FieldConfig[] = [
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
