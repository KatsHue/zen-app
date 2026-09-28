const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendPasswordResetEmail } = require('../utils/email');
const { cookieOptions } = generateToken;

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
  res.clearCookie('token', cookieOptions);
  return res.status(200).json({ message: 'Sesión cerrada correctamente.' });
}

// @route  GET /api/auth/me
async function getMe(req, res) {
  return res.status(200).json({ user: req.user.toJSON() });
}

function getClientBaseUrl() {
  const raw = process.env.CLIENT_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:5173';
  return raw.split(',')[0].trim();
}

// @route  POST /api/auth/forgot-password
// Siempre responde el mismo mensaje genérico, exista o no el correo (evita revelar
// qué correos están registrados). Solo envía el email si el usuario sí existe.
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const genericMessage = 'Si ese correo está registrado, te enviamos un enlace para restablecer tu contraseña.';

    const user = await User.findOne({ email });

    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      user.resetPasswordTokenHash = tokenHash;
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
      await user.save({ validateBeforeSave: false });

      const resetUrl = `${getClientBaseUrl()}/reset-password/${rawToken}`;
      // No bloqueamos la respuesta esperando el envío del correo.
      sendPasswordResetEmail(user.email, resetUrl).catch((err) =>
        console.error('Error enviando correo de recuperación:', err)
      );
    }

    return res.status(200).json({ message: genericMessage });
  } catch (error) {
    next(error);
  }
}

// @route  POST /api/auth/reset-password/:token
async function resetPassword(req, res, next) {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordTokenHash +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({ message: 'El enlace es inválido o ya expiró. Solicita uno nuevo.' });
    }

    user.password = newPassword; // se re-hashea automáticamente en el pre-save hook
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpires = undefined;
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    return res.status(200).json({ message: 'Tu contraseña se actualizó correctamente. Ya puedes iniciar sesión.' });
  } catch (error) {
    next(error);
  }
}

// @route  PUT /api/auth/change-password
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ message: 'Tu contraseña actual no es correcta.' });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({ message: 'Tu contraseña se actualizó correctamente.' });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, logout, getMe, forgotPassword, resetPassword, changePassword };