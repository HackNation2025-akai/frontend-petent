# Frontend - HackNation 2025

## Uruchomienie w Dockerze

Wymagania: `docker` oraz `docker compose`.

1. Zbuduj i uruchom kontener:
   ```bash
   ./start.sh
   ```
   Aplikacja będzie dostępna na `http://localhost:5173` (tryb dev Vite).

2. Zatrzymanie i czyszczenie kontenera, wolumenów oraz lokalnie zbudowanych obrazów dla tego projektu:
   ```bash
   ./clear.sh
   ```
