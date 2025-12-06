import type { ReactNode } from "react";

type SectionProps = {
  title: string;
  description?: string;
  children?: ReactNode;
  onValidateClick?: () => void;
  validateLabel?: string;
  validating?: boolean;
};

export default function Section({
  title,
  description,
  children,
  onValidateClick,
  validateLabel,
  validating,
}: SectionProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-2 px-6 py-5">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
              Sekcja
            </p>
            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          </div>
          <div className="hidden h-10 w-px rounded-full bg-slate-200 md:block" />
          {onValidateClick ? (
            <button
              type="button"
              onClick={onValidateClick}
              disabled={validating}
              className="btn btn-ghost text-sm font-semibold text-emerald-700 hover:text-emerald-800 disabled:opacity-60"
            >
              {validateLabel ?? "Waliduj LLM"}
            </button>
          ) : null}
        </div>
        {description ? <p className="text-sm text-slate-600">{description}</p> : null}
      </div>

      <div className="border-t border-slate-100" />

      <div className="px-6 py-5">{children}</div>
    </section>
  );
}

