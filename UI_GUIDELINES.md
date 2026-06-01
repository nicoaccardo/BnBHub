# BnBHub — UI/UX Design Guidelines
> Documento di riferimento per lo sviluppo dell'interfaccia. Ogni decisione visiva deve essere coerente con queste linee guida. Leggere integralmente prima di modificare qualsiasi componente.

---

## 1. Principi fondamentali

### 1.1 Filosofia di design
BnBHub è un'applicazione per la prenotazione di un Bed & Breakfast in Sicilia. L'estetica deve evocare **calore mediterraneo, autenticità e fiducia**. Ogni scelta visiva deve rispondere a tre domande:

1. **È chiaro?** — L'utente capisce immediatamente cosa fare
2. **È coerente?** — Usa gli stessi pattern in tutta l'app
3. **È umano?** — Trasmette calore, non freddezza corporate

### 1.2 Regole assolute (non si derogano mai)
- ❌ Mai usare colori al di fuori della palette definita
- ❌ Mai testo su sfondo che non garantisce contrasto sufficiente (rapporto minimo 4.5:1)
- ❌ Mai elementi cliccabili senza feedback visivo (hover, active state)
- ❌ Mai pagine senza stato vuoto gestito (se una lista è vuota, mostrarlo)
- ❌ Mai form senza validazione visiva in tempo reale
- ❌ Mai testo in maiuscolo per paragrafi (solo per label e badge)
- ❌ Mai più di 2 font diversi nella stessa pagina
- ❌ Mai bordi e ombre contemporaneamente sullo stesso elemento
- ✅ Sempre feedback immediato dopo un'azione dell'utente (toast, spinner, messaggio)
- ✅ Sempre stato di caricamento per chiamate API (skeleton o spinner)
- ✅ Sempre messaggio di errore comprensibile (no codici tecnici all'utente)

---

## 2. Palette colori

### 2.1 Colori primari

| Nome | Hex | RGB | Uso |
|---|---|---|---|
| Pietra di Noto | `#F4EFE6` | 244, 239, 230 | Sfondo principale, superfici ampie |
| Terracotta Cruda | `#C18C72` | 193, 140, 114 | Accenti, CTA primari, bordi attivi |
| Blu Abisso | `#1B2E3C` | 27, 46, 60 | Header, footer, testi primari, navbar |

### 2.2 Colori derivati (generati dalla palette, non inventati)

| Nome | Hex | Derivazione | Uso |
|---|---|---|---|
| Pietra Scura | `#E6DDD0` | Pietra -8% luminosità | Sfondo card, sezioni alternate |
| Terracotta Chiara | `#D4A98A` | Terracotta +15% luminosità | Hover state pulsanti terracotta |
| Terracotta Scura | `#A8725A` | Terracotta -15% luminosità | Active state, pressed state |
| Blu Medio | `#2D4A5E` | Blu +20% luminosità | Hover state elementi blu |
| Blu Chiaro | `#F0EEF5` | Blu 5% opacity su bianco | Sfondo sezioni info, badge blu |
| Bianco Puro | `#FFFFFF` | — | Sfondo card, modali, input |
| Testo Secondario | `#6B6055` | Neutro caldo | Didascalie, testo secondario |
| Bordo Sottile | `#DDD5C8` | Pietra -10% luminosità | Separatori, bordi input |

### 2.3 Colori di stato

| Stato | Hex | Uso |
|---|---|---|
| Successo | `#4A7C59` | Conferme, prenotazioni confermate |
| Errore | `#B04A3A` | Errori form, prenotazioni annullate |
| Avviso | `#C4893A` | In attesa di conferma |
| Info | `#2D6A8F` | Informazioni generali |

### 2.4 Variabili CSS da impostare in `variables.scss`

```scss
:root {
  /* Colori primari */
  --bnb-pietra: #F4EFE6;
  --bnb-pietra-scura: #E6DDD0;
  --bnb-terracotta: #C18C72;
  --bnb-terracotta-chiara: #D4A98A;
  --bnb-terracotta-scura: #A8725A;
  --bnb-blu: #1B2E3C;
  --bnb-blu-medio: #2D4A5E;
  --bnb-blu-chiaro: #F0EEF5;

  /* Testo */
  --bnb-testo-primario: #1B2E3C;
  --bnb-testo-secondario: #6B6055;
  --bnb-testo-disabilitato: #A89E94;
  --bnb-testo-su-scuro: #F4EFE6;
  --bnb-testo-su-terracotta: #FFFFFF;

  /* Superfici */
  --bnb-sfondo: #F4EFE6;
  --bnb-sfondo-card: #FFFFFF;
  --bnb-sfondo-sezione: #E6DDD0;
  --bnb-bordo: #DDD5C8;
  --bnb-bordo-attivo: #C18C72;

  /* Stati */
  --bnb-successo: #4A7C59;
  --bnb-errore: #B04A3A;
  --bnb-avviso: #C4893A;
  --bnb-info: #2D6A8F;

  /* Ionic overrides */
  --ion-color-primary: #1B2E3C;
  --ion-color-primary-rgb: 27, 46, 60;
  --ion-color-primary-contrast: #F4EFE6;
  --ion-color-primary-shade: #172838;
  --ion-color-primary-tint: #2D4A5E;

  --ion-color-secondary: #C18C72;
  --ion-color-secondary-rgb: 193, 140, 114;
  --ion-color-secondary-contrast: #FFFFFF;
  --ion-color-secondary-shade: #A8725A;
  --ion-color-secondary-tint: #D4A98A;

  --ion-color-success: #4A7C59;
  --ion-color-warning: #C4893A;
  --ion-color-danger: #B04A3A;

  --ion-background-color: #F4EFE6;
  --ion-text-color: #1B2E3C;
  --ion-card-background: #FFFFFF;
  --ion-item-background: #FFFFFF;
  --ion-toolbar-background: #1B2E3C;
  --ion-toolbar-color: #F4EFE6;
}
```

---

## 3. Tipografia

### 3.1 Font stack
```scss
--bnb-font-titoli: 'Georgia', 'Times New Roman', serif;
--bnb-font-corpo: 'Helvetica Neue', 'Arial', sans-serif;
--bnb-font-mono: 'Courier New', monospace; /* solo per codici prenotazione */
```

### 3.2 Scala tipografica

| Elemento | Font | Dimensione | Peso | Colore | Line-height |
|---|---|---|---|---|---|
| H1 — Titolo hero | Georgia serif | 2.5rem (40px) | 400 | Bianco o Pietra | 1.2 |
| H2 — Titolo sezione | Georgia serif | 1.75rem (28px) | 400 | Blu Abisso | 1.3 |
| H3 — Titolo card | Georgia serif | 1.25rem (20px) | 400 | Blu Abisso | 1.4 |
| Body — Testo normale | Sans-serif | 1rem (16px) | 400 | Testo primario | 1.6 |
| Small — Didascalia | Sans-serif | 0.875rem (14px) | 400 | Testo secondario | 1.5 |
| Label — Etichette form | Sans-serif | 0.875rem (14px) | 500 | Testo primario | 1.4 |
| Badge — Stato | Sans-serif | 0.75rem (12px) | 600 | Variabile | 1 |
| Button — Pulsanti | Sans-serif | 0.9375rem (15px) | 500 | Variabile | 1 |

### 3.3 Regole tipografiche
- I titoli H1 e H2 usano **sempre** Georgia serif per evocare eleganza e calore
- Il corpo testo usa **sempre** sans-serif per massima leggibilità
- Non usare mai peso 700 (bold) per i titoli — il 400 con Georgia è già forte
- La lunghezza ideale di una riga di testo è **60-75 caratteri** — usare `max-width` sui paragrafi
- Non giustificare mai il testo (`text-align: justify` è vietato)

---

## 4. Spacing e layout

### 4.1 Sistema di spacing (multipli di 4px)
```scss
--bnb-space-1: 4px;
--bnb-space-2: 8px;
--bnb-space-3: 12px;
--bnb-space-4: 16px;   /* unità base */
--bnb-space-5: 20px;
--bnb-space-6: 24px;
--bnb-space-8: 32px;
--bnb-space-10: 40px;
--bnb-space-12: 48px;
--bnb-space-16: 64px;
--bnb-space-20: 80px;
```

### 4.2 Padding standard per contesti
- **Padding pagina mobile**: 16px laterale
- **Padding pagina desktop**: 24px laterale, max-width 1200px centrato
- **Padding card**: 20px
- **Padding sezione hero**: 64px verticale, 24px laterale
- **Padding sezione contenuto**: 48px verticale, 24px laterale
- **Gap tra card in griglia**: 16px
- **Margine tra sezioni**: 48px

### 4.3 Breakpoint responsive
```scss
$mobile:  576px;   /* smartphone */
$tablet:  768px;   /* tablet */
$desktop: 1024px;  /* desktop */
$wide:    1280px;  /* schermi larghi */
```

### 4.4 Griglia
- Mobile: 1 colonna
- Tablet: 2 colonne
- Desktop: 3 o 4 colonne secondo il contenuto
- Usare `ion-grid` con `ion-col` e attributi `size`, `size-md`, `size-lg`

---

## 5. Componenti

### 5.1 Pulsanti

**Pulsante primario (CTA principale)** — sfondo Terracotta, testo bianco
```scss
.btn-primary {
  --background: var(--bnb-terracotta);
  --color: #FFFFFF;
  --border-radius: 4px;
  --padding-top: 14px;
  --padding-bottom: 14px;
  font-size: 0.9375rem;
  font-weight: 500;
  letter-spacing: 0.03em;
  text-transform: none; /* mai maiuscolo */
}
.btn-primary:hover { --background: var(--bnb-terracotta-chiara); }
.btn-primary:active { --background: var(--bnb-terracotta-scura); }
```

**Pulsante secondario** — outline Blu Abisso, sfondo trasparente
```scss
.btn-secondary {
  --background: transparent;
  --color: var(--bnb-blu);
  --border-color: var(--bnb-blu);
  --border-width: 1.5px;
  --border-style: solid;
  --border-radius: 4px;
}
```

**Pulsante ghost** — solo testo, nessun bordo o sfondo
```scss
.btn-ghost {
  --background: transparent;
  --color: var(--bnb-terracotta);
  --box-shadow: none;
}
```

**Regole pulsanti:**
- Larghezza minima 120px, mai più stretti
- Mai `text-transform: uppercase` sui pulsanti
- Sempre `border-radius: 4px` — no bordi completamente rotondi sui CTA principali
- Lo spinner di caricamento deve sostituire il testo del pulsante durante le chiamate API, non aggiungersi

### 5.2 Card

```scss
ion-card {
  --background: var(--bnb-sfondo-card);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(27, 46, 60, 0.08);
  border: none; /* mai bordo E ombra insieme */
  overflow: hidden;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

ion-card:hover {
  box-shadow: 0 4px 16px rgba(27, 46, 60, 0.14);
  transform: translateY(-2px);
}

ion-card-header {
  padding: 20px 20px 8px;
}

ion-card-title {
  font-family: var(--bnb-font-titoli);
  font-size: 1.25rem;
  font-weight: 400;
  color: var(--bnb-blu);
}

ion-card-content {
  padding: 8px 20px 20px;
  color: var(--bnb-testo-secondario);
  font-size: 0.9375rem;
  line-height: 1.6;
}
```

**Variante card camera** — aggiunge bordo sinistro in Terracotta
```scss
.card-camera {
  border-left: 3px solid var(--bnb-terracotta);
}
```

**Variante card stat** — per dashboard admin
```scss
.card-stat {
  text-align: center;

  .stat-number {
    font-family: var(--bnb-font-titoli);
    font-size: 3rem;
    font-weight: 400;
    color: var(--bnb-terracotta);
    line-height: 1;
    margin: 8px 0;
  }

  .stat-label {
    font-size: 0.875rem;
    color: var(--bnb-testo-secondario);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
}
```

### 5.3 Form e input

```scss
ion-item {
  --background: var(--bnb-sfondo-card);
  --border-color: var(--bnb-bordo);
  --border-width: 0 0 1.5px 0;
  --highlight-color-focused: var(--bnb-terracotta);
  --padding-start: 0;
  margin-bottom: 8px;
}

ion-input, ion-select, ion-textarea {
  --color: var(--bnb-testo-primario);
  --placeholder-color: var(--bnb-testo-disabilitato);
  font-size: 1rem;
}

/* Label floating */
ion-input[labelPlacement="floating"] {
  --label-color: var(--bnb-testo-secondario);
}
```

**Messaggi di errore validazione:**
```scss
.validation-error {
  color: var(--bnb-errore);
  font-size: 0.8125rem;
  padding: 4px 0 8px;
  display: flex;
  align-items: center;
  gap: 4px;

  &::before {
    content: '⚠';
    font-size: 0.75rem;
  }
}
```

**Regole form:**
- Usare sempre `labelPlacement="floating"` per gli input — mai label statiche sopra
- Mostrare errori di validazione solo dopo che l'utente ha toccato il campo (`touched`)
- Il pulsante di submit si disabilita mentre la chiamata API è in corso
- Aggiungere sempre `autocomplete` agli input email e password

### 5.4 Header e toolbar

```scss
ion-header ion-toolbar {
  --background: var(--bnb-blu);
  --color: var(--bnb-testo-su-scuro);
  --border-width: 0;
  box-shadow: 0 2px 8px rgba(27, 46, 60, 0.2);
}

ion-title {
  font-family: var(--bnb-font-titoli);
  font-size: 1.125rem;
  font-weight: 400;
  letter-spacing: 0.02em;
  color: var(--bnb-testo-su-scuro);
}

ion-back-button {
  --color: var(--bnb-terracotta);
}
```

### 5.5 Badge di stato prenotazione

```scss
.badge-stato {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;

  &.in-attesa {
    background: rgba(196, 137, 58, 0.15);
    color: var(--bnb-avviso);
  }

  &.confermata {
    background: rgba(74, 124, 89, 0.15);
    color: var(--bnb-successo);
  }

  &.annullata {
    background: rgba(176, 74, 58, 0.15);
    color: var(--bnb-errore);
  }
}
```

### 5.6 Sidemenu

```scss
ion-menu {
  --background: var(--bnb-blu);

  ion-list-header {
    color: var(--bnb-terracotta);
    font-family: var(--bnb-font-titoli);
    font-size: 1.25rem;
    font-weight: 400;
    letter-spacing: 0.04em;
    padding: 24px 16px 8px;
  }

  ion-item {
    --background: transparent;
    --color: rgba(244, 239, 230, 0.75);
    --border-color: transparent;
    --ripple-color: rgba(193, 140, 114, 0.2);
    margin: 2px 8px;
    border-radius: 6px;

    ion-icon { color: rgba(244, 239, 230, 0.5); }
    ion-label { font-size: 0.9375rem; }
  }

  ion-item.selected,
  ion-item:hover {
    --background: rgba(193, 140, 114, 0.15);
    --color: var(--bnb-pietra);
    ion-icon { color: var(--bnb-terracotta); }
  }
}
```

### 5.7 Toast e notifiche

**Sempre usare toast per feedback dopo azioni.** Configurazione standard:
```typescript
// Successo
{
  message: 'Prenotazione confermata con successo',
  duration: 3000,
  color: 'success',
  position: 'bottom',
  icon: 'checkmark-circle-outline'
}

// Errore
{
  message: 'Errore durante l\'operazione. Riprova.',
  duration: 4000,
  color: 'danger',
  position: 'bottom',
  icon: 'alert-circle-outline'
}
```

---

## 6. Sezioni di pagina

### 6.1 Hero section (Home)
```scss
.hero-section {
  background: var(--bnb-blu);
  padding: 80px 24px 64px;
  text-align: center;
  position: relative;
  overflow: hidden;

  /* Texture sottile per profondità */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(193, 140, 114, 0.15) 0%,
      transparent 60%
    );
    pointer-events: none;
  }

  h1 {
    font-family: var(--bnb-font-titoli);
    font-size: clamp(1.75rem, 5vw, 3rem);
    font-weight: 400;
    color: var(--bnb-pietra);
    margin-bottom: 16px;
    line-height: 1.2;
  }

  p {
    font-size: clamp(1rem, 2vw, 1.25rem);
    color: rgba(244, 239, 230, 0.8);
    max-width: 600px;
    margin: 0 auto 32px;
    line-height: 1.6;
  }
}
```

### 6.2 Section title
```scss
.section-header {
  text-align: center;
  padding: 48px 24px 32px;

  h2 {
    font-family: var(--bnb-font-titoli);
    font-size: 1.75rem;
    font-weight: 400;
    color: var(--bnb-blu);
    margin-bottom: 8px;
  }

  /* Linea decorativa in Terracotta */
  &::after {
    content: '';
    display: block;
    width: 48px;
    height: 2px;
    background: var(--bnb-terracotta);
    margin: 12px auto 0;
  }

  p {
    color: var(--bnb-testo-secondario);
    font-size: 1rem;
    max-width: 500px;
    margin: 12px auto 0;
  }
}
```

### 6.3 Footer
```scss
.footer {
  background: var(--bnb-blu);
  padding: 48px 24px 32px;
  color: rgba(244, 239, 230, 0.7);
  font-size: 0.875rem;
  line-height: 1.8;
  text-align: center;

  strong {
    color: var(--bnb-terracotta);
    font-family: var(--bnb-font-titoli);
    font-size: 1.125rem;
    font-weight: 400;
    display: block;
    margin-bottom: 12px;
  }
}
```

---

## 7. Pagine specifiche

### 7.1 Home page — struttura obbligatoria
```
1. Header (ion-header con toolbar blu)
2. Hero (sfondo blu, titolo Georgia, sottotitolo, CTA "Scopri le camere")
3. Galleria (scroll orizzontale, immagini 300x200, border-radius 8px)
4. Servizi (griglia 2 col mobile / 4 col desktop, card con icona + titolo + testo)
5. Recensioni (card con nome, stelle, testo — sfondo Pietra Scura)
6. Mappa Leaflet (altezza 350px, marker Terracotta)
7. Footer (sfondo Blu Abisso)
```

### 7.2 Login e Registrazione
- Sfondo pagina: Pietra di Noto
- Form centrato, max-width 480px, con padding 32px
- Nessun header visibile o ridotto al minimo
- Logo BnBHub sopra il form in Georgia, colore Blu Abisso
- Link tra login/registrazione sotto il pulsante, colore Terracotta
- Nessuna immagine di sfondo — la semplicità è la forza

### 7.3 Dashboard Admin
- Statistiche in cima (3 card stat affiancate)
- Sezioni separate con titolo in Georgia e linea Terracotta
- Tabelle con righe alternate sfondo bianco / Pietra di Noto
- Badge di stato colorati per ogni prenotazione
- Pulsanti azione (conferma/annulla) piccoli e inline nelle righe

### 7.4 Pagina camere
- Griglia card: 1 col mobile, 2 col tablet, 3 col desktop
- Ogni card: immagine in alto (aspect-ratio 16/9), poi nome, tipo, prezzo/notte, pulsante
- Filtri in cima (per tipo: singola, doppia, suite) — pill buttons in Terracotta
- Badge "Disponibile" / "Non disponibile" in alto a destra sull'immagine

---

## 8. Icone

Usare esclusivamente **Ionicons** (già incluso in Ionic). Regole:
- Usare sempre la variante `-outline` per icone decorative e di navigazione
- Usare la variante piena (senza suffisso) solo per stati attivi/selezionati
- Dimensione standard icone di navigazione: 22px
- Dimensione icone in card/contenuto: 24px
- Dimensione icone hero/illustrative: 48px
- Colore icone inattive: `rgba(244, 239, 230, 0.5)` su sfondo scuro, `var(--bnb-testo-secondario)` su sfondo chiaro
- Colore icone attive/accent: `var(--bnb-terracotta)`

Icone consigliate per il progetto:
```
bed-outline          → camere
calendar-outline     → prenotazioni
people-outline       → utenti
home-outline         → home
log-in-outline       → login
person-add-outline   → registrazione
log-out-outline      → logout
grid-outline         → dashboard
star-outline         → recensioni
location-outline     → mappa
card-outline         → pagamento
checkmark-circle     → successo
alert-circle         → errore
time-outline         → in attesa
```

---

## 9. Animazioni e transizioni

### 9.1 Transizioni standard
```scss
/* Transizione base per hover e state change */
transition: all 0.2s ease;

/* Transizione per elementi che cambiano colore */
transition: background-color 0.2s ease, color 0.2s ease;

/* Transizione per card con elevazione */
transition: box-shadow 0.2s ease, transform 0.2s ease;
```

### 9.2 Regole animazioni
- ❌ Mai animazioni più lunghe di 400ms per interazioni utente
- ❌ Mai animazioni in loop su contenuto statico
- ✅ Sempre animare l'entrata di liste e card con `fadeIn` leggero
- ✅ Usare `ion-skeleton-text` durante il caricamento dei dati

### 9.3 Skeleton loading (obbligatorio per chiamate API)
```html
<!-- Usare questo pattern mentre i dati si caricano -->
<ion-card *ngIf="caricamento">
  <ion-skeleton-text animated style="height: 200px;"></ion-skeleton-text>
  <ion-card-header>
    <ion-skeleton-text animated style="width: 60%;"></ion-skeleton-text>
  </ion-card-header>
  <ion-card-content>
    <ion-skeleton-text animated style="width: 90%;"></ion-skeleton-text>
    <ion-skeleton-text animated style="width: 70%;"></ion-skeleton-text>
  </ion-card-content>
</ion-card>
```

---

## 10. Accessibilità

- Tutti gli elementi interattivi devono avere `aria-label` se non hanno testo visibile
- Le immagini decorative usano `aria-hidden="true"`
- Le immagini di contenuto hanno sempre attributo `alt` descrittivo
- Il contrasto testo/sfondo rispetta WCAG AA (rapporto minimo 4.5:1)
- I link devono essere distinguibili dal testo normale (non solo per colore)
- Gli input hanno sempre un label associato

---

## 11. Errori comuni da evitare

| ❌ Sbagliato | ✅ Corretto |
|---|---|
| `text-transform: uppercase` sui paragrafi | Solo su badge e label brevi |
| `font-weight: 700` su titoli Georgia | `font-weight: 400` — Georgia è già forte |
| `border-radius: 50px` sui CTA | `border-radius: 4px` — non pillola |
| Colori inventati fuori palette | Solo i colori definiti in sezione 2 |
| Lista vuota senza messaggio | Sempre stato vuoto con icona e testo |
| Pulsante senza stato hover | Sempre transizione su hover |
| `IonicModule` negli imports | Sempre componenti Ionic singoli (Standalone) |
| `*ngIf` nell'HTML | Sempre `@if` (Angular 17+) |
| `*ngFor` nell'HTML | Sempre `@for` (Angular 17+) |
| Hardcoded `http://localhost:3000` | Usare variabile `environment.apiUrl` |

---

## 12. Checklist prima di ogni commit

Prima di committare modifiche al frontend, verificare:

- [ ] I colori usati sono tutti nella palette definita in sezione 2
- [ ] Le chiamate API mostrano uno stato di caricamento
- [ ] I form mostrano errori di validazione corretti
- [ ] Le azioni dell'utente mostrano un feedback (toast/messaggio)
- [ ] Gli stati vuoti sono gestiti (liste senza dati)
- [ ] Nessun `IonicModule` negli imports (usare componenti singoli)
- [ ] Usata sintassi `@if` e `@for` invece di `*ngIf` e `*ngFor`
- [ ] Testato su mobile (viewport 375px) e desktop (viewport 1280px)
- [ ] Nessun errore o warning nella console del browser

---

*BnBHub UI/UX Guidelines v1.0 — Corso Programmazione Web e Mobile*