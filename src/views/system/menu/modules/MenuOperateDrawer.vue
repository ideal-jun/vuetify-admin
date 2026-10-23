<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useDisplay } from 'vuetify';

import { REG_PERMISSION_CODE } from '@/constants/reg';
import { useFormRules, useVuetifyForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { useMenuStore } from '@/store/modules/menu';
import type { MenuTableRow } from '@/store/modules/menu';

defineOptions({ name: 'MenuOperateDrawer' });

interface Props {
  /** The type of operation */
  operateType: 'add' | 'edit';
  /** The editing row data */
  rowData?: MenuTableRow | null;
  /** The default parent id when adding a child menu */
  parentId?: string;
  /** The default type when adding a menu */
  defaultType?: UnionKey.MenuType;
}

interface MenuForm {
  title: string;
  path: string;
  icon: string;
  permission: string;
  type: UnionKey.MenuType;
  parentId: string;
  sort: string;
  status: UnionKey.MenuStatus;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  submitted: [];
}>();

const visible = defineModel<boolean>('visible', { required: true });

const menuStore = useMenuStore();

const { mobile } = useDisplay();

const { formRef, validate, resetValidation } = useVuetifyForm();

const title = computed(() => {
  if (props.operateType === 'edit') {
    return $t('page.system.menu.edit');
  }

  return props.defaultType === 'button'
    ? $t('page.system.menu.addButton')
    : $t('page.system.menu.add');
});

const allTypeOptions = computed<CommonType.Option<UnionKey.MenuType>[]>(() => [
  { label: $t('page.system.menu.type.directory'), value: 'directory' },
  { label: $t('page.system.menu.type.menu'), value: 'menu' },
  { label: $t('page.system.menu.type.button'), value: 'button' },
]);

const parentMenu = computed(
  () => menuStore.flatMenus.find((item) => item.id === props.parentId) ?? null,
);

const typeOptions = computed(() => {
  if (props.operateType === 'edit') {
    return allTypeOptions.value;
  }

  if (parentMenu.value?.type === 'directory') {
    return allTypeOptions.value.filter((item) => item.value === 'menu');
  }

  if (parentMenu.value?.type === 'menu') {
    return allTypeOptions.value.filter((item) => item.value === 'button');
  }

  return allTypeOptions.value.filter((item) => item.value !== 'button');
});

const parentDisabled = computed(() => props.operateType === 'edit' || Boolean(props.parentId));

const typeDisabled = computed(() => props.operateType === 'edit' || Boolean(props.parentId));

const model = ref<MenuForm>(createDefaultModel());

const statusOptions = computed<CommonType.Option<UnionKey.MenuStatus>[]>(() => [
  { label: $t('page.system.menu.status.enabled'), value: 'enabled' },
  { label: $t('page.system.menu.status.disabled'), value: 'disabled' },
]);

const parentOptions = computed<CommonType.Option<string>[]>(() => {
  const createOption = (item: MenuTableRow): CommonType.Option<string> => ({
    label: `${'— '.repeat(item.depth)}${item.title}`,
    value: item.id,
  });

  const rootOption: CommonType.Option<string> = {
    label: $t('page.system.menu.rootParent'),
    value: '',
  };

  if (model.value.type === 'button') {
    return menuStore.flatMenus
      .filter((item) => item.type === 'menu')
      .map((item) => createOption(item));
  }

  if (model.value.type === 'menu') {
    return [
      rootOption,
      ...menuStore.flatMenus
        .filter((item) => item.type === 'directory')
        .map((item) => createOption(item)),
    ];
  }

  return [rootOption];
});

const rules = computed(() => {
  const { createPatternRule, createRequiredRule } = useFormRules();

  return {
    title: createRequiredRule($t('form.required')),
    path: createRequiredRule($t('form.required')),
    permission: [
      createRequiredRule($t('page.system.menu.permission.required')),
      createPatternRule(REG_PERMISSION_CODE, $t('page.system.menu.permission.invalid')),
    ],
  };
});

function createDefaultModel(): MenuForm {
  const type = props.defaultType ?? (parentMenu.value?.type === 'menu' ? 'button' : 'menu');

  return {
    title: '',
    path: '',
    icon: '',
    permission: '',
    type,
    parentId: props.parentId ?? '',
    sort: String(menuStore.flatMenus.length + 1),
    status: 'enabled',
  };
}

function initModel() {
  if (props.operateType === 'edit' && props.rowData) {
    const {
      title: menuTitle,
      path,
      icon,
      permission,
      type,
      parentId,
      sort,
      status,
    } = props.rowData;

    model.value = {
      title: menuTitle,
      path,
      icon,
      permission,
      type,
      parentId: parentId ?? '',
      sort: String(sort),
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

  const isButton = model.value.type === 'button';

  const payload: Api.Menu.Create = {
    title: model.value.title.trim(),
    path: isButton ? '' : model.value.path.trim(),
    icon: isButton ? '' : model.value.icon.trim(),
    permission: isButton ? model.value.permission.trim() : '',
    type: model.value.type,
    parentId: model.value.parentId || null,
    sort: Number(model.value.sort) || 0,
    status: model.value.status,
  };

  if (props.operateType === 'edit' && props.rowData) {
    menuStore.updateMenu(props.rowData.id, payload);
    window.$message?.success($t('common.updateSuccess'));
  } else {
    menuStore.createMenu(payload);
    window.$message?.success($t('common.addSuccess'));
  }

  closeDrawer();
  emit('submitted');
}

watch(
  () => model.value.type,
  (type) => {
    if (props.operateType === 'edit') {
      return;
    }

    const parent = menuStore.flatMenus.find((item) => item.id === model.value.parentId);

    let parentValid = !parent;

    if (type === 'menu') {
      parentValid = !parent || parent.type === 'directory';
    } else if (type === 'button') {
      parentValid = parent?.type === 'menu';
    }

    if (!parentValid) {
      model.value.parentId = '';
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
              v-model="model.title"
              :label="$t('page.system.menu.form.title')"
              :placeholder="$t('page.system.menu.placeholder.title')"
              prepend-inner-icon="mdi-menu"
              required
              :rules="[rules.title]"
            />

            <VTextField
              v-if="model.type === 'button'"
              v-model="model.permission"
              :label="$t('page.system.menu.form.permission')"
              :placeholder="$t('page.system.menu.placeholder.permission')"
              prepend-inner-icon="mdi-key-outline"
              required
              :rules="rules.permission"
            />

            <VTextField
              v-if="model.type !== 'button'"
              v-model="model.path"
              :label="$t('page.system.menu.form.path')"
              :placeholder="$t('page.system.menu.placeholder.path')"
              prepend-inner-icon="mdi-routes"
              required
              :rules="[rules.path]"
            />

            <VTextField
              v-if="model.type !== 'button'"
              v-model="model.icon"
              :label="$t('page.system.menu.form.icon')"
              :placeholder="$t('page.system.menu.placeholder.icon')"
              prepend-inner-icon="mdi-emoticon-outline"
            />

            <VSelect
              v-model="model.type"
              :disabled="typeDisabled"
              item-title="label"
              item-value="value"
              :items="typeOptions"
              :label="$t('page.system.menu.form.type')"
              prepend-inner-icon="mdi-file-tree-outline"
            />

            <VSelect
              v-model="model.parentId"
              :disabled="parentDisabled"
              item-title="label"
              item-value="value"
              :items="parentOptions"
              :label="$t('page.system.menu.form.parent')"
              prepend-inner-icon="mdi-folder-outline"
            />

            <VTextField
              v-model="model.sort"
              :label="$t('page.system.menu.form.sort')"
              :placeholder="$t('page.system.menu.placeholder.sort')"
              prepend-inner-icon="mdi-sort-numeric-ascending"
              type="number"
            />

            <div>
              <div class="mb-1.5 text-sm opacity-80">
                {{ $t('page.system.menu.columns.status') }}
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
        <VBtn variant="text" @click="closeDrawer">{{ $t('common.cancel') }}</VBtn>
        <VBtn color="primary" @click="handleSubmit">{{ $t('common.confirm') }}</VBtn>
      </div>
    </div>
  </VNavigationDrawer>
</template>
