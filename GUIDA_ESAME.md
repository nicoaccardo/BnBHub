# GUIDA ESAME - BnBHub

Questa guida serve per prepararvi all'orale universitario su BnBHub. L'obiettivo non e memorizzare frasi, ma saper spiegare il progetto collegando ogni scelta a un concetto teorico e a un punto preciso del codice.

Il progetto e una web app per la gestione di un B&B:

- `frontend/`: applicazione Ionic + Angular.
- `backend/`: REST API Node.js + Express.
- Database: SQLite locale.
- Ruoli: guest, user, admin.
- Funzionalita principali: registrazione, login JWT, recupero password, gestione camere con immagini, ricerca disponibilita, prenotazioni, pagamento demo, area personale, recensioni moderate, dashboard admin.

Nota utile per l'orale: quando vi chiedono "perche avete fatto X?", rispondete sempre in tre livelli:

1. Che problema risolve nel progetto.
2. Come e implementato nel codice.
3. Quali vantaggi e limiti ha rispetto alle alternative.

---

# PARTE 1 - GUIDA DI STUDIO

## 1. Architettura generale

### Cosa fa questa parte del progetto

BnBHub usa un'architettura client-server separata:

- Il client, cioe `frontend/`, mostra l'interfaccia utente, valida i form, gestisce navigazione e stato di sessione lato browser.
- Il server, cioe `backend/`, espone API HTTP, applica sicurezza, controlla ruoli, valida i dati e parla con il database.
- Il database SQLite conserva utenti, camere, immagini, prenotazioni, recensioni e token di reset password.

Questa e una classica architettura a tre livelli:

- Presentation layer: Angular/Ionic.
- Application/business layer: Express, controller, middleware, service.
- Data layer: SQLite e model.

### Come funziona tecnicamente

Il frontend chiama endpoint HTTP del backend, per esempio:

- `POST /auth/register` per registrare un utente.
- `POST /auth/login` per ottenere un token JWT.
- `GET /rooms/disponibili` per cercare camere libere.
- `POST /bookings` per creare una prenotazione.
- `PUT /bookings/:id/stato` per confermare o rifiutare una prenotazione lato admin.

I dati viaggiano quasi sempre in JSON. L'eccezione principale e l'upload immagini delle camere, dove il frontend usa `FormData` e il backend riceve multipart tramite `multer`.

Riferimenti:

- Bootstrap frontend: `frontend/src/main.ts`.
- Routing frontend: `frontend/src/app/app.routes.ts`.
- App Express: `backend/app.js`.
- Avvio backend: `backend/server.js`.
- Database: `backend/database.js`.

### Perche architettura client-server a tre livelli

Vantaggi:

- Separazione delle responsabilita: UI, logica applicativa e persistenza non sono mischiate.
- Sicurezza: le decisioni importanti, come ruolo admin o proprieta di una prenotazione, restano lato server.
- Manutenibilita: si puo modificare la UI senza riscrivere il database e viceversa.
- Scalabilita concettuale: in futuro il frontend potrebbe diventare mobile nativo via Capacitor o il backend potrebbe essere distribuito separatamente.

Limiti:

- Richiede gestione CORS, autenticazione e sincronizzazione tra frontend e backend.
- In locale servono due processi: server Express e dev server Angular.
- Il contratto API deve restare coerente: se cambia un endpoint, i service Angular vanno aggiornati.

### Perche REST API e non altre soluzioni

REST e adatto per BnBHub perche il dominio e composto da risorse chiare:

- utenti;
- camere;
- prenotazioni;
- recensioni;
- pagamenti demo;
- autenticazione.

Ogni risorsa ha endpoint con metodi HTTP semanticamente chiari:

- `GET` legge;
- `POST` crea;
- `PUT` aggiorna;
- `DELETE` elimina.

Alternative:

- GraphQL: utile se il client deve comporre query molto flessibili, ma piu complesso da introdurre per un progetto universitario di dimensione media.
- WebSocket: utile per comunicazioni realtime, ma BnBHub non ha chat o aggiornamenti live obbligatori.
- Server-side rendering tradizionale: piu semplice per pagine statiche, ma meno adatto a una SPA Ionic con esperienza app-like.

Esempi reali:

- `backend/routes/roomRoutes.js` definisce `GET /rooms`, `GET /rooms/disponibili`, `POST /rooms`, `PUT /rooms/:id`, `DELETE /rooms/:id`.
- `frontend/src/app/services/room.service.ts` incapsula le chiamate HTTP corrispondenti.

### Come comunicano frontend e backend

Il frontend usa `HttpClient` di Angular nei service. I service sono il punto unico in cui le pagine fanno chiamate API.

Esempi:

- `RoomService.getDisponibili()` costruisce `HttpParams` e chiama `GET /rooms/disponibili`.
- `BookingService.create()` chiama `POST /bookings`.
- `ReviewService.createForBooking()` chiama `POST /reviews/bookings/:bookingId`.
- `PaymentService.simulatePayment()` chiama `POST /payments/simulate`.

Per le API protette, i service aggiungono header:

```ts
Authorization: Bearer <token>
```

Riferimenti:

- `frontend/src/app/services/room.service.ts`.
- `frontend/src/app/services/booking.service.ts`.
- `frontend/src/app/services/review.service.ts`.
- `frontend/src/app/services/payment.service.ts`.
- `backend/middleware/authMiddleware.js`.

### Perche monorepo con frontend e backend separati

Il repository contiene sia `frontend/` sia `backend/`, ma i due progetti hanno `package.json`, dipendenze e comandi separati.

Vantaggi:

- Tutto il progetto e nello stesso repository: piu facile da clonare, valutare e presentare.
- Frontend e backend restano separati a livello architetturale.
- Le modifiche full-stack possono essere viste in una sola Pull Request.
- Per un team di tre studenti e piu semplice mantenere coerenza tra API e UI.

Limiti:

- Le dipendenze sono installate separatamente.
- Build e test sono separati.
- Se il progetto crescesse molto, si potrebbe valutare una struttura workspace piu formalizzata.

Riferimenti:

- `README.md` spiega installazione separata di `backend` e `frontend`.
- `backend/package.json`.
- `frontend/package.json`.

---

## 2. Database

### Tecnologia scelta: SQLite

BnBHub usa SQLite tramite il pacchetto `sqlite3`. Il database e un file locale, di default `backend/database.sqlite`, inizializzato in `backend/database.js`.

All'avvio, il codice esegue:

- apertura del database;
- `PRAGMA foreign_keys = ON`;
- creazione delle tabelle con `CREATE TABLE IF NOT EXISTS`;
- creazione dell'indice `idx_password_reset_tokens_user`.

Riferimento principale: `backend/database.js`.

### Perche SQLite e non MySQL o PostgreSQL

SQLite e una buona scelta per questo progetto universitario perche:

- non richiede un server DB separato;
- e semplice da configurare in locale;
- il database e un singolo file;
- e sufficiente per demo, sviluppo e carichi bassi;
- rende piu facile la consegna e la valutazione del progetto.

MySQL o PostgreSQL sarebbero piu adatti se:

- ci fossero molti utenti concorrenti;
- servissero permessi avanzati, replica, backup gestiti, alta disponibilita;
- il progetto fosse in produzione;
- servissero migrazioni e osservabilita piu robuste.

Limite importante: SQLite gestisce bene molte letture, ma non e ideale per tante scritture concorrenti. Nel codice alcune parti mitigano il rischio con transazioni, per esempio prenotazioni e mutazioni camere.

Nota: nel `backend/package.json` compare anche `mysql2`, ma il codice applicativo letto usa `sqlite3`; quindi la scelta effettiva del progetto e SQLite.

### Schema completo

#### Tabella `users`

Campi:

- `id INTEGER PRIMARY KEY AUTOINCREMENT`: identificativo univoco.
- `nome`, `cognome`: dati anagrafici obbligatori.
- `email TEXT UNIQUE NOT NULL`: email unica, usata per login.
- `password TEXT NOT NULL`: hash bcrypt, non password in chiaro.
- `eta`, `telefono`, `codice_fiscale`: dati utente; il codice fiscale e `UNIQUE`.
- `ruolo TEXT DEFAULT 'user'`: ruolo applicativo, di solito `user` o `admin`.
- `created_at`: timestamp di creazione.

Riferimenti:

- Schema: `backend/database.js`.
- Query: `backend/models/userModel.js`.
- Registrazione: `backend/controllers/authController.js`.

Scelta importante: `UserModel.getAll()` non restituisce la password. Questo evita esposizione di hash nelle API admin.

#### Tabella `rooms`

Campi:

- `id`: chiave primaria.
- `nome`: nome camera.
- `descrizione`: testo descrittivo.
- `tipo`: categoria della camera.
- `prezzo REAL`: prezzo per notte.
- `capienza INTEGER`: numero ospiti.
- `disponibile INTEGER DEFAULT 1`: booleano 0/1 in SQLite.
- `immagine_url`: campo legacy/fallback; il flusso attuale usa `room_images`.
- `created_at`: data creazione.

Riferimenti:

- Schema: `backend/database.js`.
- Model: `backend/models/roomModel.js`.
- Controller: `backend/controllers/roomController.js`.

#### Tabella `room_images`

Campi:

- `id`: chiave primaria.
- `room_id`: foreign key verso `rooms.id`.
- `url`: filename WebP generato lato server.
- `ordine`: ordinamento delle immagini nella galleria.
- `created_at`: timestamp.

Vincolo:

```sql
FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
```

Questo significa che se una camera viene cancellata, le righe immagini collegate vengono cancellate automaticamente dal database.

Riferimenti:

- Schema: `backend/database.js`.
- Inserimento immagini: `backend/models/roomModel.js`, funzione `insertRoomImages`.
- Upload e conversione: `backend/services/roomImageService.js`.

#### Tabella `bookings`

Campi:

- `id`: chiave primaria.
- `utente_id`: foreign key verso `users.id`.
- `camera_id`: foreign key verso `rooms.id`.
- `data_inizio`, `data_fine`: date del soggiorno in formato `YYYY-MM-DD`.
- `stato`: default `in attesa`; valori usati: `in attesa`, `confermata`, `rifiutata`, `cancellata`.
- `intolleranze`, `note_ospite`: informazioni inserite dall'utente prima del soggiorno.
- `created_at`: timestamp.

Relazioni:

- Un utente puo avere molte prenotazioni.
- Una camera puo essere collegata a molte prenotazioni in date diverse.
- Una prenotazione appartiene a un solo utente e a una sola camera.

Riferimenti:

- Schema: `backend/database.js`.
- Query con join: `backend/models/bookingModel.js`.
- Controller: `backend/controllers/bookingController.js`.

Scelta importante: quando un utente crea una prenotazione, `utente_id` non viene letto dal body, ma da `req.user.id`, cioe dal token verificato. Questo impedisce a un utente di creare prenotazioni a nome di altri.

#### Tabella `reviews`

Campi:

- `id`: chiave primaria.
- `booking_id INTEGER NOT NULL UNIQUE`: una recensione per prenotazione.
- `utente_id`: utente autore.
- `camera_id`: camera recensita.
- `voto`: intero da 1 a 5.
- `testo`: contenuto recensione.
- `visibile`: booleano 0/1.
- `stato`: `in attesa`, `pubblicata`, `rifiutata`.
- `motivo_rifiuto`: testo opzionale per moderazione.
- `created_at`, `updated_at`.

Riferimenti:

- Schema: `backend/database.js`.
- Query: `backend/models/reviewModel.js`.
- Controlli di business: `backend/controllers/reviewController.js`.

Scelta importante: le recensioni pubbliche sono solo quelle con `stato = 'pubblicata'` e `visibile = 1`; inoltre il cognome viene anonimizzato dal controller.

#### Tabella `password_reset_tokens`

Campi:

- `id`: chiave primaria.
- `user_id`: foreign key verso `users.id`.
- `token_hash TEXT UNIQUE`: hash SHA-256 del token, non token in chiaro.
- `expires_at INTEGER`: scadenza in millisecondi.
- `used_at`: valorizzato quando il token viene consumato.
- `created_at`.

Riferimenti:

- Schema: `backend/database.js`.
- Logica transazionale: `backend/models/passwordResetModel.js`.
- Generazione token: `backend/controllers/authController.js`.

Scelta importante: il token inviato via email non viene salvato in chiaro. Nel DB resta solo l'hash, cosi se il database fosse letto da terzi non sarebbe immediatamente possibile usare i link di reset.

### Cos'e una foreign key e perche l'abbiamo usata

Una foreign key e un vincolo che collega una riga di una tabella a una riga di un'altra tabella. Serve a mantenere integrita referenziale.

Esempio:

- `bookings.utente_id` deve riferirsi a un utente esistente.
- `bookings.camera_id` deve riferirsi a una camera esistente.
- `room_images.room_id` deve riferirsi a una camera esistente.

Senza foreign key, il database potrebbe contenere prenotazioni collegate a camere inesistenti o immagini senza camera.

Riferimento: `backend/database.js`, dove viene attivato `PRAGMA foreign_keys = ON`.

### Perche `ON DELETE CASCADE` in `room_images`

`ON DELETE CASCADE` evita righe orfane. Se elimino una camera, le immagini collegate non hanno piu senso nel database.

Nel codice la cancellazione camera fa anche cleanup dei file fisici:

- il DB elimina righe correlate;
- `RoomController.deleteById()` chiama `removeRoomDirectory()` per rimuovere la cartella immagini.

Riferimenti:

- Vincolo: `backend/database.js`.
- Cancellazione DB: `backend/models/roomModel.js`.
- Cleanup file: `backend/controllers/roomController.js` e `backend/services/roomImageService.js`.

### Cos'e `AUTOINCREMENT` e perche serve

`AUTOINCREMENT` fa generare automaticamente a SQLite un nuovo id numerico quando si inserisce una riga. Serve per avere chiavi primarie semplici e stabili.

Nel progetto e usato in tutte le tabelle principali. Esempio: dopo la registrazione, `UserModel.create()` inserisce l'utente e il controller risponde con `this.lastID`.

Riferimenti:

- Schema: `backend/database.js`.
- Registrazione: `backend/controllers/authController.js`.
- Creazione camere: `backend/controllers/roomController.js`.

### Perche usare placeholder `?` nelle query

Le query usano placeholder `?` invece di concatenare stringhe con input utente. Questo serve a prevenire SQL injection.

Esempio reale:

```js
db.get('SELECT * FROM users WHERE email = ?', [email], callback);
```

Il valore `email` viene passato separatamente al driver SQLite, che lo tratta come dato e non come codice SQL.

Riferimenti:

- `backend/models/userModel.js`.
- `backend/models/bookingModel.js`.
- `backend/models/reviewModel.js`.
- `backend/models/roomModel.js`.

### Disponibilita camere e overlap date

La ricerca camere usa una condizione importante:

- una camera e disponibile se non esiste una prenotazione sovrapposta nello stato `in attesa` o `confermata`.

La logica e in `RoomModel.getDisponibili()`:

```sql
NOT EXISTS (
  SELECT 1
  FROM bookings
  WHERE bookings.camera_id = rooms.id
    AND bookings.stato IN ('in attesa', 'confermata')
    AND bookings.data_inizio < ?
    AND bookings.data_fine > ?
)
```

La creazione usa una logica simile in `BookingModel.createIfAvailable()`, con `INSERT ... SELECT ... WHERE NOT EXISTS`. Questo e importante per evitare che due richieste concorrenti prenotino lo stesso periodo.

Riferimenti:

- Ricerca: `backend/models/roomModel.js`.
- Creazione atomica: `backend/models/bookingModel.js`.

---

## 3. Autenticazione e sicurezza

### Cos'e JWT

JWT significa JSON Web Token. E un token testuale composto da tre parti separate da punti:

```text
header.payload.signature
```

- Header: indica il tipo di token e l'algoritmo, nel nostro caso `HS256`.
- Payload: contiene dati non sensibili, come `id`, `email`, `ruolo`, `exp`.
- Signature: firma crittografica calcolata con un segreto lato server.

Importante: il payload JWT non e cifrato, e solo codificato Base64URL. Quindi non bisogna metterci password o dati sensibili.

Riferimenti:

- Generazione token: `backend/controllers/authController.js`, metodo `login`.
- Verifica token: `backend/middleware/authMiddleware.js`.
- Validazione minima lato frontend: `frontend/src/app/services/auth.service.ts`.

### Come funziona il login nel progetto

1. Il form Angular raccoglie email e password in `LoginPage`.
2. `AuthService.login()` invia `POST /auth/login`.
3. `AuthController.login()` cerca l'utente con `UserModel.getByEmail()`.
4. `bcrypt.compareSync()` confronta password inserita e hash salvato.
5. Se corretto, `jwt.sign()` genera un token con `id`, `email`, `ruolo`, scadenza 24h e algoritmo `HS256`.
6. Il frontend salva il token in `localStorage`.
7. Le API protette ricevono `Authorization: Bearer <token>`.
8. `verifyToken` verifica firma e scadenza, poi imposta `req.user`.

Riferimenti:

- `frontend/src/app/pages/auth/login/login.page.ts`.
- `frontend/src/app/services/auth.service.ts`.
- `backend/controllers/authController.js`.
- `backend/middleware/authMiddleware.js`.

### Perche JWT e non sessioni tradizionali

Con le sessioni tradizionali, il server conserva uno stato di sessione, spesso in memoria o in un database/cache. Il browser conserva solo un cookie con id sessione.

Con JWT, il server non deve salvare la sessione: verifica ogni richiesta controllando firma e scadenza del token. Questo rende l'autenticazione stateless.

Vantaggi JWT:

- semplice da usare con SPA;
- non richiede session store;
- il payload puo contenere il ruolo;
- funziona bene con API REST.

Limiti JWT:

- se rubato, resta valido fino alla scadenza;
- revoca immediata piu difficile senza blacklist;
- se salvato in `localStorage`, e esposto a XSS;
- non bisogna inserirci dati sensibili.

Risposta critica da orale: "Per un progetto universitario e una SPA, JWT e una scelta adatta. In produzione valuterei cookie HttpOnly, refresh token, scadenze brevi e protezioni XSS/CSRF piu robuste."

### Cos'e bcrypt e perche non salvare password in chiaro

bcrypt e una funzione di hashing pensata per password. A differenza di hash generici veloci come MD5 o SHA-256, bcrypt e volutamente lento e usa un salt, cioe un valore casuale che rende diverso l'hash anche per password uguali.

Nel progetto:

- registrazione: `bcrypt.hashSync(password, 10)`;
- login: `bcrypt.compareSync(password, user.password)`;
- reset password: nuova password hashata con cost 10.

Riferimenti:

- `backend/controllers/authController.js`.
- `backend/controllers/userController.js`.

Perche non password in chiaro:

- se il database viene compromesso, gli attaccanti leggerebbero direttamente le password;
- molti utenti riusano password su piu servizi;
- salvare password in chiaro e una grave violazione di sicurezza.

### Cosa sono i salt rounds

Nel codice `bcrypt.hashSync(password, 10)` usa cost factor 10. Aumentare questo valore rende l'hash piu lento da calcolare.

Vantaggio:

- attacchi brute force piu costosi.

Limite:

- login e registrazione diventano piu lenti;
- valore troppo alto puo causare problemi di performance.

Per un progetto come BnBHub, 10 e una scelta ragionevole per ambiente didattico e locale.

### Come funziona `verifyToken` passo per passo

File: `backend/middleware/authMiddleware.js`.

1. Legge l'header `Authorization`.
2. Estrae il token dopo `Bearer`.
3. Se manca, risponde `401 Token mancante`.
4. Chiama `jwt.verify(token, getJwtSecret(), { algorithms: [JWT_ALGORITHM] })`.
5. Se token scaduto, manomesso o firmato male, risponde `403 Token non valido o scaduto`.
6. Se valido, mette il payload in `req.user`.
7. Chiama `next()` per passare al controller o al middleware successivo.

Concetto teorico: middleware Express significa funzione tra richiesta e risposta che puo bloccare, modificare `req/res` o proseguire.

### Come funziona `verifyAdmin` e perche e separato

`verifyAdmin` controlla solo l'autorizzazione:

```js
if (!req.user || req.user.ruolo !== 'admin') {
  return res.status(403).json({ errore: 'Accesso riservato agli amministratori' });
}
```

E separato da `verifyToken` perche autenticazione e autorizzazione sono concetti diversi:

- Autenticazione: "chi sei?".
- Autorizzazione: "puoi fare questa operazione?".

Vantaggi:

- riuso: alcune route richiedono solo utente autenticato, altre admin, altre user;
- codice piu leggibile nelle route;
- responsabilita separate.

Riferimenti:

- Middleware: `backend/middleware/authMiddleware.js`.
- Route admin: `backend/routes/userRoutes.js`, `backend/routes/roomRoutes.js`, `backend/routes/bookingRoutes.js`, `backend/routes/reviewRoutes.js`.

### Perche il SECRET va nel `.env`

`JWT_SECRET` e la chiave usata per firmare e verificare i token. Se fosse nel codice e finisse su GitHub, chiunque potrebbe generare token validi.

Nel progetto:

- `.env` contiene i segreti locali ed e ignorato da Git.
- `.env.example` documenta le variabili senza valori reali.
- `server.js` carica `dotenv`.
- `config/security.js` valida che `JWT_SECRET` abbia almeno 32 caratteri.

Riferimenti:

- `backend/server.js`.
- `backend/config/security.js`.
- `README.md`.

### Cosa succede se il token scade o viene manomesso

Se il token scade:

- `jwt.verify()` fallisce;
- il backend risponde `403`;
- il frontend, quando controlla `AuthService.getToken()`, elimina token non validi o scaduti.

Se il token viene modificato nel `localStorage`:

- il payload potrebbe sembrare cambiato lato browser;
- ma la firma non corrisponde piu;
- il backend rifiuta la richiesta.

Questo e fondamentale: il frontend puo migliorare UX, ma non e una barriera di sicurezza sufficiente. La sicurezza reale sta nel backend.

Riferimenti:

- Verifica server: `backend/middleware/authMiddleware.js`.
- Validazione client: `frontend/src/app/services/auth.service.ts`.

### Altri livelli di sicurezza presenti

Validazione input:

- `backend/middleware/authValidation.js` con `express-validator`.
- `backend/middleware/validateRequest.js` restituisce HTTP 400 con dettagli.

Rate limiting:

- `backend/middleware/authRateLimit.js`.
- login: 10 tentativi in 15 minuti, saltando richieste riuscite;
- registrazione: 10 in 1 ora;
- reset password: 5 in 15 minuti.

Helmet:

- `backend/app.js` applica `helmet()` per header HTTP di sicurezza.

CORS:

- `backend/app.js` usa `cors()` con whitelist.
- `backend/config/security.js` definisce default `http://localhost:4200` e `http://localhost:8100`.

Upload immagini:

- `backend/middleware/roomUpload.js` limita MIME type, dimensione e numero file.
- `backend/services/roomImageService.js` verifica contenuto reale con `sharp`, converte in WebP, genera filename sicuri.

Open redirect:

- `frontend/src/app/utils/return-url.ts` accetta solo URL interni sicuri.

Pagamento demo:

- `backend/services/paymentGatewayService.js` rifiuta campi come card number, CVV o scadenza nel body.

---

## 4. Backend - Node.js + Express

### Cos'e Node.js

Node.js e un runtime JavaScript lato server. Permette di usare JavaScript fuori dal browser e si basa su I/O asincrono, utile per gestire molte operazioni di rete e file senza bloccare il processo.

Nel progetto:

- il backend e CommonJS (`"type": "commonjs"`);
- usa Express per routing HTTP;
- usa SQLite, bcrypt, JWT, Nodemailer, multer, sharp.

Riferimento: `backend/package.json`.

### Cos'e Express e perche lo abbiamo usato

Express e un framework minimalista per costruire server HTTP e API REST.

Lo abbiamo usato perche:

- routing semplice;
- middleware chiari;
- ecosistema maturo;
- integrazione facile con CORS, Helmet, JSON body parsing e static files;
- adatto a un backend universitario REST.

Riferimento: `backend/app.js`.

### Middleware in Express

Un middleware e una funzione con accesso a `req`, `res`, `next`. Puo:

- leggere o modificare la richiesta;
- bloccare la risposta;
- aggiungere dati a `req`, come `req.user`;
- passare al prossimo middleware con `next()`.

Esempi reali:

- `express.json()` legge body JSON.
- `helmet()` aggiunge header sicurezza.
- `cors()` controlla origin.
- `verifyToken` autentica.
- `verifyAdmin` autorizza.
- `uploadRoomImages` gestisce multipart.
- `validateRequest` trasforma errori validazione in JSON.

Riferimenti:

- `backend/app.js`.
- `backend/middleware/authMiddleware.js`.
- `backend/middleware/roomUpload.js`.
- `backend/middleware/validateRequest.js`.

### Struttura Model -> Controller -> Route

Il progetto separa:

- Route: definiscono URL, metodi HTTP e middleware.
- Controller: gestiscono richiesta/risposta, validazione di business e orchestrazione.
- Model: contengono query SQL e accesso dati.
- Service: contengono logiche tecniche riutilizzabili, come email, immagini, pagamento.

Esempio camere:

- Route: `backend/routes/roomRoutes.js`.
- Controller: `backend/controllers/roomController.js`.
- Model: `backend/models/roomModel.js`.
- Service immagini: `backend/services/roomImageService.js`.

Perche e utile:

- evita controller pieni di SQL;
- evita route troppo complesse;
- rende testabili singoli livelli;
- facilita spiegazione e manutenzione.

### Routing Express nel progetto

`backend/app.js` monta i router:

- `/users` -> `userRoutes`;
- `/auth` -> `authRoutes`;
- `/rooms` -> `roomRoutes`;
- `/bookings` -> `bookingRoutes`;
- `/payments` -> `paymentRoutes`;
- `/reviews` -> `reviewRoutes`.

Poi definisce `GET /` come health check con risposta JSON.

Esempio:

```js
app.use('/auth', authRoutes);
```

Significa che `router.post('/login', ...)` in `authRoutes.js` diventa `POST /auth/login`.

### CORS

CORS significa Cross-Origin Resource Sharing. Il browser lo usa per decidere se una pagina caricata da un origin puo chiamare un server su un altro origin.

Nel progetto:

- frontend locale: `http://localhost:4200` oppure `http://localhost:8100`;
- backend: `http://localhost:3000`.

Sono origin diversi, quindi serve CORS.

Il backend usa una whitelist:

- default da `DEFAULT_CORS_ORIGINS`;
- oppure variabile `CORS_ORIGINS`;
- se origin non e consentito, errore `403`.

Riferimenti:

- `backend/app.js`, funzioni `createCorsOptions` e middleware errore.
- `backend/config/security.js`.

### Codici HTTP usati

Nel progetto compaiono questi codici:

- `200 OK`: richiesta riuscita, per login, letture, update.
- `201 Created`: risorsa creata, per registrazione, camera, prenotazione, recensione.
- `400 Bad Request`: input non valido, date errate, payload camera non valido.
- `401 Unauthorized`: manca autenticazione o credenziali login non valide.
- `403 Forbidden`: token non valido/scaduto o ruolo non autorizzato.
- `404 Not Found`: camera, prenotazione, utente o recensione non trovata.
- `409 Conflict`: duplicato o conflitto, per email/CF gia registrati, camera non disponibile, recensione gia inviata.
- `413 Payload Too Large`: immagini troppo grandi o troppe immagini.
- `429 Too Many Requests`: rate limiting.
- `500 Internal Server Error`: errore imprevisto server/database.

Riferimenti:

- `backend/controllers/authController.js`.
- `backend/controllers/roomController.js`.
- `backend/controllers/bookingController.js`.
- `backend/controllers/reviewController.js`.
- `backend/middleware/roomUpload.js`.
- `backend/middleware/authRateLimit.js`.

### Variabili d'ambiente

Le variabili d'ambiente permettono di configurare il progetto senza mettere segreti nel codice.

Usate nel backend:

- `PORT`;
- `JWT_SECRET`;
- `CORS_ORIGINS`;
- `PUBLIC_API_URL`;
- `UPLOADS_PATH`;
- `DATABASE_PATH`;
- `FRONTEND_URL`;
- configurazione SMTP.

Riferimenti:

- `backend/server.js`.
- `backend/config/security.js`.
- `backend/services/mailService.js`.
- `backend/services/roomImageService.js`.
- `backend/utils/publicAssetUrl.js`.
- `README.md`.

### Test backend

Il backend usa il test runner nativo di Node:

```bash
npm test
```

E ha test per:

- sicurezza JWT/CORS/Helmet;
- autenticazione;
- validazione;
- rate limiting;
- upload immagini;
- prenotazioni;
- recensioni;
- reset password;
- pagamento demo.

Riferimenti:

- `backend/*.test.js` nelle cartelle `controllers`, `models`, `middleware`, `services`, `config`, `utils`.
- Script: `backend/package.json`.

---

## 5. Frontend - Angular + Ionic

### Cos'e Angular

Angular e un framework frontend per costruire Single Page Application. Usa TypeScript, componenti, template, dependency injection, router e servizi.

Nel progetto Angular gestisce:

- pagine;
- routing;
- form reattivi;
- service HTTP;
- guard di navigazione;
- stato token lato browser;
- template con `@if` e `@for`.

Riferimenti:

- Bootstrap: `frontend/src/main.ts`.
- Route: `frontend/src/app/app.routes.ts`.
- Component shell: `frontend/src/app/app.component.ts`.

### Pattern MVC/MVVM

Angular non e MVC classico puro, ma si avvicina a MVVM/component-based:

- View: template HTML (`*.page.html`, `app.component.html`).
- ViewModel/Component: classe TypeScript (`*.page.ts`) con stato e metodi.
- Model/Service: interfacce e service che comunicano col backend.

Esempio:

- `prenota.page.html`: view.
- `prenota.page.ts`: logica della pagina, form, selezione camera, pagamento.
- `RoomService`, `BookingService`, `PaymentService`: accesso dati/API.

### Cos'e Ionic e perche lo abbiamo usato

Ionic e un framework UI per creare interfacce responsive e app-like con componenti pronti:

- `ion-content`;
- `ion-button`;
- `ion-card`;
- `ion-menu`;
- `ion-input`;
- `ion-spinner`;
- `ion-badge`;
- `ion-accordion`.

Lo abbiamo usato perche:

- accelera lo sviluppo UI;
- offre componenti responsive;
- si integra bene con Angular;
- prepara il progetto a un possibile packaging mobile con Capacitor.

Riferimenti:

- Import Ionic: `frontend/src/main.ts`.
- Shell e menu: `frontend/src/app/app.component.html`.
- Pagine: `frontend/src/app/pages/**`.
- Capacitor: `frontend/capacitor.config.ts`.

### Standalone component

Il progetto usa Angular standalone: i componenti dichiarano direttamente `standalone: true` e importano cio che serve.

Esempio:

```ts
@Component({
  standalone: true,
  imports: [ReactiveFormsModule, IonContent, IonButton]
})
```

Differenza rispetto a `NgModule`:

- prima i componenti venivano dichiarati in moduli;
- con standalone ogni componente e piu autonomo;
- il routing puo caricare direttamente componenti con `loadComponent`;
- la struttura e piu semplice per app moderne.

Riferimenti:

- `frontend/src/main.ts`.
- `frontend/src/app/app.routes.ts`.
- Qualsiasi pagina in `frontend/src/app/pages/**`.

### Lazy loading delle route

In `app.routes.ts` ogni pagina viene caricata con `loadComponent`.

Vantaggi:

- il bundle iniziale puo essere piu leggero;
- il browser carica una pagina solo quando serve;
- migliora performance percepita;
- separa naturalmente le feature.

Esempio:

```ts
{
  path: 'prenota',
  canActivate: [userGuard],
  loadComponent: () =>
    import('./pages/prenota/prenota.page').then((m) => m.PrenotaPage),
}
```

Riferimento: `frontend/src/app/app.routes.ts`.

### Routing Angular

Le route principali sono:

- `/home`: pubblica.
- `/login`: guest.
- `/register`: guest.
- `/password-dimenticata`: pubblica.
- `/reimposta-password`: pubblica.
- `/prenota`: user.
- `/area-personale`: user.
- `/admin/...`: admin.
- `**`: pagina non disponibile.

Il parent `/admin` usa `canActivate: [adminGuard]`, quindi tutte le sotto-pagine admin sono protette.

Riferimento: `frontend/src/app/app.routes.ts`.

### Service Angular

Un service e una classe injectable usata per logica condivisa. Nel progetto i service HTTP evitano di mettere chiamate API direttamente nei componenti.

Vantaggi:

- componenti piu leggibili;
- riuso;
- testabilita;
- separazione tra UI e accesso dati.

Esempi:

- `AuthService`: login, registrazione, reset password, token.
- `RoomService`: camere e upload immagini.
- `BookingService`: prenotazioni.
- `ReviewService`: recensioni.
- `PaymentService`: pagamento demo.
- `UserService`: lista utenti admin.

Riferimenti: `frontend/src/app/services/*.ts`.

### HttpClient

`HttpClient` e il client HTTP di Angular. Restituisce `Observable`, quindi le pagine usano `subscribe()` per gestire successi ed errori.

Esempio:

- `PrenotaPage` chiama `roomService.getDisponibili().subscribe(...)`;
- `LoginPage` chiama `authService.login().subscribe(...)`;
- `GestioneCamerePage` chiama `roomService.create()` o `roomService.update()`.

Riferimenti:

- `frontend/src/app/pages/prenota/prenota.page.ts`.
- `frontend/src/app/pages/auth/login/login.page.ts`.
- `frontend/src/app/pages/admin/gestione-camere/gestione-camere.page.ts`.

### Reactive Forms

Il progetto usa Reactive Forms invece di Template Forms.

Vantaggi:

- validazione esplicita nel TypeScript;
- form piu testabili;
- gestione semplice di validatori custom;
- adatti a form complessi come prenotazione, pagamento, registrazione, reset password.

Esempi:

- `LoginPage`: email e password.
- `RegisterPage`: nome, cognome, email, password, eta, telefono, codice fiscale.
- `PrenotaPage`: date, ospiti e carta demo.
- `ReimpostaPasswordPage`: password e conferma.
- `GestioneCamerePage`: form camera e immagini.

Riferimenti:

- `frontend/src/app/pages/auth/register/register.page.ts`.
- `frontend/src/app/pages/prenota/prenota.page.ts`.
- `frontend/src/app/pages/admin/gestione-camere/gestione-camere.page.ts`.

### Guard Angular

Un guard decide se una route puo essere attivata.

Nel progetto:

- `adminGuard`: solo admin;
- `userGuard`: solo user;
- `guestGuard`: solo non autenticati.

Esempi:

- user non loggato che va su `/prenota` viene mandato a `/login?returnUrl=/prenota`;
- admin che prova a entrare in pagine user viene mandato a pagina non disponibile;
- utente loggato che va su `/login` viene reindirizzato.

Riferimento: `frontend/src/app/guards/auth.guard.ts`.

### JWT nel `localStorage`

Il frontend salva il token JWT in `localStorage` tramite `AuthService.salvaToken()`.

Vantaggi:

- semplice;
- persistente dopo refresh pagina;
- facile da leggere nei service per costruire header `Authorization`.

Limiti:

- vulnerabile a XSS: se uno script malevolo gira nella pagina, puo leggere il token;
- non permette revoca immediata;
- in produzione si valuterebbero cookie HttpOnly/Secure o strategia refresh token.

Nel progetto il frontend valida struttura, algoritmo, ruolo e scadenza prima di considerare il token valido. Ma la verifica decisiva resta lato backend.

Riferimento: `frontend/src/app/services/auth.service.ts`.

### Perche `@if` e `@for`

Nei template si usano i control flow moderni di Angular:

- `@if` al posto di `*ngIf`;
- `@for` al posto di `*ngFor`.

Sono sintassi piu moderne e leggibili, introdotte nelle versioni recenti di Angular, e si integrano bene con standalone component.

Esempio: `frontend/src/app/app.component.html` mostra menu diversi per guest, user e admin usando `@if` e cicli `@for`.

### Sidemenu Ionic

Il sidemenu mobile e in `app.component.html` con:

- `ion-menu`;
- `ion-menu-toggle`;
- `ion-list`;
- `ion-item`;
- `ion-menu-button`.

Il menu cambia in base al ruolo:

- guest: Prenota, Login;
- user: Area personale, Prenota, Logout;
- admin: Dashboard, Camere, Prenotazioni, Recensioni, Utenti, Logout.

Riferimenti:

- `frontend/src/app/app.component.html`.
- `frontend/src/app/app.component.ts`.

### Leaflet

Leaflet e usato nella home per mostrare una mappa OpenStreetMap.

Nel codice:

- `import * as L from 'leaflet'`;
- `L.map('map').setView(...)`;
- `L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', ...)`;
- marker custom su Palermo/Unipa.

Riferimento: `frontend/src/app/pages/home/home.page.ts`.

### Test frontend

Il frontend usa Jasmine + Karma.

Script:

```bash
npm test
```

Riferimenti:

- `frontend/karma.conf.js`.
- `frontend/src/**/*.spec.ts`.
- Script in `frontend/package.json`.

---

## 6. Funzionalita specifiche end-to-end

### Registrazione end-to-end

Flusso:

1. L'utente compila `RegisterPage`.
2. Reactive Forms valida campi: email, eta, telefono, codice fiscale, password.
3. Il frontend normalizza email lowercase e codice fiscale uppercase.
4. `AuthService.register()` invia `POST /auth/register`.
5. `authRoutes.js` applica validazione, `validateRequest`, rate limiter e controller.
6. `AuthController.register()` normalizza ancora, controlla duplicati email/CF.
7. La password viene hashata con bcrypt cost 10.
8. `UserModel.create()` salva l'utente con ruolo `user`.
9. `MailService.sendRegistrationConfirmation()` prova a inviare email di conferma.
10. Il server risponde `201`, il frontend porta al login.

Riferimenti:

- Frontend: `frontend/src/app/pages/auth/register/register.page.ts`.
- Service: `frontend/src/app/services/auth.service.ts`.
- Route: `backend/routes/authRoutes.js`.
- Controller: `backend/controllers/authController.js`.
- Model: `backend/models/userModel.js`.
- Email: `backend/services/mailService.js`.

### Login end-to-end

Flusso:

1. `LoginPage` raccoglie email/password.
2. `AuthService.login()` chiama `POST /auth/login`.
3. Il backend valida input e applica rate limit.
4. `UserModel.getByEmail()` cerca l'utente.
5. `bcrypt.compareSync()` confronta password.
6. `jwt.sign()` crea token con `id`, `email`, `ruolo`, `expiresIn: '24h'`.
7. Il frontend salva token con `salvaToken()`.
8. Se admin, redirect a `/admin/dashboard`; se user, redirect a `returnUrl` sicuro o `/home`.

Riferimenti:

- `frontend/src/app/pages/auth/login/login.page.ts`.
- `frontend/src/app/services/auth.service.ts`.
- `backend/controllers/authController.js`.

### Protezione route admin

Il progetto usa doppia protezione:

- frontend: `adminGuard`;
- backend: `verifyToken` + `verifyAdmin`.

Perche entrambi?

- Il guard migliora UX: evita di mostrare pagine non autorizzate.
- Il backend garantisce sicurezza reale: anche chiamando API con Postman o modificando il JS, senza token admin valido la richiesta viene respinta.

Riferimenti:

- Guard: `frontend/src/app/guards/auth.guard.ts`.
- Route Angular: `frontend/src/app/app.routes.ts`.
- Middleware: `backend/middleware/authMiddleware.js`.
- Route protette: `backend/routes/*.js`.

### Multiple immagini per camera

Flusso admin:

1. `GestioneCamerePage` consente selezione file.
2. Il frontend controlla massimo 10 immagini, 5 MB, MIME JPEG/PNG/WebP.
3. `RoomService.create()` o `update()` costruisce `FormData`.
4. Nel `FormData`, il campo `camera` contiene JSON; il campo `immagini` contiene file.
5. Il backend passa per `verifyToken`, `verifyAdmin`, `uploadRoomImages`.
6. `roomUpload.js` usa `multer.memoryStorage()`.
7. `roomImageService.processUploadedImages()` verifica contenuto con `sharp`, ridimensiona e converte WebP.
8. `RoomModel` salva camera e righe `room_images`.
9. I file vengono salvati in `backend/uploads/rooms/<roomId>/`.
10. Le API restituiscono URL pubblici tramite `withPublicImageUrls()`.

Riferimenti:

- Frontend: `frontend/src/app/pages/admin/gestione-camere/gestione-camere.page.ts`.
- Service: `frontend/src/app/services/room.service.ts`.
- Route: `backend/routes/roomRoutes.js`.
- Upload: `backend/middleware/roomUpload.js`.
- Controller: `backend/controllers/roomController.js`.
- Model: `backend/models/roomModel.js`.
- Image service: `backend/services/roomImageService.js`.
- URL pubblici: `backend/utils/publicAssetUrl.js`.

### Prenotazioni

Flusso utente:

1. `PrenotaPage` imposta date e ospiti.
2. `RoomService.getDisponibili()` chiama `GET /rooms/disponibili`.
3. Il backend valida date e ospiti.
4. `RoomModel.getDisponibili()` esclude camere con prenotazioni sovrapposte.
5. L'utente seleziona camera e compila dati carta demo.
6. `PaymentService.simulatePayment()` chiama `POST /payments/simulate`.
7. Se pagamento demo e autorizzato, `BookingService.create()` chiama `POST /bookings`.
8. Il backend prende `utente_id` dal token, non dal body.
9. `BookingModel.createIfAvailable()` inserisce solo se non ci sono overlap.
10. La prenotazione nasce `in attesa`.

Riferimenti:

- Frontend: `frontend/src/app/pages/prenota/prenota.page.ts`.
- Service camere: `frontend/src/app/services/room.service.ts`.
- Service booking: `frontend/src/app/services/booking.service.ts`.
- Controller camere: `backend/controllers/roomController.js`.
- Controller booking: `backend/controllers/bookingController.js`.
- Model: `backend/models/bookingModel.js`.

### Gestione prenotazioni admin

L'admin vede tutte le prenotazioni e puo confermare o rifiutare quelle gestibili.

Il backend:

- accetta solo stati `confermata` o `rifiutata`;
- blocca modifica se check-in e gia passato;
- se conferma una prenotazione non gia confermata, invia email con link area personale.

Riferimenti:

- Frontend: `frontend/src/app/pages/admin/gestione-prenotazioni/gestione-prenotazioni.page.ts`.
- Controller: `backend/controllers/bookingController.js`.
- Email: `backend/services/mailService.js`.

### Area personale utente

L'utente vede solo le proprie prenotazioni tramite `GET /bookings/mie`.

Nel backend:

- la route imposta `req.params.utente_id = req.user.id`;
- il model filtra `WHERE bookings.utente_id = ?`;
- il risultato include dati camera e recensione tramite join.

Funzioni:

- aggiornare intolleranze/note;
- cancellare prenotazioni future non chiuse;
- inviare recensioni su soggiorni conclusi e confermati;
- vedere galleria immagini camera.

Riferimenti:

- Frontend: `frontend/src/app/pages/area-personale/area-personale.page.ts`.
- Route: `backend/routes/bookingRoutes.js`.
- Controller: `backend/controllers/bookingController.js`.
- Model: `backend/models/bookingModel.js`.

### Recensioni moderate

Flusso:

1. L'utente puo recensire solo prenotazioni confermate e concluse.
2. Il backend controlla proprieta, stato e data fine.
3. La recensione nasce `in attesa` e `visibile = 0`.
4. L'admin pubblica o rifiuta da `GestioneRecensioniPage`.
5. La home mostra solo recensioni pubblicate e visibili.
6. Il cognome viene anonimizzato, per esempio `Mario R.`.

Riferimenti:

- User: `frontend/src/app/pages/area-personale/area-personale.page.ts`.
- Admin: `frontend/src/app/pages/admin/gestione-recensioni/gestione-recensioni.page.ts`.
- Public home: `frontend/src/app/pages/home/home.page.ts`.
- Controller: `backend/controllers/reviewController.js`.
- Model: `backend/models/reviewModel.js`.

### Nodemailer

Nodemailer invia email SMTP se le variabili sono configurate.

Nel progetto invia:

- conferma registrazione;
- link reset password;
- conferma prenotazione.

Se SMTP non e configurato, `sendMail()` stampa warning e non blocca il flusso principale. Questo e utile in sviluppo: l'app resta usabile anche senza email reale.

Riferimento: `backend/services/mailService.js`.

### Recupero password

Flusso:

1. Utente inserisce email in `PasswordDimenticataPage`.
2. Backend risponde sempre con messaggio generico, anche se email inesistente.
3. Se utente esiste, genera token casuale 32 byte in esadecimale.
4. Salva solo hash SHA-256 del token.
5. Invalida eventuali token precedenti dell'utente.
6. Invia email con link.
7. `ReimpostaPasswordPage` legge token dalla query string.
8. Backend consuma token in transazione e aggiorna password hashata bcrypt.
9. Token diventa usato e non riutilizzabile.

Riferimenti:

- Frontend richiesta: `frontend/src/app/pages/auth/password-dimenticata/password-dimenticata.page.ts`.
- Frontend conferma: `frontend/src/app/pages/auth/reimposta-password/reimposta-password.page.ts`.
- Controller: `backend/controllers/authController.js`.
- Model: `backend/models/passwordResetModel.js`.
- Email: `backend/services/mailService.js`.

### Pagamento demo

Il pagamento non integra un provider reale, ma simula un'autorizzazione.

Punti importanti:

- il frontend valida dati carta solo localmente;
- il backend riceve solo `paymentMethodToken: 'tok_demo_bnbhub'`;
- se nel body arrivano campi sensibili come `cardNumber`, `cvv`, `expiry`, il backend rifiuta;
- dopo pagamento autorizzato, la prenotazione viene creata con una seconda chiamata.

Riferimenti:

- Frontend: `frontend/src/app/pages/prenota/prenota.page.ts`.
- Service: `frontend/src/app/services/payment.service.ts`.
- Route: `backend/routes/paymentRoutes.js`.
- Controller: `backend/controllers/paymentController.js`.
- Service: `backend/services/paymentGatewayService.js`.

---

## 7. Scelte tecnologiche: X invece di Y

### SQLite invece di MySQL/PostgreSQL

Risposta ideale:

"Abbiamo scelto SQLite per semplicita di setup e coerenza con un progetto universitario. Non richiede un server separato e permette di avere tutto in locale. MySQL o PostgreSQL sarebbero migliori in produzione, con piu utenti concorrenti, backup, ruoli DB e scalabilita. Nel nostro caso SQLite basta, ma siamo consapevoli che andrebbe rivalutato per deployment reale."

Riferimento: `backend/database.js`.

### JWT invece di sessioni

Risposta ideale:

"JWT si adatta bene a una SPA con API REST: il backend verifica firma e scadenza a ogni richiesta senza mantenere sessione lato server. Il token contiene id e ruolo, quindi i middleware possono autorizzare le route. Il limite e che la revoca immediata e piu complessa e il salvataggio in localStorage richiede attenzione agli XSS."

Riferimenti:

- `backend/controllers/authController.js`.
- `backend/middleware/authMiddleware.js`.
- `frontend/src/app/services/auth.service.ts`.

### Ionic invece di React Native o Flutter

Risposta ideale:

"Ionic ci permette di costruire una UI responsive usando Angular, HTML, CSS e TypeScript, cioe tecnologie gia coerenti con il frontend web. React Native e Flutter sono ottime soluzioni mobile native/cross-platform, ma avrebbero richiesto un ecosistema diverso. Con Ionic e Capacitor possiamo mantenere una base web e avere possibilita futura di packaging mobile."

Riferimenti:

- `frontend/src/main.ts`.
- `frontend/capacitor.config.ts`.
- componenti Ionic nelle pagine.

### Angular standalone invece di NgModules

Risposta ideale:

"Standalone riduce boilerplate e rende i componenti piu autonomi. Ogni pagina importa direttamente i moduli e i componenti Ionic che usa. Inoltre si integra bene con `loadComponent` e lazy loading. NgModules sono ancora comprensibili storicamente, ma per un progetto moderno Angular standalone e piu diretto."

Riferimenti:

- `frontend/src/main.ts`.
- `frontend/src/app/app.routes.ts`.
- pagine `standalone: true`.

### bcrypt invece di MD5/SHA

Risposta ideale:

"MD5 e SHA sono hash generici molto veloci, quindi inadatti alle password: un attaccante puo provare miliardi di combinazioni. bcrypt e pensato per password, usa salt e cost factor, quindi rende piu costoso il brute force. Nel progetto usiamo cost 10, un valore adatto per sviluppo e demo."

Riferimento: `backend/controllers/authController.js`.

### Node.js invece di PHP o Python

Risposta ideale:

"Node.js permette di usare JavaScript/TypeScript come linguaggio principale tra frontend e backend. Express rende rapida la costruzione di API REST e l'ecosistema ha librerie mature per JWT, bcrypt, SQLite, upload ed email. PHP o Python sarebbero alternative valide, ma avrebbero introdotto un secondo linguaggio e stack."

Riferimenti:

- `backend/package.json`.
- `backend/app.js`.

### Leaflet invece di Google Maps

Risposta ideale:

"Leaflet e leggero, open source e si integra bene con OpenStreetMap. Per mostrare una posizione sulla home e sufficiente e non richiede API key. Google Maps offre servizi avanzati, ma introduce costi, chiavi API e configurazioni aggiuntive."

Riferimento: `frontend/src/app/pages/home/home.page.ts`.

### Nodemailer invece di servizio email esterno SDK-specifico

Risposta ideale:

"Nodemailer e generico: funziona con SMTP e non lega il progetto a un provider specifico. Per un progetto universitario e sufficiente e facile da configurare. In produzione potremmo usare servizi come SendGrid, Mailgun o SES per deliverability, template e monitoraggio migliori."

Riferimento: `backend/services/mailService.js`.

---

## 8. Git e workflow

### Branch separati per ogni sviluppatore

Con tre studenti, lavorare direttamente su `main` aumenta il rischio di conflitti e regressioni. Branch separati permettono a ciascuno di sviluppare una feature isolata.

Flusso consigliato:

1. partire da `dev`;
2. creare branch personale;
3. sviluppare e testare;
4. aprire Pull Request verso `dev`;
5. integrare `dev` in `main` quando stabile.

Riferimento: `README.md`, sezione "Flusso Git consigliato".

### Feature branch -> dev -> main

- `main`: codice stabile, consegnabile.
- `dev`: integrazione delle modifiche.
- branch personali: feature o fix.

Vantaggi:

- riduce rischio di rompere la versione stabile;
- facilita review;
- rende chiaro cosa e pronto e cosa e in sviluppo.

### Conventional Commits

Conventional Commits e una convenzione per messaggi di commit, per esempio:

- `feat: aggiunge gestione recensioni`;
- `fix: corregge controllo date prenotazione`;
- `docs: aggiorna guida esame`;
- `test: aggiunge test upload immagini`.

Vantaggi:

- storico piu leggibile;
- facilita changelog;
- permette di capire rapidamente il tipo di modifica.

Nel repository non serve che il codice "usi" Conventional Commits: e una regola di workflow, non una libreria.

### Branch Protection Rules

Le Branch Protection Rules sono configurazioni della piattaforma Git, per esempio GitHub. Non stanno necessariamente nei file del repository.

Possono imporre:

- Pull Request obbligatoria prima del merge;
- review obbligatoria;
- test verdi prima del merge;
- divieto di push diretto su `main`;
- branch aggiornato prima del merge.

Risposta da orale:

"Le branch protection servono a proteggere il ramo stabile. Anche se un singolo sviluppatore sbaglia, non puo rompere `main` senza passare da review e controlli."

---

## 9. Come dividerla tra tre studenti

Tutti devono sapere tutto, ma per studiare conviene assegnare una responsabilita primaria.

Studente 1 - Backend e sicurezza:

- Express, route, controller, model;
- JWT, bcrypt, middleware;
- validazione, rate limit, CORS, Helmet;
- recupero password.

Studente 2 - Database e flussi dati:

- schema SQLite;
- relazioni e foreign key;
- prenotazioni, disponibilita, transazioni;
- immagini multiple;
- recensioni e join.

Studente 3 - Frontend e UX:

- Angular standalone;
- Ionic;
- routing e guard;
- Reactive Forms;
- service HTTP;
- home, Leaflet, area personale e admin.

Metodo consigliato:

- ognuno studia prima la propria area;
- poi simulate domande incrociate;
- nessuno deve dire "questa parte non l'ho fatta io": all'orale dovete saper spiegare tutto.

---

# PARTE 2 - SIMULAZIONE ORALE

## Domande base

### 1. Cos'e BnBHub e qual e la sua architettura generale?

Risposta ideale:

BnBHub e un'applicazione per gestire un B&B: mostra camere, permette registrazione e login, prenotazioni, gestione admin, recensioni e immagini. L'architettura e client-server a tre livelli: frontend Ionic/Angular, backend Express, database SQLite. Il frontend gestisce interfaccia e navigazione, il backend espone REST API e applica sicurezza, il database conserva dati persistenti.

Riferimento codice: `frontend/src/main.ts`, `backend/app.js`, `backend/database.js`.

### 2. Cos'e una REST API?

Risposta ideale:

Una REST API espone risorse tramite endpoint HTTP e usa i metodi HTTP in modo semantico: `GET` per leggere, `POST` per creare, `PUT` per aggiornare, `DELETE` per eliminare. Nel nostro progetto le risorse sono camere, utenti, prenotazioni, recensioni, pagamenti e autenticazione. Per esempio `GET /rooms` legge le camere e `POST /bookings` crea una prenotazione.

Riferimento codice: `backend/routes/roomRoutes.js`, `backend/routes/bookingRoutes.js`.

### 3. Perche avete separato frontend e backend?

Risposta ideale:

Li abbiamo separati per dividere responsabilita diverse: il frontend si occupa dell'esperienza utente, mentre il backend si occupa di sicurezza, validazione, regole di business e database. Questa separazione rende il progetto piu ordinato e manutenibile. Inoltre consente al frontend di cambiare senza riscrivere il backend e viceversa.

Riferimento codice: cartelle `frontend/` e `backend/`, con manifest separati `frontend/package.json` e `backend/package.json`.

### 4. Che database usate e perche?

Risposta ideale:

Usiamo SQLite, un database relazionale salvato in un file locale. Lo abbiamo scelto per semplicita di installazione e perche e sufficiente per un progetto universitario e una demo locale. Rispetto a MySQL o PostgreSQL e meno adatto a grandi carichi concorrenti, ma evita configurazioni server aggiuntive.

Riferimento codice: `backend/database.js`.

### 5. Cos'e una foreign key?

Risposta ideale:

Una foreign key e un vincolo che collega una riga a una riga di un'altra tabella, garantendo integrita referenziale. Per esempio `bookings.utente_id` si collega a `users.id` e `bookings.camera_id` a `rooms.id`. In questo modo il database evita prenotazioni riferite a utenti o camere inesistenti.

Riferimento codice: `backend/database.js`.

### 6. Cos'e JWT e dove lo usate?

Risposta ideale:

JWT e un token composto da header, payload e firma. Lo usiamo dopo il login: il backend firma un token con id, email, ruolo e scadenza; il frontend lo salva e lo invia nelle richieste protette. Il backend verifica firma e scadenza con `verifyToken`.

Riferimento codice: `backend/controllers/authController.js`, `backend/middleware/authMiddleware.js`, `frontend/src/app/services/auth.service.ts`.

### 7. Cosa fa il middleware `verifyToken`?

Risposta ideale:

`verifyToken` legge l'header `Authorization`, estrae il Bearer token e lo verifica con il segreto JWT. Se il token manca risponde 401, se non e valido o e scaduto risponde 403. Se e valido, inserisce il payload in `req.user` e passa al middleware successivo.

Riferimento codice: `backend/middleware/authMiddleware.js`.

### 8. Cosa fa `verifyAdmin`?

Risposta ideale:

`verifyAdmin` controlla che l'utente autenticato abbia ruolo `admin`. Non verifica il token da zero: assume che `verifyToken` abbia gia popolato `req.user`. E separato per distinguere autenticazione e autorizzazione.

Riferimento codice: `backend/middleware/authMiddleware.js`, `backend/routes/userRoutes.js`.

### 9. Perche usate bcrypt?

Risposta ideale:

Usiamo bcrypt per salvare hash delle password, non password in chiaro. bcrypt e progettato per password: usa salt e un cost factor che rende l'hashing volutamente lento. Nel progetto le password vengono hashate con cost 10 in registrazione e reset password.

Riferimento codice: `backend/controllers/authController.js`.

### 10. Cos'e Express?

Risposta ideale:

Express e un framework Node.js per creare server HTTP e API. Nel progetto lo usiamo per definire route REST, middleware, gestione CORS, parsing JSON e file statici. `app.js` crea l'applicazione Express e monta tutti i router.

Riferimento codice: `backend/app.js`.

### 11. Cos'e Angular?

Risposta ideale:

Angular e un framework frontend TypeScript per creare Single Page Application. Nel progetto gestisce componenti, template, router, form reattivi, service HTTP e guard. Usiamo componenti standalone e lazy loading tramite `loadComponent`.

Riferimento codice: `frontend/src/main.ts`, `frontend/src/app/app.routes.ts`.

### 12. Cos'e Ionic?

Risposta ideale:

Ionic e un framework UI che fornisce componenti responsive e app-like, come `ion-content`, `ion-card`, `ion-button`, `ion-menu`. Lo usiamo insieme ad Angular per costruire un'interfaccia moderna, mobile-friendly e pronta a un possibile packaging con Capacitor.

Riferimento codice: `frontend/src/app/app.component.html`, `frontend/capacitor.config.ts`.

### 13. Cosa sono i Reactive Forms?

Risposta ideale:

I Reactive Forms sono form gestiti dal codice TypeScript con `FormGroup`, `FormControl` e validatori. Nel progetto li usiamo per login, registrazione, prenotazione, pagamento demo, reset password e gestione camere. Sono adatti perche i nostri form hanno validazioni esplicite e anche validatori custom, come date e carta demo.

Riferimento codice: `frontend/src/app/pages/prenota/prenota.page.ts`, `frontend/src/app/pages/auth/register/register.page.ts`.

### 14. Cosa sono i service Angular?

Risposta ideale:

I service Angular sono classi iniettate nei componenti per logica condivisa. Nel progetto concentrano le chiamate HTTP, quindi le pagine non devono conoscere dettagli degli endpoint. Per esempio `RoomService` gestisce camere e upload immagini, `BookingService` gestisce prenotazioni.

Riferimento codice: `frontend/src/app/services/room.service.ts`, `frontend/src/app/services/booking.service.ts`.

### 15. Cosa fa il guard Angular?

Risposta ideale:

Un guard decide se una route puo essere aperta. Nel progetto `adminGuard` protegge l'area admin, `userGuard` protegge prenotazione e area personale, `guestGuard` evita che un utente gia loggato torni a login o registrazione. Questo migliora la navigazione, ma la sicurezza vera resta anche nel backend.

Riferimento codice: `frontend/src/app/guards/auth.guard.ts`, `frontend/src/app/app.routes.ts`.

## Domande intermedie

### 16. Cosa succede se un utente modifica il token JWT nel localStorage?

Risposta ideale:

Il frontend potrebbe leggere un payload alterato, ma il backend non si fida del frontend. Appena il token modificato viene inviato a una route protetta, `jwt.verify()` controlla la firma: se anche un carattere cambia, la firma non corrisponde e la richiesta viene rifiutata con 403. Il nostro `AuthService` fa anche una validazione strutturale lato client, ma e solo un aiuto UX.

Riferimento codice: `backend/middleware/authMiddleware.js`, `frontend/src/app/services/auth.service.ts`.

### 17. Perche `verifyAdmin` non e dentro `verifyToken`?

Risposta ideale:

Perche autenticazione e autorizzazione sono due livelli diversi. `verifyToken` risponde alla domanda "il token e valido?", mentre `verifyAdmin` risponde "questo utente ha il ruolo admin?". Separarli consente di riutilizzare `verifyToken` anche per route user e di comporre i middleware in modo chiaro.

Riferimento codice: `backend/middleware/authMiddleware.js`, `backend/routes/bookingRoutes.js`.

### 18. Perche `utente_id` della prenotazione viene dal token e non dal body?

Risposta ideale:

Se accettassimo `utente_id` dal body, un utente potrebbe inviare l'id di un altro utente e creare prenotazioni a suo nome. Invece il backend prende `req.user.id`, che deriva da un token verificato. Questo e un controllo di ownership e autorizzazione lato server.

Riferimento codice: `backend/controllers/bookingController.js`, metodo `create`.

### 19. Come prevenite SQL injection?

Risposta ideale:

Usiamo query parametrizzate con placeholder `?`, passando i valori in array separati. In questo modo l'input utente viene trattato come dato, non come codice SQL. Per esempio la ricerca utente per email usa `SELECT * FROM users WHERE email = ?`.

Riferimento codice: `backend/models/userModel.js`, `backend/models/bookingModel.js`.

### 20. Come funziona la ricerca camere disponibili?

Risposta ideale:

Il frontend invia date e numero ospiti a `GET /rooms/disponibili`. Il backend valida date e ospiti, poi il model filtra camere disponibili, con capienza sufficiente e senza prenotazioni sovrapposte in stato `in attesa` o `confermata`. La condizione SQL usa `NOT EXISTS` per escludere camere occupate nel periodo.

Riferimento codice: `frontend/src/app/services/room.service.ts`, `backend/controllers/roomController.js`, `backend/models/roomModel.js`.

### 21. Perche le prenotazioni usano `INSERT ... WHERE NOT EXISTS`?

Risposta ideale:

Serve a rendere atomico il controllo disponibilita piu inserimento. Se due utenti provano a prenotare la stessa camera nello stesso periodo, non basta controllare prima e inserire dopo: tra le due operazioni potrebbe arrivare un'altra richiesta. Con `INSERT ... SELECT ... WHERE NOT EXISTS`, l'inserimento avviene solo se al momento della query non esiste overlap.

Riferimento codice: `backend/models/bookingModel.js`, funzione `createIfAvailable`.

### 22. Come funziona il sistema di immagini multiple?

Risposta ideale:

Ogni camera puo avere piu immagini nella tabella `room_images`, collegate con `room_id`. L'admin carica file dal frontend tramite `FormData`; il backend li riceve con `multer`, verifica e converte con `sharp`, salva filename WebP nel database e file in `uploads/rooms/<roomId>`. Le API restituiscono poi URL pubblici per visualizzarle.

Riferimento codice: `frontend/src/app/services/room.service.ts`, `backend/middleware/roomUpload.js`, `backend/services/roomImageService.js`, `backend/models/roomModel.js`.

### 23. Perche `ON DELETE CASCADE` su `room_images`?

Risposta ideale:

Perche le immagini non hanno senso senza la camera. Se una camera viene eliminata, il database elimina automaticamente le righe immagini collegate, evitando dati orfani. Il controller poi elimina anche la cartella dei file fisici, per tenere coerenti database e filesystem.

Riferimento codice: `backend/database.js`, `backend/controllers/roomController.js`, `backend/services/roomImageService.js`.

### 24. Come funziona la moderazione recensioni?

Risposta ideale:

L'utente puo creare una recensione solo per una prenotazione propria, confermata e conclusa. La recensione nasce `in attesa` e non visibile. L'admin puo pubblicarla o rifiutarla; solo quelle `pubblicata` e `visibile = 1` appaiono nella home, con cognome anonimizzato.

Riferimento codice: `backend/controllers/reviewController.js`, `backend/models/reviewModel.js`, `frontend/src/app/pages/admin/gestione-recensioni/gestione-recensioni.page.ts`.

### 25. Perche usate CORS?

Risposta ideale:

Il browser considera frontend e backend origin diversi: Angular gira su `localhost:4200` o `8100`, Express su `localhost:3000`. CORS permette al backend di dichiarare quali origin possono fare richieste. Nel nostro caso usiamo una whitelist configurabile, quindi origin non autorizzati ricevono errore.

Riferimento codice: `backend/app.js`, `backend/config/security.js`.

### 26. Perche usate Helmet?

Risposta ideale:

Helmet imposta header HTTP di sicurezza che aiutano a ridurre rischi comuni, come sniffing del content-type o alcune classi di attacchi lato browser. Non sostituisce validazione e autorizzazione, ma e un livello difensivo aggiuntivo. Nel progetto viene applicato globalmente all'app Express.

Riferimento codice: `backend/app.js`.

### 27. Come funziona il recupero password?

Risposta ideale:

L'utente richiede il reset con email; il backend risponde sempre in modo generico per non rivelare se l'account esiste. Se l'utente esiste, genera un token casuale, salva solo l'hash SHA-256, imposta scadenza 30 minuti e invia link via email. La conferma consuma il token in transazione e aggiorna la password hashata con bcrypt.

Riferimento codice: `backend/controllers/authController.js`, `backend/models/passwordResetModel.js`, `backend/services/mailService.js`.

### 28. Perche il pagamento e solo demo?

Risposta ideale:

Perche gestire pagamenti reali richiede provider certificati, sicurezza PCI-DSS e mai ricevere dati carta direttamente sul nostro server. Nel progetto simuliamo l'autorizzazione con un token demo e il backend rifiuta campi sensibili come numero carta o CVV. Questo mostra il flusso concettuale senza trattare dati reali.

Riferimento codice: `frontend/src/app/pages/prenota/prenota.page.ts`, `backend/services/paymentGatewayService.js`.

### 29. Come funziona il lazy loading in Angular?

Risposta ideale:

Le route usano `loadComponent`, quindi Angular importa una pagina solo quando la route viene richiesta. Questo riduce il carico iniziale e organizza meglio le feature. Nel nostro progetto tutte le pagine principali sono caricate cosi, incluse home, prenota, area personale e admin.

Riferimento codice: `frontend/src/app/app.routes.ts`.

### 30. Perche alcune API sono protette sia da guard frontend sia da middleware backend?

Risposta ideale:

Il guard frontend evita navigazioni inutili e migliora UX, ma non e sicurezza sufficiente perche il client puo essere manipolato. Il backend deve sempre verificare token e ruolo perche le API possono essere chiamate anche fuori dall'app, per esempio con Postman. Per questo una route admin usa sia `adminGuard` lato Angular sia `verifyToken` e `verifyAdmin` lato Express.

Riferimento codice: `frontend/src/app/guards/auth.guard.ts`, `backend/routes/roomRoutes.js`.

## Domande avanzate

### 31. Come gestireste la scadenza del token senza costringere l'utente a rifare login ogni 24 ore?

Risposta ideale:

Introdurrei una strategia access token + refresh token. L'access token avrebbe vita breve, per esempio 15 minuti, mentre il refresh token sarebbe piu lungo, salvato in cookie HttpOnly/Secure e ruotato a ogni uso. Il backend dovrebbe avere una tabella per refresh token validi/revocati, cosi si puo fare logout reale e revoca in caso di furto.

Riferimento codice attuale: `backend/controllers/authController.js` genera un solo JWT con `expiresIn: '24h'`; `frontend/src/app/services/auth.service.ts` lo salva in `localStorage`.

### 32. Quali rischi ha salvare JWT in localStorage?

Risposta ideale:

Il rischio principale e XSS: se uno script malevolo viene eseguito nella pagina, puo leggere `localStorage` e rubare il token. Il vantaggio e la semplicita, ma in produzione preferirei cookie HttpOnly/Secure oppure almeno CSP forte, sanitizzazione rigorosa e token a vita breve. Nel nostro progetto e accettabile per demo, ma va dichiarato come limite.

Riferimento codice: `frontend/src/app/services/auth.service.ts`.

### 33. Se doveste scalare a 10.000 utenti, cosa cambiereste?

Risposta ideale:

Valuterei PostgreSQL o MySQL al posto di SQLite, migrazioni strutturate, connection pooling, logging centralizzato, deployment separato frontend/backend, storage immagini su object storage e CDN. Aggiungerei refresh token, monitoraggio, backup, test end-to-end e pipeline CI/CD. Per le prenotazioni servirebbero transazioni robuste e vincoli/lock piu adatti a concorrenza alta.

Riferimento codice attuale: `backend/database.js`, `backend/services/roomImageService.js`, `backend/models/bookingModel.js`.

### 34. Cosa sono le SQL injection e come le avete prevenute?

Risposta ideale:

Una SQL injection avviene quando input utente viene concatenato in una query e interpretato come SQL. Noi usiamo placeholder `?`, quindi input e query restano separati. Bisogna pero restare attenti nei punti in cui si costruiscono dinamicamente liste di placeholder, come `IN (...)`: nel nostro codice gli id vengono convertiti e validati prima.

Riferimento codice: `backend/models/userModel.js`, `backend/models/roomModel.js`.

### 35. Come garantite che una recensione sia scritta solo da chi ha soggiornato?

Risposta ideale:

Il backend non si fida del frontend. Quando arriva `POST /reviews/bookings/:bookingId`, prende l'utente dal token e cerca la prenotazione con `getByIdForUser(bookingId, utenteId)`. Poi controlla che sia confermata, che il soggiorno sia finito e che non esista gia una recensione per quella prenotazione.

Riferimento codice: `backend/controllers/reviewController.js`, `backend/models/bookingModel.js`, `backend/models/reviewModel.js`.

### 36. Che problemi ci sono nel salvare immagini su filesystem locale?

Risposta ideale:

In locale e semplice, ma in produzione crea problemi: backup, deployment su piu istanze, persistenza in container, spazio disco e CDN. Se il backend scalasse su piu server, un'immagine caricata su un'istanza potrebbe non esistere sulle altre. La soluzione sarebbe usare object storage come S3 compatibile e servire asset tramite CDN.

Riferimento codice attuale: `backend/services/roomImageService.js`, `backend/app.js`.

### 37. Perche il reset password salva l'hash del token e non il token?

Risposta ideale:

Perche il token di reset e una credenziale temporanea: chi lo possiede puo cambiare password. Salvando solo hash SHA-256, se qualcuno legge il database non ottiene direttamente token utilizzabili. Quando l'utente invia il token, il backend lo hasha e cerca l'hash corrispondente non scaduto e non usato.

Riferimento codice: `backend/controllers/authController.js`, funzione `hashResetToken`; `backend/models/passwordResetModel.js`.

### 38. Come gestite concorrenza e consistenza nelle camere?

Risposta ideale:

`RoomModel` usa una coda interna per mutazioni e transazioni `BEGIN IMMEDIATE`, `COMMIT`, `ROLLBACK`. Questo evita che create/update/delete camere e immagini si intreccino lasciando dati incoerenti. Inoltre il controller prova a pulire file se una parte del salvataggio fallisce.

Riferimento codice: `backend/models/roomModel.js`, `backend/controllers/roomController.js`.

### 39. Quali limiti ha il vostro sistema di autorizzazione?

Risposta ideale:

Il sistema e chiaro per due ruoli, `user` e `admin`, ma e semplice. Se in futuro servissero permessi granulari, per esempio receptionist, proprietario, staff pulizie, servirebbe un modello RBAC piu completo o permessi per azione. Inoltre il ruolo e nel JWT: se il ruolo cambia nel DB, un token gia emesso resta valido fino alla scadenza con il vecchio ruolo.

Riferimento codice: `backend/middleware/authMiddleware.js`, `backend/controllers/authController.js`.

### 40. Cosa cambierebbe passando da SQLite a PostgreSQL?

Risposta ideale:

Dovremmo cambiare driver, gestione connessioni, sintassi di alcune query e probabilmente introdurre migrazioni. PostgreSQL offrirebbe concorrenza migliore, tipi piu ricchi, vincoli avanzati, indici potenti e deployment piu adatto alla produzione. In cambio richiederebbe installazione/configurazione server, backup e gestione credenziali piu strutturata.

Riferimento codice attuale: `backend/database.js`, `backend/models/*.js`.

### 41. Il frontend usa sempre `environment.apiUrl`?

Risposta ideale:

Non sempre. `RoomService` e `HomePage` usano `environment.apiUrl`, mentre altri service come `AuthService`, `BookingService`, `ReviewService`, `PaymentService` e `UserService` hanno `http://localhost:3000` hardcoded. Funziona in locale, ma come miglioramento centralizzerei tutti gli URL in `environment` o in un service/config unico.

Riferimento codice: `frontend/src/app/services/room.service.ts`, `frontend/src/app/services/auth.service.ts`, `frontend/src/environments/environment.ts`.

### 42. Perche il backend deve validare anche se il frontend valida gia?

Risposta ideale:

Perche la validazione frontend e aggirabile: un utente puo modificare il browser, disabilitare JavaScript o chiamare API direttamente. Il backend e l'unico punto affidabile per proteggere dati e regole. Nel nostro progetto quasi tutti i controlli importanti sono ripetuti lato server: date, ruolo, proprieta, upload, recensioni, pagamento demo.

Riferimento codice: `frontend/src/app/pages/prenota/prenota.page.ts`, `backend/controllers/bookingController.js`, `backend/controllers/reviewController.js`, `backend/middleware/authValidation.js`.

### 43. Qual e la differenza tra autenticazione e autorizzazione nel vostro progetto?

Risposta ideale:

Autenticazione significa verificare l'identita: nel nostro caso controllare il JWT con `verifyToken`. Autorizzazione significa decidere cosa puo fare quell'identita: `verifyAdmin` e `verifyUser` controllano il ruolo. Inoltre alcuni controller fanno autorizzazione per proprieta, per esempio prenotazioni e recensioni dell'utente loggato.

Riferimento codice: `backend/middleware/authMiddleware.js`, `backend/controllers/bookingController.js`, `backend/controllers/reviewController.js`.

### 44. Come evitate open redirect dopo il login?

Risposta ideale:

Quando un guest prova ad accedere a `/prenota`, viene mandato a login con `returnUrl`. Un parametro di redirect puo essere pericoloso se consente URL esterni. Per questo `getSafeInternalReturnUrl()` accetta solo URL interni, rifiuta `//`, caratteri di controllo e origin diversi.

Riferimento codice: `frontend/src/app/utils/return-url.ts`, `frontend/src/app/pages/auth/login/login.page.ts`.

### 45. Come spieghereste la "difesa in profondita" nel progetto?

Risposta ideale:

Difesa in profondita significa non affidarsi a un solo controllo. In BnBHub abbiamo guard frontend, middleware backend, validazione input, query parametrizzate, bcrypt, JWT firmati, rate limiting, CORS, Helmet, upload controllato e conversione immagini, ownership sulle risorse e token reset monouso. Se un livello viene aggirato, altri livelli continuano a proteggere il sistema.

Riferimento codice: `frontend/src/app/guards/auth.guard.ts`, `backend/middleware/authMiddleware.js`, `backend/middleware/authValidation.js`, `backend/app.js`, `backend/services/roomImageService.js`.

---

# Mini checklist finale prima dell'orale

- Sapere disegnare l'architettura: Angular/Ionic -> Express REST -> SQLite.
- Sapere spiegare JWT: header, payload, firma, scadenza, limiti.
- Sapere spiegare bcrypt: hash, salt, cost factor.
- Sapere spiegare le relazioni DB: users, rooms, room_images, bookings, reviews.
- Sapere spiegare perche l'utente della prenotazione viene dal token.
- Sapere spiegare perche guard frontend e middleware backend servono entrambi.
- Sapere spiegare disponibilita camere e overlap date.
- Sapere spiegare upload immagini: FormData, multer, sharp, WebP, filesystem.
- Sapere spiegare recensioni moderate e privacy cognome.
- Sapere citare almeno un file reale per ogni risposta.
- Sapere dichiarare limiti e miglioramenti: SQLite, localStorage, pagamento demo, file storage locale, API URL hardcoded.

Frase jolly utile:

"Nel progetto abbiamo scelto soluzioni proporzionate a una web app universitaria: abbastanza semplici da mantenere e presentare, ma con attenzione a sicurezza, separazione dei livelli e coerenza dei dati. Per produzione reale rafforzeremmo database, gestione token, storage immagini, configurazione ambienti e pipeline di deploy."
