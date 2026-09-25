require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const weightRoutes = require('./routes/weightRoutes');
const dailyLogRoutes = require('./routes/dailyLogRoutes');
const measurementRoutes = require('./routes/measurementRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

app.set('trust proxy', 1);

connectDB();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:'],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'"],
      },
    },
  })
);

app.use(mongoSanitize());

// --- CORS ---
// CLIENT_URL admite una o varias URLs separadas por coma, por ejemplo:
//   CLIENT_URL=https://mi-frontend.onrender.com,http://localhost:5173
// Si no se define explícitamente, usamos RENDER_EXTERNAL_URL (que Render inyecta
// automáticamente con la URL pública del propio servicio) como respaldo. Esto hace
// que el despliegue de UN SOLO SERVICIO funcione sin configurar nada extra: el
// backend permite automáticamente su propia URL pública como origen válido.
const allowedOrigins = (process.env.CLIENT_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Origen no permitido por la política de CORS.'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/weights', weightRoutes);
app.use('/api/daily-logs', dailyLogRoutes);
app.use('/api/measurements', measurementRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (isProduction && fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));

  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🌿 Servidor escuchando en el puerto ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});