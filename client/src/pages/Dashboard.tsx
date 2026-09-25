import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { useWeights } from '../hooks/useWeights';
import WeightTab from '../components/WeightTab';
import DiaryTab from '../components/DiaryTab';
import MeasurementsTab from '../components/MeasurementsTab';
import { fetchWeekLogs, type WeekLogsResponse } from '../api/dailyLogs';
import {
  ACTIVITY_LEVELS,
  GOAL_KEYS,
  GOAL_LABELS,
  calculateCalorieTargets,
  calculateRenalProtein,
  type GoalKey,
} from '../utils/health';
import { todayDateKey } from '../utils/date';

type SectionTab = 'resumen' | 'peso' | 'diario' | 'medidas';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { profile, update: updateProfile } = useProfile();
  const { data: weightsData, addWeight, isLoading: weightsLoading } = useWeights(365);

  const [activeSection, setActiveSection] = useState<SectionTab>('resumen');
  const [weekSummary, setWeekSummary] = useState<WeekLogsResponse | null>(null);

  useEffect(() => {
    if (activeSection !== 'resumen') return;
    let cancelled = false;
    fetchWeekLogs()
      .then((res) => {
        if (!cancelled) setWeekSummary(res);
      })
      .catch(() => {
        // Si falla, simplemente no mostramos el total semanal; no es crítico.
      });
    return () => {
      cancelled = true;
    };
  }, [activeSection]);

  const [weightInput, setWeightInput] = useState('');
  const [weightDate, setWeightDate] = useState(todayDateKey());
  const [isLoggingWeight, setIsLoggingWeight] = useState(false);
  const [weightMessage, setWeightMessage] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleLogWeight = async (e: FormEvent) => {
    e.preventDefault();
    const value = Number(weightInput);
    if (!value || value <= 0) return;
    setIsLoggingWeight(true);
    setWeightMessage(null);
    try {
      await addWeight(value, weightDate);
      setWeightInput('');
      setWeightDate(todayDateKey());
      setWeightMessage(weightDate === todayDateKey() ? 'Peso guardado.' : `Peso del ${weightDate} actualizado.`);
    } catch {
      setWeightMessage('No se pudo guardar tu peso. Intenta de nuevo.');
    } finally {
      setIsLoggingWeight(false);
    }
  };

  const handleSelectWeightHistory = (dateKey: string, weightKg: number) => {
    setWeightDate(dateKey);
    setWeightInput(String(weightKg));
    setWeightMessage(null);
  };

  const isProfileComplete = !!(profile && profile.age && profile.heightCm);
  const weightForCalc = weightsData?.rollingAverage7d ?? weightsData?.latestWeightKg ?? null;

  const renalResult = useMemo(() => {
    if (!profile?.renalEnabled || !weightForCalc) return null;
    return calculateRenalProtein(profile.renalStageId, weightForCalc, profile.dialysisModality);
  }, [profile, weightForCalc]);

  const targets = useMemo(() => {
    if (!isProfileComplete || !profile || !profile.age || !profile.heightCm || !weightForCalc) return null;
    return calculateCalorieTargets(
      {
        sex: profile.sex,
        age: profile.age,
        heightCm: profile.heightCm,
        weightKg: weightForCalc,
        activityLevel: profile.activityLevel,
      },
      renalResult ? { proteinGPerKg: renalResult.avgGPerKg, sodiumMaxMg: renalResult.sodiumMaxMg } : null,
      profile.proteinGPerKg
    );
  }, [isProfileComplete, profile, weightForCalc, renalResult]);

  const activeGoalKey: GoalKey = profile?.activeGoalKey ?? 'maintenance';
  const activeTarget = targets?.find((t) => t.key === activeGoalKey) ?? null;

  const handleSelectGoal = async (key: GoalKey) => {
    if (!profile) return;
    try {
      await updateProfile({ activeGoalKey: key });
    } catch {
      // Si falla la persistencia del selector, no interrumpimos al usuario.
    }
  };

  return (
    <div className="zen-page zen-page--stacked">
      <div className="zen-stack">
        {/* --- Barra superior delgada --- */}
        <div className="zen-topbar">
          <span className="zen-topbar__brand">🌿 Zen</span>
          <span className="zen-topbar__greeting">Hola, {user?.name}</span>
          <button type="button" className="zen-topbar__logout" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>

        {/* --- Navegación por secciones --- */}
        <div className="zen-section-tabs">
          <button
            type="button"
            className={`zen-section-tab ${activeSection === 'resumen' ? 'active' : ''}`}
            onClick={() => setActiveSection('resumen')}
          >
            Resumen
          </button>
          <button
            type="button"
            className={`zen-section-tab ${activeSection === 'peso' ? 'active' : ''}`}
            onClick={() => setActiveSection('peso')}
          >
            Peso
          </button>
          <button
            type="button"
            className={`zen-section-tab ${activeSection === 'diario' ? 'active' : ''}`}
            onClick={() => setActiveSection('diario')}
          >
            Diario
          </button>
          <button
            type="button"
            className={`zen-section-tab ${activeSection === 'medidas' ? 'active' : ''}`}
            onClick={() => setActiveSection('medidas')}
          >
            Medidas
          </button>
        </div>

        {/* --- Resumen --- */}
        {activeSection === 'resumen' && (
          <>
            <div className="zen-card zen-card--wide">
              <div className="zen-profile-summary">
                {isProfileComplete ? (
                  <p style={{ margin: 0 }}>
                    {profile!.sex === 'male' ? 'Hombre' : 'Mujer'} · {profile!.age} años · {profile!.heightCm} cm ·{' '}
                    {ACTIVITY_LEVELS.find((a) => a.id === profile!.activityLevel)?.label.split(' · ')[0]}
                    {profile!.renalEnabled ? ' · Ajuste renal activo' : ''}
                  </p>
                ) : (
                  <p style={{ margin: 0, color: 'var(--zen-text-soft)' }}>Aún no completas tu perfil.</p>
                )}
                <Link to="/profile" className="zen-btn zen-btn--ghost zen-btn--small">
                  {isProfileComplete ? 'Editar' : 'Completar perfil'}
                </Link>
              </div>

              {!weightsLoading && weightForCalc && (
                <p className="zen-footer-text" style={{ marginTop: 14, marginBottom: 0 }}>
                  Peso (promedio 7 días): <strong>{weightForCalc} kg</strong> 
                  .
                </p>
              )}

              {weekSummary && (
                <p className="zen-footer-text" style={{ marginTop: 10, marginBottom: 0 }}>
                  Kcal consumidas esta semana:{' '}
                  <strong>{weekSummary.totalKcal.toLocaleString('es-MX')} kcal</strong> ·{' '}
                  {weekSummary.entries.length}/7 días registrados 
                  .
                </p>
              )}
            </div>

            {!isProfileComplete && (
              <div className="zen-card zen-card--wide">
                <p className="zen-footer-text">
                  Completa tu perfil (arriba) para poder calcular tus objetivos calóricos.
                </p>
              </div>
            )}

            {isProfileComplete && !weightForCalc && (
              <div className="zen-card zen-card--wide">
                <p className="zen-footer-text">
                  Registra tu peso en la pestaña "Peso" para calcular tus objetivos calóricos.
                </p>
              </div>
            )}

            {targets && activeTarget && (
              <div className="zen-card zen-card--wide">
                <div className="zen-card__header" style={{ marginBottom: 12 }}>
                  <h1 style={{ fontSize: '1.2rem' }}>Tu meta</h1>
                </div>

                <div className="zen-tabs">
                  {GOAL_KEYS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      className={`zen-tab ${activeGoalKey === key ? 'active' : ''}`}
                      onClick={() => handleSelectGoal(key)}
                    >
                      {GOAL_LABELS[key]}
                    </button>
                  ))}
                </div>

                <div className="zen-result-card" style={{ marginTop: 16 }}>
                  <h3>{activeTarget.label}</h3>
                  <div className="zen-result-row">
                    <span>Kcal / día</span>
                    <span>{activeTarget.dailyKcal.toLocaleString('es-MX')} kcal</span>
                  </div>
                  <div className="zen-result-row">
                    <span>Kcal / semana</span>
                    <span>{activeTarget.weeklyKcal.toLocaleString('es-MX')} kcal</span>
                  </div>
                  <div className="zen-result-row">
                    <span>Proteína</span>
                    <span>{activeTarget.macros.proteinG} g</span>
                  </div>
                  <div className="zen-result-row">
                    <span>Carbohidratos</span>
                    <span>{activeTarget.macros.carbsG} g</span>
                  </div>
                  <div className="zen-result-row">
                    <span>Grasas</span>
                    <span>{activeTarget.macros.fatG} g</span>
                  </div>
                  <div className="zen-result-row">
                    <span>Fibra</span>
                    <span>{activeTarget.macros.fiberG} g</span>
                  </div>
                  {activeTarget.sodiumMaxMg && (
                    <div className="zen-result-row">
                      <span>Sodio máximo</span>
                      <span>{activeTarget.sodiumMaxMg.toLocaleString('es-MX')} mg</span>
                    </div>
                  )}
                  {activeTarget.warning && <p className="zen-warning">{activeTarget.warning}</p>}
                </div>

                <p className="zen-disclaimer">
                  Calculado con tu promedio de peso de 7 días ({weightForCalc} kg)
                  {profile?.renalEnabled ? ', con el ajuste renal de tu perfil aplicado' : ''}. Estimaciones
                  educativas; no sustituyen la valoración de un nutriólogo
                  {profile?.renalEnabled ? ' ni de un nefrólogo' : ''}.
                </p>
              </div>
            )}
          </>
        )}

        {/* --- Peso --- */}
        {activeSection === 'peso' && (
          <WeightTab
            data={weightsData}
            isLoading={weightsLoading}
            weightInput={weightInput}
            onWeightInputChange={setWeightInput}
            weightDate={weightDate}
            onWeightDateChange={setWeightDate}
            onSubmit={handleLogWeight}
            isSubmitting={isLoggingWeight}
            message={weightMessage}
            onSelectHistoryEntry={handleSelectWeightHistory}
          />
        )}

        {/* --- Diario --- */}
        {activeSection === 'diario' && <DiaryTab />}

        {/* --- Medidas --- */}
        {activeSection === 'medidas' && <MeasurementsTab />}
      </div>
    </div>
  );
}