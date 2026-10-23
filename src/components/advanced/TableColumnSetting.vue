<script setup lang="ts">
import { computed } from 'vue';

import type { TableColumnCheck } from '@/hooks/common/table';
import { $t } from '@/locales';

defineOptions({ name: 'TableColumnSetting' });

const props = defineProps<{
  checks: TableColumnCheck[];
}>();

const emit = defineEmits<{
  (e: 'update:checks', checks: TableColumnCheck[]): void;
}>();

const allChecked = computed(() => props.checks.every((check) => check.checked));

function toggle(check: TableColumnCheck) {
  emit(
    'update:checks',
    props.checks.map((item) =>
      item.key === check.key ? { ...item, checked: !item.checked } : item,
    ),
  );
}

function toggleAll() {
  const checked = !allChecked.value;

  emit(
    'update:checks',
    props.checks.map((item) => ({ ...item, checked })),
  );
}

function reset() {
  emit(
    'update:checks',
    props.checks.map((item) => ({ ...item, checked: true })),
  );
}
</script>

<template>
  <VMenu :close-on-content-click="false" location="bottom end">
    <template #activator="{ props: activatorProps }">
      <span v-bind="activatorProps">
        <ButtonIcon :tooltip-content="$t('common.columnSetting')">
          <SvgIcon icon="mdi-view-column-outline" />
        </ButtonIcon>
      </span>
    </template>

    <VCard elevation="8" min-width="220">
      <VCardText class="px-3 py-2">
        <VCheckbox
          color="primary"
          density="compact"
          hide-details
          :label="$t('common.selectAll')"
          :model-value="allChecked"
          @update:model-value="toggleAll"
        />
      </VCardText>

      <VDivider />

      <VList class="max-h-[280px] overflow-y-auto" density="compact">
        <VListItem v-for="check in checks" :key="check.key">
          <VCheckbox
            color="primary"
            density="compact"
            hide-details
            :label="check.title"
            :model-value="check.checked"
            @update:model-value="toggle(check)"
          />
        </VListItem>
      </VList>

      <VDivider />

      <VCardActions class="justify-end py-2">
        <VBtn size="small" variant="text" @click="reset">{{ $t('common.reset') }}</VBtn>
      </VCardActions>
    </VCard>
  </VMenu>
</template>
