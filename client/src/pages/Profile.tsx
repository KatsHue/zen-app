import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import {
  ACTIVITY_LEVELS,
  RENAL_STAGES,
  type ActivityLevel,
  type DialysisModality,
  type Sex,
} from '../utils/health';

export default function Profile() {
  const { user } = useAuth();
  const { profile, isLoading, update } = useProfile();
  const navigate = useNavigate();

  const [sex, setSex] = useState<Sex>('female');
  const [age, setAge] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('none');
  const [proteinGPerKg, setProteinGPerKg] = useState('1.8');
  const [renalEnabled, setRenalEnabled] = useState(false);
  const [renalStageId, setRenalStageId] = useState(RENAL_STAGES[0].id);
  const [dialysisModality, setDialysisModality] = useState<DialysisModality>('none');

  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setSex(profile.sex);
    setAge(profile.age ? String(profile.age) : '');
    setHeightCm(profile.heightCm ? String(profile.heightCm) : '');
    setActivityLevel(profile.activityLevel);
    setProteinGPerKg(profile.proteinGPerKg !== undefined ? String(profile.proteinGPerKg) : '1.8');
    setRenalEnabled(profile.renalEnabled);
    setRenalStageId(profile.renalStageId);
    setDialysisModality(profile.dialysisModality);
  }, [profile]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedMessage(null);
    try {
      await update({
        sex,
        age: Number(age),
        heightCm: Number(heightCm),
        activityLevel,
        proteinGPerKg: Number(proteinGPerKg),
        renalEnabled,
        renalStageId,
        dialysisModality,
      });
      setSavedMessage('Tus datos se guardaron correctamente.');
    } catch {
      setSavedMessage('Ocurrió un error al guardar. Intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="zen-loading">🌿 Cargando tu perfil...</div>;
  }

  return (
    <div className="zen-page zen-page--stacked">
      <div className="zen-stack">
        <div className="zen-card zen-card--wide">
          <div className="zen-card__header">
            <div className="zen-card__icon">📋</div>
            <h1>Mi perfil</h1>
            <p>Estos datos casi no cambian; los usamos para calcular tus objetivos.</p>
          </div>

          <form onSubmit={handleSave} noValidate>
            <div className="zen-field">
              <label>Correo electrónico</label>
              <p style={{ margin: 0, color: 'var(--zen-text-soft)' }}>{user?.email}</p>
            </div>

            <div className="zen-field">
              <label>Sexo</label>
              <div className="zen-toggle-group">
                <button
                  type="button"
                  className={`zen-toggle ${sex === 'female' ? 'active' : ''}`}
                  onClick={() => setSex('female')}
                >
                  Mujer
                </button>
                <button
                  type="button"
                  className={`zen-toggle ${sex === 'male' ? 'active' : ''}`}
                  onClick={() => setSex('male')}
                >
                  Hombre
                </button>
              </div>
            </div>

            <div className="zen-field-row">
              <div className="zen-field">
                <label htmlFor="age">Edad (años)</label>
                <input
                  id="age"
                  type="number"
                  min={10}
                  max={119}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                />
              </div>
              <div className="zen-field">
                <label htmlFor="height">Estatura (cm)</label>
                <input
                  id="height"
                  type="number"
                  min={100}
                  max={259}
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="zen-field">
              <label htmlFor="activity">Nivel de actividad física</label>
              <select
                id="activity"
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
              >
                {ACTIVITY_LEVELS.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="zen-field">
              <label htmlFor="proteinGPerKg">Proteína objetivo (g por kg de peso)</label>
              <input
                id="proteinGPerKg"
                type="number"
                step="0.1"
                min={1.0}
                max={3.0}
                value={proteinGPerKg}
                onChange={(e) => setProteinGPerKg(e.target.value)}
              />
              <small style={{ color: 'var(--zen-text-soft)', fontSize: '0.78rem' }}>
                Recomendado: 1.6–2.2 g/kg para preservar músculo en déficit. 1.8 es un buen punto de partida; súbelo
                solo si entrenas fuerza con frecuencia y tienes bajo % de grasa. (No aplica si activas el ajuste
                renal abajo — ahí la proteína se calcula distinto.)
              </small>
            </div>

            <hr className="zen-divider" />

            <label className="zen-switch-row">
              <span>🫘 Tengo un solo riñón / considerar función renal (TFG)</span>
              <span
                className={`zen-switch ${renalEnabled ? 'on' : ''}`}
                onClick={() => setRenalEnabled((v) => !v)}
              >
                <span className="zen-switch__dot" />
              </span>
            </label>

            {renalEnabled && (
              <div style={{ marginTop: 14 }}>
                <p className="zen-disclaimer" style={{ marginTop: 0 }}>
                  Ajusta la <strong>proteína</strong> y el <strong>límite de sodio</strong> de todos tus objetivos
                  según el estadio de TFG que elijas. <strong>No sustituye la valoración de un nefrólogo o
                  nutriólogo renal.</strong>
                </p>

                <div className="zen-field">
                  <label htmlFor="renalStage">Estadio de función renal (TFG)</label>
                  <select
                    id="renalStage"
                    value={renalStageId}
                    onChange={(e) => setRenalStageId(e.target.value)}
                  >
                    {RENAL_STAGES.map((stage) => (
                      <option key={stage.id} value={stage.id}>
                        {stage.tfgLabel} — {stage.description}
                      </option>
                    ))}
                  </select>
                </div>

                {renalStageId === 'g5' && (
                  <div className="zen-field">
                    <label htmlFor="dialysis">¿Está en diálisis?</label>
                    <select
                      id="dialysis"
                      value={dialysisModality}
                      onChange={(e) => setDialysisModality(e.target.value as DialysisModality)}
                    >
                      <option value="none">No, manejo conservador</option>
                      <option value="hemodialysis">Sí, hemodiálisis</option>
                      <option value="peritoneal">Sí, diálisis peritoneal</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {savedMessage && (
              <p className="zen-footer-text" style={{ marginTop: 12 }}>
                {savedMessage}
              </p>
            )}

            <button type="submit" className="zen-btn" disabled={isSaving} style={{ marginTop: 18 }}>
              {isSaving ? 'Guardando...' : 'Guardar mis datos'}
            </button>
          </form>
        </div>

        <button
          type="button"
          className="zen-btn zen-btn--ghost"
          onClick={() => navigate('/dashboard')}
          style={{ maxWidth: 640, margin: '0 auto', width: '100%' }}
        >
          ← Volver al dashboard
        </button>
      </div>
    </div>
  );
}