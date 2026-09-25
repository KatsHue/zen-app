const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const MAX_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutos

// @route  POST /api/auth/register
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Ya existe una cuenta con ese correo.' });
    }

    const user = await User.create({ name, email, password });
    generateToken(res, user._id);

    return res.status(201).json({
      message: 'Cuenta creada correctamente.',
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

// @route  POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    // Respuesta genérica para no revelar si el correo existe o no
    const invalidCredsMsg = { message: 'Correo o contraseña incorrectos.' };

    if (!user) {
      return res.status(401).json(invalidCredsMsg);
    }

    // Bloqueo temporal tras múltiples intentos fallidos
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        message: `Cuenta bloqueada temporalmente. Intenta de nuevo en ${minutesLeft} minuto(s).`,
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= MAX_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
        user.loginAttempts = 0;
      }
      await user.save();
      return res.status(401).json(invalidCredsMsg);
    }

    // Login correcto: resetear contador
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    generateToken(res, user._id);

    return res.status(200).json({
      message: 'Sesión iniciada correctamente.',
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

// @route  POST /api/auth/logout
function logout(req, res) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  return res.status(200).json({ message: 'Sesión cerrada correctamente.' });
}

// @route  GET /api/auth/me
async function getMe(req, res) {
  return res.status(200).json({ user: req.user.toJSON() });
}

module.exports = { register, login, logout, getMe };
