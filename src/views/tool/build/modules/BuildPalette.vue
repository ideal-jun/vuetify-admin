<script setup lang="ts">
import { computed } from 'vue';

import { $t } from '@/locales';

import { BUILD_COMPONENT_MIME, endBuilderDrag, startBuilderDrag } from './drag-state';
import { paletteGroupMeta, paletteItems } from './field-config';
import type { BuilderFieldType } from './types';

defineOptions({ name: 'BuildPalette' });

const emit = defineEmits<{
  add: [type: BuilderFieldType];
}>();

const groups = computed(() =>
  paletteGroupMeta.map((group) => ({
    ...group,
    label: $t(group.labelKey),
    items: paletteItems
      .filter((item) => item.group === group.group)
      .map((item) => ({ ...item, label: $t(item.labelKey) })),
  })),
);

function handleDragStart(event: DragEvent, type: BuilderFieldType) {
  startBuilderDrag('palette');

  if (event.dataTransfer) {
    event.dataTransfer.setData(BUILD_COMPONENT_MIME, type);
    event.dataTransfer.effectAllowed = 'copy';
  }
}

function handleDragEnd() {
  endBuilderDrag();
}
</script>

<template>
  <VSheet class="app-panel flex min-h-0 flex-col overflow-hidden" rounded="lg">
    <div class="flex shrink-0 items-center justify-between gap-2 px-4 py-3">
      <div class="text-sm font-700">{{ $t('page.build.palette.title') }}</div>
      <VChip color="primary" size="x-small" variant="tonal">
        {{ $t('page.build.palette.hint') }}
      </VChip>
    </div>

    <VDivider />

    <div class="min-h-0 flex-1 overflow-y-auto px-3 py-3">
      <div v-for="group in groups" :key="group.group" class="mb-4 last:mb-0">
        <div class="mb-2 flex items-center gap-1.5 text-xs font-600 uppercase opacity-60">
          <VIcon :icon="group.icon" size="16" />
          <span>{{ group.label }}</span>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="item in group.items"
            :key="item.type"
            class="flex cursor-grab items-center gap-2 rounded-lg border border-dashed px-2.5 py-2 text-left text-xs transition-colors hover:border-primary hover:text-primary"
            draggable="true"
            type="button"
            @click="emit('add', item.type)"
            @dragend="handleDragEnd"
            @dragstart="handleDragStart($event, item.type)"
          >
            <VIcon :icon="item.icon" size="18" />
            <span class="truncate">{{ item.label }}</span>
          </button>
        </div>
      </div>
    </div>
  </VSheet>
</template>
