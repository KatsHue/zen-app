import { useState, type FormEvent } from 'react';
import { useAuth, AuthError } from '../context/AuthContext';
import ErrorAlert from './ErrorAlert';

export default function ChangePasswordCard() {
  const { changePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState<AuthError | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (newPassword !== confirmNewPassword) {
      setError(new AuthError('Las contraseñas nuevas no coinciden.'));
      return;
    }

    setIsSaving(true);
    try {
      const msg = await changePassword(currentPassword, newPassword);
      setMessage(msg);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setError(err instanceof AuthError ? err : new AuthError('Ocurrió un error inesperado.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="zen-card zen-card--wide">
      <div className="zen-card__header">
        <div className="zen-card__icon">🔒</div>
        <h1 style={{ fontSize: '1.3rem' }}>Cambiar contraseña</h1>
      </div>

      <ErrorAlert error={error} />

      <form onSubmit={handleSubmit} noValidate>
        <div className="zen-field">
          <label htmlFor="currentPassword">Contraseña actual</label>
          <input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>

        <div className="zen-field">
          <label htmlFor="newPassword">Nueva contraseña</label>
          <input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            required
          />
          <small style={{ color: 'var(--zen-text-soft)', fontSize: '0.78rem' }}>
            Mínimo 8 caracteres, con al menos un número.
          </small>
        </div>

        <div className="zen-field">
          <label htmlFor="confirmNewPassword">Confirmar nueva contraseña</label>
          <input
            id="confirmNewPassword"
            type="password"
            autoComplete="new-password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>

        {message && (
          <p className="zen-footer-text" style={{ marginTop: 0, marginBottom: 12 }}>
            {message}
          </p>
        )}

        <button type="submit" className="zen-btn" disabled={isSaving}>
          {isSaving ? 'Guardando...' : 'Cambiar contraseña'}
        </button>
      </form>
    </div>
  );
}