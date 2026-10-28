<script setup lang="ts">
import { computed } from 'vue';

import { $t } from '@/locales';

import BuildFieldControl from './BuildFieldControl.vue';
import {
  BUILD_COMPONENT_MIME,
  builderDrag,
  endBuilderDrag,
  setBuilderDropIndex,
  startBuilderDrag,
} from './drag-state';
import { fieldTypeLabelKeys } from './field-config';
import type { BuilderField, BuilderFieldType } from './types';

defineOptions({ name: 'BuildCanvas' });

interface Props {
  fields: BuilderField[];
  values: Record<string, unknown>;
  activeId: number | null;
}

const { fields, values, activeId } = defineProps<Props>();

const emit = defineEmits<{
  select: [id: number | null];
  add: [type: BuilderFieldType, index: number];
  clone: [id: number];
  remove: [id: number];
  'move-by': [index: number, offset: number];
  reorder: [from: number, to: number];
  'update-value': [id: number, value: unknown];
}>();

const isDragging = computed(() => builderDrag.source !== null);

/** Resolve every field type label once, the template only does a lookup */
const typeLabels = computed(
  () =>
    Object.fromEntries(
      Object.entries(fieldTypeLabelKeys).map(([type, key]) => [type, $t(key)]),
    ) as Record<BuilderFieldType, string>,
);

function onItemDragStart(event: DragEvent, index: number) {
  startBuilderDrag('canvas', index);

  if (event.dataTransfer) {
    event.dataTransfer.setData(BUILD_COMPONENT_MIME, 'reorder');
    event.dataTransfer.effectAllowed = 'move';
  }
}

function onItemDragEnd() {
  endBuilderDrag();
}

function onItemDragOver(event: DragEvent, index: number, span: number) {
  if (!builderDrag.source) {
    return;
  }

  const element = event.currentTarget;

  if (!(element instanceof HTMLElement)) {
    return;
  }

  const rect = element.getBoundingClientRect();
  const after =
    span >= 12
      ? event.clientY > rect.top + rect.height / 2
      : event.clientX > rect.left + rect.width / 2;

  setBuilderDropIndex(after ? index + 1 : index);
}

function onRootDragOver() {
  if (!builderDrag.source) {
    return;
  }

  setBuilderDropIndex(fields.length);
}

function performDrop(event: DragEvent, fallbackIndex: number) {
  const source = builderDrag.source;
  const from = builderDrag.from;
  const target = builderDrag.over >= 0 ? builderDrag.over : fallbackIndex;

  if (source === 'canvas' && from >= 0) {
    emit('reorder', from, target);
  } else if (source === 'palette') {
    const type = event.dataTransfer?.getData(BUILD_COMPONENT_MIME);

    if (type) {
      emit('add', type as BuilderFieldType, target);
    }
  }

  endBuilderDrag();
}

function onItemDrop(event: DragEvent, index: number) {
  performDrop(event, index);
}

function onRootDrop(event: DragEvent) {
  performDrop(event, fields.length);
}
</script>

<template>
  <div
    class="min-h-[320px]"
    @click.self="emit('select', null)"
    @dragover.prevent="onRootDragOver"
    @drop.prevent="onRootDrop"
  >
    <VRow v-if="fields.length > 0" class="ma-0" @click.self="emit('select', null)">
      <VCol
        v-for="(field, index) in fields"
        :key="field.id"
        :cols="12"
        :md="field.span < 12 ? field.span : undefined"
      >
        <div
          class="group relative rounded-lg border-2 border-transparent p-3 transition-colors hover:border-primary/20"
          :class="{
            'border-primary bg-primary/5': activeId === field.id,
            'ring-2 ring-primary':
              builderDrag.over === index ||
              (builderDrag.over === fields.length && index === fields.length - 1),
          }"
          @click.stop="emit('select', field.id)"
          @dragover.stop.prevent="onItemDragOver($event, index, field.span)"
          @drop.stop.prevent="onItemDrop($event, index)"
        >
          <div class="mb-2 flex items-center gap-1">
            <div
              :aria-label="$t('page.build.canvas.reorder')"
              class="cursor-move rounded p-0.5 text-medium-emphasis opacity-60 hover:opacity-100"
              draggable="true"
              role="button"
              tabindex="0"
              :title="$t('page.build.canvas.reorder')"
              @dragend="onItemDragEnd"
              @dragstart.stop="onItemDragStart($event, index)"
            >
              <VIcon icon="mdi-drag" size="16" />
            </div>

            <span class="text-xs font-600 uppercase tracking-wide opacity-50">
              {{ typeLabels[field.type] }}
            </span>

            <VSpacer />

            <div
              class="flex items-center"
              :class="activeId === field.id ? '' : 'invisible group-hover:visible'"
            >
              <VBtn
                :aria-label="$t('page.build.canvas.moveUp')"
                density="compact"
                :disabled="index === 0"
                icon="mdi-arrow-up"
                size="x-small"
                variant="text"
                @click.stop="emit('move-by', index, -1)"
              />
              <VBtn
                :aria-label="$t('page.build.canvas.moveDown')"
                density="compact"
                :disabled="index === fields.length - 1"
                icon="mdi-arrow-down"
                size="x-small"
                variant="text"
                @click.stop="emit('move-by', index, 1)"
              />
              <VBtn
                :aria-label="$t('page.build.canvas.clone')"
                density="compact"
                icon="mdi-content-copy"
                size="x-small"
                variant="text"
                @click.stop="emit('clone', field.id)"
              />
              <VBtn
                :aria-label="$t('page.build.canvas.remove')"
                color="error"
                density="compact"
                icon="mdi-delete-outline"
                size="x-small"
                variant="text"
                @click.stop="emit('remove', field.id)"
              />
            </div>
          </div>

          <BuildFieldControl
            :field="field"
            :model-value="values[field.model]"
            @update:model-value="(value) => emit('update-value', field.id, value)"
          />
        </div>
      </VCol>
    </VRow>

    <div
      v-else
      class="flex min-h-[320px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary/30 p-8 text-center transition-colors"
      :class="{ 'border-primary bg-primary/5': isDragging }"
      @click="emit('select', null)"
    >
      <VIcon class="opacity-30" icon="mdi-form-select" size="56" />
      <div class="mt-3 text-base font-600">{{ $t('page.build.canvas.empty') }}</div>
      <div class="mt-1 max-w-md text-sm opacity-50">{{ $t('page.build.canvas.emptyHint') }}</div>
    </div>
  </div>
</template>
