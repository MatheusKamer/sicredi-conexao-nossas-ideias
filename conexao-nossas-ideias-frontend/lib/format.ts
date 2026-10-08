const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});
const timeFormatter = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });
const percentFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  maximumFractionDigits: 1,
});

function dateParts(value: string | Date) {
  const parts = dateFormatter.formatToParts(new Date(value));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';

  return { day: get('day'), month: get('month').replace('.', ''), year: get('year') };
}

/** "07 out 2026" */
export function formatDate(value: string | Date) {
  const { day, month, year } = dateParts(value);
  return `${day} ${month} ${year}`;
}

/** "14:32" */
export function formatTime(value: string | Date) {
  return timeFormatter.format(new Date(value));
}

/** "agora", "há 5 min", "há 2 h", "ontem", "28 set" */
export function formatRelative(value: string | Date, now = new Date()) {
  const date = new Date(value);
  const minutes = Math.floor((now.getTime() - date.getTime()) / 60_000);

  if (minutes < 1) return 'agora';
  if (minutes < 60) return `há ${minutes} min`;
  if (minutes < 24 * 60) return `há ${Math.floor(minutes / 60)} h`;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'ontem';

  const { day, month } = dateParts(date);
  return `${day} ${month}`;
}

/** 0.528 -> "52,8%" */
export function formatPercent(ratio: number) {
  return percentFormatter.format(ratio);
}

/** Short, human-friendly reference for a request UUID: "#3B248836". */
export function formatRequestCode(id: string) {
  return `#${id.slice(0, 8).toUpperCase()}`;
}

/** "Theodor Amstad" -> "TA" */
export function initials(name: string | null | undefined) {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  return (words[0][0] + (words.length > 1 ? words[words.length - 1][0] : '')).toUpperCase();
}
