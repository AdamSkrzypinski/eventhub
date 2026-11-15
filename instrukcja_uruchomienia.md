# EventHub – Instrukcja uruchomienia projektu

## 1. Wymagania wstępne

* **Node.js** w wersji `v20.x` lub nowszej
* **npm** w wersji `v10.x` lub nowszej

---

## 2. Pliki wykluczone z repozytorium (do utworzenia / wygenerowania)

Ze względów bezpieczeństwa oraz rozmiaru paczki poniższe elementy **nie są dołączone do repozytorium** i należy je uzupełnić przed uruchomieniem:

1. **Katalogi `node_modules/`** – wygenerują się automatycznie podczas instalacji zależności.
2. **Plik konfiguracyjny `apps/server/.env`** – przechowuje zmienne środowiskowe serwera (należy utworzyć go ręcznie).
3. **Plik bazy danych `apps/server/database.sqlite`** (wraz z plikami pomocniczymi `-wal` i `-shm`) – zostanie utworzony automatycznie przy pierwszym uruchomieniu serwera na podstawie schematu SQL.

---

## 3. Kroki uruchomienia lokalnego

### Krok 1: Instalacja zależności
W katalogu głównym projektu (`eventhub/`) otwórz terminal i zainstaluj pakiety dla całego monorepo:
```bash
npm install
```

### Krok 2: Utworzenie pliku `.env`
W katalogu `apps/server/` utwórz nowy plik o nazwie `.env` i wklej do niego poniższą konfigurację:
```env
PORT=5000
JWT_SECRET=dowolny_tajny_klucz_do_podpisywania_tokenow
```

### Krok 3: Uruchomienie serwera deweloperskiego (Backend)
W katalogu głównym projektu uruchom serwer:
```bash
npm run dev --workspace=apps/server
```
Po uruchomieniu:
* API będzie dostępne pod adresem: `http://localhost:5000`
* W katalogu `apps/server/` automatycznie pojawi się zainicjalizowany plik bazy danych `database.sqlite`.

---

## 4. Dostępne endpointy REST API

### Autoryzacja (`/api/auth`)
* `POST /api/auth/register` – Rejestracja nowego użytkownika (domyślnie nadawana rola `USER`).
* `POST /api/auth/login` – Logowanie użytkownika i pobranie tokenu `JWT`.

### Wydarzenia (`/api/events`)
* `GET /api/events` – Pobranie listy wszystkich wydarzeń wraz z liczbą dostępnych miejsc.
* `GET /api/events/:id` – Pobranie szczegółów konkretnego wydarzenia.
* `POST /api/events` – Utworzenie nowego wydarzenia *(wymaga nagłówka `Authorization: Bearer <token>` z rolą `ADMIN`)*.
* `DELETE /api/events/:id` – Usunięcie wydarzenia *(wymaga roli `ADMIN`)*.

### Rezerwacje (`/api/reservations`)
* `POST /api/reservations` – Rezerwacja miejsca na wydarzenie (`{ "eventId": 1 }`). Chronione atomową transakcją SQLite przed przekroczeniem limitu miejsc (zwraca `409 Conflict` w przypadku braku miejsc).
* `GET /api/reservations/my` – Lista rezerwacji zalogowanego użytkownika.
* `DELETE /api/reservations/:id` – Anulowanie rezerwacji.