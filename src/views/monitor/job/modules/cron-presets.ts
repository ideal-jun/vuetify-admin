/** A common cron expression offered by the job form */
export interface CronPreset {
  key: string;
  expression: string;
}

/** The common cron expressions inserted from the job form */
export const CRON_PRESETS: CronPreset[] = [
  { key: 'everyMinute', expression: '0 * * * * ?' },
  { key: 'everyFiveMinutes', expression: '0 0/5 * * * ?' },
  { key: 'everyHour', expression: '0 0 * * * ?' },
  { key: 'everyDayAtTwo', expression: '0 0 2 * * ?' },
  { key: 'everyMonday', expression: '0 0 2 ? * MON' },
  { key: 'firstDayOfMonth', expression: '0 0 2 1 * ?' },
];
