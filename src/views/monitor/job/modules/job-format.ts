import dayjs from 'dayjs';

/** Format a backend timestamp (milliseconds number or date string) for the job pages */
export function formatDateTime(value?: number | string | null) {
  if (value == null || value === '') {
    return '—';
  }

  const time = typeof value === 'number' ? value : Number(value);

  if (Number.isFinite(time) && String(value).length >= 10 && !String(value).includes('-')) {
    return dayjs(time).format('YYYY-MM-DD HH:mm:ss');
  }

  return String(value);
}
