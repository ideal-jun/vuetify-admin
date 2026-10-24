<script setup lang="ts">
import ButtonIcon from '@/components/custom/ButtonIcon.vue';
import SvgIcon from '@/components/custom/SvgIcon.vue';
import { $t } from '@/locales';

defineOptions({ name: 'ReloadButton' });

defineProps<{
  loading?: boolean;
}>();
</script>

<template>
  <ButtonIcon :tooltip-content="$t('icon.reload')">
    <SvgIcon :class="{ 'animate-spin animate-duration-750': loading }" icon="mdi-reload" />
  </ButtonIcon>
</template>
