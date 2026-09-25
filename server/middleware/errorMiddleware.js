function notFound(req, res, next) {
  res.status(404).json({ message: `Ruta no encontrada: ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err.stack);

  // Error de duplicado de Mongo (ej. email ya registrado)
  if (err.code === 11000) {
    return res.status(409).json({ message: 'El correo ya está registrado.' });
  }

  const statusCode = err.statusCode && err.statusCode !== 200 ? err.statusCode : 500;
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    message: err.message || 'Error interno del servidor',
    // Nunca exponer el stack trace en producción
    stack: isProduction ? undefined : err.stack,
  });
}

module.exports = { notFound, errorHandler };
