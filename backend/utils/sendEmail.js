const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.CORREO_ORIGEN,
    pass: process.env.CORREO_PASS,
  },
});


async function sendInvitationEmail(destinatario, nombre, claveTemporal) {
  try {
    const mailOptions = {
      from: `"TransformCV" <${process.env.CORREO_ORIGEN}>`,
      to: destinatario,
      subject: "Invitación a TransformCV",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <p>Hola <strong>${nombre}</strong>,</p>
          <p>Has sido invitado a unirte a la plataforma <strong>TransformCV</strong>.</p>
          <p><strong>Tu contraseña temporal es:</strong></p>
          <p style="font-size: 20px; font-weight: bold; color: #1976d2;">${claveTemporal}</p>
          <p>Para ingresar, haz clic en el siguiente enlace:</p>
          <p>
            <a href="https://tranform-cv.vercel.app" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #1976d2; color: #fff; text-decoration: none; border-radius: 5px;">
              Ingresar a TransformCV
            </a>
          </p>
          <p>Una vez que inicies sesión, se te pedirá cambiar la contraseña para activar tu cuenta.</p>
          <hr/>
          <p style="font-size: 12px; color: #888;">Si no esperabas esta invitación, puedes ignorar este correo.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Correo de invitación enviado a:", destinatario);
  } catch (error) {
    console.error("❌ Error al enviar el correo de invitación:", error.message);
    throw error;
  }
}


async function sendPasswordRecoveryEmail(destinatario, nombre, claveTemporal) {
  try {
    const mailOptions = {
      from: `"TransformCV" <${process.env.CORREO_ORIGEN}>`,
      to: destinatario,
      subject: "Recuperación de contraseña - TransformCV",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <p>Hola <strong>${nombre}</strong>,</p>
          <p>Has solicitado restablecer tu contraseña en <strong>TransformCV</strong>.</p>
          <p><strong>Tu nueva contraseña temporal es:</strong></p>
          <p style="font-size: 20px; font-weight: bold; color: #1976d2;">${claveTemporal}</p>
          <p>Ingresa con esta contraseña desde el siguiente enlace:</p>
          <p>
            <a href="https://tranform-cv.vercel.app/login" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #1976d2; color: #fff; text-decoration: none; border-radius: 5px;">
              Iniciar sesión
            </a>
          </p>
          <p>Una vez que inicies sesión, deberás cambiar tu contraseña por una nueva.</p>
          <hr/>
          <p style="font-size: 12px; color: #888;">Si no solicitaste este cambio, puedes ignorar este correo.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Correo de recuperación enviado a:", destinatario);
  } catch (error) {
    console.error("❌ Error al enviar el correo de recuperación:", error.message);
    throw error;
  }
}

module.exports = {
  sendInvitationEmail,
  sendPasswordRecoveryEmail,
};
