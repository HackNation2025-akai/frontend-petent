import type { FormValues } from "../types/form";

type Props = {
  values: FormValues;
};

export function AccidentNotificationPrint({ values }: Props) {
  const injuredFullName = `${values.firstName || ""} ${values.lastName || ""}`.trim();
  const workplace = values.residence?.city || "";
  const addressAndPhone = `${values.residence?.street ?? ""} ${values.residence?.houseNumber ?? ""}, ${values.residence?.postalCode ?? ""} ${values.residence?.city ?? ""}${values.phone ? ", tel. " + values.phone : ""}`.trim();

  return (
    <div className="a4-page bg-white mx-auto my-5 shadow-lg" style={{ width: "210mm", minHeight: "297mm", padding: "25mm 20mm" }}>
      <div className="flex justify-between items-start mb-8 text-sm">
        <div className="w-1/2 pr-4">
          <div className="mb-4">
            <div className="input-line">
              {injuredFullName || "(imię i nazwisko zgłaszającego)"}
            </div>
            <div className="text-xs text-center text-gray-500">
              (imię i nazwisko zgłaszającego)
            </div>
          </div>
          <div>
            <div className="input-line">
              {(values.accident?.authority as string) || "(stanowisko służbowe, nr telefonu)"}
            </div>
            <div className="text-xs text-center text-gray-500">
              (stanowisko służbowe, nr telefonu)
            </div>
          </div>
        </div>

        <div className="w-1/2 pl-4 text-right">
          <div className="mb-4">
            <div className="input-line text-right">
              {values.accident?.date || "Miejscowość, data"}
            </div>
            <div className="text-xs text-center text-gray-500">(miejscowość i data)</div>
          </div>
          <div>
            <div className="input-line text-right">{workplace || "Miejsce pracy"}</div>
            <div className="text-xs text-center text-gray-500">(miejsce pracy)</div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-12">
        <div className="w-1/3 text-center">
          <div className="font-bold mb-2">Do:</div>
          <div className="input-line text-center">/ bezpośredni przełożony /</div>
          <div className="font-bold mt-1">/ bezpośredni przełożony /</div>
        </div>
      </div>

      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold uppercase underline tracking-wide">
          Zawiadomienie o wypadku przy pracy
        </h1>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block font-bold text-sm text-gray-800">
            Imię i nazwisko osoby poszkodowanej:
          </label>
          <div className="input-line">{injuredFullName}</div>
        </div>

        <div>
          <label className="block font-bold text-sm text-gray-800">Miejsce pracy:</label>
          <div className="input-line">{workplace}</div>
          <div className="text-xs text-right text-gray-500">
            (zakład pracy, oddział, wydział)
          </div>
        </div>

        <div>
          <label className="block font-bold text-sm text-gray-800">
            Adres zamieszkania, numer telefonu:
          </label>
          <div className="input-line">{addressAndPhone}</div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <label className="block font-bold text-sm text-gray-800">
              Data i godzina wypadku:
            </label>
            <div className="input-line">{values.accident?.date}</div>
          </div>
          <div>
            <label className="block font-bold text-sm text-gray-800">
              Miejsce wypadku:
            </label>
            <div className="input-line">{values.accident?.place}</div>
          </div>
        </div>

        <div>
          <label className="block font-bold text-sm text-gray-800">Skutki wypadku:</label>
          <div className="mt-1 min-h-[5rem] border border-gray-300 bg-gray-50 p-2 text-sm leading-relaxed">
            {values.accident?.injuryTypes}
          </div>
        </div>

        <div>
          <label className="block font-bold text-sm text-gray-800">
            Świadkowie wypadku (imię, nazwisko, adres zamieszkania, numer telefonu):
          </label>
          <div className="mt-1 min-h-[6rem] border border-gray-300 bg-gray-50 p-2 text-sm leading-relaxed" />
        </div>

        <div>
          <label className="block font-bold text-sm text-gray-800">Zwięzły opis wypadku:</label>
          <div className="mt-1 min-h-[12rem] border border-gray-300 bg-gray-50 p-2 text-sm leading-relaxed text-justify">
            {values.accident?.accidentDetails}
          </div>
        </div>
      </div>

      <div className="mt-16 flex justify-end">
        <div className="w-1/3 text-center">
          <div className="input-line mb-1">{injuredFullName}</div>
          <div className="text-xs text-gray-500">
            (podpis osoby zgłaszającej wypadek)
          </div>
        </div>
      </div>
    </div>
  );
}
