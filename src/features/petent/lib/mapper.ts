import type { FieldName, FormValues } from "../types/form";

export type BackendPayload = {
  injured_person: Record<string, unknown>;
  injured_address: Record<string, unknown>;
  injured_previous_address?: Record<string, unknown> | null;
  injured_correspondence_address?: Record<string, unknown> | null;
  correspondence_type?: string;
  reporter?: Record<string, unknown> | null;
  accident_info: Record<string, unknown>;
};

const fieldPaths = [
  "injured_person.pesel",
  "reporter.pesel",
  "injured_person.first_name",
  "injured_person.last_name",
  "injured_address.city",
  "injured_person.document_number",
  "injured_person.phone",
  "accident_info.accident_place",
  "accident_info.first_aid_facility",
  "accident_info.investigating_authority",
  "accident_info.machine_description",
  "accident_info.detailed_description",
  "accident_info.injuries_description",
] as const;

const hasValue = (value: unknown) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
};

const getByPath = (obj: Record<string, unknown>, path: string): unknown => {
  return path.split(".").reduce<unknown>((curr, key) => {
    if (curr === null || curr === undefined) return undefined;
    if (typeof curr !== "object") return undefined;
    return (curr as Record<string, unknown>)[key];
  }, obj);
};

export const mapCorrespondenceType = (mode: FormValues["correspondence"]["mode"]) => {
  switch (mode) {
    case "adres":
      return "standard";
    case "poste_restante":
      return "poste_restante";
    case "skrytka_pocztowa":
      return "po_box";
    case "przegrodka_pocztowa":
      return "postal_compartment";
    default:
      return "standard";
  }
};

export const mapFormToBackendPayload = (values: FormValues): BackendPayload => {
  const injuredAddress = {
    street: values.residence.street || null,
    house_number: values.residence.houseNumber || null,
    apartment_number: values.residence.apartmentNumber || null,
    postal_code: values.residence.postalCode || null,
    city: values.residence.city || null,
    country: values.residence.country || null,
  };

  const lastResidence =
    values.lastResidence &&
    (values.lastResidence.street ||
      values.lastResidence.city ||
      values.lastResidence.postalCode ||
      values.lastResidence.houseNumber)
      ? {
          street: values.lastResidence.street || null,
          house_number: values.lastResidence.houseNumber || null,
          apartment_number: values.lastResidence.apartmentNumber || null,
          postal_code: values.lastResidence.postalCode || null,
          city: values.lastResidence.city || null,
        }
      : null;

  const correspondenceAddress =
    values.correspondence &&
    (values.correspondence.street || values.correspondence.city || values.correspondence.postalCode)
      ? {
          street: values.correspondence.street || null,
          house_number: values.correspondence.houseNumber || null,
          apartment_number: values.correspondence.apartmentNumber || null,
          postal_code: values.correspondence.postalCode || null,
          city: values.correspondence.city || null,
          country: values.correspondence.country || null,
        }
      : null;

  const payload: BackendPayload = {
    injured_person: {
      pesel: values.pesel || null,
      document_type: values.docType || null,
      document_number: values.docNumber || null,
      first_name: values.firstName || null,
      last_name: values.lastName || null,
      birth_date: values.birthDate || null,
      birth_place: values.birthPlace || null,
      phone: values.phone || null,
    },
    injured_address: injuredAddress,
    injured_previous_address: lastResidence,
    injured_correspondence_address: correspondenceAddress,
    correspondence_type: mapCorrespondenceType(values.correspondence.mode),
    accident_info: {
      accident_date: values.accident.date || null,
      accident_time: values.accident.plannedHoursStart || null,
      accident_place: values.accident.place || null,
      planned_work_start: values.accident.plannedHoursStart || null,
      planned_work_end: values.accident.plannedHoursEnd || null,
      injuries_description: values.accident.injuryTypes || null,
      detailed_description: values.accident.accidentDetails || null,
      first_aid_provided: values.accident.firstAid,
      first_aid_facility: values.accident.medicalFacility || null,
      investigating_authority: values.accident.authority || null,
      machine_involved: values.accident.machineRelated,
      machine_description: values.accident.machineUsageDetails || null,
      machine_certified: values.accident.machineCertified,
      machine_registered: values.accident.machineRegistered,
    },
  };

  return payload;
};

export const mapFieldsToValidate = (
  payload: BackendPayload,
  requested?: string[] | null
): string[] => {
  const requestedSet = requested?.length ? new Set(requested) : null;
  return fieldPaths.filter((path) => {
    if (requestedSet && !requestedSet.has(path)) return false;
    return hasValue(getByPath(payload as unknown as Record<string, unknown>, path));
  });
};

export const backendFieldToFormField: Record<string, keyof FormValues | string> = {
  "injured_person.pesel": "pesel",
  "injured_person.first_name": "firstName",
  "injured_person.last_name": "lastName",
  "injured_address.city": "residence.city",
  "injured_person.document_number": "docNumber",
  "injured_person.phone": "phone",
  "accident_info.accident_place": "accident.place",
  "accident_info.first_aid_facility": "accident.medicalFacility",
  "accident_info.investigating_authority": "accident.authority",
  "accident_info.machine_description": "accident.machineUsageDetails",
  "accident_info.detailed_description": "accident.accidentDetails",
  "accident_info.injuries_description": "accident.injuryTypes",
};

export const formFieldToBackendPaths: Record<FieldName, string[]> = {
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

// helper re-export to ensure named access
export { formFieldToBackendPaths as fieldMapReverse };

