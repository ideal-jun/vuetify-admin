<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useDisplay } from 'vuetify';

import { enableStatusOptions } from '@/constants/business';
import { REG_EMAIL, REG_PHONE } from '@/constants/reg';
import { useFormRules, useVuetifyForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import {
  fetchCreateDept,
  fetchGetDeptExcludeChild,
  fetchGetDeptList,
  fetchUpdateDept,
} from '@/service/api/system-dept';
import { translateOptions } from '@/utils/common';

defineOptions({ name: 'DeptOperateDrawer' });

interface Props {
  /** The type of operation */
  operateType: 'add' | 'edit';
  /** The editing row data */
  rowData?: Api.SystemManage.Dept | null;
  /** The default parent id when adding a child department */
  parentId?: number;
}

const props = withDefaults(defineProps<Props>(), {
  rowData: null,
  parentId: 0,
});

const emit = defineEmits<{
  submitted: [];
}>();

const visible = defineModel<boolean>('visible', { required: true });

const { mobile } = useDisplay();

const { formRef, validate, resetValidation } = useVuetifyForm();

const submitting = ref(false);
const optionsLoading = ref(false);

const model = ref<Api.SystemManage.DeptForm>(createDefaultModel());

const parentOptions = ref<CommonType.Option<number>[]>([]);

const title = computed(() =>
  props.operateType === 'add' ? $t('page.dept.add') : $t('page.dept.edit'),
);

const statusOptions = computed(() => translateOptions(enableStatusOptions));

const rules = computed(() => {
  const { createPatternRule, createRequiredRule } = useFormRules();

  return {
    deptName: [createRequiredRule($t('form.required'))],
    orderNum: [createRequiredRule($t('form.required'))],
    phone: createPatternRule(REG_PHONE, $t('form.phone.invalid')),
    email: createPatternRule(REG_EMAIL, $t('form.email.invalid')),
  };
});

function createDefaultModel(): Api.SystemManage.DeptForm {
  return {
    parentId: props.parentId,
    deptName: '',
    orderNum: 1,
    leader: '',
    phone: '',
    email: '',
    status: '0',
  };
}

function buildParentOptions(depts: Api.SystemManage.Dept[]) {
  const nodeMap = new Map<number, Api.SystemManage.Dept>();

  for (const dept of depts) {
    nodeMap.set(dept.deptId, { ...dept, children: [] });
  }

  const roots: Api.SystemManage.Dept[] = [];

  for (const dept of nodeMap.values()) {
    const parent = dept.parentId ? nodeMap.get(dept.parentId) : undefined;

    if (parent) {
      parent.children = [...(parent.children ?? []), dept];
    } else {
      roots.push(dept);
    }
  }

  const options: CommonType.Option<number>[] = [{ label: $t('page.dept.rootParent'), value: 0 }];

  const walk = (items: Api.SystemManage.Dept[], depth: number) => {
    items.sort((first, second) => (first.orderNum ?? 0) - (second.orderNum ?? 0));

    for (const item of items) {
      options.push({ label: `${'— '.repeat(depth)}${item.deptName}`, value: item.deptId });

      if (item.children?.length) {
        walk(item.children, depth + 1);
      }
    }
  };

  walk(roots, 0);

  return options;
}

async function loadParentOptions() {
  optionsLoading.value = true;

  const result =
    props.operateType === 'edit' && props.rowData
      ? await fetchGetDeptExcludeChild(props.rowData.deptId)
      : await fetchGetDeptList();

  optionsLoading.value = false;

  parentOptions.value = result.error ? [] : buildParentOptions(result.data);
}

function initModel() {
  if (props.operateType === 'edit' && props.rowData) {
    const { parentId, deptName, orderNum, leader, phone, email, status } = props.rowData;

    model.value = {
      parentId: parentId ?? 0,
      deptName,
      orderNum: orderNum ?? 1,
      leader: leader ?? '',
      phone: phone ?? '',
      email: email ?? '',
      status: status ?? '0',
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
    if (props.operateType === 'add') {
      const { error } = await fetchCreateDept({ ...model.value });

      if (error) {
        return;
      }

      window.$message?.success($t('common.addSuccess'));
    } else {
      if (!props.rowData) {
        return;
      }

      const { error } = await fetchUpdateDept({ ...model.value, deptId: props.rowData.deptId });

      if (error) {
        return;
      }

      window.$message?.success($t('common.updateSuccess'));
    }

    closeDrawer();
    emit('submitted');
  } finally {
    submitting.value = false;
  }
}

watch(visible, (value) => {
  if (!value) {
    return;
  }

  initModel();
  resetValidation();
  void loadParentOptions();
});
</script>

<template>
  <VNavigationDrawer
    v-model="visible"
    class="dept-operate-drawer"
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
          <div class="mt-1 text-xs opacity-50">{{ $t('page.dept.drawerDesc') }}</div>
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
            <VSelect
              v-model="model.parentId"
              item-title="label"
              item-value="value"
              :items="parentOptions"
              :label="$t('page.dept.form.parentId')"
              :loading="optionsLoading"
              prepend-inner-icon="mdi-file-tree-outline"
            />

            <VTextField
              v-model="model.deptName"
              :label="$t('page.dept.columns.deptName')"
              :placeholder="$t('page.dept.form.deptName')"
              prepend-inner-icon="mdi-office-building-outline"
              required
              :rules="rules.deptName"
            />

            <VTextField
              v-model.number="model.orderNum"
              :label="$t('page.dept.columns.orderNum')"
              :placeholder="$t('page.dept.form.orderNum')"
              prepend-inner-icon="mdi-sort-numeric-ascending"
              required
              :rules="rules.orderNum"
              type="number"
            />

            <VTextField
              v-model="model.leader"
              :label="$t('page.dept.form.leader')"
              prepend-inner-icon="mdi-account-outline"
            />

            <VTextField
              v-model="model.phone"
              :label="$t('page.dept.form.phone')"
              prepend-inner-icon="mdi-cellphone"
              :rules="[rules.phone]"
            />

            <VTextField
              v-model="model.email"
              :label="$t('page.dept.form.email')"
              prepend-inner-icon="mdi-email-outline"
              :rules="[rules.email]"
            />

            <div>
              <div class="mb-1.5 text-sm opacity-80">{{ $t('page.dept.columns.status') }}</div>

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
