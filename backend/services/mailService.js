const nodemailer = require('nodemailer');

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
  await sendMail({
    to: user.email,
    subject: 'Registrazione confermata - BnBHub',
    text: [
      `Ciao ${user.nome},`,
      '',
      'la tua registrazione su BnBHub è stata completata con successo.',
      'Ora puoi accedere al sito e prenotare la camera che preferisci.',
      '',
      'A presto,',
      'Il team BnBHub'
    ].join('\n'),
    html: `
      <p>Ciao ${user.nome},</p>
      <p>la tua registrazione su BnBHub è stata completata con successo.</p>
      <p>Ora puoi accedere al sito e prenotare la camera che preferisci.</p>
      <p>A presto,<br>Il team BnBHub</p>
    `
  });
}

async function sendBookingConfirmedEmail(booking) {
  const price = formatPrice(booking.prezzo);
  const priceLine = price ? `<li>Prezzo: ${price} / notte</li>` : '';
  const priceText = price ? `Prezzo: ${price} / notte` : '';

  await sendMail({
    to: booking.email,
    subject: 'Prenotazione confermata - BnBHub',
    text: [
      `Ciao ${booking.nome},`,
      '',
      'la tua prenotazione è stata confermata.',
      '',
      `Camera: ${booking.camera_nome}`,
      `Check-in: ${formatDate(booking.data_inizio)}`,
      `Check-out: ${formatDate(booking.data_fine)}`,
      priceText,
      'Stato: confermata',
      '',
      'A presto,',
      'Il team BnBHub'
    ].filter(Boolean).join('\n'),
    html: `
      <p>Ciao ${booking.nome},</p>
      <p>la tua prenotazione è stata confermata.</p>
      <ul>
        <li>Camera: ${booking.camera_nome}</li>
        <li>Check-in: ${formatDate(booking.data_inizio)}</li>
        <li>Check-out: ${formatDate(booking.data_fine)}</li>
        ${priceLine}
        <li>Stato: confermata</li>
      </ul>
      <p>A presto,<br>Il team BnBHub</p>
    `
  });
}

module.exports = {
  sendRegistrationConfirmation,
  sendBookingConfirmedEmail
};
