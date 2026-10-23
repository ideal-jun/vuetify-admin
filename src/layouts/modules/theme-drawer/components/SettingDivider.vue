<script setup lang="ts">
defineOptions({
  name: 'SettingDivider',
});

defineProps<{
  /** Divider title */
  title: string;
}>();
</script>

<template>
  <VDivider class="my-6"> {{ title }} </VDivider>
</template>
<style scoped></style>
