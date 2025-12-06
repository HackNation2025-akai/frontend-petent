import { describe, expect, it } from "vitest";
import { validateFormValues } from "./schema";
import type { FormValues } from "../types/form";

const baseValid: FormValues = {
  pesel: "12345678901",
  docType: "id_card",
  docNumber: "ABC12345",
  firstName: "Jan",
  lastName: "Kowalski",
  birthDate: "1990-01-01",
  birthPlace: "Warszawa",
  phone: "600700800",
  residence: {
    street: "Główna",
    houseNumber: "10",
    apartmentNumber: "",
    postalCode: "00-001",
    city: "Warszawa",
    country: "Polska",
    abroad: false,
  },
  lastResidence: {
    street: "Stara",
    houseNumber: "5",
    apartmentNumber: "",
    postalCode: "00-002",
    city: "Warszawa",
  },
  correspondence: {
    street: "Główna",
    houseNumber: "10",
    apartmentNumber: "",
    postalCode: "00-001",
    city: "Warszawa",
    country: "Polska",
    mode: "adres",
    onBehalf: false,
  },
  accident: {
    date: "2024-01-01",
    place: "Zakład",
    plannedHoursStart: "08:00",
    plannedHoursEnd: "16:00",
    injuryTypes: "Uraz",
    accidentDetails: "Opis",
    authority: "",
    firstAid: false,
    medicalFacility: "",
    machineRelated: false,
    machineUsageDetails: "",
    machineCertified: false,
    machineRegistered: false,
  },
};

describe("validateFormValues", () => {
  it("passes on valid payload", () => {
    const result = validateFormValues(baseValid);
    expect(result.success).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("returns errors for invalid pesel and phone", () => {
    const invalid: FormValues = { ...baseValid, pesel: "123", phone: "12" };
    const result = validateFormValues(invalid);
    expect(result.success).toBe(false);
    expect(result.errors.pesel).toBeDefined();
    expect(result.errors.phone).toBeDefined();
  });
});

