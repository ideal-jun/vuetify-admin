import { $t } from '@/locales';

/** Operation log status: "0" success, "1" fail */
export const operlogStatusRecord: Record<Api.Backend.Status, App.I18n.I18nKey> = {
  '0': 'page.operlog.status.success',
  '1': 'page.operlog.status.fail',
};

/** Business type of an operation log (sys_oper_type dictionary) */
export const businessTypeRecord: Record<number, App.I18n.I18nKey> = {
  0: 'page.operlog.businessType.other',
  1: 'page.operlog.businessType.insert',
  2: 'page.operlog.businessType.update',
  3: 'page.operlog.businessType.delete',
  4: 'page.operlog.businessType.grant',
  5: 'page.operlog.businessType.export',
  6: 'page.operlog.businessType.import',
  7: 'page.operlog.businessType.forceLogout',
  8: 'page.operlog.businessType.genCode',
  9: 'page.operlog.businessType.clean',
};

export const businessTypeOptions = Object.entries(businessTypeRecord).map(([value, label]) => ({
  value: Number(value),
  label,
}));

/** Translate a business type, unknown values fall back to the raw value */
export function getBusinessTypeLabel(businessType: number) {
  const key = businessTypeRecord[businessType];

  return key ? $t(key) : String(businessType);
}
