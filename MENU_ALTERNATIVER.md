# Menyalternativer for Oscars Pizzeria

## Situasjon nå
- **Ninito** (order.ninito.com) – ingen offentlig API for å hente meny
- **Foodora** – har Partner API, men krever at restauranten har tilgang

## Mulige løsninger

### 1. ✅ Static menu (implementert)
**Fil:** `backend/static_menu.json`

Rediger JSON-filen når menyen endres. Backend bruker denne når ingen API er tilgjengelig.

```bash
# Rediger filen
nano backend/static_menu.json
```

### 2. Foodora Partner API
- [Foodora Developer Portal](https://developer.foodora.com/)
- Krever: Partner-konto, `client_id`, `client_secret`
- Kan hente produktkatalog – må sjekkes med Oscars Pizzeria/Foodora om de har tilgang

### 3. Ninito
- Kontakt Ninito (ninito.com) og spør om API for meny
- De tilbyr online bestilling – mulig de har integrasjon for partnere

### 4. Google Sheets
- Lag meny i et Google-ark
- Publiser som CSV/JSON eller bruk Google Sheets API
- Enkelt å oppdatere for ikke-utviklere

### 5. MongoDB (allerede i prosjektet)
- Lag en `menu`-kolleksjon
- Bygg et enkelt admin-grensesnitt eller script for å oppdatere

### 6. GloriaFood/GlobalFood
- Hvis Oscars Pizzeria bytter til GloriaFood POS, kan menyen hentes automatisk
- Krever: Restaurant key fra GloriaFood Admin
