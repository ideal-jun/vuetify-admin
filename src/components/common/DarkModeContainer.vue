<script setup lang="ts">
defineOptions({ name: 'DarkModeContainer' });

withDefaults(
  defineProps<{
    inverted?: boolean;
  }>(),
  {
    inverted: false,
  },
);
</script>

<template>
  <div
    class="bg-container text-base-text transition-300"
    :class="{ 'bg-inverted text-white': inverted }"
  >
    <slot />
  </div>
</template>
