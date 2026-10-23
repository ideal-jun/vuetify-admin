import { transformRecordToOption } from '@/utils/common';

export const enableStatusRecord: Record<Api.Common.EnableStatus, App.I18n.I18nKey> = {
  '1': 'page.system.user.status.enabled',
  '2': 'page.system.user.status.disabled',
};

export const enableStatusOptions = transformRecordToOption(enableStatusRecord);

export const userGenderRecord: Record<Api.SystemManage.UserGender, App.I18n.I18nKey> = {
  '1': 'page.system.user.gender.male',
  '2': 'page.system.user.gender.female',
};

export const userGenderOptions = transformRecordToOption(userGenderRecord);

/** Button permission codes used by the management pages */
export const permissionCodes = {
  menuAdd: 'system:menu:add',
  menuEdit: 'system:menu:edit',
  menuDelete: 'system:menu:delete',
  roleAdd: 'system:role:add',
  roleEdit: 'system:role:edit',
  roleDelete: 'system:role:delete',
  userAdd: 'system:user:add',
  userEdit: 'system:user:edit',
  userDelete: 'system:user:delete',
} as const;
