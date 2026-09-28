import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, AuthError } from '../context/AuthContext';
import ErrorAlert from '../components/ErrorAlert';

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<AuthError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      setSent(true);
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
          <h1>Recuperar contraseña</h1>
          <p>Te enviaremos un enlace por correo para restablecerla.</p>
        </div>

        {sent ? (
          <p className="zen-footer-text" style={{ marginTop: 0 }}>
            Si ese correo está registrado, te enviamos un enlace para restablecer tu contraseña. Revisa tu bandeja
            de entrada (y la carpeta de spam, por si acaso).
          </p>
        ) : (
          <>
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

              <button type="submit" className="zen-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Enviar enlace'}
              </button>
            </form>
          </>
        )}

        <p className="zen-footer-text">
          <Link to="/login">← Volver a iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}