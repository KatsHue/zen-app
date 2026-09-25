# 🌿 Zen Login App

Login funcional, seguro y listo para producción, con estética zen (verde, tranquilizante).

**Stack:** Node.js + Express · React + TypeScript (Vite) · MongoDB Atlas · JWT en cookie httpOnly.

---

## 1. Estructura del proyecto

```
zen-login-app/
├── server/          # API Express (auth, JWT, MongoDB)
├── client/          # Frontend React + TypeScript (Vite)
├── render.yaml       # Blueprint opcional para Render
└── package.json      # Orquesta build/start para despliegue en un solo servicio
```

En **producción**, Express sirve el build de React (`client/dist`) como archivos estáticos.
Así todo corre en **un único servicio web**, ideal para el plan Free de Render (evita
problemas de CORS/cookies entre dos dominios distintos y usa solo un "web service").

---

## 2. Seguridad implementada

- Contraseñas con **bcrypt** (12 salt rounds), nunca se devuelven al cliente.
- Sesión vía **JWT dentro de una cookie httpOnly** (no accesible por JS → mitiga XSS),
  `secure` en producción y `sameSite: lax`.
- **Rate limiting** en `/api/auth/login` y `/register` (mitiga fuerza bruta).
- **Bloqueo temporal de cuenta** tras 5 intentos fallidos de login (15 min).
- **Helmet** con Content-Security-Policy configurada.
- **express-mongo-sanitize** contra inyección de operadores de MongoDB.
- **express-validator** valida y normaliza toda entrada del usuario.
- Mensajes de error genéricos en login (no revela si el correo existe o no).
- Manejo centralizado de errores; el stack trace nunca se expone en producción.

---

## 3. Configurar MongoDB Atlas

1. Crea una cuenta gratuita en [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Crea un **Cluster gratuito (M0)**.
3. En **Database Access**, crea un usuario con contraseña.
4. En **Network Access**, agrega `0.0.0.0/0` (permitir acceso desde cualquier IP) —
   necesario porque Render usa IPs dinámicas en el plan free.
5. En **Database > Connect > Drivers**, copia el connection string, similar a:
   ```
   mongodb+srv://usuario:<password>@cluster0.xxxxx.mongodb.net/zen-login?retryWrites=true&w=majority
   ```
6. Reemplaza `<password>` por la contraseña real (sin `< >`).

---

## 4. Desarrollo local

### Backend
```bash
cd server
cp .env.example .env
# Edita .env y coloca tu MONGODB_URI y un JWT_SECRET (cadena larga aleatoria)
npm install
npm run dev        # http://localhost:5000
```

### Frontend
```bash
cd client
npm install
npm run dev         # http://localhost:5173
```

El frontend en dev usa el proxy de Vite (`/api` → `localhost:5000`), así que no
necesitas configurar CORS manualmente para probar localmente.

Genera un `JWT_SECRET` seguro con:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 5. Desplegar en Render (plan Free)

### Opción A: usando `render.yaml` (Blueprint)
1. Sube este proyecto a un repositorio de GitHub.
2. En Render, ve a **New > Blueprint** y selecciona el repo (detecta `render.yaml`).
3. Render te pedirá el valor de `MONGODB_URI` (no lo pongas en el repo). `JWT_SECRET`
   se genera automáticamente.
4. Despliega.

### Opción B: manual
1. En Render, **New > Web Service**, conecta tu repo.
2. Configuración:
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free
3. En **Environment**, agrega las variables:
   - `NODE_ENV=production`
   - `MONGODB_URI=<tu connection string de Atlas>`
   - `JWT_SECRET=<una cadena larga y aleatoria>`
   - `JWT_EXPIRES_IN=7d`
4. Despliega. Render instalará dependencias de `server` y `client`, compilará el
   frontend y arrancará Express, que servirá tanto la API (`/api/...`) como el
   frontend (todo lo demás).

> **Nota sobre el plan Free de Render:** el servicio "duerme" tras ~15 min de
> inactividad y tarda unos segundos en despertar en la siguiente petición. Es
> normal y no afecta la seguridad ni la funcionalidad.

---

## 6. Endpoints de la API

| Método | Ruta                | Descripción                          | Protegida |
|--------|---------------------|---------------------------------------|-----------|
| POST   | `/api/auth/register`| Crea una cuenta                       | No        |
| POST   | `/api/auth/login`   | Inicia sesión                         | No        |
| POST   | `/api/auth/logout`  | Cierra sesión (limpia la cookie)      | No        |
| GET    | `/api/auth/me`      | Devuelve el usuario autenticado       | Sí        |
| GET    | `/api/health`        | Verifica que el servidor está vivo    | No        |

---

## 7. Siguientes pasos sugeridos

- Verificación de correo electrónico al registrarse.
- Recuperación de contraseña ("olvidé mi contraseña").
- Autenticación de dos factores (2FA).
- Refresh tokens si necesitas sesiones más largas sin re-login.

¡Que disfrutes tu espacio zen! 🌱
# Zen-App
