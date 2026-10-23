import type { Ref } from 'vue';

import { $t } from '@/locales';

/**
 * Transform a record to options
 *
 * @example
 *   const record = {
 *     key1: 'label1',
 *     key2: 'label2'
 *   };
 *   const options = transformRecordToOption(record);
 *   // [
 *   //   { value: 'key1', label: 'label1' },
 *   //   { value: 'key2', label: 'label2' }
 *   // ]
 *
 * @param record
 */
export function transformRecordToOption<T extends Record<string, string>>(record: T) {
  return Object.entries(record).map(([value, label]) => ({
    value,
    label,
  })) as CommonType.Option<keyof T, T[keyof T]>[];
}

/**
 * Translate options
 *
 * @param options
 */
export function translateOptions(options: CommonType.Option<string, App.I18n.I18nKey>[]) {
  return options.map((option) => ({
    ...option,
    label: $t(option.label),
  }));
}

/**
 * Toggle an html class
 *
 * @param className
 */
export function toggleHtmlClass(className: string) {
  function add() {
    document.documentElement.classList.add(className);
  }

  function remove() {
    document.documentElement.classList.remove(className);
  }

  return {
    add,
    remove,
  };
}

/** Clone a JSON serializable value */
export function jsonClone<T>(value: T): T {
  // Pinia state contains reactive proxies which structuredClone cannot clone.
  // eslint-disable-next-line unicorn/prefer-structured-clone
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Get the value of a possibly ref value */
export function unrefElement<T>(value: T | Ref<T>): T {
  return (value as Ref<T>)?.value ?? (value as T);
}

/** Whether the value is a non-empty string */
export function isString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/** Sleep for a number of milliseconds */
export function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}
