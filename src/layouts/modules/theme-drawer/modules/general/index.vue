<script setup lang="ts">
import GlobalSettings from './modules/GlobalSettings.vue';
import WatermarkSettings from './modules/WatermarkSettings.vue';

defineOptions({
  name: 'GeneralSettings',
});
</script>

<template>
  <div class="flex-col-stretch gap-16px">
    <GlobalSettings />
    <WatermarkSettings />
  </div>
</template>
