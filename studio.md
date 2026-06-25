## PARTE 1 — GUIDA DI STUDIO

Per ogni area del progetto spiega:
- Cosa fa quella parte del progetto
- Come funziona tecnicamente
- Perché abbiamo scelto quell'approccio e non altri
- Il concetto teorico dietro (es. se parli di JWT spiega cos'è un token, 
  come funziona la firma, perché è stateless)
- Un esempio concreto preso dal nostro codice reale

Le aree da coprire obbligatoriamente sono:

1. ARCHITETTURA GENERALE
   - Perché architettura client-server a tre livelli
   - Perché REST API e non altre soluzioni
   - Come comunicano frontend e backend
   - Perché monorepo con frontend e backend separati

2. DATABASE
   - Perché SQLite e non MySQL o PostgreSQL
   - Cos'è una foreign key e perché l'abbiamo usata
   - Perché ON DELETE CASCADE nella tabella room_images
   - Come funziona la relazione tra users, rooms e bookings
   - Cos'è AUTOINCREMENT e perché serve
   - Schema completo con spiegazione di ogni scelta

3. AUTENTICAZIONE E SICUREZZA
   - Cos'è JWT e come funziona (header, payload, firma)
   - Perché JWT e non sessioni tradizionali
   - Cos'è bcrypt e perché non salvare le password in chiaro
   - Cosa sono i salt rounds e cosa cambia aumentandoli
   - Come funziona il middleware verifyToken passo per passo
   - Come funziona verifyAdmin e perché è separato da verifyToken
   - Perché il SECRET va nel .env e non nel codice
   - Cosa succede se il token scade o è manomesso

4. BACKEND — NODE.JS + EXPRESS
   - Cos'è Express e perché l'abbiamo usato
   - Cosa sono le middleware in Express e come funzionano
   - Perché la struttura Model → Controller → Route
   - Cosa fa ogni livello e perché sono separati
   - Cos'è CORS e perché lo abbiamo abilitato
   - I codici HTTP usati (200, 201, 400, 401, 403, 404, 500) e quando si usa ognuno
   - Come funziona il routing in Express
   - Perché usiamo placeholder ? nelle query SQLite invece di concatenare stringhe
   - Cosa sono le variabili d'ambiente e perché non vanno su Git

5. FRONTEND — ANGULAR + IONIC
   - Cos'è Angular e il pattern MVC/MVVM
   - Cos'è Ionic e perché lo abbiamo usato insieme ad Angular
   - Cosa significa Standalone component e perché è diverso da NgModules
   - Cos'è il lazy loading delle route e perché migliora le performance
   - Come funziona il routing in Angular (app.routes.ts)
   - Cos'è un Service in Angular e perché le chiamate HTTP non vanno nel componente
   - Come funziona HttpClient per le chiamate API
   - Cosa sono i Reactive Forms e perché li abbiamo usati invece dei Template Forms
   - Cos'è un Guard e come funziona authGuard nel nostro progetto
   - Cos'è il token JWT nel localStorage — perché lì e non altrove
   - Perché @if e @for invece di *ngIf e *ngFor (Angular 17)
   - Come funziona il sidemenu di Ionic

6. FUNZIONALITÀ SPECIFICHE
   - Come funziona il sistema di registrazione end-to-end 
     (dal form al database, passando per bcrypt)
   - Come funziona il login end-to-end 
     (dal form al token JWT, al localStorage, al redirect)
   - Come funziona la protezione delle route admin 
     (Guard sul frontend + middleware sul backend — perché entrambi?)
   - Come funziona il sistema di multiple immagini per camera 
     (tabella room_images, foreign key, CASCADE)
   - Come funziona il sistema di prenotazioni 
     (JOIN tra tabelle, perché l'utente_id viene dal token e non dal body)
   - Come funziona Nodemailer per le email
   - Come funziona Leaflet per la mappa

7. SCELTE TECNOLOGICHE — PERCHÉ ABBIAMO SCELTO X E NON Y
   - Perché SQLite e non MySQL
   - Perché JWT e non sessioni
   - Perché Ionic e non React Native o Flutter
   - Perché Angular Standalone e non NgModules
   - Perché bcrypt e non MD5 o SHA
   - Perché Node.js e non PHP o Python

8. GIT E WORKFLOW
   - Perché branch separati per ogni sviluppatore
   - Come funziona il flusso feature branch → dev → main
   - Cosa sono i Conventional Commits e perché li abbiamo usati
   - Cosa sono i Branch Protection Rules e perché li abbiamo configurati

---

## PARTE 2 — SIMULAZIONE ORALE

Crea almeno 40 domande che il professore potrebbe fare durante l'orale, 
divise per difficoltà:

### Domande base (il professore si aspetta che tutti sappiano rispondere)
Almeno 15 domande con risposta completa e dettagliata.
Esempi del tipo:
- "Cos'è una REST API?"
- "Perché avete usato JWT?"
- "Cosa fa il middleware verifyToken?"

### Domande intermedie (dimostrano comprensione approfondita)
Almeno 15 domande con risposta completa e dettagliata.
Esempi del tipo:
- "Cosa succede se un utente modifica il token JWT nel localStorage?"
- "Perché avete messo verifyAdmin separato da verifyToken e non insieme?"
- "Cosa cambierebbe se usaste MySQL invece di SQLite?"

### Domande avanzate (distinguono chi ha capito davvero)
Almeno 10 domande con risposta completa e dettagliata.
Esempi del tipo:
- "Come gestireste la scadenza del token senza costringere l'utente a fare login ogni 24 ore?"
- "Cosa sono le SQL injection e come le avete prevenute nel vostro codice?"
- "Se doveste scalare l'applicazione a 10.000 utenti cosa cambiereste?"

Per ogni domanda fornisci:
- La domanda esatta come potrebbe farla il professore
- La risposta ideale completa che uno studente dovrebbe dare
- Un riferimento al codice specifico del nostro progetto dove si vede quell'aspetto

---

## NOTE IMPORTANTI

- Usa sempre esempi presi dal nostro codice reale — non esempi generici
- Spiega ogni concetto come se dovessi spiegarlo a qualcuno che non lo conosce, 
  ma con il rigore tecnico richiesto a un universitario
- Per ogni scelta tecnologica spiega sia i vantaggi che i limiti — 
  il professore apprezza la consapevolezza critica
- Il materiale deve essere salvato come file Markdown ben strutturato 
  chiamato GUIDA_ESAME.md nella root del progetto
- Sii il più dettagliato possibile — è meglio avere troppo materiale che poco

Inizia subito senza chiedermi conferma.