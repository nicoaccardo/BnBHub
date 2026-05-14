# BnBHub

Applicazione per la gestione di un B&B, sviluppata con Ionic + Angular (frontend) e Node + Express (backend).

## Requisiti

- Node.js >= 18
- Ionic CLI: `npm install -g @ionic/cli`

## Setup iniziale

Dopo aver clonato il repo, installa le dipendenze sia per il frontend che per il backend:

```bash
cd frontend
npm install

cd ../backend
npm install
```

> ⚠️ La cartella `node_modules` non è inclusa nel repo. Va generata in locale con `npm install`.

## Avviare il frontend

```bash
cd frontend
ionic serve
```

Il browser si aprirà automaticamente su `http://localhost:8100`.

## Avviare il backend

```bash
cd backend
npm run dev
```

Il server partirà su `http://localhost:3000`.

## Flusso Git

- Lavora sempre sul tuo branch personale
- Quando hai finito una feature, apri una **Pull Request** verso `dev`
- Solo codice stabile e approvato viene mergiato su `main`
