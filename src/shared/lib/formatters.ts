export const normalizeDigits = (value: string, maxLength?: number) => {
  const digits = value.replace(/\D+/g, "");
  return typeof maxLength === "number" ? digits.slice(0, maxLength) : digits;
};

export const normalizePesel = (value: string) => normalizeDigits(value, 11);

export const normalizePhone = (value: string) => normalizeDigits(value, 15);

export const normalizePostalCode = (value: string) => {
  const digits = normalizeDigits(value, 5);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}-${digits.slice(2)}`;
};

