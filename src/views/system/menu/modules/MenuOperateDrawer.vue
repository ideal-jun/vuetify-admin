<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useDisplay } from 'vuetify';

import { enableStatusOptions, menuTypeOptions, menuVisibleOptions } from '@/constants/business';
import { REG_PERMISSION_CODE } from '@/constants/reg';
import { useFormRules, useVuetifyForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { useMenuStore } from '@/store/modules/menu';
import type { MenuTableRow } from '@/store/modules/menu';
import { translateOptions } from '@/utils/common';

defineOptions({ name: 'MenuOperateDrawer' });

interface Props {
  /** The type of operation */
  operateType: 'add' | 'edit';
  /** The editing row data */
  rowData?: MenuTableRow | null;
  /** The parent menu id when adding a child menu, 0 means the root level */
  parentId?: number;
  /** The default menu type when adding a menu */
  defaultType?: Api.RuoYi.MenuType;
}

interface MenuForm {
  menuName: string;
  parentId: number;
  orderNum: number | string;
  path: string;
  component: string;
  menuType: Api.RuoYi.MenuType;
  perms: string;
  icon: string;
  visible: Api.RuoYi.Visible;
  status: Api.RuoYi.Status;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  submitted: [];
}>();

const visible = defineModel<boolean>('visible', { required: true });

const menuStore = useMenuStore();

const { mobile } = useDisplay();

const { formRef, validate, resetValidation } = useVuetifyForm();

const submitting = ref(false);

const title = computed(() => {
  if (props.operateType === 'edit') {
    return $t('page.system.menu.edit');
  }

  return props.defaultType === 'F' ? $t('page.system.menu.addButton') : $t('page.system.menu.add');
});

const parentMenu = computed(
  () => menuStore.flatMenus.find((item) => item.menuId === props.parentId) ?? null,
);

const typeOptions = computed(() => {
  const options = translateOptions(menuTypeOptions);

  if (props.operateType === 'edit') {
    return options;
  }

  if (parentMenu.value?.menuType === 'M') {
    return options.filter((item) => item.value === 'C');
  }

  if (parentMenu.value?.menuType === 'C') {
    return options.filter((item) => item.value === 'F');
  }

  return options.filter((item) => item.value !== 'F');
});

const statusOptions = computed(() => translateOptions(enableStatusOptions));

const visibleOptions = computed(() => translateOptions(menuVisibleOptions));

const parentDisabled = computed(() => props.operateType === 'edit' || Boolean(props.parentId));

const typeDisabled = computed(() => props.operateType === 'edit' || Boolean(props.parentId));

const model = ref<MenuForm>(createDefaultModel());

const parentOptions = computed<CommonType.Option<number>[]>(() => {
  const createOption = (item: MenuTableRow): CommonType.Option<number> => ({
    label: `${'— '.repeat(item.depth)}${item.menuName}`,
    value: item.menuId,
  });

  const rootOption: CommonType.Option<number> = {
    label: $t('page.system.menu.rootParent'),
    value: 0,
  };

  if (model.value.menuType === 'F') {
    return menuStore.flatMenus
      .filter((item) => item.menuType === 'C')
      .map((item) => createOption(item));
  }

  return [
    rootOption,
    ...menuStore.flatMenus
      .filter((item) => item.menuType === 'M')
      .map((item) => createOption(item)),
  ];
});

const rules = computed(() => {
  const { createPatternRule, createRequiredRule } = useFormRules();
  const required = createRequiredRule($t('form.required'));

  return {
    menuName: [required],
    path: model.value.menuType === 'F' ? [] : [required],
    perms:
      model.value.menuType === 'F'
        ? [
            createRequiredRule($t('page.system.menu.permission.required')),
            createPatternRule(REG_PERMISSION_CODE, $t('page.system.menu.permission.invalid')),
          ]
        : [],
  };
});

function createDefaultModel(): MenuForm {
  const parentType = parentMenu.value?.menuType;

  let menuType: Api.RuoYi.MenuType = 'M';

  if (props.defaultType) {
    menuType = props.defaultType;
  } else if (parentType === 'M') {
    menuType = 'C';
  } else if (parentType === 'C') {
    menuType = 'F';
  }

  return {
    menuName: '',
    parentId: props.parentId ?? 0,
    orderNum: menuStore.flatMenus.length + 1,
    path: '',
    component: '',
    menuType,
    perms: '',
    icon: '',
    visible: '0',
    status: '0',
  };
}

function initModel() {
  if (props.operateType === 'edit' && props.rowData) {
    const {
      menuName,
      parentId,
      orderNum,
      path,
      component,
      menuType,
      perms,
      icon,
      visible,
      status,
    } = props.rowData;

    model.value = {
      menuName,
      parentId,
      orderNum,
      path: path ?? '',
      component: component ?? '',
      menuType,
      perms: perms ?? '',
      icon: icon ?? '',
      visible,
      status,
    };

    return;
  }

  model.value = createDefaultModel();
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  const result = await validate();

  if (result && !result.valid) {
    return;
  }

  submitting.value = true;

  try {
    await submitMenu();

    closeDrawer();
    emit('submitted');
  } finally {
    submitting.value = false;
  }
}

async function submitMenu() {
  const isButton = model.value.menuType === 'F';
  const isMenu = model.value.menuType === 'C';

  const payload: Api.Menu.Create = {
    menuName: model.value.menuName.trim(),
    parentId: Number(model.value.parentId) || 0,
    orderNum: Number(model.value.orderNum) || 0,
    menuType: model.value.menuType,
    visible: model.value.visible,
    status: model.value.status,
    path: isButton ? '' : model.value.path.trim(),
    component: isMenu ? model.value.component.trim() : '',
    perms: model.value.perms.trim(),
    icon: isButton ? '' : model.value.icon.trim(),
  };

  if (props.operateType === 'edit' && props.rowData) {
    const success = await menuStore.updateMenu({
      ...payload,
      menuId: props.rowData.menuId,
    });

    if (!success) {
      return;
    }

    window.$message?.success($t('common.updateSuccess'));
  } else {
    const success = await menuStore.createMenu(payload);

    if (!success) {
      return;
    }

    window.$message?.success($t('common.addSuccess'));
  }
}

watch(
  () => model.value.menuType,
  (menuType) => {
    if (props.operateType === 'edit') {
      return;
    }

    const parent = menuStore.flatMenus.find((item) => item.menuId === model.value.parentId);

    if (menuType === 'F') {
      if (parent?.menuType !== 'C') {
        model.value.parentId = 0;
      }

      return;
    }

    if (parent && parent.menuType !== 'M') {
      model.value.parentId = 0;
    }
  },
);

watch(visible, (value) => {
  if (!value) {
    return;
  }

  initModel();
  resetValidation();
});
</script>

<template>
  <VNavigationDrawer
    v-model="visible"
    class="menu-operate-drawer"
    floating
    location="right"
    order="-1"
    temporary
    :width="mobile ? '100%' : 440"
  >
    <div class="flex h-full flex-col">
      <div class="flex items-start justify-between gap-3 px-5 py-4">
        <div>
          <div class="text-lg font-700">{{ title }}</div>
          <div class="mt-1 text-xs opacity-50">{{ $t('page.system.menu.drawerDesc') }}</div>
        </div>

        <VBtn
          :aria-label="$t('common.close')"
          :disabled="submitting"
          icon="mdi-close"
          size="small"
          variant="text"
          @click="closeDrawer"
        />
      </div>

      <VDivider />

      <div class="flex-1 overflow-y-auto px-5 py-5">
        <VForm ref="formRef" :model="model" @submit.prevent="handleSubmit">
          <div class="flex flex-col gap-4">
            <VTextField
              v-model="model.menuName"
              :label="$t('page.system.menu.form.menuName')"
              :placeholder="$t('page.system.menu.placeholder.menuName')"
              prepend-inner-icon="mdi-menu"
              required
              :rules="rules.menuName"
            />

            <VSelect
              v-model="model.menuType"
              :disabled="typeDisabled"
              item-title="label"
              item-value="value"
              :items="typeOptions"
              :label="$t('page.system.menu.form.menuType')"
              prepend-inner-icon="mdi-file-tree-outline"
            />

            <VSelect
              v-model="model.parentId"
              :disabled="parentDisabled"
              item-title="label"
              item-value="value"
              :items="parentOptions"
              :label="$t('page.system.menu.form.parentId')"
              prepend-inner-icon="mdi-folder-outline"
            />

            <VTextField
              v-model.number="model.orderNum"
              :label="$t('page.system.menu.form.orderNum')"
              :placeholder="$t('page.system.menu.placeholder.orderNum')"
              prepend-inner-icon="mdi-sort-numeric-ascending"
              type="number"
            />

            <VTextField
              v-if="model.menuType !== 'F'"
              v-model="model.path"
              :label="$t('page.system.menu.form.path')"
              :placeholder="$t('page.system.menu.placeholder.path')"
              prepend-inner-icon="mdi-routes"
              required
              :rules="rules.path"
            />

            <VTextField
              v-if="model.menuType === 'C'"
              v-model="model.component"
              :label="$t('page.system.menu.form.component')"
              :placeholder="$t('page.system.menu.placeholder.component')"
              prepend-inner-icon="mdi-puzzle-outline"
            />

            <VTextField
              v-model="model.perms"
              :label="$t('page.system.menu.form.perms')"
              :placeholder="$t('page.system.menu.placeholder.perms')"
              prepend-inner-icon="mdi-key-outline"
              :rules="rules.perms"
            />

            <VTextField
              v-if="model.menuType !== 'F'"
              v-model="model.icon"
              :label="$t('page.system.menu.form.icon')"
              :placeholder="$t('page.system.menu.placeholder.icon')"
              prepend-inner-icon="mdi-emoticon-outline"
            />

            <VSelect
              v-model="model.visible"
              item-title="label"
              item-value="value"
              :items="visibleOptions"
              :label="$t('page.system.menu.form.visible')"
              prepend-inner-icon="mdi-eye-outline"
            />

            <div>
              <div class="mb-1.5 text-sm opacity-80">
                {{ $t('page.system.menu.form.status') }}
              </div>

              <VRadioGroup v-model="model.status" hide-details inline>
                <VRadio
                  v-for="option in statusOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </VRadioGroup>
            </div>
          </div>
        </VForm>
      </div>

      <VDivider />

      <div class="flex justify-end gap-2 px-5 py-4">
        <VBtn :disabled="submitting" variant="text" @click="closeDrawer">
          {{ $t('common.cancel') }}
        </VBtn>
        <VBtn color="primary" :disabled="submitting" :loading="submitting" @click="handleSubmit">
          {{ $t('common.confirm') }}
        </VBtn>
      </div>
    </div>
  </VNavigationDrawer>
</template>
