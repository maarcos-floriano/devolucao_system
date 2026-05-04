const nodemailer = require('nodemailer');

let cachedTransporter = null;

function splitEmails(value = '') {
  return String(value || '')
    .split(/[;,]/)
    .map((email) => email.trim())
    .filter(Boolean);
}

function uniqueEmails(emails) {
  return [...new Set(emails.filter(Boolean).map((email) => email.trim()))];
}

function getTransporter() {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  if (!process.env.SMTP_HOST) {
    return null;
  }

  const port = Number(process.env.SMTP_PORT || 587);
  const auth = process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS || '',
      }
    : undefined;

  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || port === 465,
    auth,
  });

  return cachedTransporter;
}

async function sendMail({ to, subject, text, html }) {
  const recipients = uniqueEmails(Array.isArray(to) ? to : splitEmails(to));

  if (recipients.length === 0) {
    return { sent: false, reason: 'no_recipients' };
  }

  const transporter = getTransporter();
  if (!transporter) {
    console.log('[email skipped] SMTP nao configurado', { to: recipients, subject });
    return { sent: false, reason: 'smtp_not_configured' };
  }

  const from = process.env.MAIL_FROM || process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to: recipients.join(','),
    subject,
    text,
    html,
  });

  return { sent: true, to: recipients };
}

async function notifyWatchClosed(chamado, devolucao) {
  const to = uniqueEmails([
    chamado.email_solicitante,
    ...splitEmails(process.env.SAC_NOTIFICATION_EMAIL),
  ]);

  return sendMail({
    to,
    subject: `Devolucao encontrada: ${devolucao.cliente || chamado.cliente}`,
    text: [
      'Uma devolucao que estava em acompanhamento foi registrada e o chamado foi fechado automaticamente.',
      '',
      `Chamado: #${chamado.id}`,
      `Cliente: ${devolucao.cliente || chamado.cliente || '-'}`,
      `Produto registrado: ${devolucao.produto || '-'}`,
      `Item esperado: ${chamado.item_esperado || '-'}`,
      `Devolucao: #${devolucao.id}`,
    ].join('\n'),
  });
}

async function notifyRemoteAccess(chamado) {
  const to = uniqueEmails([
    chamado.email_responsavel,
    ...splitEmails(process.env.REMOTE_ACCESS_NOTIFICATION_EMAIL || process.env.ADMIN_NOTIFICATION_EMAIL),
  ]);

  return sendMail({
    to,
    subject: `Acesso remoto agendado: ${chamado.cliente || 'cliente sem nome'}`,
    text: [
      'Foi registrado um chamado de acesso remoto.',
      '',
      `Chamado: #${chamado.id || '-'}`,
      `Cliente: ${chamado.cliente || '-'}`,
      `Quando: ${chamado.acesso_remoto_em || '-'}`,
      `Solicitante: ${chamado.email_solicitante || '-'}`,
      `Descricao: ${chamado.problema || chamado.observacao || '-'}`,
    ].join('\n'),
  });
}

module.exports = {
  notifyRemoteAccess,
  notifyWatchClosed,
  sendMail,
  splitEmails,
  uniqueEmails,
};
