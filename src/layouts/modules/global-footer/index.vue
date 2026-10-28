<script setup lang="ts">
defineOptions({ name: 'GlobalFooter' });

const { right = false } = defineProps<{
  /** Whether the footer content floats to the right */
  right?: boolean;
}>();
</script>

<template>
  <div
    class="h-full flex items-center gap-2 px-6 text-xs opacity-60"
    :class="right ? 'justify-end' : 'justify-center'"
  >
    <span>Copyright MIT © 2021-2026 Vuetify Admin</span>
    <span class="opacity-40">·</span>
    <a
      class="text-primary transition hover:opacity-80"
      href="https://vuetifyjs.com/"
      rel="noopener noreferrer"
      target="_blank"
    >
      Vuetify
    </a>
  </div>
</template>
