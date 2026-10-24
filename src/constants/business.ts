import { transformRecordToOption } from '@/utils/common';

/** backend status: "0" normal, "1" disabled */
export const enableStatusRecord: Record<Api.Common.EnableStatus, App.I18n.I18nKey> = {
  '0': 'page.system.common.status.normal',
  '1': 'page.system.common.status.disabled',
};

export const enableStatusOptions = transformRecordToOption(enableStatusRecord);

/** backend sex: "0" male, "1" female, "2" unknown */
export const userSexRecord: Record<Api.Backend.Sex, App.I18n.I18nKey> = {
  '0': 'page.system.user.sex.male',
  '1': 'page.system.user.sex.female',
  '2': 'page.system.user.sex.unknown',
};

export const userSexOptions = transformRecordToOption(userSexRecord);

/** backend menu type: "M" directory, "C" menu, "F" button */
export const menuTypeRecord: Record<Api.Backend.MenuType, App.I18n.I18nKey> = {
  M: 'page.system.menu.type.directory',
  C: 'page.system.menu.type.menu',
  F: 'page.system.menu.type.button',
};

export const menuTypeOptions = transformRecordToOption(menuTypeRecord);

/** backend menu visibility: "0" visible, "1" hidden */
export const menuVisibleRecord: Record<Api.Backend.Visible, App.I18n.I18nKey> = {
  '0': 'page.system.common.visible.show',
  '1': 'page.system.common.visible.hide',
};

export const menuVisibleOptions = transformRecordToOption(menuVisibleRecord);

/** Button permission codes used by the management pages, they are the raw backend permission strings */
export const permissionCodes = {
  menuAdd: 'system:menu:add',
  menuEdit: 'system:menu:edit',
  menuDelete: 'system:menu:remove',
  roleAdd: 'system:role:add',
  roleEdit: 'system:role:edit',
  roleDelete: 'system:role:remove',
  userAdd: 'system:user:add',
  userEdit: 'system:user:edit',
  userDelete: 'system:user:remove',
} as const;
