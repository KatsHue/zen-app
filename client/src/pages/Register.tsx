import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, AuthError } from '../context/AuthContext';
import ErrorAlert from '../components/ErrorAlert';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<AuthError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(new AuthError('Las contraseñas no coinciden.'));
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name, email, password);
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
          <div className="zen-card__icon">🍃</div>
          <h1>Crea tu espacio</h1>
          <p>Unos minutos para empezar, con calma.</p>
        </div>

        <ErrorAlert error={error} />

        <form onSubmit={handleSubmit} noValidate>
          <div className="zen-field">
            <label htmlFor="name">Nombre</label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
            <small style={{ color: 'var(--zen-text-soft)', fontSize: '0.78rem' }}>
              Mínimo 8 caracteres, con al menos un número.
            </small>
          </div>

          <div className="zen-field">
            <label htmlFor="confirmPassword">Confirmar contraseña</label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>

          <button type="submit" className="zen-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="zen-footer-text">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}