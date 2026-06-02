const nodemailer = require('nodemailer');

const brand = {
  primary: '#1B2E3C',
  primaryTint: '#2D4A5E',
  secondary: '#C18C72',
  secondaryTint: '#D4A98A',
  secondaryShade: '#A8725A',
  background: '#F4EFE6',
  card: '#FFFFFF',
  surface: '#E6DDD0',
  infoSurface: '#F0EEF5',
  text: '#1B2E3C',
  muted: '#6B6055',
  disabled: '#A89E94',
  border: '#DDD5C8',
  success: '#4A7C59',
  error: '#B04A3A',
  warning: '#C4893A',
  info: '#2D6A8F',
  headingFont: 'Georgia, "Times New Roman", serif',
  bodyFont: '"Helvetica Neue", Arial, sans-serif'
};

const requiredConfig = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_SECURE',
  'SMTP_USER',
  'SMTP_PASS',
  'MAIL_FROM'
];

function hasMailConfig() {
  return requiredConfig.every((key) => process.env[key])
    && process.env.SMTP_USER !== 'indirizzo@gmail.com'
    && process.env.SMTP_PASS !== 'app_password_gmail';
}

function createTransporter() {
  if (!hasMailConfig()) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

function formatDate(value) {
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(`${value}T00:00:00`));
}

function formatPrice(value) {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(Number(value));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getFrontendUrl() {
  return (process.env.FRONTEND_URL || 'http://localhost:4200').replace(/\/$/, '');
}

function getBookingInfoUrl(bookingId) {
  return `${getFrontendUrl()}/area-personale?prenotazione=${encodeURIComponent(bookingId)}`;
}

function getLoginUrl() {
  return `${getFrontendUrl()}/login`;
}

function renderParagraph(text) {
  return `
    <p style="margin:0 0 18px;color:${brand.text};font-family:${brand.bodyFont};font-size:16px;line-height:1.6;">
      ${escapeHtml(text)}
    </p>
  `;
}

function renderButton(href, label) {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:26px 0 8px;">
      <tr>
        <td bgcolor="${brand.secondary}" style="border-radius:4px;">
          <a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 20px;color:#FFFFFF;font-family:${brand.bodyFont};font-size:15px;font-weight:500;line-height:1;text-decoration:none;border-radius:4px;background:${brand.secondary};">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>
  `;
}

function renderHighlight(title, text) {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;border:1px solid ${brand.border};border-left:4px solid ${brand.secondary};border-radius:8px;background:${brand.surface};">
      <tr>
        <td style="padding:18px 20px;">
          <p style="margin:0 0 6px;color:${brand.primary};font-family:${brand.bodyFont};font-size:12px;font-weight:600;letter-spacing:0;text-transform:uppercase;">
            ${escapeHtml(title)}
          </p>
          <p style="margin:0;color:${brand.muted};font-family:${brand.bodyFont};font-size:15px;line-height:1.6;">
            ${escapeHtml(text)}
          </p>
        </td>
      </tr>
    </table>
  `;
}

function renderDetailRows(rows) {
  return rows
    .filter((row) => row.value !== null && row.value !== undefined && row.value !== '')
    .map((row) => `
      <tr>
        <td style="padding:13px 0;border-bottom:1px solid ${brand.border};color:${brand.muted};font-family:${brand.bodyFont};font-size:14px;line-height:1.45;">
          ${escapeHtml(row.label)}
        </td>
        <td align="right" style="padding:13px 0;border-bottom:1px solid ${brand.border};color:${brand.text};font-family:${brand.bodyFont};font-size:15px;font-weight:500;line-height:1.45;">
          ${escapeHtml(row.value)}
        </td>
      </tr>
    `)
    .join('');
}

function renderDetailsCard(title, rows) {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;border:1px solid ${brand.border};border-radius:8px;background:${brand.surface};">
      <tr>
        <td style="padding:18px 20px 4px;">
          <p style="margin:0;color:${brand.primary};font-family:${brand.bodyFont};font-size:12px;font-weight:600;letter-spacing:0;text-transform:uppercase;">
            ${escapeHtml(title)}
          </p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            ${renderDetailRows(rows)}
          </table>
        </td>
      </tr>
    </table>
  `;
}

function renderEmailLayout({ preheader, eyebrow, title, bodyHtml }) {
  const currentYear = new Date().getFullYear();

  return `
    <!doctype html>
    <html lang="it">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>BnBHub</title>
      </head>
      <body style="margin:0;padding:0;background:${brand.background};color:${brand.text};font-family:${brand.bodyFont};">
        <span style="display:none;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">
          ${escapeHtml(preheader)}
        </span>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${brand.background};">
          <tr>
            <td align="center" style="padding:34px 16px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;background:${brand.card};border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(27,46,60,0.08);">
                <tr>
                  <td style="background:${brand.primary};padding:30px 32px;color:${brand.background};">
                    <p style="margin:0 0 18px;color:${brand.secondary};font-family:${brand.bodyFont};font-size:12px;font-weight:600;letter-spacing:0;text-transform:uppercase;">
                      ${escapeHtml(eyebrow)}
                    </p>
                    <h1 style="margin:0;color:${brand.background};font-family:${brand.headingFont};font-size:30px;line-height:1.2;font-weight:400;">
                      ${escapeHtml(title)}
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px;background:${brand.card};">
                    ${bodyHtml}
                    <p style="margin:28px 0 0;color:${brand.text};font-family:${brand.bodyFont};font-size:16px;line-height:1.6;">
                      A presto,<br>
                      <strong style="font-weight:500;">Il team BnBHub</strong>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:22px 32px;background:${brand.primaryTint};color:${brand.background};">
                    <p style="margin:0 0 6px;color:${brand.secondary};font-family:${brand.headingFont};font-size:18px;font-weight:400;">BnBHub Palermo</p>
                    <p style="margin:0;color:${brand.surface};font-family:${brand.bodyFont};font-size:13px;line-height:1.6;">
                      Via dell'Universita 1, 90100 Palermo (PA)<br>
                      &copy; ${currentYear} BnBHub
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

async function sendMail(options) {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn('Configurazione SMTP mancante: email non inviata.');
    return;
  }

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    ...options
  });
}

async function sendRegistrationConfirmation(user) {
  const loginUrl = getLoginUrl();

  await sendMail({
    to: user.email,
    subject: 'Registrazione confermata - BnBHub',
    text: [
      `Ciao ${user.nome},`,
      '',
      'la tua registrazione su BnBHub e stata completata con successo.',
      'Ora puoi accedere al sito e prenotare la camera che preferisci.',
      `Accedi qui: ${loginUrl}`,
      '',
      'A presto,',
      'Il team BnBHub'
    ].join('\n'),
    html: renderEmailLayout({
      preheader: 'La tua registrazione su BnBHub e stata completata con successo.',
      eyebrow: 'Registrazione confermata',
      title: `Ciao ${user.nome}, benvenuto su BnBHub.`,
      bodyHtml: `
        ${renderParagraph('La tua registrazione su BnBHub e stata completata con successo.')}
        ${renderHighlight(
          'Account attivo',
          'Ora puoi accedere al sito, controllare le disponibilita e prenotare la camera che preferisci.'
        )}
        ${renderButton(loginUrl, 'Accedi a BnBHub')}
      `
    })
  });
}

async function sendBookingConfirmedEmail(booking) {
  const price = formatPrice(booking.prezzo);
  const priceText = price ? `Prezzo: ${price} / notte` : '';
  const bookingInfoUrl = getBookingInfoUrl(booking.id);

  await sendMail({
    to: booking.email,
    subject: 'Prenotazione confermata - BnBHub',
    text: [
      `Ciao ${booking.nome},`,
      '',
      'la tua prenotazione e stata confermata.',
      '',
      `Camera: ${booking.camera_nome}`,
      `Check-in: ${formatDate(booking.data_inizio)}`,
      `Check-out: ${formatDate(booking.data_fine)}`,
      priceText,
      'Stato: confermata',
      '',
      'Se hai intolleranze, allergie o esigenze particolari, compila il form nella tua area personale:',
      bookingInfoUrl,
      '',
      'A presto,',
      'Il team BnBHub'
    ].filter(Boolean).join('\n'),
    html: renderEmailLayout({
      preheader: 'La tua prenotazione BnBHub e stata confermata.',
      eyebrow: 'Prenotazione confermata',
      title: `Ciao ${booking.nome}, il tuo soggiorno e confermato.`,
      bodyHtml: `
        ${renderParagraph('Abbiamo confermato la tua prenotazione. Qui sotto trovi il riepilogo del soggiorno.')}
        ${renderDetailsCard('Dettagli prenotazione', [
          { label: 'Camera', value: booking.camera_nome },
          { label: 'Check-in', value: formatDate(booking.data_inizio) },
          { label: 'Check-out', value: formatDate(booking.data_fine) },
          { label: 'Prezzo', value: price ? `${price} / notte` : '' },
          { label: 'Stato', value: 'Confermata' }
        ])}
        ${renderHighlight(
          'Prima dell\'arrivo',
          'Se hai intolleranze, allergie o esigenze particolari, compila il form nella tua area personale.'
        )}
        ${renderButton(bookingInfoUrl, 'Compila informazioni soggiorno')}
        <p style="margin:16px 0 0;color:${brand.muted};font-family:${brand.bodyFont};font-size:13px;line-height:1.6;">
          Se il pulsante non funziona, copia questo link nel browser:<br>
          <a href="${escapeHtml(bookingInfoUrl)}" style="color:${brand.secondaryShade};text-decoration:underline;">${escapeHtml(bookingInfoUrl)}</a>
        </p>
      `
    })
  });
}

module.exports = {
  sendRegistrationConfirmation,
  sendBookingConfirmedEmail
};
