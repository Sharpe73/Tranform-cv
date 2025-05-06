const nodemailer = require("nodemailer");

async function enviarCorreoInvitacion(destinatario, nombreUsuario, contraseñaTemporal, remitenteAdmin) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mensaje = {
    from: `"Transform CV" <${process.env.EMAIL_USER}>`,
    to: destinatario,
    subject: "Invitación para unirte a Transform CV",
    html: `
      <p>Hola <strong>${nombreUsuario}</strong>,</p>
      <p>Has sido invitado a unirte a la plataforma <strong>Transform CV</strong>.</p>
      <p><strong>Tu contraseña temporal:</strong> ${contraseñaTemporal}</p>
      <p>Ingresa en: <a href="https://tranform-cv.vercel.app/login">tranform-cv.vercel.app/login</a></p>
      <p>Esta invitación fue enviada por: <strong>${remitenteAdmin}</strong></p>
      <p>Una vez que ingreses, deberás cambiar tu contraseña.</p>
      <p style="margin-top:20px;">Saludos,<br><em>Equipo Transform CV</em></p>
    `,
  };

  await transporter.sendMail(mensaje);
}

module.exports = { enviarCorreoInvitacion };
