<script setup lang="ts">
import { useId } from 'vue';

defineOptions({ name: 'ChromeTabBg' });

const symbolId = `page-tab-chrome-${useId()}`;
</script>

<template>
  <svg aria-hidden="true" height="100%" width="100%">
    <defs>
      <symbol :id="symbolId" viewBox="0 0 214 36">
        <path d="M17 0h197v36H0v-2c4.5 0 9-3.5 9-8V8c0-4.5 3.5-8 8-8z" />
      </symbol>
    </defs>

    <svg height="100%" width="51%">
      <use fill="currentColor" height="36" :href="`#${symbolId}`" width="214" />
    </svg>

    <g transform="scale(-1, 1)">
      <svg height="100%" width="51%" x="-100%" y="0">
        <use fill="currentColor" height="36" :href="`#${symbolId}`" width="214" />
      </svg>
    </g>
  </svg>
</template>
