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
      <div className="flex flex-col gap-3 px-6 pt-5 pb-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
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

        <div className="h-[3px] w-full border-b-[3px] border-[#007834]" />
      </div>

      {description ? (
        <div className="px-6 pt-1 pb-3">
          <p className="text-sm text-slate-600">{description}</p>
        </div>
      ) : null}

      <div className="px-6 pb-6">{children}</div>
    </section>
  );
}

