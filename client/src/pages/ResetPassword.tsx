import { useState, type FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth, AuthError } from '../context/AuthContext';
import ErrorAlert from '../components/ErrorAlert';

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

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

    if (!token) {
      setError(new AuthError('El enlace no es válido.'));
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(token, password);
      navigate('/login');
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
          <div className="zen-card__icon">🔑</div>
          <h1>Nueva contraseña</h1>
          <p>Elige una nueva contraseña para tu cuenta.</p>
        </div>

        <ErrorAlert error={error} />

        <form onSubmit={handleSubmit} noValidate>
          <div className="zen-field">
            <label htmlFor="password">Nueva contraseña</label>
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
            {isSubmitting ? 'Guardando...' : 'Restablecer contraseña'}
          </button>
        </form>

        <p className="zen-footer-text">
          <Link to="/login">← Volver a iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}