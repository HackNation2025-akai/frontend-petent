# Frontend - HackNation 2025

## Stos
- Vite 7 + React 19 + TypeScript 5.9
- React Router 7
- TanStack React Form
- Radix UI Theme
- Tailwind CSS v4 (importy w `src/styles/index.css`)

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

## Struktura `src/`
- `app/` — router, providery (np. Radix Theme)
- `features/petent/` — logika formularza, sekcje, typy i configi
- `styles/` — globalne style (Tailwind + tokeny bazowe)
- aliasy: `@/*` wskazuje na `src/*`

## Uruchomienie w Dockerze
1. Zbuduj i uruchom:
   ```bash
   ./start.sh
   ```
2. Sprzątanie kontenera, wolumenów i lokalnych obrazów:
   ```bash
   ./clear.sh
   ```
