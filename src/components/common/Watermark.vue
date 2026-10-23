<script setup lang="ts">
import { computed } from 'vue';

defineOptions({ name: 'Watermark' });

const props = defineProps<{
  content: string;
}>();

const items = computed(() => Array.from({ length: 40 }, (_, index) => index));
</script>

<template>
  <div class="watermark pointer-events-none fixed inset-0 z-[2500] overflow-hidden">
    <span
      v-for="item in items"
      :key="item"
      class="watermark-item"
      :style="{
        left: `${(item % 8) * 14}%`,
        top: `${Math.floor(item / 8) * 22}%`,
      }"
    >
      {{ props.content }}
    </span>
  </div>
</template>

<style scoped>
.watermark-item {
  position: absolute;
  display: block;
  color: rgb(0 0 0 / 6%);
  font-size: 16px;
  white-space: nowrap;
  transform: rotate(-24deg);
  user-select: none;
}

.dark .watermark-item {
  color: rgb(255 255 255 / 7%);
}
</style>
