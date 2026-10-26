/** The field types supported by the form builder */
export type BuilderFieldType =
  | 'input'
  | 'textarea'
  | 'password'
  | 'number'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'switch'
  | 'slider'
  | 'date'
  | 'time'
  | 'button';

/** The palette groups of the builder */
export type BuilderPaletteGroup = 'input' | 'select' | 'action';

/** A single option of a choice field */
export interface BuilderOption {
  label: string;
  value: string | number;
}

/** A field placed on the builder canvas */
export interface BuilderField {
  id: number;
  type: BuilderFieldType;
  model: string;
  label: string;
  placeholder: string;
  required: boolean;
  span: number;
  defaultValue: unknown;
  options: BuilderOption[];
  min?: number;
  max?: number;
  step?: number;
  buttonText?: string;
  buttonColor?: string;
  disabled: boolean;
}

/** The settings of the generated form */
export interface BuilderFormConfig {
  formRef: string;
  modelName: string;
  showActions: boolean;
  submitText: string;
  resetText: string;
  disabled: boolean;
}

/** The document emitted by the form builder preview */
export interface BuilderDocument {
  form: BuilderFormConfig;
  fields: BuilderField[];
}

/** An item of the component palette */
export interface PaletteItem {
  type: BuilderFieldType;
  labelKey: App.I18n.I18nKey;
  icon: string;
  group: BuilderPaletteGroup;
}
