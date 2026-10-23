<script setup lang="ts">
import SvgIcon from '@/components/custom/SvgIcon.vue';

defineOptions({ name: 'LookForward' });
</script>

<template>
  <div class="size-full min-h-[520px] flex-col-center gap-6 overflow-hidden">
    <div class="flex text-[160px] text-primary/80">
      <SvgIcon icon="mdi-rocket-launch-outline" />
    </div>
    <slot>
      <h3 class="text-2xl text-primary font-500">{{ $t('common.lookForward') }}</h3>
    </slot>
  </div>
</template>
