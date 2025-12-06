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

