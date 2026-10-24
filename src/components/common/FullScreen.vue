<script setup lang="ts">
import { useFullscreen } from '@vueuse/core';

import ButtonIcon from '@/components/custom/ButtonIcon.vue';
import SvgIcon from '@/components/custom/SvgIcon.vue';
import { $t } from '@/locales';

defineOptions({ name: 'FullScreen' });

const { isFullscreen, toggle } = useFullscreen();
</script>

<template>
  <ButtonIcon
    :tooltip-content="isFullscreen ? $t('icon.fullscreenExit') : $t('icon.fullscreen')"
    @click="toggle"
  >
    <SvgIcon :icon="isFullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'" />
  </ButtonIcon>
</template>
