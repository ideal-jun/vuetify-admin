<script setup lang="ts">
import ButtonIcon from '@/components/custom/ButtonIcon.vue';
import SvgIcon from '@/components/custom/SvgIcon.vue';
import { $t } from '@/locales';

defineOptions({ name: 'TableHeaderOperation' });

const {
  loading = false,
  showAdd = true,
  showBatchDelete = true,
  canBatchDelete = true,
  disabled = false,
} = defineProps<{
  /** Whether the table is loading */
  loading?: boolean;
  /** Whether to show the add button */
  showAdd?: boolean;
  /** Whether the batch delete button is enabled */
  showBatchDelete?: boolean;
  /** Whether the current user can batch delete */
  canBatchDelete?: boolean;
  /** Whether the operation is disabled */
  disabled?: boolean;
}>();

const emit = defineEmits<{
  add: [];
  refresh: [];
  'batch-delete': [];
}>();
</script>

<template>
  <div class="flex flex-wrap items-center justify-end gap-2">
    <slot name="prefix" />

    <VBtn
      v-if="showAdd"
      color="primary"
      :disabled="disabled"
      prepend-icon="mdi-plus"
      rounded="lg"
      @click="emit('add')"
    >
      {{ $t('common.add') }}
    </VBtn>

    <VBtn
      v-if="canBatchDelete"
      color="error"
      :disabled="!showBatchDelete"
      prepend-icon="mdi-delete-sweep-outline"
      variant="outlined"
      @click="emit('batch-delete')"
    >
      {{ $t('common.batchDelete') }}
    </VBtn>

    <ButtonIcon :tooltip-content="$t('common.refresh')" @click="emit('refresh')">
      <SvgIcon :class="{ 'animate-spin animate-duration-750': loading }" icon="mdi-reload" />
    </ButtonIcon>

    <slot />
  </div>
</template>
