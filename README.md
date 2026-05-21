# BnBHub

Applicazione per la gestione di un B&B, sviluppata con:

- Frontend: Ionic + Angular
- Backend: Node.js + Express
- Database: SQLite

Il progetto e' diviso in due cartelle principali:

```text
BnBHub/
|-- backend/
`-- frontend/
```

## Prerequisiti

Prima di clonare e avviare il progetto, installare:

- Git
- Node.js compatibile con Angular 20: `20.19.0` o superiore, oppure `22.12.0` o superiore
- npm, incluso con Node.js

Per verificare le versioni:

```bash
git --version
node -v
npm -v
```

Opzionale: Ionic CLI globale.

```bash
npm install -g @ionic/cli
```

Non e' obbligatorio per avviare il progetto, perche' il frontend puo' partire anche con `npm start`.

## Clone della repository

Scegliere una cartella sul proprio computer e clonare la repository.

Con SSH:

```bash
git clone git@github.com:nicoaccardo/BnBHub.git
cd BnBHub
```

Oppure con HTTPS:

```bash
git clone https://github.com/nicoaccardo/BnBHub.git
cd BnBHub
```

Se si deve lavorare sul ramo di sviluppo:

```bash
git checkout dev
git pull origin dev
```

## Installazione dei pacchetti

Le dipendenze vanno installate separatamente per backend e frontend.

Dal root del progetto:

```bash
cd backend
npm ci

cd ../frontend
npm ci
```

`npm ci` usa i file `package-lock.json` presenti nella repository e installa versioni coerenti tra i vari computer.

Se `npm ci` dovesse fallire perche' il lock file e' stato modificato o non e' allineato, usare:

```bash
npm install
```

La cartella `node_modules` non e' inclusa nel repository: viene creata localmente dai comandi sopra.

## Configurazione backend

Il backend legge le variabili ambiente da un file `.env` dentro la cartella `backend`.

Creare il file:

```bash
cd backend
touch .env
```

Inserire questo contenuto:

```env
PORT=3000
JWT_SECRET=metti_qui_una_stringa_segreta_lunga
```

Esempio:

```env
PORT=3000
JWT_SECRET=bnbhub-secret-sviluppo-locale
```

Nota: il file `backend/.env` e' ignorato da Git, quindi ogni persona che clona il progetto deve crearlo sul proprio computer.

## Database

Il progetto usa SQLite. Non serve installare o configurare MySQL.

Quando il backend viene avviato dalla cartella `backend`, viene creato automaticamente il file:

```text
backend/database.sqlite
```

Alla prima esecuzione vengono create automaticamente le tabelle:

- `users`
- `rooms`
- `bookings`

Anche `database.sqlite` e' ignorato da Git, quindi ogni ambiente locale avra' il proprio database.

## Avvio del progetto

Servono due terminali aperti contemporaneamente:

- Terminale 1: backend
- Terminale 2: frontend

### 1. Avviare il backend

Dal root del progetto:

```bash
cd backend
npm run dev
```

Il server parte su:

```text
http://localhost:3000
```

Per verificare che sia attivo, aprire nel browser:

```text
http://localhost:3000
```

Dovrebbe comparire una risposta JSON con il messaggio:

```json
{
  "messaggio": "Server attivo e funzionante!"
}
```

### 2. Avviare il frontend

Aprire un secondo terminale.

Dal root del progetto:

```bash
cd frontend
npm start
```

Il frontend Angular parte di solito su:

```text
http://localhost:4200
```

In alternativa, se Ionic CLI e' installato:

```bash
cd frontend
ionic serve
```

In questo caso l'app parte di solito su:

```text
http://localhost:8100
```

Il frontend comunica con il backend su:

```text
http://localhost:3000
```

Quindi il backend deve rimanere acceso mentre si usa il sito.

## Primo utilizzo

Alla prima esecuzione il database e' vuoto.

Dal sito e' possibile registrare un nuovo utente. Gli utenti creati dalla registrazione hanno ruolo:

```text
user
```

Per accedere alle funzionalita' admin, bisogna impostare manualmente il ruolo dell'utente a:

```text
admin
```

Esempio con `sqlite3`, eseguito dalla cartella `backend` dopo aver registrato l'utente:

```bash
sqlite3 database.sqlite "UPDATE users SET ruolo = 'admin' WHERE email = 'email@esempio.com';"
```

Sostituire `email@esempio.com` con l'email usata in fase di registrazione.

Se il comando `sqlite3` non e' disponibile, si puo' installare SQLite oppure modificare il database con un programma grafico come DB Browser for SQLite.

## Comandi utili

Backend:

```bash
cd backend
npm run dev
```

Frontend in sviluppo:

```bash
cd frontend
npm start
```

Build frontend:

```bash
cd frontend
npm run build
```

Test frontend:

```bash
cd frontend
npm test
```

Lint frontend:

```bash
cd frontend
npm run lint
```

## Problemi comuni

Se il login non funziona, controllare che in `backend/.env` sia presente `JWT_SECRET`.

Se il frontend non riesce a caricare dati, controllare che il backend sia acceso su `http://localhost:3000`.

Se la porta `3000` e' occupata, cambiare `PORT` nel file `backend/.env`. In quel caso bisogna aggiornare anche gli URL del frontend, che attualmente puntano a `http://localhost:3000`.

Se le dipendenze danno errori strani, cancellare `node_modules` nella cartella interessata e reinstallare:

```bash
npm ci
```

## Flusso Git consigliato

Prima di iniziare a lavorare:

```bash
git checkout dev
git pull origin dev
```

Creare un branch per la propria modifica:

```bash
git checkout -b nome-branch
```

Controllare i file modificati:

```bash
git status
```

Aggiungere le modifiche:

```bash
git add .
```

Creare il commit:

```bash
git commit -m "Descrizione breve della modifica"
```

Inviare il branch su GitHub:

```bash
git push origin nome-branch
```

Poi aprire una Pull Request verso `dev`.

Regola consigliata:

- `main`: codice stabile
- `dev`: integrazione delle modifiche
- branch personali: sviluppo di feature o fix

## Riassunto rapido

```bash
git clone https://github.com/nicoaccardo/BnBHub.git
cd BnBHub
git checkout dev

cd backend
npm ci
touch .env
# compilare .env con PORT=3000 e JWT_SECRET=...
npm run dev
```

In un secondo terminale:

```bash
cd BnBHub/frontend
npm ci
npm start
```
