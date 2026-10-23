<script setup lang="ts">
import ThemeColor from './modules/ThemeColor.vue';
import ThemeRadius from './modules/ThemeRadius.vue';
import ThemeSchema from './modules/ThemeSchema.vue';

defineOptions({
  name: 'AppearanceSettings',
});
</script>

<template>
  <div class="flex-col-stretch gap-16px">
    <ThemeSchema />
    <ThemeColor />
    <ThemeRadius />
  </div>
</template>
