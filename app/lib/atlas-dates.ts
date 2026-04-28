export function todayYmd(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysYmd(ymd: string, days: number): string {
  const base = new Date(`${ymd}T00:00:00`);
  base.setDate(base.getDate() + days);
  return base.toISOString().slice(0, 10);
}

export function isPastYmd(a: string, b: string): boolean {
  // a < b
  return a.localeCompare(b) < 0;
}

export function isOverdue(dueDate: string, paid: boolean, nowYmd = todayYmd()): boolean {
  return !paid && isPastYmd(dueDate, nowYmd);
}

