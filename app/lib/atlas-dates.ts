export function todayYmd(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysYmd(ymd: string, days: number): string {
  const safeDays = Number.isFinite(days) ? Math.max(0, Math.trunc(days)) : 0;
  const [y, m, d] = ymd.split('-').map((v) => Number.parseInt(v, 10));
  if (!y || !m || !d) return ymd;
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + safeDays);
  return todayYmd(dt);
}

export function isOverdue(dueDateYmd: string, isPaid: boolean, nowYmd: string = todayYmd()): boolean {
  if (isPaid) return false;
  if (!dueDateYmd) return false;
  return dueDateYmd < nowYmd;
}

