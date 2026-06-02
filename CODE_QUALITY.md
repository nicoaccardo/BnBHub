# BnBHub — Code Quality Guidelines
> Documento di riferimento per la pulizia, il refactoring e la qualità del codice. Usare questo file come checklist prima di ogni commit e come contesto per Codex quando si interviene sul codice esistente.

---

## 1. Principi fondamentali

### 1.1 Regole assolute
- ❌ Mai codice commentato lasciato nel file — se non serve, va eliminato
- ❌ Mai `console.log` in produzione — solo per debug temporaneo
- ❌ Mai variabili dichiarate e mai usate
- ❌ Mai import dichiarati e mai usati
- ❌ Mai funzioni duplicate — se la stessa logica appare due volte, va estratta
- ❌ Mai `any` in TypeScript se il tipo è deducibile
- ❌ Mai logica di business nell'HTML — solo nel `.ts`
- ❌ Mai chiamate HTTP dirette nei componenti — sempre tramite Service
- ❌ Mai dati hardcoded nel codice — usare variabili o costanti nominate
- ✅ Ogni funzione fa una sola cosa
- ✅ I nomi di variabili e funzioni descrivono chiaramente il loro scopo
- ✅ Il codice si legge come prosa — non serve un commento per capirlo

---

## 2. Struttura del progetto

### 2.1 Struttura attesa del frontend
```
frontend/src/app/
├── guards/
│   └── auth.guard.ts
├── pages/
│   ├── home/
│   │   ├── home.page.ts
│   │   ├── home.page.html
│   │   └── home.page.scss
│   ├── auth/
│   │   ├── login/
│   │   └── register/
│   └── admin/
│       ├── dashboard/
│       ├── gestione-camere/
│       ├── gestione-prenotazioni/
│       └── gestione-utenti/
├── services/
│   ├── auth.service.ts
│   ├── room.service.ts
│   └── booking.service.ts
└── app.routes.ts
```

### 2.2 Struttura attesa del backend
```
backend/
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── roomController.js
│   └── bookingController.js
├── middleware/
│   └── authMiddleware.js
├── models/
│   ├── userModel.js
│   ├── roomModel.js
│   └── bookingModel.js
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── roomRoutes.js
│   └── bookingRoutes.js
├── services/
│   └── emailService.js
├── .env                ← NON su Git
├── database.js
└── server.js
```

### 2.3 Regole di struttura
- Un file per componente — mai due componenti nello stesso file
- I file `.spec.ts` generati automaticamente da Angular e non usati vanno eliminati
- La cartella `folder/` generata dal template Ionic va eliminata se non usata
- I file di esempio generati dal template vanno rimossi

---

## 3. Angular / TypeScript — regole specifiche

### 3.1 Componenti Standalone (obbligatorio)
```typescript
// ✅ CORRETTO — Standalone con imports singoli
@Component({
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, CommonModule]
})

// ❌ SBAGLIATO — IonicModule è deprecato con Standalone
@Component({
  standalone: true,
  imports: [IonicModule]
})
```

### 3.2 Sintassi template Angular 17+
```html
<!-- ✅ CORRETTO -->
@if (condizione) { <div>...</div> }
@for (item of lista; track item.id) { <div>...</div> }

<!-- ❌ SBAGLIATO — deprecato in Angular 17+ -->
<div *ngIf="condizione">...</div>
<div *ngFor="let item of lista">...</div>
```

### 3.3 Tipizzazione TypeScript
```typescript
// ✅ CORRETTO — tipo esplicito
camere: Camera[] = [];
caricamento: boolean = false;

interface Camera {
  id: number;
  nome: string;
  tipo: string;
  prezzo: number;
  disponibile: number;
}

// ❌ SBAGLIATO — any generico
camere: any[] = [];
caricamento: any = false;
```

### 3.4 Chiamate HTTP — pattern corretto
```typescript
// ✅ CORRETTO — chiamata nel Service, gestione nel Componente
// service:
getAll(): Observable<Camera[]> {
  return this.http.get<Camera[]>(this.apiUrl);
}

// componente:
ngOnInit() {
  this.roomService.getAll().subscribe({
    next: (camere) => {
      this.camere = camere;
      this.caricamento = false;
    },
    error: (err) => {
      console.error(err);
      this.caricamento = false;
    }
  });
}

// ❌ SBAGLIATO — chiamata HTTP diretta nel componente
ngOnInit() {
  this.http.get('http://localhost:3000/rooms').subscribe(...)
}
```

### 3.5 Gestione della sottoscrizione (memory leak)
```typescript
// ✅ CORRETTO — unsubscribe nel destroy
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

private destroy$ = new Subject<void>();

ngOnInit() {
  this.roomService.getAll()
    .pipe(takeUntil(this.destroy$))
    .subscribe({ next: (camere) => this.camere = camere });
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

### 3.6 Import Angular da usare — riferimento rapido
```typescript
// Componenti Ionic più usati
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonListHeader, IonItem, IonLabel,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonButton, IonButtons, IonBackButton, IonMenuButton,
  IonGrid, IonRow, IonCol,
  IonInput, IonSelect, IonSelectOption, IonTextarea, IonCheckbox,
  IonIcon, IonBadge, IonChip,
  IonSpinner, IonSkeletonText,
  IonToast, IonAlert, IonModal,
  IonRefresher, IonRefresherContent,
  IonInfiniteScroll, IonInfiniteScrollContent,
  IonFab, IonFabButton,
  IonSearchbar, IonSegment, IonSegmentButton,
  IonText, IonNote,
  IonMenuToggle, IonMenu, IonSplitPane, IonApp, IonRouterOutlet, IonRouterLink
} from '@ionic/angular/standalone';

// Angular core
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

// RxJS
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
```

---

## 4. Node.js / Express — regole specifiche

### 4.1 Struttura controller — pattern standard
```javascript
// ✅ CORRETTO — gestione errori uniforme
const NomeController = {
  metodo: (req, res) => {
    NomeModel.query((err, result) => {
      if (err) return res.status(500).json({ errore: err.message });
      if (!result) return res.status(404).json({ errore: 'Risorsa non trovata' });
      res.json(result);
    });
  }
};

// ❌ SBAGLIATO — errori non gestiti
const NomeController = {
  metodo: (req, res) => {
    NomeModel.query((err, result) => {
      res.json(result); // se err esiste, crasha
    });
  }
};
```

### 4.2 Codici HTTP da usare
```
200 OK              → GET riuscito
201 Created         → POST riuscito (risorsa creata)
400 Bad Request     → dati mancanti o non validi
401 Unauthorized    → token mancante
403 Forbidden       → token valido ma permessi insufficienti
404 Not Found       → risorsa non trovata
500 Internal Error  → errore generico del server
```

### 4.3 Variabili d'ambiente — mai hardcoded
```javascript
// ✅ CORRETTO
const SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 3000;

// ❌ SBAGLIATO
const SECRET = 'chiave_segreta_bnb';
const PORT = 3000;
```

### 4.4 Validazione input nel backend
```javascript
// ✅ CORRETTO — validare sempre i dati in arrivo
create: (req, res) => {
  const { nome, email, password } = req.body;
  if (!nome || !email || !password) {
    return res.status(400).json({ errore: 'Tutti i campi sono obbligatori' });
  }
  // procedi
}

// ❌ SBAGLIATO — usare i dati senza validarli
create: (req, res) => {
  UserModel.create(req.body, callback);
}
```

### 4.5 Require — ordine standard in ogni file
```javascript
// 1. Moduli Node.js nativi
const path = require('path');
const crypto = require('crypto');

// 2. Dipendenze npm
const express = require('express');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// 3. File locali del progetto
const db = require('../database');
const UserModel = require('../models/userModel');
```

---

## 5. Naming conventions

### 5.1 Regole generali

| Contesto | Convenzione | Esempio |
|---|---|---|
| Variabili e funzioni JS/TS | camelCase | `getUserById`, `totaleCamere` |
| Classi e interfacce TS | PascalCase | `UserController`, `Camera` |
| Costanti | UPPER_SNAKE_CASE | `JWT_SECRET`, `MAX_RETRY` |
| File componenti Angular | kebab-case | `home.page.ts`, `auth.guard.ts` |
| File backend | camelCase | `userController.js`, `authMiddleware.js` |
| Classi CSS | kebab-case | `.hero-section`, `.card-camera` |
| Variabili CSS | `--prefisso-nome` | `--bnb-terracotta`, `--bnb-spazio-4` |
| Route API | kebab-case, plurale | `/auth/login`, `/rooms`, `/bookings` |
| Tabelle database | snake_case, plurale | `users`, `rooms`, `bookings` |
| Colonne database | snake_case | `codice_fiscale`, `data_inizio` |

### 5.2 Nomi che descrivono l'intenzione
```typescript
// ✅ CORRETTO — il nome dice cosa fa/contiene
const prenotazioniInAttesa = prenotazioni.filter(p => p.stato === 'in attesa');
function calcolaNotti(dataInizio: string, dataFine: string): number { ... }
isLoggedIn(): boolean { ... }

// ❌ SBAGLIATO — nomi generici o abbreviati
const data = prenotazioni.filter(p => p.stato === 'in attesa');
function calc(d1: string, d2: string): number { ... }
check(): boolean { ... }
```

---

## 6. Pulizia codice — checklist operativa

### 6.1 Per ogni file `.ts` del frontend
- [ ] Nessun `IonicModule` negli imports — solo componenti singoli
- [ ] Nessun `*ngIf` o `*ngFor` — solo `@if` e `@for`
- [ ] Nessun `any` dove il tipo è deducibile
- [ ] Nessun `console.log` rimasto
- [ ] Tutti gli import dichiarati sono effettivamente usati
- [ ] Nessuna variabile dichiarata e mai usata
- [ ] Le chiamate HTTP passano sempre dal Service
- [ ] Stato di caricamento gestito (`caricamento = true/false`)
- [ ] Stato vuoto gestito (cosa mostrare se l'array è vuoto)
- [ ] Errori delle chiamate API gestiti e mostrati all'utente

### 6.2 Per ogni file `.html` del frontend
- [ ] Nessun testo hardcoded che dovrebbe venire da una variabile
- [ ] Nessuna logica complessa nell'HTML — solo riferimenti a variabili del `.ts`
- [ ] Tutti i `routerLink` puntano a route esistenti in `app.routes.ts`
- [ ] Le immagini hanno `alt` descrittivo
- [ ] I pulsanti hanno testo descrittivo o `aria-label`
- [ ] Usato `@if` invece di `*ngIf`
- [ ] Usato `@for` con `track` invece di `*ngFor`

### 6.3 Per ogni file `.js` del backend
- [ ] Nessun `console.log` rimasto (solo `console.error` per gli errori)
- [ ] Tutti i require dichiarati sono usati
- [ ] Validazione input presente nei controller
- [ ] Tutti i casi di errore restituiscono codice HTTP corretto
- [ ] Nessuna variabile d'ambiente hardcoded nel codice
- [ ] Le query SQL usano i placeholder `?` e mai concatenazione di stringhe

### 6.4 Pulizia file non necessari
Eliminare questi file se presenti:
```
frontend/src/app/folder/          ← cartella template Ionic non usata
frontend/src/app/**/*.spec.ts     ← file di test non usati
frontend/src/app/home/            ← cartella home generata dal template (se sostituita)
backend/node_modules/             ← non committare mai
frontend/node_modules/            ← non committare mai
**/.DS_Store                      ← file macOS
**/Thumbs.db                      ← file Windows
```

---

## 7. Anti-pattern da eliminare

### 7.1 Frontend Angular

**Import duplicati o inutilizzati:**
```typescript
// ❌ Da eliminare — CommonModule non serve se si usano @if e @for nativi
// In Angular 17+ standalone, @if e @for sono built-in
imports: [CommonModule, IonHeader, ...]

// ✅ Tenerlo solo se si usa pipe async o ngClass
```

**Logica nel template:**
```html
<!-- ❌ Logica nel template — spostare nel .ts -->
<div>{{ prezzo * notti * (1 + tassa / 100) }}</div>

<!-- ✅ Logica nel .ts, risultato nel template -->
<div>{{ prezzoTotale }}</div>
```

**Subscribe annidati:**
```typescript
// ❌ Subscribe annidati — usare switchMap
this.service1.getData().subscribe(data1 => {
  this.service2.getData(data1.id).subscribe(data2 => { ... });
});

// ✅ Usare switchMap
import { switchMap } from 'rxjs/operators';
this.service1.getData().pipe(
  switchMap(data1 => this.service2.getData(data1.id))
).subscribe(data2 => { ... });
```

### 7.2 Backend Node.js

**Query SQL con concatenazione di stringhe:**
```javascript
// ❌ SQL injection risk
db.get(`SELECT * FROM users WHERE email = '${email}'`, callback);

// ✅ Sempre placeholder
db.get('SELECT * FROM users WHERE email = ?', [email], callback);
```

**Callback hell:**
```javascript
// ❌ Callback annidati — estrarre in funzioni separate
UserModel.getByEmail(email, (err, user) => {
  if (user) {
    BookingModel.getByUtente(user.id, (err, bookings) => {
      RoomModel.getById(bookings[0].camera_id, (err, room) => {
        res.json(room);
      });
    });
  }
});

// ✅ Funzioni separate o async/await
```

**Risposta senza return:**
```javascript
// ❌ Senza return — il codice continua dopo res.json
if (err) res.status(500).json({ errore: err.message });
res.json(result); // viene eseguito anche se c'è errore

// ✅ Con return
if (err) return res.status(500).json({ errore: err.message });
res.json(result);
```

---

## 8. Commenti nel codice

### 8.1 Quando commentare
```typescript
// ✅ Commentare il PERCHÉ, non il COSA
// Il timeout è necessario perché Leaflet richiede che il DOM sia già renderizzato
setTimeout(() => this.initMap(), 500);

// ❌ Non commentare il COSA — si vede dal codice
// Imposta il valore di caricamento a true
this.caricamento = true;
```

### 8.2 Commenti di sezione (accettabili)
```typescript
// ─── Inizializzazione ────────────────────────────────────────
ngOnInit() { ... }

// ─── Chiamate API ─────────────────────────────────────────────
caricaCamere() { ... }

// ─── Gestione form ───────────────────────────────────────────
onSubmit() { ... }
```

### 8.3 TODO accettabili
```typescript
// TODO: aggiungere paginazione quando le camere superano 20
// TODO: implementare cache locale per le camere disponibili
// FIXME: il filtro per tipo non funziona con camere multiple dello stesso tipo
```

---

## 9. Sicurezza — controlli obbligatori

### 9.1 Frontend
- Il token JWT non viene mai loggato in console
- I dati sensibili (password, CF) non vengono mai salvati in `localStorage` — solo il token
- Le route admin controllano sempre il ruolo dell'utente lato frontend (Guard) E lato backend (middleware)

### 9.2 Backend
- Le password non vengono mai restituite nelle response API (rimuoverle sempre dalla query o dalla risposta)
- Il `JWT_SECRET` è sempre nel `.env`, mai nel codice
- Le query SQL usano sempre i placeholder `?`
- Il middleware `verifyToken` è applicato a tutte le route che richiedono autenticazione
- Il middleware `verifyAdmin` è applicato a tutte le route che richiedono ruolo admin

```javascript
// ✅ Rimuovere la password dalla risposta
getAll: (req, res) => {
  UserModel.getAll((err, rows) => {
    if (err) return res.status(500).json({ errore: err.message });
    // Rimuove la password da ogni utente prima di inviare la risposta
    const utenti = rows.map(({ password, ...utente }) => utente);
    res.json(utenti);
  });
}
```

---

## 10. Come usare questo file con Codex

### 10.1 Prompt per pulizia generale
```
Leggi CODE_QUALITY.md nella root del progetto.
Analizza [nome file] e:
1. Rimuovi tutti gli import non utilizzati
2. Sostituisci *ngIf/*ngFor con @if/@for
3. Sostituisci IonicModule con i componenti singoli
4. Rimuovi console.log non necessari
5. Aggiungi return mancanti nelle risposte di errore
Mostrami le modifiche prima di applicarle.
```

### 10.2 Prompt per refactoring
```
Leggi CODE_QUALITY.md nella root del progetto.
In [nome file] ho questa logica duplicata: [descrivi].
Estraila in una funzione/metodo riusabile seguendo le convenzioni del documento.
```

### 10.3 Prompt per review
```
Leggi CODE_QUALITY.md nella root del progetto.
Fai una review di [nome file] e segnalami tutti i problemi
rispetto alle linee guida, senza modificare nulla.
Organizza i problemi per priorità: critico, importante, minore.
```

---

*BnBHub Code Quality Guidelines v1.0 — Corso Programmazione Web e Mobile*