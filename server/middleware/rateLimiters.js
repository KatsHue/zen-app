const rateLimit = require('express-rate-limit');

// Limita intentos de login/registro por IP para mitigar ataques de fuerza bruta
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // 20 intentos por IP en la ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Demasiados intentos. Intenta de nuevo en unos minutos.',
  },
});

module.exports = { authLimiter };
