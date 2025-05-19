const nodemailer = require("nodemailer");

async function sendInvitationEmail(destinatario, nombre, claveTemporal) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.CORREO_ORIGEN,
        pass: process.env.CORREO_PASS,
      },
    });

    const mailOptions = {
      from: `"TransformCV" <${process.env.CORREO_ORIGEN}>`,
      to: destinatario,
      subject: "Invitación a TransformCV",
      html: `
        <p>Hola ${nombre},</p>
        <p>Has sido invitado a unirte a la plataforma <strong>TransformCV</strong>.</p>
        <p>Tu contraseña temporal es:</p>
        <h2>${claveTemporal}</h2>
        <p>Debes iniciar sesión y cambiarla para activar tu cuenta.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Correo enviado a:", destinatario);
  } catch (error) {
    console.error("❌ Error al enviar el correo:", error.message);
    throw error;
  }
}

module.exports = { sendInvitationEmail };
