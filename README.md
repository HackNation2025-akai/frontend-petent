# Frontend - HackNation 2025

## Stos
- Vite 7 + React 19 + TypeScript 5.9
- React Router 7
- TanStack React Form
- Radix UI Theme
- Tailwind CSS v4 (importy w `src/styles/index.css`)
- Zod (walidacja), Vitest + Playwright (testy)

## Wymagania
- Node 20+
- npm (domyślnie) lub pnpm/yarn (jeśli preferujesz)
- Docker (opcjonalnie do uruchamiania przez `start.sh`)

## Komendy
- `npm run dev` — start dev (`http://localhost:5173`)
- `npm run build` — build produkcyjny
- `npm run check` — typy (TS `--noEmit`)
- `npm run lint` / `npm run lint:fix` — lint
- `npm run format` — Prettier
- `npm run preview` — podgląd builda (port 4173)
- `npm run test` — testy jednostkowe (Vitest)
- `npm run test:e2e` — Playwright (uruchamia dev server na 4173)

## Struktura `src/`
- `app/` — router, providery (np. Radix Theme)
- `features/petent/` — logika formularza, sekcje, typy i configi
- `shared/` — wspólne utilsy (logger, formatery), provider toastów
- `styles/` — globalne style (Tailwind + tokeny bazowe)
- aliasy: `@/*`, `@features/*`, `@shared/*`

## Architektura formularza
- Walidacja: Zod (`features/petent/validation/schema.ts`), błędy w UI pod polami.
- Sekcje formularza w `features/petent/components/sections/*`, konfiguracje pól w `features/petent/types/form.config.ts`.
- Persistencja szkicu: localStorage (klucz `petent_form_draft_v1`), przycisk „Zapisz szkic”.
- Toasty: `ToastProvider` w `app/providers/AppProviders.tsx`.

## Uruchomienie w Dockerze
1. Zbuduj i uruchom:
   ```bash
   ./start.sh
   ```
2. Sprzątanie kontenera, wolumenów i lokalnych obrazów:
   ```bash
   ./clear.sh
   ```
