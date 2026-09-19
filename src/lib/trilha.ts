export type StepInfo = {
  step: number | null;
  label: string;
  weekday: string;
};

const WEEKDAYS = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
];

export type Time = {
  id: number;
  nome: string;
};

/** Converte "2026-08-12" em Date local (evita o deslocamento de fuso do ISO). */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Terça = passo 3, quinta = passo 4, demais dias = voluntariado extra. */
export function stepForISODate(iso: string): StepInfo {
  const date = parseISODate(iso);
  const day = date.getDay();
  const weekday = WEEKDAYS[day] ?? "";
  if (day === 2) return { step: 3, label: "Passo 3 da trilha", weekday };
  if (day === 4) return { step: 4, label: "Passo 4 da trilha", weekday };
  return { step: null, label: "Voluntariado extra", weekday };
}

export function stepLabel(step: number | null): string {
  if (step === 3) return "Passo 3";
  if (step === 4) return "Passo 4";
  return "Extra";
}

export function formatDateLong(iso: string): string {
  return parseISODate(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatDateShort(iso: string): string {
  return parseISODate(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export function monthRange(monthValue: string): { start: string; end: string } {
  const [y, m] = monthValue.split("-").map(Number);
  const year = y ?? new Date().getFullYear();
  const month = m ?? 1;
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return { start: toISODate(start), end: toISODate(end) };
}

export function currentMonthValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, "0")}`;
}

export function formatMonthLabel(monthValue: string): string {
  const [y, m] = monthValue.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}
