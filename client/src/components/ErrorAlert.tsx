import { AuthError } from '../context/AuthContext';

export default function ErrorAlert({ error }: { error: AuthError | null }) {
  if (!error) return null;

  if (error.fieldErrors && error.fieldErrors.length > 0) {
    return (
      <div className="zen-alert">
        <ul style={{ margin: 0, paddingLeft: '18px' }}>
          {error.fieldErrors.map((fieldError, index) => (
            <li key={`${fieldError.field}-${index}`}>{fieldError.message}</li>
          ))}
        </ul>
      </div>
    );
  }

  return <div className="zen-alert">{error.message}</div>;
}