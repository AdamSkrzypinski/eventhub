# KARTA ZAŁOŻEŃ PROJEKTU

**Przedmiot:** Zaawansowane technologie programowania  
**Temat z listy zagadnień:** Projekt 8 – Lokalne REST API  
**Nazwa projektu:** EventHub – System Zarządzania Wydarzeniami i Rezerwacją Miejsc  

---

## 1. Metryczka projektu i autora


| **Imię i Nazwisko studenta** | [Adam Skrzypiński] |
| **Numer indeksu** | [98210] |
| **Kierunek / Semestr** | Informatyka / 6 |


---

## 2. Cel i zarys projektu

Celem projektu jest zaprojektowanie oraz implementacja lokalnego serwera HTTP udostępniającego interfejs REST API wraz zintegrowaną, responsywną aplikacją kliencką (SPA).

Aplikacja **EventHub** rozwiązuje problem organizacji lokalnych inicjatyw (np. warsztatów, prelekcji technicznych, spotkań kół naukowych):
* **Organizatorzy** mogą dodawać nowe wydarzenia, określać datę, lokalizację oraz ściśle zdefiniowany limit dostępnych miejsc.
* **Uczestnicy** mają możliwość przeglądania katalogu nadchodzących wydarzeń, filtrowania ich po kategoriach, weryfikacji liczby wolnych biletów oraz dokonywania i anulowania rezerwacji.

Projekt łączy warstwę backendową i frontendową przy użyciu jednego spójnego języka programowania (**TypeScript**), co eliminuje rozbieżności w typowaniu danych pomiędzy klientem a serwerem.

---

## 3. Stos technologiczny

| Warstwa | Technologia / Biblioteka | Rola w systemie |
| :--- | :--- | :--- |
| **Język wiodący** | **TypeScript 5.x** | Statyczne typowanie w całym ekosystemie (Fullstack TS) |
| **Backend Framework** | **Node.js + Express.js** | Obsługa routingu HTTP, kontrolerów i potoków middleware |
| **Baza danych** | **SQLite** (`better-sqlite3` lub `Prisma`) | Przechowywanie danych w pojedynczym, lokalnym pliku bez konieczności konfiguracji zewnętrznych serwerów SQL |
| **Walidacja danych** | **Zod** | Walidacja schematów danych wejściowych w żądaniach HTTP (Body, Query params) |
| **Uwierzytelnianie** | **JWT (JSON Web Token) + bcrypt** | Bezstanowa autoryzacja żądań oraz bezpieczne haszowanie haseł użytkowników |
| **Frontend** | **React (Vite) + Tailwind CSS** | Klient webowy – interfejs użytkownika, stan rezerwacji, estetyczny dashboard |
| **Konteneryzacja (opcjonalnie)** | **Docker & Docker Compose** | Możliwość uruchomienia bazy i serwerów jednym poleceniem |

---

## 4. Architektura systemu


### 4.1. Wzorzec projektowy: Repozytorium (Repository Pattern)
Logika bazodanowa jest całkowicie odseparowana od logiki biznesowej i kontrolerów HTTP:
* Warstwa kontrolera (`EventsController`) przyjmuje request i odpowiada kodem HTTP.
* Warstwa serwisu (`EventsService`) weryfikuje zasady biznesowe (np. czy data wydarzenia nie jest z przeszłości).
* Warstwa repozytorium (`EventsRepository`) wykonuje bezpośrednie operacje na bazie SQLite.

### 4.2. Bezpieczeństwo i potok Middleware (Chain of Responsibility)
Każde zapytanie trafiające do chronionych zasobów przechodzi przez łańcuch middleware:
1. `validateRequest(schema)` – odrzuca niepoprawne formaty danych kodem `400 Bad Request`.
2. `authenticateToken` – weryfikuje podpis cyfrowy tokenu JWT; brak tokenu zwraca `401 Unauthorized`.
3. `requireRole(['ORGANIZER'])` – sprawdza poziom uprawnień użytkownika; brak uprawnień zwraca `403 Forbidden`.

### 4.3. Obsługa współbieżności i transakcyjność (Overbooking Prevention)
Operacja rezerwacji biletu realizowana jest w ramach transakcji atomowej:
1. Pobranie aktualnego limitu miejsc oraz liczby potwierdzonych rezerwacji.
2. Warunek atomowy: jeśli liczba rezerwacji > limit miejsc, transakcja zostaje przerwana z błędem biznesowym `409 Conflict`.
3. Dodanie rekordu rezerwacji i dekrementacja dostępnej puli w jednym bloku transakcyjnym bazy SQLite.

---

## 5. Konteneryzacja (Element opcjonalny)

Aplikacja zostanie przygotowana do opcjonalnego uruchomienia w kontenerach Docker przy użyciu `docker-compose.yml`:
* Kontener `eventhub-backend`: Środowisko Node.js uruchamiające skompilowany kod TypeScript oraz montujące plik bazy `sqlite.db` jako wolumen (`volume`).
* Kontener `eventhub-frontend`: Zbudowana aplikacja React serwowana przez lekki serwer Nginx.

---

## 6. Harmonogram i checklista realizacji

### Etap 1: Deklaracja tematu 
- [x] Opracowanie karty założeń projektu.

### Etap 2: Backend, Baza Danych i Logika
- [x] Konfiguracja TypeScript, ESLint i Express.js.
- [x] Utworzenie struktury bazy SQLite i migracji tabel.
- [x] Implementacja wzorca Repozytorium dla encji `Event` i `User`.
- [ ] Utworzenie endpointów CRUD dla wydarzeń.
- [ ] Implementacja autoryzacji JWT i middleware sprawdzających role.
- [ ] Implementacja logiki zapisu na wydarzenie z blokadą overbookingu w transakcji SQLite.

### Etap 3: Klient Frontendowy (React)
- [ ] Utworzenie projektu React (Vite) z Tailwind CSS.
- [ ] Implementacja widoku listy wydarzeń z wyszukiwarką i filtrami.
- [ ] Utworzenie formularza logowania/rejestracji oraz mechanizmu zapisywania tokenu.
- [ ] Implementacja widoku profilu z listą zarezerwowanych biletów.

### Etap 4: Testy i Wdrożenie Końcowe
- [ ] Testy scenariuszy brzegowych (próba zapisu przy 0 wolnych miejscach, błędny token).
- [ ] Przygotowanie konfiguracji Docker (Dockerfile + Docker Compose)(opcjonalnie)-.
- [ ] Uzupełnienie końcowego pliku README o instrukcję uruchomienia i zrzuty ekranu.