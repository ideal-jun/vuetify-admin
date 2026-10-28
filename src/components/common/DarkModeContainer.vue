<script setup lang="ts">
defineOptions({ name: 'DarkModeContainer' });

const { inverted = false } = defineProps<{
  inverted?: boolean;
}>();
</script>

<template>
  <div
    class="bg-container text-base-text transition-300"
    :class="{ 'bg-inverted text-white': inverted }"
  >
    <slot />
  </div>
</template>
