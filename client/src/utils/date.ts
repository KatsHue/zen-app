// Fecha LOCAL del navegador (no UTC), para que "hoy" corresponda al día real
// del usuario sin importar en qué zona horaria esté el servidor.
export function todayDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Mes LOCAL actual en formato YYYY-MM, para registros mensuales (ej. medidas corporales).
export function currentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// Fecha LOCAL de hace N días, en formato YYYY-MM-DD. Útil para filtrar por rango
// (ej. "últimos 30 días") comparando strings de fecha, que ordenan igual que las fechas reales.
export function dateKeyDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}