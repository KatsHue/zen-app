import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, AuthError } from '../context/AuthContext';
import ErrorAlert from '../components/ErrorAlert';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<AuthError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof AuthError ? err : new AuthError('Ocurrió un error inesperado.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="zen-page">
      <div className="zen-card">
        <div className="zen-card__header">
          <div className="zen-card__icon">🌿</div>
          <h1>Bienvenido</h1>
          <p>Respira hondo e inicia sesión</p>
        </div>

        <ErrorAlert error={error} />

        <form onSubmit={handleSubmit} noValidate>
          <div className="zen-field">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="zen-field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="zen-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="zen-footer-text">
          ¿Aún no tienes cuenta? <Link to="/register">Crea una aquí</Link>
        </p>
      </div>
    </div>
  );
}