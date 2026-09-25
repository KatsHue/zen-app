const jwt = require('jsonwebtoken');

function generateToken(res, userId) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('token', token, {
    httpOnly: true, // no accesible desde JS del navegador -> mitiga XSS
    secure: isProduction, // solo por HTTPS en producción (Render usa HTTPS)
    sameSite: 'lax', // protección CSRF razonable manteniendo misma-origen
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    path: '/',
  });

  return token;
}

module.exports = generateToken;
