import { $t } from '@/locales';
import { jsonClone } from '@/utils/common';

import type {
  BuilderField,
  BuilderFieldType,
  BuilderFormConfig,
  BuilderOption,
  BuilderPaletteGroup,
  PaletteItem,
} from './types';

/** The i18n key of every field type label */
export const fieldTypeLabelKeys: Record<BuilderFieldType, App.I18n.I18nKey> = {
  input: 'page.build.components.input',
  textarea: 'page.build.components.textarea',
  password: 'page.build.components.password',
  number: 'page.build.components.number',
  select: 'page.build.components.select',
  radio: 'page.build.components.radio',
  checkbox: 'page.build.components.checkbox',
  switch: 'page.build.components.switch',
  slider: 'page.build.components.slider',
  date: 'page.build.components.date',
  time: 'page.build.components.time',
  button: 'page.build.components.button',
};

/** The groups of the component palette */
export const paletteGroupMeta: {
  group: BuilderPaletteGroup;
  labelKey: App.I18n.I18nKey;
  icon: string;
}[] = [
  { group: 'input', labelKey: 'page.build.palette.input', icon: 'mdi-form-textbox' },
  { group: 'select', labelKey: 'page.build.palette.select', icon: 'mdi-form-dropdown' },
  { group: 'action', labelKey: 'page.build.palette.action', icon: 'mdi-gesture-tap-button' },
];

/** The components available in the palette */
export const paletteItems: PaletteItem[] = [
  { type: 'input', group: 'input', icon: 'mdi-form-textbox', labelKey: fieldTypeLabelKeys.input },
  {
    type: 'textarea',
    group: 'input',
    icon: 'mdi-form-textarea',
    labelKey: fieldTypeLabelKeys.textarea,
  },
  {
    type: 'password',
    group: 'input',
    icon: 'mdi-form-textbox-password',
    labelKey: fieldTypeLabelKeys.password,
  },
  { type: 'number', group: 'input', icon: 'mdi-numeric', labelKey: fieldTypeLabelKeys.number },
  {
    type: 'select',
    group: 'select',
    icon: 'mdi-form-dropdown',
    labelKey: fieldTypeLabelKeys.select,
  },
  {
    type: 'radio',
    group: 'select',
    icon: 'mdi-radiobox-marked',
    labelKey: fieldTypeLabelKeys.radio,
  },
  {
    type: 'checkbox',
    group: 'select',
    icon: 'mdi-checkbox-multiple-marked-outline',
    labelKey: fieldTypeLabelKeys.checkbox,
  },
  {
    type: 'switch',
    group: 'select',
    icon: 'mdi-toggle-switch',
    labelKey: fieldTypeLabelKeys.switch,
  },
  {
    type: 'slider',
    group: 'select',
    icon: 'mdi-tune-vertical',
    labelKey: fieldTypeLabelKeys.slider,
  },
  { type: 'date', group: 'select', icon: 'mdi-calendar', labelKey: fieldTypeLabelKeys.date },
  { type: 'time', group: 'select', icon: 'mdi-clock-outline', labelKey: fieldTypeLabelKeys.time },
  {
    type: 'button',
    group: 'action',
    icon: 'mdi-gesture-tap-button',
    labelKey: fieldTypeLabelKeys.button,
  },
];

/** The colors available for a button field */
export const buttonColors = ['primary', 'secondary', 'success', 'info', 'warning', 'error'];

/** The field types that store a list of options */
const optionTypes: Set<BuilderFieldType> = new Set(['select', 'radio', 'checkbox']);

/** The field types that store a plain text value */
const textTypes: Set<BuilderFieldType> = new Set(['input', 'textarea', 'password', 'date', 'time']);

/** Whether the field type renders an editable placeholder */
export function hasPlaceholder(type: BuilderFieldType): boolean {
  return ['input', 'textarea', 'password', 'select'].includes(type);
}

/** Whether the field type stores a list of options */
export function hasOptions(type: BuilderFieldType): boolean {
  return optionTypes.has(type);
}

/** Whether the field type stores a plain text value */
export function isTextType(type: BuilderFieldType): boolean {
  return textTypes.has(type);
}

/** Create the default form settings */
export function createDefaultFormConfig(): BuilderFormConfig {
  return {
    formRef: 'formRef',
    modelName: 'formData',
    showActions: true,
    submitText: $t('page.build.defaults.submit'),
    resetText: $t('page.build.defaults.reset'),
    disabled: false,
  };
}

function createDefaultOptions(): BuilderOption[] {
  return [
    { label: $t('page.build.defaults.optionOne'), value: 1 },
    { label: $t('page.build.defaults.optionTwo'), value: 2 },
  ];
}

/** Create a field name that is not used yet */
export function createModelName(usedModels: string[]): string {
  let index = 1;

  while (usedModels.includes('field' + index)) {
    index += 1;
  }

  return 'field' + index;
}

/** Create a new field from the palette type */
export function createField(
  type: BuilderFieldType,
  id: number,
  usedModels: string[],
): BuilderField {
  const field: BuilderField = {
    id,
    type,
    model: createModelName(usedModels),
    label: $t(fieldTypeLabelKeys[type]),
    placeholder: '',
    required: type !== 'button',
    span: 12,
    defaultValue: '',
    options: [],
    disabled: false,
  };

  switch (type) {
    case 'input':
    case 'textarea':
    case 'password': {
      field.placeholder = $t('page.build.defaults.placeholder');
      break;
    }
    case 'number': {
      field.defaultValue = null;
      field.min = 0;
      field.max = 100;
      field.step = 1;
      break;
    }
    case 'select': {
      field.placeholder = $t('page.build.defaults.selectPlaceholder');
      field.defaultValue = null;
      field.options = createDefaultOptions();
      break;
    }
    case 'radio': {
      field.defaultValue = null;
      field.options = createDefaultOptions();
      break;
    }
    case 'checkbox': {
      field.defaultValue = [];
      field.options = createDefaultOptions();
      break;
    }
    case 'switch': {
      field.required = false;
      field.defaultValue = false;
      break;
    }
    case 'slider': {
      field.required = false;
      field.defaultValue = 0;
      field.min = 0;
      field.max = 100;
      field.step = 1;
      break;
    }
    case 'button': {
      field.buttonText = $t('page.build.defaults.buttonText');
      field.buttonColor = 'primary';
      break;
    }
    default: {
      break;
    }
  }

  return field;
}

/** Clone a field placed on the canvas and give it a fresh name */
export function cloneField(field: BuilderField, id: number, usedModels: string[]): BuilderField {
  const clone = jsonClone(field);

  clone.id = id;
  clone.model = createModelName(usedModels);

  return clone;
}

/** Normalize the stored default value to the value shape expected by the field type */
export function normalizeDefaultValue(field: BuilderField): unknown {
  switch (field.type) {
    case 'number': {
      return typeof field.defaultValue === 'number' ? field.defaultValue : null;
    }
    case 'switch': {
      return Boolean(field.defaultValue);
    }
    case 'slider': {
      return typeof field.defaultValue === 'number' ? field.defaultValue : (field.min ?? 0);
    }
    case 'checkbox': {
      return Array.isArray(field.defaultValue) ? field.defaultValue : [];
    }
    case 'select':
    case 'radio': {
      return field.defaultValue ?? null;
    }
    case 'button': {
      return null;
    }
    default: {
      return typeof field.defaultValue === 'string' ? field.defaultValue : '';
    }
  }
}

/** Create the initial interactive value of a field */
export function createInitialValue(field: BuilderField): unknown {
  const value = normalizeDefaultValue(field);

  return Array.isArray(value) ? [...value] : value;
}
