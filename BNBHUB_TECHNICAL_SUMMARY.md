# BnBHub - Riassunto tecnico del progetto

> Questo file non e la documentazione finale. E un contesto tecnico strutturato, ricavato dall'analisi dei sorgenti `frontend/` e `backend/`, da usare come input per generare successivamente la documentazione universitaria.
>
> Analisi aggiornata il 16 giugno 2026. Sono stati letti i sorgenti, i manifest, i lockfile, le configurazioni, i test, i template e gli stili. Sono stati inoltre rieseguiti build e test frontend disponibili dopo le ultime modifiche.

## 1. Stack tecnologico

### 1.1 Architettura generale

- Applicazione client-server separata in:
  - `frontend/`: Single Page Application Ionic + Angular, componenti standalone e lazy loading.
  - `backend/`: REST API Node.js + Express in CommonJS.
  - Persistenza: database locale SQLite.
- Comunicazione via HTTP JSON.
- URL usati dal frontend: `http://localhost:3000`.
- URL API centralizzato nei file `environment.ts` ed `environment.prod.ts` tramite `apiUrl`.
- Backend in ascolto su `process.env.PORT` oppure porta `3000`.
- Frontend normalmente servito su `http://localhost:4200`.

### 1.2 Frontend: dipendenze principali e versioni esatte risolte

Le versioni "dichiarate" provengono da `frontend/package.json`; le versioni "risolte" da `frontend/package-lock.json`.

| Pacchetto | Dichiarata | Risolta | Uso nel progetto |
|---|---:|---:|---|
| `@angular/core`, `common`, `compiler`, `forms`, `router`, `animations`, `platform-browser`, `platform-browser-dynamic` | `^20.0.0` | `20.3.20` | Framework SPA, componenti standalone, router, Reactive Forms, bootstrap browser e test |
| `@ionic/angular` | `^8.0.0` | `8.8.6` | Componenti UI responsive/mobile, menu, card, form, badge, accordion, spinner, navigation shell |
| `@capacitor/core` | `8.3.3` | `8.3.3` | Runtime Capacitor predisposto per packaging nativo |
| `@capacitor/app` | `8.1.0` | `8.1.0` | Plugin lifecycle/app Capacitor; installato ma non importato nei sorgenti analizzati |
| `@capacitor/haptics` | `8.0.2` | `8.0.2` | Plugin Capacitor per feedback aptico |
| `@capacitor/keyboard` | `8.0.3` | `8.0.3` | Plugin Capacitor per gestione tastiera mobile |
| `@capacitor/status-bar` | `8.0.2` | `8.0.2` | Plugin Capacitor per gestione status bar |
| `ionicons` | `^7.0.0` | `7.4.0` | Icone della navbar, pagine, mappe e gallerie |
| `leaflet` | `^1.9.4` | `1.9.4` | Mappa OpenStreetMap nella home |
| `rxjs` | `~7.8.0` | `7.8.2` | Observable e gestione delle chiamate HTTP |
| `tslib` | `^2.3.0` | `2.8.1` | Helper runtime TypeScript |
| `zone.js` | `~0.15.0` | `0.15.1` | Change detection Angular e ambiente test |
| `typescript` | `~5.9.0` | `5.9.3` | Compilazione TypeScript strict |
| `@angular/cli` | `^20.0.0` | `20.3.25` | Build, serve, test e lint |
| `@angular-devkit/build-angular` | `^20.0.0` | `20.3.25` | Builder Angular applicazione/Karma |
| `@angular-eslint/*` | `^20.0.0` | `20.7.0` | Lint TypeScript e template Angular |
| `@ionic/angular-toolkit` | `^12.0.0` | `12.3.0` | Schematics e integrazione Ionic/Angular |
| `@capacitor/cli` | `8.3.3` | `8.3.3` | Tooling Capacitor |
| `jasmine-core` | `~5.1.0` | `5.1.2` | Unit test frontend |
| `karma` | `~6.4.0` | `6.4.4` | Test runner browser |
| `karma-chrome-launcher` | `~3.2.0` | `3.2.0` | Esecuzione test in Chrome/ChromeHeadless |
| `karma-coverage` | `~2.2.0` | `2.2.1` | Report coverage |
| `eslint` | `^9.16.0` | `9.39.4` | Analisi statica |

Altri tool frontend risolti: `@types/jasmine 5.1.15`, `@types/leaflet 1.9.21`, `@typescript-eslint/eslint-plugin 8.59.3`, `@typescript-eslint/parser 8.59.3`, `eslint-plugin-import 2.32.0`, `eslint-plugin-jsdoc 48.11.0`, `eslint-plugin-prefer-arrow 1.2.2`, `jasmine-spec-reporter 5.0.2`, `karma-jasmine 5.1.0`, `karma-jasmine-html-reporter 2.1.0`.

### 1.3 Backend: dipendenze principali e versioni esatte risolte

| Pacchetto | Dichiarata | Risolta | Uso nel progetto |
|---|---:|---:|---|
| `express` | `^5.2.1` | `5.2.1` | Server HTTP, routing REST e parsing JSON tramite `express.json()` |
| `cors` | `^2.8.6` | `2.8.6` | Gestione delle richieste cross-origin tra frontend e backend |
| `dotenv` | `^17.4.2` | `17.4.2` | Caricamento di `.env` |
| `sqlite3` | `^6.0.1` | `6.0.1` | Database SQLite, schema e query callback-based |
| `bcryptjs` | `^3.0.3` | `3.0.3` | Hash password con cost factor 10 e verifica login |
| `jsonwebtoken` | `^9.0.3` | `9.0.3` | Emissione e verifica JWT |
| `nodemailer` | `^8.0.8` | `8.0.8` | Email di conferma registrazione e prenotazione |
| `express-rate-limit` | `^8.5.2` | `8.5.2` | Limitazione dei tentativi su login, registrazione e richiesta reset password |
| `express-validator` | `^7.3.2` | `7.3.2` | Validazione e normalizzazione centralizzata dei payload di autenticazione |
| `helmet` | `^8.2.0` | `8.2.0` | Impostazione degli header HTTP di sicurezza |
| `multer` | `^2.1.1` | `2.1.1` | Upload multipart in memoria delle immagini camera |
| `sharp` | `^0.35.0` | `0.35.0` | Validazione contenuto, ridimensionamento e conversione immagini in WebP |
| `nodemon` | `^3.1.14` | `3.1.14` | Riavvio automatico server con `npm run dev` |
| `supertest` | `^7.2.2` | `7.2.2` | Test HTTP/integration dell'app Express senza avviare una porta reale |

### 1.4 Configurazione e scelte tecniche

- Angular standalone: nessun `NgModule`; bootstrap con `bootstrapApplication`.
- Route lazy-loaded tramite `loadComponent`.
- `provideHttpClient()` senza interceptor: ogni service protetto crea manualmente l'header `Authorization`.
- TypeScript strict, target ES2022, module resolution `bundler`.
- SCSS globale e per componente; palette centralizzata in `theme/variables.scss`.
- Build output Angular in `frontend/www`.
- Capacitor configurato con `appId: io.ionic.starter`, `appName: frontend` e `webDir: www`.
- Backend CommonJS (`"type": "commonjs"`).
- L'app Express e separata dall'avvio del server: `app.js` costruisce ed esporta l'applicazione, mentre `server.js` valida la configurazione e apre la porta HTTP.
- CORS usa una whitelist configurabile tramite `CORS_ORIGINS`; in assenza della variabile sono consentiti i frontend locali sulle porte `4200` e `8100`.
- Il segreto JWT viene validato all'avvio e deve contenere almeno 32 caratteri.
- Le immagini pubbliche vengono servite dal backend da `/uploads/structure` e `/uploads/rooms`.
- Script backend disponibile: `npm run images:structure`, che converte immagini PNG della struttura in WebP.
- Test backend con test runner nativo Node (`node --test`).
- Test frontend con Jasmine + Karma.

## 2. Struttura del progetto

### 2.1 Albero completo rilevato

Esclusi `node_modules/`, `.angular/`, `dist/`, `.git/` e `frontend/www/`. Quest'ultima e una cartella di output generata automaticamente dalla build Angular e non fa parte dei sorgenti da documentare.

```text
BnBHub/
|-- .gitignore
|-- README.md
|-- backend/
|   |-- .env
|   |-- .env.example
|   |-- app.js
|   |-- database.js
|   |-- database.sqlite
|   |-- package.json
|   |-- package-lock.json
|   |-- server.js
|   |-- config/
|   |   |-- security.js
|   |   `-- security.test.js
|   |-- controllers/
|   |   |-- authController.js
|   |   |-- authController.test.js
|   |   |-- bookingController.js
|   |   |-- bookingController.test.js
|   |   |-- paymentController.js
|   |   |-- reviewController.js
|   |   |-- reviewController.test.js
|   |   |-- roomController.js
|   |   |-- roomController.test.js
|   |   `-- userController.js
|   |-- middleware/
|   |   |-- authMiddleware.js
|   |   |-- authMiddleware.test.js
|   |   |-- authRateLimit.js
|   |   |-- authRateLimit.test.js
|   |   |-- authValidation.js
|   |   |-- authValidation.test.js
|   |   |-- roomUpload.js
|   |   |-- roomUpload.test.js
|   |   `-- validateRequest.js
|   |-- models/
|   |   |-- bookingModel.js
|   |   |-- bookingModel.test.js
|   |   |-- passwordResetModel.js
|   |   |-- passwordResetModel.test.js
|   |   |-- reviewModel.js
|   |   |-- roomModel.js
|   |   |-- roomModel.test.js
|   |   `-- userModel.js
|   |-- routes/
|   |   |-- authRoutes.js
|   |   |-- bookingRoutes.js
|   |   |-- paymentRoutes.js
|   |   |-- reviewRoutes.js
|   |   |-- roomRoutes.js
|   |   `-- userRoutes.js
|   |-- scripts/
|   |   `-- convertStructureImages.js
|   |-- uploads/
|   |   `-- structure/
|   |       |-- cucina.webp
|   |       |-- hero.webp
|   |       |-- parcheggio.webp
|   |       |-- piscina.webp
|   |       |-- sala-colazione.webp
|   |       `-- salotto.webp
|   |-- services/
|   |   |-- mailService.js
|   |   |-- paymentGatewayService.js
|   |   |-- paymentGatewayService.test.js
|   |   |-- roomImageService.js
|   |   |-- roomImageService.test.js
|   |   |-- structureImageService.js
|   |   `-- structureImageService.test.js
|   `-- utils/
|       |-- publicAssetUrl.js
|       `-- publicAssetUrl.test.js
`-- frontend/
    |-- .browserslistrc
    |-- .editorconfig
    |-- .eslintrc.json
    |-- .gitignore
    |-- angular.json
    |-- capacitor.config.ts
    |-- favicon.ico
    |-- ionic.config.json
    |-- karma.conf.js
    |-- package.json
    |-- package-lock.json
    |-- tsconfig.json
    |-- tsconfig.app.json
    |-- tsconfig.spec.json
    |-- .vscode/
    |   |-- extensions.json
    |   `-- settings.json
    |-- src/
    |   |-- global.scss
    |   |-- index.html
    |   |-- main.ts
    |   |-- polyfills.ts
    |   |-- test.ts
    |   |-- zone-flags.ts
    |   |-- environments/
    |   |   |-- environment.ts
    |   |   `-- environment.prod.ts
    |   |-- theme/
    |   |   `-- variables.scss
    |   |-- assets/
    |   |   |-- shapes.svg
    |   |   `-- icon/
    |   |       `-- favicon.png
    |   `-- app/
    |       |-- app.component.html
    |       |-- app.component.scss
    |       |-- app.component.spec.ts
    |       |-- app.component.ts
    |       |-- app.routes.ts
    |       |-- folder/
    |       |   |-- folder.page.html
    |       |   |-- folder.page.scss
    |       |   |-- folder.page.spec.ts
    |       |   `-- folder.page.ts
    |       |-- guards/
    |       |   |-- auth.guard.spec.ts
    |       |   `-- auth.guard.ts
    |       |-- utils/
    |       |   |-- return-url.spec.ts
    |       |   `-- return-url.ts
    |       |-- services/
    |       |   |-- auth.service.spec.ts
    |       |   |-- auth.service.ts
    |       |   |-- booking.service.ts
    |       |   |-- payment.service.ts
    |       |   |-- review.service.ts
    |       |   |-- room.service.spec.ts
    |       |   |-- room.service.ts
    |       |   `-- user.service.ts
    |       `-- pages/
    |           |-- home/
    |           |   |-- home.page.html
    |           |   |-- home.page.scss
    |           |   `-- home.page.ts
    |           |-- prenota/
    |           |   |-- prenota.page.html
    |           |   |-- prenota.page.scss
    |           |   |-- prenota.page.spec.ts
    |           |   `-- prenota.page.ts
    |           |-- area-personale/
    |           |   |-- area-personale.page.html
    |           |   |-- area-personale.page.scss
    |           |   |-- area-personale.page.spec.ts
    |           |   `-- area-personale.page.ts
    |           |-- redirect/
    |           |   |-- redirect.page.html
    |           |   |-- redirect.page.scss
    |           |   `-- redirect.page.ts
    |           |-- auth/
    |           |   |-- login/
    |           |   |   |-- login.page.html
    |           |   |   |-- login.page.scss
    |           |   |   |-- login.page.spec.ts
    |           |   |   `-- login.page.ts
    |           |   |-- password-dimenticata/
    |           |   |   |-- password-dimenticata.page.html
    |           |   |   |-- password-dimenticata.page.scss
    |           |   |   |-- password-dimenticata.page.spec.ts
    |           |   |   `-- password-dimenticata.page.ts
    |           |   |-- register/
    |           |   |   |-- register.page.html
    |           |   |   |-- register.page.scss
    |           |   |   |-- register.page.spec.ts
    |           |   |   `-- register.page.ts
    |           |   `-- reimposta-password/
    |           |       |-- reimposta-password.page.html
    |           |       |-- reimposta-password.page.scss
    |           |       |-- reimposta-password.page.spec.ts
    |           |       `-- reimposta-password.page.ts
    |           `-- admin/
    |               |-- dashboard/
    |               |   |-- dashboard.page.html
    |               |   |-- dashboard.page.scss
    |               |   `-- dashboard.page.ts
    |               |-- gestione-camere/
    |               |   |-- gestione-camere.page.html
    |               |   |-- gestione-camere.page.scss
    |               |   |-- gestione-camere.page.spec.ts
    |               |   `-- gestione-camere.page.ts
    |               |-- gestione-prenotazioni/
    |               |   |-- gestione-prenotazioni.page.html
    |               |   |-- gestione-prenotazioni.page.scss
    |               |   `-- gestione-prenotazioni.page.ts
    |               |-- gestione-recensioni/
    |               |   |-- gestione-recensioni.page.html
    |               |   |-- gestione-recensioni.page.scss
    |               |   `-- gestione-recensioni.page.ts
    |               `-- gestione-utenti/
    |                   |-- gestione-utenti.page.html
    |                   |-- gestione-utenti.page.scss
    |                   `-- gestione-utenti.page.ts
```

### 2.2 Ruolo dei file principali

#### Root

- `README.md`: istruzioni di installazione, configurazione, avvio e utilizzo locale del progetto.
- `.gitignore`: esclude dipendenze, build, `.env`, database SQLite, `.vscode` e file sistema.

#### Backend

- `app.js`: costruisce l'app Express, applica Helmet, whitelist CORS, parsing JSON, monta tutti i router, serve gli asset statici da `/uploads/structure` e `/uploads`, e gestisce gli errori CORS.
- `server.js`: carica `.env`, valida la configurazione di sicurezza e avvia l'app sulla porta configurata.
- `config/security.js`: centralizza algoritmo JWT `HS256`, lunghezza minima del segreto e origini CORS consentite.
- `database.js`: apre il percorso SQLite configurabile, abilita le foreign key e inizializza le sei tabelle e l'indice per i token di reset.
- `controllers/*.js`: validazione e orchestrazione HTTP.
- `models/*.js`: query SQLite parametrizzate e join.
- `routes/*.js`: definizione endpoint e middleware.
- `authMiddleware.js`: autenticazione JWT e autorizzazione per ruolo.
- `authValidation.js`: regole `express-validator` per registrazione, login e recupero password.
- `authRateLimit.js`: rate limiter dedicati agli endpoint di autenticazione.
- `roomUpload.js`: middleware `multer` per upload immagini camera in memoria, con limite 10 file, 5 MB per file e MIME JPEG/PNG/WebP.
- `validateRequest.js`: converte gli errori di validazione in risposte JSON HTTP 400 uniformi.
- `passwordResetModel.js`: sostituzione, consumo e invalidazione atomica dei token di reset password.
- `mailService.js`: rendering email HTML/testo e invio SMTP opzionale, incluse le email di reset password.
- `paymentGatewayService.js`: validazione e autorizzazione pagamento simulata.
- `roomImageService.js`: valida immagini caricate, le converte in WebP, le salva in `uploads/rooms/<roomId>/` e pulisce i file non referenziati.
- `structureImageService.js`: converte immagini PNG note della struttura in WebP ottimizzati.
- `publicAssetUrl.js`: trasforma percorsi asset interni in URL pubblici assoluti usando host richiesta o `PUBLIC_API_URL`.
- `convertStructureImages.js`: script CLI usato da `npm run images:structure`.
- `uploads/structure/*.webp`: asset reali della struttura serviti dal backend e usati dalla home.
- `*.test.js`: test unitari e di integrazione per sicurezza, autenticazione, rate limiting, validazione, upload immagini, asset pubblici, prenotazioni, recensioni, pagamenti, reset password e URL pubblici.
- `.env.example`: modello senza segreti per configurare porta, JWT, CORS, frontend, upload e SMTP.
- `.env`: configurazione locale, parametri SMTP e credenziali dimostrative user/admin predisposte per l'accesso del professore.
- `database.sqlite`: database locale predisposto con dati dimostrativi coerenti per la presentazione e la valutazione.

#### Frontend

- `main.ts`: bootstrap Angular standalone, Ionic, Router con preload e HttpClient.
- `app.routes.ts`: tutte le route, guard e lazy loading.
- `app.component.*`: shell globale, navbar desktop/mobile, menu per ruolo, logout e navigazione alle sezioni home.
- `guards/auth.guard.ts`: guard admin, user e guest.
- `utils/return-url.ts`: valida redirect interni per evitare open redirect.
- `services/*.ts`: unico livello di accesso HTTP; `RoomService` usa `FormData` per create/update camere con immagini.
- `pages/**`: componenti pagina, template e stili dedicati.
- `global.scss`: import CSS Ionic e stile condiviso di card, bottoni, form, layout, stati e responsive.
- `theme/variables.scss`: palette BnBHub e override variabili Ionic.
- `environment*.ts`: contiene `production` e `apiUrl`, usato dai service e dalla home per costruire URL API e asset.
- `angular.json`: build in `www`, lazy bundle, budget, test Karma e lint.
- `capacitor.config.ts`: predisposizione Capacitor.
- `karma.conf.js`, `test.ts`, `tsconfig.spec.json`: infrastruttura unit test.
- `polyfills.ts`, `zone-flags.ts`: Zone.js e configurazione custom elements.

## 3. Database

### 3.1 Tecnologia e inizializzazione

- Motore: SQLite tramite `sqlite3`.
- File predefinito: `backend/database.sqlite`; per test o ambienti alternativi il percorso puo essere sovrascritto con `DATABASE_PATH`.
- Connessione aperta all'import di `database.js`.
- `PRAGMA foreign_keys = ON`.
- Tabelle create con `CREATE TABLE IF NOT EXISTS`.
- Indice `idx_password_reset_tokens_user` creato su `password_reset_tokens(user_id)`.
- Lo schema corrente presuppone che le immagini camera siano gestite dal flusso upload: `room_images.url` contiene filename WebP generati e l'inizializzazione del database non esegue cancellazioni automatiche di immagini.

### 3.2 Schema completo

#### `users`

| Campo | Tipo | Vincoli/default |
|---|---|---|
| `id` | `INTEGER` | PK, AUTOINCREMENT |
| `nome` | `TEXT` | NOT NULL |
| `cognome` | `TEXT` | NOT NULL |
| `email` | `TEXT` | UNIQUE, NOT NULL |
| `password` | `TEXT` | NOT NULL; contiene hash bcrypt |
| `eta` | `INTEGER` | nullable |
| `telefono` | `TEXT` | nullable |
| `codice_fiscale` | `TEXT` | UNIQUE, nullable nello schema |
| `ruolo` | `TEXT` | default `'user'`; valori applicativi `user`/`admin` |
| `created_at` | `TEXT` | default `datetime('now')` |

#### `rooms`

| Campo | Tipo | Vincoli/default |
|---|---|---|
| `id` | `INTEGER` | PK, AUTOINCREMENT |
| `nome` | `TEXT` | NOT NULL |
| `descrizione` | `TEXT` | nullable |
| `tipo` | `TEXT` | NOT NULL |
| `prezzo` | `REAL` | NOT NULL |
| `capienza` | `INTEGER` | NOT NULL |
| `disponibile` | `INTEGER` | default `1`; usato come booleano 0/1 |
| `immagine_url` | `TEXT` | nullable; campo legacy/fallback, azzerato nelle camere gestite dal flusso upload |
| `created_at` | `TEXT` | default `datetime('now')` |

#### `room_images`

| Campo | Tipo | Vincoli/default |
|---|---|---|
| `id` | `INTEGER` | PK, AUTOINCREMENT |
| `room_id` | `INTEGER` | NOT NULL, FK verso `rooms.id`, `ON DELETE CASCADE` |
| `url` | `TEXT` | NOT NULL; contiene il filename WebP generato, non un URL esterno |
| `ordine` | `INTEGER` | NOT NULL, default `0` |
| `created_at` | `TEXT` | default `datetime('now')` |

Relazione: `rooms 1:N room_images`.

#### `bookings`

| Campo | Tipo | Vincoli/default |
|---|---|---|
| `id` | `INTEGER` | PK, AUTOINCREMENT |
| `utente_id` | `INTEGER` | NOT NULL, FK verso `users.id` |
| `camera_id` | `INTEGER` | NOT NULL, FK verso `rooms.id`, `ON DELETE CASCADE` |
| `data_inizio` | `TEXT` | NOT NULL, formato applicativo `YYYY-MM-DD` |
| `data_fine` | `TEXT` | NOT NULL, formato applicativo `YYYY-MM-DD` |
| `stato` | `TEXT` | default `'in attesa'`; valori usati: `in attesa`, `confermata`, `rifiutata`, `cancellata` |
| `intolleranze` | `TEXT` | nullable |
| `note_ospite` | `TEXT` | nullable |
| `created_at` | `TEXT` | default `datetime('now')` |

Relazioni: `users 1:N bookings`; `rooms 1:N bookings`. Eliminando una camera vengono eliminate in cascata le prenotazioni collegate.

#### `reviews`

| Campo | Tipo | Vincoli/default |
|---|---|---|
| `id` | `INTEGER` | PK, AUTOINCREMENT |
| `booking_id` | `INTEGER` | NOT NULL, UNIQUE, FK verso `bookings.id`, `ON DELETE CASCADE` |
| `utente_id` | `INTEGER` | NOT NULL, FK verso `users.id` |
| `camera_id` | `INTEGER` | NOT NULL, FK verso `rooms.id`, `ON DELETE CASCADE` |
| `voto` | `INTEGER` | NOT NULL; validazione applicativa 1-5 |
| `testo` | `TEXT` | NOT NULL; massimo applicativo 500 caratteri |
| `visibile` | `INTEGER` | default `0`; booleano 0/1 |
| `stato` | `TEXT` | default `'in attesa'`; valori `in attesa`, `pubblicata`, `rifiutata` |
| `motivo_rifiuto` | `TEXT` | nullable; massimo applicativo 250 caratteri |
| `created_at` | `TEXT` | default `datetime('now')` |
| `updated_at` | `TEXT` | default `datetime('now')`, aggiornato nelle moderazioni |

Relazioni: una prenotazione puo avere al massimo una recensione; `users 1:N reviews`; `rooms 1:N reviews`; `bookings 1:0..1 reviews`. Eliminando una camera o una prenotazione vengono eliminate in cascata le recensioni collegate.

#### `password_reset_tokens`

| Campo | Tipo | Vincoli/default |
|---|---|---|
| `id` | `INTEGER` | PK, AUTOINCREMENT |
| `user_id` | `INTEGER` | NOT NULL, FK verso `users.id`, `ON DELETE CASCADE` |
| `token_hash` | `TEXT` | UNIQUE, NOT NULL; SHA-256 del token inviato via email |
| `expires_at` | `INTEGER` | NOT NULL; timestamp Unix in millisecondi |
| `used_at` | `TEXT` | nullable; valorizzato al consumo o all'invalidazione |
| `created_at` | `TEXT` | default `datetime('now')` |

Relazione: `users 1:N password_reset_tokens`. A livello applicativo rimane attivo un solo token per utente: la generazione di un nuovo token invalida quelli precedenti.

### 3.3 Vincoli, comportamento e stato dimostrativo

- Ruoli, stati, voto, prezzo, capienza e date vengono validati dai controller applicativi.
- Le date sono stringhe ISO, quindi i confronti lessicografici funzionano nel formato previsto.
- La disponibilita temporale usa overlap:
  - prenotazione esistente `data_inizio < nuova_data_fine`
  - e `data_fine > nuova_data_inizio`
  - solo stati `in attesa` o `confermata`.
- La creazione di una prenotazione usa un unico `INSERT ... SELECT ... WHERE NOT EXISTS`, quindi due richieste concorrenti sovrapposte non possono inserire entrambe la prenotazione.
- Le mutazioni camera e immagini usano transazioni `BEGIN IMMEDIATE` e una coda applicativa per preservare ordine, isolamento e coerenza tra tabella `rooms`, tabella `room_images` e filesystem.
- I token di recupero password sono memorizzati solo come hash SHA-256, scadono dopo 30 minuti e vengono consumati insieme all'aggiornamento password dentro una transazione `BEGIN IMMEDIATE`.
- Le query usano placeholder `?`, salvo composizione controllata di placeholder o nomi tabella interni.
- Il database locale e stato sistemato e preparato per la consegna con utenti, camere, immagini, prenotazioni e recensioni dimostrative coerenti con i flussi applicativi.
- Sono presenti account dimostrativi distinti per ruolo `user` e `admin`.
- Le relative credenziali di accesso sono configurate in `backend/.env` tramite `USER_EMAIL`, `USER_PASSWORD`, `ADMIN_EMAIL` e `ADMIN_PASSWORD`, in modo che il professore possa provare entrambi i flussi applicativi.

## 4. API REST - Backend

Base URL locale: `http://localhost:3000`. Tutte le risposte applicative sono JSON.

Legenda middleware:

- `verifyToken`: richiede `Authorization: Bearer <jwt>`, verifica firma/scadenza e valorizza `req.user`.
- `verifyAdmin`: richiede `req.user.ruolo === 'admin'`.
- `verifyUser`: richiede esattamente `req.user.ruolo === 'user'`; un admin non puo usare endpoint utente.
- `*Validation`: catene `express-validator` specifiche per il payload.
- `validateRequest`: interrompe la richiesta con HTTP 400 e dettagli campo/messaggio se la validazione fallisce.
- `*Limiter`: rate limiter per IP con header standard.
- `uploadRoomImages`: parsing multipart con `multer` per immagini camera, applicato solo dopo autenticazione e autorizzazione admin.

### 4.1 Endpoint generale

#### `GET /`

- Middleware: nessuno.
- Body/query: nessuno.
- Funzione: health check minimale.
- Risposta 200: `{ "messaggio": "Server attivo e funzionante!" }`.

### 4.2 Autenticazione

#### `POST /auth/register`

- Middleware, in ordine: `registrationValidation`, `validateRequest`, `registrationLimiter`.
- Body: `{ nome, cognome, email, password, eta, telefono, codice_fiscale }`.
- Funzione:
  - valida e normalizza i dati con `express-validator`;
  - richiede nome/cognome di 2-40 caratteri, email valida max 120, password di 6-64 caratteri con almeno una lettera e un numero, eta 18-120, telefono e codice fiscale italiani validi;
  - normalizza email lowercase e codice fiscale uppercase;
  - verifica duplicati email e codice fiscale;
  - hash password bcrypt cost 10;
  - forza `ruolo: "user"`;
  - crea l'utente;
  - tenta in modo asincrono l'email di conferma.
- Risposta 201: `{ messaggio, id }`.
- Errori:
  - 400 `{ errore: "Dati non validi", dettagli: [{ campo, messaggio }] }`;
  - 409 `{ codice: "EMAIL_GIA_REGISTRATA", errore }`;
  - 409 `{ codice: "CODICE_FISCALE_GIA_REGISTRATO", errore }`;
  - 429 al superamento del limite di 10 tentativi/ora per IP;
  - 500 errore database.

#### `POST /auth/login`

- Middleware, in ordine: `loginValidation`, `validateRequest`, `loginLimiter`.
- Body: `{ email, password }`.
- Funzione: normalizza l'email, cerca l'utente, confronta bcrypt ed emette un JWT `HS256` valido 24 ore.
- Payload JWT: `{ id, email, ruolo, iat, exp }`.
- Risposta 200: `{ messaggio, token }`.
- Errori:
  - 400 per formato email/password non valido;
  - 401 `{ errore: "Credenziali non valide" }` sia per utente inesistente sia per password errata;
  - 429 dopo 10 tentativi falliti in 15 minuti per IP;
  - 500 database.
- Il limiter non conteggia i login conclusi con successo.

#### `POST /auth/password-reset/request`

- Middleware, in ordine: `passwordResetRequestLimiter`, `passwordResetRequestValidation`, `validateRequest`.
- Body: `{ email }`.
- Funzione:
  - normalizza l'email;
  - restituisce sempre lo stesso messaggio, indipendentemente dall'esistenza dell'account;
  - se l'utente esiste, genera 32 byte casuali rappresentati come token esadecimale di 64 caratteri;
  - salva nel database soltanto l'hash SHA-256, invalida eventuali token precedenti e imposta scadenza a 30 minuti;
  - invia via email il link `${FRONTEND_URL}/reimposta-password?token=<token>`.
- Risposta 200: messaggio generico che invita a controllare la posta se l'indirizzo e associato a un account.
- Errori: 400 email non valida; 429 `{ codice: "TROPPE_RICHIESTE", errore }` dopo 5 richieste in 15 minuti.

#### `POST /auth/password-reset/confirm`

- Middleware, in ordine: `passwordResetConfirmValidation`, `validateRequest`.
- Body: `{ token, password }`.
- Validazioni: token esadecimale di esattamente 64 caratteri; nuova password di 6-64 caratteri con almeno una lettera e un numero.
- Funzione:
  - calcola SHA-256 del token ricevuto;
  - genera il nuovo hash bcrypt cost 10;
  - consuma il token e aggiorna la password in modo atomico;
  - rifiuta token inesistenti, scaduti, gia usati o invalidati.
- Risposta 200: conferma dell'avvenuto aggiornamento password.
- Errore 400: `{ codice: "TOKEN_RESET_NON_VALIDO", errore }` per token non valido/scaduto/usato, oltre agli errori uniformi di validazione.

### 4.3 Utenti

#### `GET /users`

- Middleware: `verifyToken`, `verifyAdmin`.
- Funzione: elenco di tutti gli utenti.
- Risposta 200: array con `id, nome, cognome, email, eta, telefono, codice_fiscale, ruolo, created_at`.
- La password non viene restituita.

#### `GET /users/:id`

- Middleware: `verifyToken`, `verifyAdmin`.
- Parametro: `id`.
- Funzione: dettaglio utente.
- Risposta 200: stessi campi dell'elenco.
- Errori: 404 non trovato, 500 database.

### 4.4 Camere

Oggetti camera restituiti: campi `rooms`, `immagini_url: string[]` con URL assoluti, `immagini: [{ id, url, ordine }]` e `immagine_url` riallineato alla prima immagine oppure `null`.

#### `GET /rooms`

- Middleware: nessuno.
- Funzione: restituisce tutte le camere con immagini ordinate per `ordine, id`.
- Risposta 200: array di camere.

#### `GET /rooms/disponibili`

- Middleware: nessuno.
- Query opzionale:
  - `data_inizio=YYYY-MM-DD`
  - `data_fine=YYYY-MM-DD`
  - `ospiti=<intero >= 1>`
- Funzione:
  - richiede entrambe le date se una e presente;
  - verifica `data_fine > data_inizio`;
  - filtra `disponibile = 1`;
  - filtra `capienza >= ospiti`;
  - esclude overlap con prenotazioni `in attesa`/`confermata`.
- Risposta 200: array camere disponibili.
- Errori 400 per date/ospiti non validi; 500 database.

#### `GET /rooms/:id`

- Middleware: nessuno.
- Funzione: dettaglio camera con immagini.
- Risposta 200: camera.
- Errori: 404 camera non trovata, 500 database.

#### `POST /rooms`

- Middleware: `verifyToken`, `verifyAdmin`, `uploadRoomImages`.
- Content-Type: `multipart/form-data`.
- Campi form:
  - `camera`: stringa JSON `{ nome, descrizione, tipo, prezzo, capienza, disponibile }`;
  - `immagini`: da 1 a 10 file immagine JPEG, PNG o WebP.
- Limiti upload: massimo 5 MB per file, massimo 10 immagini, campo `camera` massimo 100 KB.
- Validazioni camera: nome/tipo non vuoti, prezzo > 0, capienza intera >= 1, disponibile 0/1.
- Validazioni file:
  - MIME dichiarato solo `image/jpeg`, `image/png`, `image/webp`;
  - contenuto reale decodificabile e coerente col MIME;
  - formato effettivo jpeg/png/webp;
  - massimo 40.000.000 pixel in input;
  - immagini animate non supportate.
- Funzione:
  - converte ogni immagine in WebP con lato massimo 1920 px e qualita 82;
  - genera filename UUID `.webp`;
  - crea la camera e i record `room_images` in transazione;
  - salva i file in `uploads/rooms/<roomId>/`;
  - in caso di errore storage esegue rollback applicativo eliminando camera/file gia creati.
- Risposta 201: `{ messaggio, id }`.
- Errori: 400 payload/upload/contenuto immagine non valido, 413 file troppo grande o troppe immagini, 500 database/storage.

#### `PUT /rooms/:id`

- Middleware: `verifyToken`, `verifyAdmin`, `uploadRoomImages`.
- Content-Type: `multipart/form-data`.
- Campi form:
  - `camera`: stringa JSON `{ nome, descrizione, tipo, prezzo, capienza, disponibile, immagini_mantenute }`;
  - `immagini_mantenute`: array di id immagini esistenti da conservare, senza duplicati;
  - `immagini`: nuovi file JPEG/PNG/WebP da aggiungere.
- Vincoli: dopo l'update la camera deve avere almeno una foto e al massimo 10 immagini totali.
- Funzione:
  - verifica che la camera esista;
  - verifica che ogni id in `immagini_mantenute` appartenga alla camera;
  - processa e salva i nuovi file WebP;
  - aggiorna dati camera, ordine delle immagini mantenute e nuovi record `room_images` in transazione;
  - elimina dal filesystem le immagini non piu referenziate.
- Risposta 200: `{ messaggio: "Camera aggiornata con successo" }`.
- Errori: 400 payload/upload/id immagini non validi, 404 camera non trovata, 413 file troppo grande o troppe immagini, 500 database/storage.

#### `DELETE /rooms/:id`

- Middleware: `verifyToken`, `verifyAdmin`.
- Funzione: elimina camera, prenotazioni e recensioni collegate in transazione; le righe `room_images` sono eliminate in cascata e la directory `uploads/rooms/<id>` viene rimossa.
- Risposta 200: `{ messaggio: "Camera eliminata con successo" }`.

### 4.5 Prenotazioni

#### `GET /bookings/mie`

- Middleware: `verifyToken`, `verifyUser`.
- Funzione: usa esclusivamente `req.user.id`; un utente non puo scegliere un altro id.
- Risposta 200: array con campi prenotazione, camera (`camera_nome`, `tipo`, `prezzo`, immagini) ed eventuale recensione (`recensione_id`, voto, testo, visibile, stato).

#### `POST /bookings`

- Middleware: `verifyToken`, `verifyUser`.
- Body: `{ camera_id, data_inizio, data_fine }`.
- `utente_id` e preso dal JWT.
- Funzione:
  - valida id camera e date;
  - verifica camera esistente e flag `disponibile`;
  - tenta la creazione con un inserimento SQL condizionale atomico che ricontrolla l'assenza di overlap;
  - crea stato iniziale `in attesa` solo se l'intervallo e ancora disponibile.
- Risposta 201: `{ messaggio, id }`.
- Errori: 400 payload/camera non disponibile, 404 camera, 409 overlap, 500 database.

#### `PUT /bookings/mie/:id/info-soggiorno`

- Middleware: `verifyToken`, `verifyUser`.
- Body: `{ intolleranze, note_ospite }`; default stringa vuota e trim.
- Funzione: aggiorna solo una prenotazione posseduta dall'utente.
- Vietato per stato `cancellata`/`rifiutata` e dopo/con il giorno di check-out (`data_fine <= oggi`).
- Risposta 200: `{ messaggio: "Informazioni soggiorno aggiornate" }`.
- Errori: 404 non trovata/non posseduta, 400 non modificabile, 500 database.

#### `PUT /bookings/mie/:id/cancella`

- Middleware: `verifyToken`, `verifyUser`.
- Body: vuoto.
- Funzione: porta a `cancellata` una propria prenotazione in stato `in attesa` o `confermata`.
- Vietato dopo/con il check-out; e invece consentito anche dopo il check-in finche il soggiorno non e concluso.
- Risposta 200: `{ messaggio: "Prenotazione annullata" }`.

#### `GET /bookings`

- Middleware: `verifyToken`, `verifyAdmin`.
- Funzione: tutte le prenotazioni con join utente e camera.
- Risposta 200: array con prenotazione, `nome`, `cognome`, `email`, `camera_nome`, `tipo`, `prezzo`.

#### `GET /bookings/:id`

- Middleware: `verifyToken`, `verifyAdmin`.
- Funzione: dettaglio raw della tabella `bookings`, senza join.
- Risposta 200: prenotazione.
- Errori: 404, 500.

#### `PUT /bookings/:id/stato`

- Middleware: `verifyToken`, `verifyAdmin`.
- Body: `{ stato: "confermata" | "rifiutata" }`.
- Funzione:
  - verifica prenotazione esistente;
  - vieta modifiche se `data_inizio < oggi`;
  - aggiorna lo stato;
  - alla prima transizione verso `confermata`, recupera dettagli e tenta email di conferma.
- Risposta 200: `{ messaggio: "Stato prenotazione aggiornato" }`.
- Errori: 400 stato/check-in passato, 404, 500.

### 4.6 Recensioni

#### `GET /reviews/public`

- Middleware: nessuno.
- Funzione: massimo 8 recensioni con `stato = pubblicata` e `visibile = 1`.
- Privacy: cognome ridotto all'iniziale, es. `Mario R.`.
- Risposta 200: array `{ id, nome_ospite, camera_nome, voto, testo, created_at }`.

#### `POST /reviews/bookings/:bookingId`

- Middleware: `verifyToken`, `verifyUser`.
- Body: `{ voto, testo }`.
- Validazioni:
  - voto intero 1-5;
  - testo obbligatorio, max 500;
  - prenotazione posseduta dall'utente;
  - prenotazione `confermata`;
  - soggiorno concluso (`data_fine <= oggi`);
  - nessuna recensione gia associata.
- Creazione: `stato = in attesa`, `visibile = 0`.
- Risposta 201: `{ messaggio, id }`.
- Errori: 400, 404, 409 duplicato, 500.

#### `GET /reviews`

- Middleware: `verifyToken`, `verifyAdmin`.
- Funzione: tutte le recensioni con join utente, camera e date prenotazione.
- Risposta 200: array di record completi per moderazione.

#### `PUT /reviews/:id/stato`

- Middleware: `verifyToken`, `verifyAdmin`.
- Body: `{ stato: "pubblicata" | "rifiutata", motivo_rifiuto? }`.
- Motivo max 250 caratteri.
- Pubblicazione: `visibile = 1`, motivo nullo.
- Rifiuto: `visibile = 0`, conserva il motivo.
- Una recensione gia rifiutata diventa immutabile tramite questo endpoint.
- Risposta 200 con messaggio specifico.

#### `PUT /reviews/:id/visibilita`

- Middleware: `verifyToken`, `verifyAdmin`.
- Body: `{ visibile: boolean | 0 | 1 | "0" | "1" }`.
- Funzione:
  - visibile true -> stato `pubblicata`;
  - visibile false -> stato `in attesa`;
  - azzera `motivo_rifiuto`;
  - non modifica recensioni rifiutate.
- Risposta 200 con messaggio; 404 se nessuna riga modificata.
- L'endpoint e il metodo Angular esistono, ma la pagina admin attuale usa solo `updateStato`.

### 4.7 Pagamenti

#### `POST /payments/simulate`

- Middleware: `verifyToken`, `verifyUser`.
- Body:

```json
{
  "amount": 240,
  "currency": "EUR",
  "paymentMethodToken": "tok_demo_bnbhub",
  "booking": {
    "camera_id": 1,
    "data_inizio": "2026-07-10",
    "data_fine": "2026-07-12"
  }
}
```

- Funzione:
  - rifiuta ricorsivamente campi con nomi riconducibili a PAN/card number, CVV/CVC o scadenza;
  - valida importo > 0, valuta solo EUR, token demo esatto e dati prenotazione;
  - attende 1500 ms;
  - restituisce un'autorizzazione simulata.
- Risposta 200: `success`, stato, messaggio, `transactionId`, `paymentIntentId`, provider, `authorized: true`, `captured: false`, importo, valuta, metodo tokenizzato demo, booking, timestamp e suggerimento integrazione.
- Errore 400: `{ success: false, stato: "pagamento_simulato_non_valido", errore }`.
- L'endpoint rappresenta esclusivamente la fase di autorizzazione dimostrativa; la prenotazione viene creata dalla successiva chiamata a `POST /bookings`.

### 4.8 Asset pubblici

#### `GET /uploads/structure/<filename>.webp`

- Middleware applicativo: static middleware Express, nessuna autenticazione.
- Funzione: serve le immagini WebP della struttura usate nella home (`hero`, `cucina`, `parcheggio`, `piscina`, `sala-colazione`, `salotto`).
- Sicurezza/headers:
  - `dotfiles: deny`;
  - directory listing disabilitato (`index: false`);
  - cache breve `maxAge: 5m`;
  - `Cross-Origin-Resource-Policy: cross-origin`;
  - `X-Content-Type-Options: nosniff`;
  - `Content-Type: image/webp` per file WebP.

#### `GET /uploads/rooms/<roomId>/<filename>.webp`

- Middleware applicativo: static middleware Express, nessuna autenticazione.
- Funzione: serve le immagini camera caricate dagli admin e referenziate nelle risposte `GET /rooms`, `GET /rooms/disponibili`, `GET /bookings/mie`.
- Sicurezza/headers:
  - `dotfiles: deny`;
  - directory listing disabilitato (`index: false`);
  - cache `maxAge: 7d`;
  - `Cross-Origin-Resource-Policy: cross-origin`;
  - `X-Content-Type-Options: nosniff`;
  - `Content-Type: image/webp` per file WebP.

## 5. Frontend - Pagine

### `/home` - `HomePage`

- Accesso: pubblico.
- Mostra: hero con immagine locale servita dal backend, galleria autoplay della struttura, servizi, recensioni, mappa Leaflet/OpenStreetMap, footer.
- API: `GET /reviews/public`.
- Se l'API recensioni non e disponibile, mostra una selezione dimostrativa di fallback.
- Risorse immagini: `GET /uploads/structure/hero.webp` e galleria `cucina.webp`, `parcheggio.webp`, `piscina.webp`, `sala-colazione.webp`, `salotto.webp`, costruite tramite `environment.apiUrl`.
- Risorse esterne: tile OpenStreetMap.

### `/login` - `LoginPage`

- Accesso: solo guest tramite `guestGuard`; utenti autenticati vengono reindirizzati a dashboard admin o home.
- Mostra: form email/password, link registrazione e link "Password dimenticata?".
- API: `POST /auth/login`.
- Dopo login salva JWT in localStorage.
- Admin sempre a `/admin/dashboard`; user al `returnUrl` interno validato oppure `/home`.
- La query `?passwordReset=success` mostra la conferma che la password e stata aggiornata.

### `/password-dimenticata` - `PasswordDimenticataPage`

- Accesso: pubblico, senza guard.
- Mostra: form email, stato di invio, conferma generica e link per tornare al login.
- API: `POST /auth/password-reset/request`.
- Normalizza l'email con `trim()` e lowercase prima dell'invio.
- Non rivela se l'account esiste; in caso di HTTP 429 mostra un messaggio dedicato per il limite di richieste.

### `/reimposta-password` - `ReimpostaPasswordPage`

- Accesso: pubblico, senza guard; richiede il token nella query string.
- Mostra: form nuova password/conferma, errori di corrispondenza, token non valido/scaduto e link per richiedere un nuovo reset.
- API: `POST /auth/password-reset/confirm`.
- Valida lato client token esadecimale di 64 caratteri e password di 6-64 caratteri con lettera e numero.
- Dopo il successo naviga a `/login?passwordReset=success`.

### `/register` - `RegisterPage`

- Accesso: solo guest tramite `guestGuard`.
- Mostra: form nome, cognome, email, password, eta, telefono, codice fiscale.
- API: `POST /auth/register`.
- Validazione client dettagliata: maggiore eta, pattern CF, telefono, password con lettera e numero.
- Gestisce duplicati email/CF e preserva `returnUrl`.
- Dopo successo va a login con `registrazione=success`.

### `/prenota` - `PrenotaPage`

- Accesso: solo ruolo `user` tramite `userGuard`; guest inviato al login con `returnUrl=/prenota`; admin rifiutato.
- Mostra: ricerca date/ospiti, camere disponibili con galleria, riepilogo notti/prezzo e form carta demo.
- Le gallerie camera usano `immagini_url` restituito dal backend.
- API in sequenza:
  1. `GET /rooms/disponibili`;
  2. `POST /payments/simulate`;
  3. se autorizzato, `POST /bookings`.
- I dati carta vengono validati solo nel browser; al backend arriva esclusivamente `tok_demo_bnbhub`.

### `/area-personale` - `AreaPersonalePage`

- Accesso: solo ruolo `user`.
- Mostra prenotazioni divise in:
  - in attesa;
  - soggiorni futuri confermati;
  - soggiorni passati;
  - cancellate/rifiutate.
- Mostra immagini camera da `immagini_url`, stato, date, prezzo, intolleranze/note e recensione.
- API:
  - `GET /bookings/mie`;
  - `PUT /bookings/mie/:id/info-soggiorno`;
  - `PUT /bookings/mie/:id/cancella`;
  - `POST /reviews/bookings/:bookingId`.
- Query `?prenotazione=<id>` evidenzia e porta alla prenotazione, usata dal link email.

### `/admin/dashboard` - `DashboardPage`

- Accesso: solo admin, grazie al guard sul parent `/admin`.
- Mostra contatori camere, prenotazioni totali, prenotazioni in attesa, recensioni da moderare e accessi rapidi.
- API: `GET /rooms`, `GET /bookings`, `GET /reviews`.
- I conteggi sono calcolati client-side.

### `/admin/gestione-camere` - `GestioneCamerePage`

- Accesso: solo admin.
- Mostra: form create/update, upload immagini file, anteprime inline, immagini gia salvate, disponibilita, elenco camere e azioni modifica/elimina.
- Accetta file JPEG, PNG o WebP; massimo 10 immagini per camera e 5 MB per file.
- In modifica consente di mantenere/rimuovere immagini esistenti e aggiungerne di nuove; invia al backend gli id mantenuti tramite `immagini_mantenute`.
- API: `GET /rooms`, `POST /rooms`, `PUT /rooms/:id`, `DELETE /rooms/:id`.

### `/admin/gestione-prenotazioni` - `GestionePrenotazioniPage`

- Accesso: solo admin.
- Mostra: prenotazioni raggruppate in attesa, confermate, rifiutate/cancellate; dati ospite, camera, periodo e informazioni soggiorno.
- API: `GET /bookings`, `PUT /bookings/:id/stato`.
- Disabilita lato client le azioni con check-in passato; il backend ripete il controllo.

### `/admin/gestione-recensioni` - `GestioneRecensioniPage`

- Accesso: solo admin.
- Mostra: recensioni da moderare, pubblicate e rifiutate; voto, testo, ospite, soggiorno, motivo rifiuto.
- API: `GET /reviews`, `PUT /reviews/:id/stato`.

### `/admin/gestione-utenti` - `GestioneUtentiPage`

- Accesso: solo admin.
- Mostra elenco utenti, ruolo, email, telefono, eta e codice fiscale.
- API: `GET /users`.
- E sola consultazione: nessuna modifica/eliminazione UI.

### `/pagina-non-disponibile` - `RedirectPage`

- Accesso: pubblico.
- Mostra pagina generica per URL inesistente o ruolo non autorizzato, con pulsante home.
- API: nessuna.

### Route accessorie

- `/` reindirizza a `/home`.
- `**` reindirizza a `/pagina-non-disponibile`.

## 6. Servizi Angular

### `AuthService`

- `register(dati)`: POST registrazione.
- `login(email, password)`: POST login.
- `requestPasswordReset(email)`: POST richiesta email di recupero password.
- `resetPassword(token, password)`: POST conferma del reset con token e nuova password.
- `salvaToken(token)`: salva solo token strutturalmente valido.
- `getToken()`: restituisce token valido oppure lo elimina.
- `isLoggedIn()`: presenza token valido.
- `getUserRole()`: ruolo dal payload.
- `isAdmin()`, `isUser()`: controllo ruolo.
- `logout()`: rimuove il token.
- Validazione privata: tre parti JWT base64url, header `alg === HS256`, id intero, exp futuro, ruolo admin/user.

### `UserService`

- `getAll()`: `GET /users` con Bearer token.

### `RoomService`

- `getAll()`: `GET /rooms`.
- `getDisponibili(filtri)`: `GET /rooms/disponibili` con `HttpParams`.
- `getById(id)`: `GET /rooms/:id`.
- `create(room, images)`: `POST /rooms` admin con `FormData`; campo `camera` JSON e campo `immagini` ripetuto per i file.
- `update(id, room, keptImageIds, images)`: `PUT /rooms/:id` admin con `FormData`; aggiunge `immagini_mantenute` al JSON `camera`.
- `delete(id)`: `DELETE /rooms/:id` admin.
- Definisce interfacce `Camera`, `CameraImage`, `CameraPayload`, `RoomFilters`.

### `BookingService`

- `getAll()`: `GET /bookings` admin.
- `getMie()`: `GET /bookings/mie` user.
- `create(booking)`: `POST /bookings` user.
- `updateStato(id, stato)`: `PUT /bookings/:id/stato` admin.
- `updateInfoSoggiorno(id, dati)`: `PUT /bookings/mie/:id/info-soggiorno`.
- `cancellaMia(id)`: `PUT /bookings/mie/:id/cancella`.

### `ReviewService`

- `getPublic()`: `GET /reviews/public`.
- `getAll()`: `GET /reviews` admin.
- `createForBooking(bookingId, dati)`: `POST /reviews/bookings/:bookingId`.
- `updateVisibilita(id, visibile)`: `PUT /reviews/:id/visibilita`.
- `updateStato(id, stato, motivo_rifiuto)`: moderazione admin.
- Definisce `RecensionePubblica` e `RecensioneAdmin`.

### `PaymentService`

- `simulatePayment(payment)`: `POST /payments/simulate`.
- Definisce request/response del gateway demo.

## 7. Autenticazione e sicurezza

### 7.1 Flusso JWT

1. L'utente si registra; password hashata con bcrypt cost 10.
2. Al login il backend confronta l'hash.
3. `jwt.sign` genera token con payload `id`, `email`, `ruolo`, scadenza 24h e algoritmo esplicitamente impostato a `HS256`.
4. Il frontend valida forma, algoritmo dichiarato, id, ruolo e scadenza e salva il token in `localStorage`.
5. I service protetti inviano `Authorization: Bearer <token>`.
6. `verifyToken` usa `jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] })` e assegna il payload a `req.user`.
7. `verifyAdmin`/`verifyUser` applicano autorizzazione server-side.

Il backend rifiuta l'avvio se `JWT_SECRET` manca o contiene meno di 32 caratteri.

### 7.2 Guard frontend

- `adminGuard`:
  - non autenticato -> `/login`;
  - admin -> consente;
  - altro ruolo -> `/pagina-non-disponibile`.
- `userGuard`:
  - non autenticato -> `/login?returnUrl=<url>`;
  - user -> consente;
  - admin/altro -> pagina non disponibile.
- `guestGuard`:
  - guest -> consente;
  - admin -> dashboard;
  - user -> home.

### 7.3 Route protette backend

- Solo admin:
  - `GET /users`, `GET /users/:id`;
  - create/update/delete camere; upload immagini camera consentito solo dopo `verifyToken` e `verifyAdmin`;
  - elenco/dettaglio/stato prenotazioni;
  - elenco/moderazione/visibilita recensioni.
- Solo user:
  - proprie prenotazioni, creazione, note e cancellazione;
  - invio recensione;
  - simulazione pagamento.
- Pubbliche:
  - health check, register/login e recupero password;
  - lettura camere e disponibilita;
  - recensioni pubbliche.
  - immagini pubbliche in `/uploads/structure` e `/uploads/rooms`.

### 7.4 Misure presenti

- Hash password bcrypt.
- JWT firmato e scadenza verificata dal server, con algoritmo `HS256` fissato sia in emissione sia in verifica.
- Validazione obbligatoria del segreto JWT all'avvio.
- Autorizzazione per ruolo sia frontend sia backend.
- Helmet applicato globalmente per gli header HTTP di sicurezza.
- CORS con whitelist configurabile; le origini non consentite ricevono HTTP 403.
- Validazione e normalizzazione centralizzate con `express-validator`.
- Rate limiting separato per login, registrazione e richiesta recupero password.
- Login con risposta 401 uniforme per email inesistente e password errata.
- Recupero password con risposta generica per evitare la rivelazione dell'esistenza di un account.
- Token reset casuale di 256 bit, memorizzato solo come hash SHA-256, scadenza 30 minuti e uso singolo.
- Aggiornamento password e consumo token eseguiti atomicamente in transazione.
- Query SQL parametrizzate.
- Inserimento prenotazione atomico contro richieste concorrenti sovrapposte.
- Mutazioni camera transazionali, con isolamento delle operazioni su immagini e cleanup dei file non referenziati.
- Password esclusa dalle API admin utenti.
- Protezione open redirect tramite `getSafeInternalReturnUrl`.
- Il gateway demo rifiuta campi carta sensibili nel body.
- Recensioni pubbliche anonimizzano il cognome.
- Controlli ownership per prenotazioni e recensioni.
- Email HTML esegue escape dei dati dinamici.
- Upload immagini vincolato a JPEG/PNG/WebP, massimo 10 file per camera e 5 MB per file.
- Contenuto immagini verificato e riconvertito in WebP con limite dimensionale; filename generati lato server.
- Asset statici serviti senza directory listing, con dotfile negati, `nosniff` e `Cross-Origin-Resource-Policy: cross-origin`.

## 8. Funzionalita implementate

### 8.1 Funzionalita operative end-to-end

- Home pubblica responsive con galleria, servizi, mappa e recensioni moderate.
- Registrazione utente con normalizzazione, hash password, gestione duplicati e email opzionale.
- Login JWT e navigazione differenziata per ruolo.
- Recupero password completo: richiesta email, token casuale monouso con scadenza, pagina di impostazione nuova password e conferma al login.
- Protezione degli endpoint di autenticazione con validazione centralizzata e rate limiting.
- Guard frontend e middleware backend per separare guest, user e admin.
- Ricerca camere per periodo e capienza con esclusione overlap.
- Creazione prenotazioni protetta anche da richieste concorrenti mediante inserimento SQL atomico.
- Gestione admin completa delle camere, incluse immagini multiple caricate da file, anteprima, mantenimento/rimozione immagini esistenti e disponibilita.
- Conversione automatica immagini camere in WebP e pubblicazione da `/uploads/rooms`.
- Home pubblica basata su immagini struttura locali servite da `/uploads/structure`.
- Simulazione autorizzazione pagamento tokenizzata senza invio dati carta al backend.
- Creazione richiesta prenotazione dopo autorizzazione demo.
- Dashboard admin con statistiche aggregate lato client.
- Gestione admin prenotazioni: elenco, accettazione/rifiuto, blocco dopo check-in.
- Email opzionale alla conferma prenotazione con link diretto all'area personale.
- Area personale: elenco e raggruppamento prenotazioni, gallerie, note/intolleranze, cancellazione.
- Recensione post-soggiorno, una per prenotazione.
- Moderazione recensioni admin e pubblicazione in home.
- Consultazione utenti lato admin senza esposizione password.
- UI responsive con navbar desktop, menu mobile, stato loading/error/empty.

### 8.2 Verifiche disponibili e copertura automatizzata

- Frontend: `npm test -- --watch=false --browsers=ChromeHeadless` -> 48 test su 48 passati.
- Build frontend: `npm run build` -> completata con successo.
- Copertura backend disponibile:
  - configurazione JWT, algoritmo `HS256`, Helmet, whitelist CORS e static assets;
  - autenticazione JWT, autorizzazione `verifyUser` e protezione upload camere prima del parsing multipart;
  - uniformita delle risposte login e resistenza all'enumerazione account;
  - validazione/normalizzazione dei payload e rate limiter;
  - richiesta, scadenza, sostituzione e consumo singolo dei token reset;
  - upload immagini camera, limiti MIME/numero/dimensione, conversione WebP, cleanup filesystem e URL pubblici;
  - conversione immagini struttura in WebP;
  - prenotazioni concorrenti sovrapposte, update user-scoped e cancellazioni concluse;
  - room model transazionale, ordine immagini, disponibilita camere e delete cascade;
  - recensioni post-soggiorno, duplicati, moderazione e blocco delle recensioni rifiutate;
  - simulazione pagamento e rifiuto di dati carta sensibili.
- Copertura frontend disponibile:
  - validazione token e guard di ruolo;
  - protezione return URL e redirect login/register/reset password;
  - pagine password dimenticata e reimpostazione password;
  - `RoomService` con `FormData`;
  - gestione camere con upload, anteprime, limiti file e immagini esistenti;
  - gallerie camera in prenotazione e area personale;
  - rendering e navigazione principale.

## 9. Copertura dell'analisi

- Nessun file sorgente testuale rilevante e rimasto non analizzato.
- `backend/.env`: analizzato a livello di struttura senza riportare i valori delle variabili. Contiene:
  - `PORT`
  - `JWT_SECRET`
  - `SMTP_HOST`
  - `SMTP_PORT`
  - `SMTP_SECURE`
  - `SMTP_USER`
  - `SMTP_PASS`
  - `MAIL_FROM`
  - `FRONTEND_URL`
  - `USER_EMAIL`
  - `USER_PASSWORD`
  - `ADMIN_EMAIL`
  - `ADMIN_PASSWORD`
- Le ultime quattro variabili forniscono al professore le credenziali dimostrative per provare il flusso utente e il flusso amministratore.
- `backend/.env.example`: modello pubblico contenente `PORT`, `JWT_SECRET`, `CORS_ORIGINS`, `FRONTEND_URL`, `UPLOADS_PATH`, parametri SMTP e `MAIL_FROM`.
- `DATABASE_PATH` e supportata da `database.js` per usare un file SQLite alternativo, soprattutto nei test, ma non e necessaria nella configurazione locale standard.
- `UPLOADS_PATH` e supportata dai servizi immagini per usare una cartella upload diversa da `backend/uploads`.
- `PUBLIC_API_URL` e supportata da `publicAssetUrl.js` per generare URL pubblici assoluti quando host/protocollo della richiesta non coincidono con l'URL pubblico desiderato.
- `backend/database.sqlite`: file binario verificato tramite SQLite; schema, tabelle e presenza dei dati dimostrativi sono stati controllati.
- File immagine/binari (`favicon.png`, `favicon.ico`, asset WebP in `backend/uploads/structure`): inventariati; non contengono logica applicativa.
- `backend/uploads/rooms`: non incluso nell'albero perche contiene file caricati/generati per le camere; la logica e documentata tramite DB, servizi immagini e API camere.
- `node_modules/`, `.angular/`, `dist/` e `frontend/www/`: esclusi dall'albero perche dipendenze, cache o output generati.
- `.git/`: esclusa come metadato VCS.

## Sintesi breve da dare a Claude

BnBHub e una SPA Ionic/Angular 20 standalone con backend Express 5 e database SQLite predisposto con dati dimostrativi. Implementa ruoli guest/user/admin, JWT `HS256` valido 24 ore, Helmet, whitelist CORS, validazione e rate limiting, recupero password sicuro con token monouso, gestione camere con upload immagini multipart, conversione WebP, storage locale in `/uploads`, ricerca disponibilita per date e capienza, prenotazioni atomiche con moderazione admin, autorizzazione pagamento dimostrativa, informazioni soggiorno, cancellazione, recensioni post-soggiorno moderate ed email SMTP. La home usa immagini struttura locali servite dal backend. Le credenziali dimostrative user/admin sono fornite nel file `backend/.env`. I test frontend risultano 48/48 passati e la build Angular risulta completata con successo.
