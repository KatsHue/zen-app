const RESEND_API_URL = 'https://api.resend.com/emails';

// Envía un correo vía Resend. Si falta la API key o Resend responde con error,
// lo registramos en consola pero NO tumbamos la petición que lo disparó (ej. forgot-password
// siempre debe responder igual, exista o no el correo, y sin importar si el envío falló).
async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error('❌ Falta RESEND_API_KEY en las variables de entorno; no se envió el correo.');
    return;
  }

  const from = process.env.EMAIL_FROM || 'onboarding@resend.dev';

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject, html }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('❌ Resend respondió con error al enviar correo:', response.status, errorBody);
    }
  } catch (error) {
    console.error('❌ Error de red al enviar correo con Resend:', error.message);
  }
}

function buildResetPasswordEmailHtml(resetUrl) {
  return `
    <div style="font-family: -apple-system, Arial, sans-serif; max-width: 480px; margin: 0 auto; color:#2f3e35;">
      <h2 style="color:#4f6f5c; margin-bottom: 4px;">🌿 Restablece tu contraseña</h2>
      <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Zen.</p>
      <p style="margin: 24px 0;">
        <a href="${resetUrl}" style="background:#6b9080;color:#ffffff;padding:12px 22px;border-radius:10px;text-decoration:none;display:inline-block;font-weight:600;">
          Restablecer contraseña
        </a>
      </p>
      <p style="font-size:13px;color:#5b6b60;">
        Este enlace expira en 1 hora. Si tú no solicitaste esto, puedes ignorar este correo con tranquilidad —
        tu contraseña no cambiará.
      </p>
    </div>
  `;
}

async function sendPasswordResetEmail(to, resetUrl) {
  await sendEmail({
    to,
    subject: 'Restablece tu contraseña — Zen',
    html: buildResetPasswordEmailHtml(resetUrl),
  });
}

module.exports = { sendPasswordResetEmail };