<script setup lang="ts">
defineOptions({ name: 'TablePageLayout' });

const { title = '' } = defineProps<{
  /** The table title */
  title?: string;
}>();
</script>

<template>
  <div class="flex min-h-full flex-col gap-5 md:h-full md:min-h-0 md:overflow-hidden">
    <div class="shrink-0">
      <slot name="search" />
    </div>

    <VSheet
      class="app-panel flex min-h-[60vh] flex-1 flex-col overflow-hidden md:min-h-0"
      rounded="10px"
    >
      <div class="flex shrink-0 flex-col justify-between gap-3 p-2 md:flex-row md:items-center">
        <div class="text-base font-700">
          <slot name="title">{{ title }}</slot>
        </div>

        <div class="min-w-0">
          <slot name="actions" />
        </div>
      </div>

      <VDivider />

      <slot name="table" />
    </VSheet>

    <slot name="append" />
  </div>
</template>
