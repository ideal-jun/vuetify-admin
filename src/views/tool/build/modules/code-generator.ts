import { $t } from '@/locales';

import { hasPlaceholder, normalizeDefaultValue } from './field-config';
import type { BuilderField, BuilderFormConfig, BuilderOption } from './types';

const INDENT = '  ';
const NEWLINE = String.fromCodePoint(10);

/** Escape a value rendered as static html text or attribute */
function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('{', '&#123;')
    .replaceAll('}', '&#125;');
}

/** Escape a value used inside a bound attribute expression */
function escapeAttribute(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
}

/** Quote a value as a single quoted JavaScript string */
function quote(value: string): string {
  const backslash = String.fromCodePoint(92);
  const escaped = value
    .split(backslash)
    .join(backslash + backslash)
    .split("'")
    .join(backslash + "'")
    .split(String.fromCodePoint(10))
    .join(' ')
    .split(String.fromCodePoint(13))
    .join('');

  return "'" + escaped + "'";
}

/** Turn a JSON serializable value into a JavaScript literal */
function literal(value: unknown): string {
  if (value === null || value === undefined) {
    return 'null';
  }

  if (typeof value === 'string') {
    return quote(value);
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return '[' + value.map((item) => literal(item)).join(', ') + ']';
  }

  return 'null';
}

function staticAttribute(name: string, value: string): string {
  return name + '="' + escapeHtml(value) + '"';
}

function boundAttribute(name: string, expression: string): string {
  return name + '="' + escapeAttribute(expression) + '"';
}

function indentLines(lines: string[], depth: number): string[] {
  const prefix = INDENT.repeat(depth);

  return lines.map((line) => (line ? prefix + line : line));
}

function selfClosingTag(tagName: string, attributes: string[]): string[] {
  if (attributes.length === 0) {
    return ['<' + tagName + ' />'];
  }

  return ['<' + tagName, ...attributes.map((attribute) => INDENT + attribute), '/>'];
}

/** Whether the generated form should add a required rule for the field */
function hasRules(field: BuilderField): boolean {
  return (
    field.required && field.type !== 'switch' && field.type !== 'slider' && field.type !== 'button'
  );
}

function requiredRule(field: BuilderField): string {
  const message = $t('page.build.generated.required', { label: field.label });

  if (field.type === 'checkbox') {
    return '(value: unknown) => (Array.isArray(value) && value.length > 0) || ' + quote(message);
  }

  if (field.type === 'number') {
    return "(value: unknown) => typeof value === 'number' || " + quote(message);
  }

  return "(value: unknown) => String(value ?? '').trim().length > 0 || " + quote(message);
}

function valueLiteral(field: BuilderField): string {
  return literal(normalizeDefaultValue(field));
}

function optionsExpression(options: BuilderOption[]): string {
  const items = options.map(
    (option) => '{ title: ' + quote(option.label) + ', value: ' + literal(option.value) + ' }',
  );

  return '[' + items.join(', ') + ']';
}

function baseAttributes(field: BuilderField, form: BuilderFormConfig): string[] {
  const attributes = [
    'v-model="' + form.modelName + '.' + field.model + '"',
    staticAttribute('label', field.label),
  ];

  if (hasPlaceholder(field.type) && field.placeholder) {
    attributes.push(staticAttribute('placeholder', field.placeholder));
  }

  if (hasRules(field)) {
    attributes.push(boundAttribute(':rules', 'rules.' + field.model));
  }

  if (field.disabled) {
    attributes.push('disabled');
  }

  return attributes;
}

function numericAttributes(field: BuilderField): string[] {
  const attributes: string[] = [];

  if (typeof field.min === 'number') {
    attributes.push(boundAttribute(':min', String(field.min)));
  }

  if (typeof field.max === 'number') {
    attributes.push(boundAttribute(':max', String(field.max)));
  }

  if (typeof field.step === 'number') {
    attributes.push(boundAttribute(':step', String(field.step)));
  }

  return attributes;
}

function radioLines(field: BuilderField, form: BuilderFormConfig): string[] {
  const lines = ['<VRadioGroup'];
  const attributes = baseAttributes(field, form);

  lines.push(...attributes.map((attribute) => INDENT + attribute), '>');

  for (const option of field.options) {
    lines.push(
      INDENT +
        '<VRadio ' +
        staticAttribute('label', option.label) +
        ' ' +
        boundAttribute(':value', literal(option.value)) +
        ' />',
    );
  }

  lines.push('</VRadioGroup>');

  return lines;
}

function checkboxLines(field: BuilderField, form: BuilderFormConfig): string[] {
  const model = form.modelName + '.' + field.model;
  const lines = [
    '<div>',
    INDENT + '<div class="mb-1 text-sm">' + escapeHtml(field.label) + '</div>',
    INDENT + '<VInput',
    INDENT.repeat(2) + boundAttribute(':model-value', model),
  ];

  if (hasRules(field)) {
    lines.push(INDENT.repeat(2) + boundAttribute(':rules', 'rules.' + field.model));
  }

  lines.push(
    INDENT.repeat(2) + 'hide-details="auto"',
    INDENT + '>',
    INDENT.repeat(2) + '<div class="d-flex flex-wrap">',
  );

  for (const option of field.options) {
    lines.push(
      INDENT.repeat(3) +
        '<VCheckbox ' +
        [
          'v-model="' + model + '"',
          staticAttribute('label', option.label),
          boundAttribute(':value', literal(option.value)),
          'class="mr-4"',
          'hide-details',
        ].join(' ') +
        ' />',
    );
  }

  lines.push(INDENT.repeat(2) + '</div>', INDENT + '</VInput>', '</div>');

  return lines;
}

/** Create the template lines of a single field */
function createControlLines(field: BuilderField, form: BuilderFormConfig): string[] {
  const base = baseAttributes(field, form);

  switch (field.type) {
    case 'input': {
      return selfClosingTag('VTextField', [
        ...base,
        'density="comfortable"',
        'hide-details="auto"',
      ]);
    }
    case 'textarea': {
      return selfClosingTag('VTextarea', [...base, 'auto-grow', 'rows="2"', 'hide-details="auto"']);
    }
    case 'password': {
      return selfClosingTag('VTextField', [...base, 'type="password"', 'hide-details="auto"']);
    }
    case 'date': {
      return selfClosingTag('VTextField', [...base, 'type="date"', 'hide-details="auto"']);
    }
    case 'time': {
      return selfClosingTag('VTextField', [...base, 'type="time"', 'hide-details="auto"']);
    }
    case 'number': {
      return selfClosingTag('VNumberInput', [
        ...base,
        ...numericAttributes(field),
        'density="comfortable"',
        'hide-details="auto"',
      ]);
    }
    case 'select': {
      return selfClosingTag('VSelect', [
        ...base,
        boundAttribute(':items', optionsExpression(field.options)),
        'clearable',
        'density="comfortable"',
        'hide-details="auto"',
      ]);
    }
    case 'switch': {
      return selfClosingTag('VSwitch', [...base, 'hide-details="auto"']);
    }
    case 'slider': {
      return selfClosingTag('VSlider', [
        ...base,
        ...numericAttributes(field),
        'density="comfortable"',
        'hide-details="auto"',
      ]);
    }
    case 'radio': {
      return radioLines(field, form);
    }
    case 'checkbox': {
      return checkboxLines(field, form);
    }
    case 'button': {
      return [
        '<VBtn ' +
          staticAttribute('color', field.buttonColor || 'primary') +
          ' type="button">' +
          escapeHtml(field.buttonText || field.label) +
          '</VBtn>',
      ];
    }
    default: {
      return ['<!-- Unsupported field type -->'];
    }
  }
}

/** Serialize the current design as a JSON document */
export function stringifyDocument(form: BuilderFormConfig, fields: BuilderField[]): string {
  return JSON.stringify({ form, fields }, null, 2);
}

/** Generate a ready-to-use Vue single-file component from the current design */
export function generateVueCode(form: BuilderFormConfig, fields: BuilderField[]): string {
  const dataFields = fields.filter((field) => field.type !== 'button');
  const ruleFields = fields.filter((field) => hasRules(field));

  const scriptLines: string[] = [
    '<script setup lang="ts">',
    "import { reactive, ref } from 'vue';",
    '',
    'const ' + form.formRef + ' = ref();',
    'const ' + form.modelName + ' = reactive({',
    ...dataFields.map((field) => INDENT + field.model + ': ' + valueLiteral(field) + ','),
    '});',
    '',
  ];

  if (ruleFields.length > 0) {
    scriptLines.push(
      'const rules = {',
      ...ruleFields.map((field) => INDENT + field.model + ': [' + requiredRule(field) + '],'),
      '};',
      '',
    );
  } else {
    scriptLines.push('const rules = {};', '');
  }

  scriptLines.push(
    'function handleSubmit() {',
    INDENT + form.formRef + '.value?.validate().then(({ valid }: { valid: boolean }) => {',
    INDENT.repeat(2) + 'if (!valid) {',
    INDENT.repeat(3) + 'return;',
    INDENT.repeat(2) + '}',
    '',
    INDENT.repeat(2) + '// TODO: submit the form data',
    INDENT.repeat(2) + 'console.log(' + form.modelName + ');',
    INDENT + '});',
    '}',
    '',
    'function handleReset() {',
    INDENT + form.formRef + '.value?.reset();',
    '}',
    '</script>',
  );

  const templateLines: string[] = [
    '<template>',
    INDENT +
      '<VForm ref="' +
      form.formRef +
      '" :model="' +
      form.modelName +
      '"' +
      (form.disabled ? ' disabled' : '') +
      ' @submit.prevent="handleSubmit">',
    INDENT.repeat(2) + '<VRow>',
  ];

  for (const field of fields) {
    templateLines.push(
      INDENT.repeat(3) +
        '<VCol cols="12"' +
        (field.span < 12 ? ' md="' + String(field.span) + '"' : '') +
        '>',
      ...indentLines(createControlLines(field, form), 4),
      INDENT.repeat(3) + '</VCol>',
    );
  }

  if (form.showActions) {
    templateLines.push(
      INDENT.repeat(3) + '<VCol class="d-flex gap-2" cols="12">',
      INDENT.repeat(4) +
        '<VBtn color="primary" type="submit">' +
        escapeHtml(form.submitText) +
        '</VBtn>',
      INDENT.repeat(4) +
        '<VBtn type="button" variant="text" @click="handleReset">' +
        escapeHtml(form.resetText) +
        '</VBtn>',
      INDENT.repeat(3) + '</VCol>',
    );
  }

  templateLines.push(INDENT.repeat(2) + '</VRow>', INDENT + '</VForm>', '</template>');

  return [...scriptLines, '', ...templateLines].join(NEWLINE);
}
