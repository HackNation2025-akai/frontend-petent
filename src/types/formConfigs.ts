import type { FieldConfig, FormValues } from "./form";
import {
  personalFields,
  residenceFields,
  lastResidenceFields,
  correspondenceFields,
} from "./form";

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

