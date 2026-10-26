import { transformRecordToOption } from '@/utils/common';

/** Login log status: "0" success, "1" fail */
export const logininforStatusRecord: Record<Api.Backend.Status, App.I18n.I18nKey> = {
  '0': 'page.logininfor.status.success',
  '1': 'page.logininfor.status.fail',
};

export const logininforStatusOptions = transformRecordToOption(logininforStatusRecord);
