// Genera el hash bcrypt de una contraseña, para pegarlo manualmente en el campo
// "password" de un usuario en MongoDB Atlas (útil cuando alguien no puede usar
// "olvidé mi contraseña" porque el correo solo le llega al dueño de la cuenta de Resend).
//
// Uso (desde la carpeta server/):
//   node scripts/hash-password.js "laNuevaContraseña123"
//
// ¿CÓMO USAR?
//
// 1. Genera el hash localmente
// En VS Code, en la terminal, entra a la carpeta server/ y corre: node scripts/hash-password.js 
// "laNuevaContraseña123" (usa la contraseña real que le vas a dar a la persona, con al menos 8 
// caracteres y un número). Te va a imprimir un texto largo que empieza con $2a$12$... - eso es el hash.
//
// 2. Copia el hash
// Copia el hash completo que te imprimió la terminal (todo, desde $2a$12$ hasta el final, sin espacios 
// extra al inicio o final).
//
// 3. Ve a Atlas y encuentra al usuario
// Entra a cloud.mongodb.com, tu cluster → Browse Collections → la base de datos de tu app → 
// colección 'users'. Busca al usuario por su email (usa el filtro, ej. {"email": "correo@ejemplo.com"}).
//
// 4. Edita el campo password
// Da clic en el lápiz de editar ese documento. Busca el campo "password" (debería mostrar un texto 
// largo tipo $2a$12$... ya existente). Borra su valor actual y pega el hash nuevo que generaste 
// en el paso 1, exactamente igual, sin comillas extra. Asegúrate de que el tipo de dato siga 
// siendo String.
// 
// 5. Revisa que la cuenta no esté bloqueada
// Mientras estás ahí, revisa el campo "loginAttempts": si tiene un número mayor a 0, 
// cámbialo a 0. Y si "lockUntil" tiene una fecha, cámbialo a null. Esto evita que la cuenta 
// siga bloqueada por los intentos fallidos anteriores.
//
// 6. Guarda y avisa a la persona
// Da clic en 'Update' / guardar en Atlas. Avisa a la persona (por WhatsApp, en persona, 
// etc. - nunca por un canal inseguro) cuál es la contraseña temporal que le pusiste, 
// para que inicie sesión y, si quiere, la cambie por una propia desde 'Cambiar contraseña' en Mi perfil.


const bcrypt = require('bcryptjs');

const plainPassword = process.argv[2];

if (!plainPassword) {
  console.error('Uso: node scripts/hash-password.js "laNuevaContraseña123"');
  process.exit(1);
}

if (plainPassword.length < 8) {
  console.error('⚠️  La contraseña debe tener al menos 8 caracteres (regla de la app).');
  process.exit(1);
}

bcrypt.hash(plainPassword, 12).then((hash) => {
  console.log('\nCopia EXACTAMENTE este valor y pégalo en el campo "password" del usuario en Atlas:\n');
  console.log(hash);
  console.log('');
});