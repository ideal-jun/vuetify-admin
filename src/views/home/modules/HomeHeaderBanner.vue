<script setup lang="ts">
import dayjs from 'dayjs';
import { computed } from 'vue';

import { useRouterPush } from '@/hooks/common/router';
import { $t } from '@/locales';
import { useAuthStore } from '@/store/modules/auth';

defineOptions({ name: 'HomeHeaderBanner' });

const authStore = useAuthStore();
const { routerPushByKey } = useRouterPush();

const greeting = computed(() =>
  $t('page.home.welcome', { userName: authStore.userInfo.userName || 'Admin' }),
);

const dateText = computed(() => dayjs().format('YYYY-MM-DD dddd'));

interface BannerAction {
  key: string;
  label: string;
  icon: string;
  route?: App.Global.RouteKey;
  href?: string;
}

const actions = computed<BannerAction[]>(() => [
  {
    key: 'addUser',
    label: $t('page.home.addUser'),
    icon: 'mdi-account-plus-outline',
    route: 'system_user',
  },
  {
    key: 'addRole',
    label: $t('page.home.addRole'),
    icon: 'mdi-shield-plus-outline',
    route: 'system_role',
  },
  { key: 'manageMenu', label: $t('page.home.manageMenu'), icon: 'mdi-menu', route: 'system_menu' },
  {
    key: 'viewDocs',
    label: $t('page.home.viewDocs'),
    icon: 'mdi-book-open-variant',
    href: 'https://vuetifyjs.com/',
  },
]);

function handleAction(action: BannerAction) {
  if (action.href) {
    window.open(action.href, '_blank');

    return;
  }

  if (action.route) {
    void routerPushByKey(action.route);
  }
}
</script>

<template>
  <VCard class="home-banner relative overflow-hidden" rounded="xl" variant="flat">
    <div class="home-banner__glow home-banner__glow--one" />
    <div class="home-banner__glow home-banner__glow--two" />

    <div class="relative z-10 flex flex-col gap-6 p-6 md:p-8">
      <div class="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <div class="flex items-center gap-2 text-sm text-white/70">
            <VIcon icon="mdi-calendar-blank-outline" size="16" />
            {{ dateText }}
            <span class="mx-1 opacity-40">·</span>
            <VIcon icon="mdi-weather-partly-cloudy" size="16" />
            {{ $t('page.home.weather') }}
          </div>

          <h1 class="mt-3 text-3xl text-white font-800 md:text-4xl">{{ greeting }}</h1>
          <p class="mt-2 max-w-xl text-sm text-white/70">{{ $t('page.home.subtitle') }}</p>
        </div>

        <div
          class="hidden size-24 shrink-0 items-center justify-center rounded-3xl bg-white/10 backdrop-blur md:flex"
        >
          <VIcon class="text-white" icon="mdi-rocket-launch-outline" size="48" />
        </div>
      </div>

      <div class="flex flex-wrap gap-2">
        <VBtn
          v-for="action in actions"
          :key="action.key"
          class="text-none text-white"
          variant="text"
          @click="handleAction(action)"
        >
          <VIcon class="mr-1.5" :icon="action.icon" size="18" />
          {{ action.label }}
        </VBtn>
      </div>
    </div>
  </VCard>
</template>

<style scoped>
.home-banner {
  background:
    radial-gradient(circle at 85% 10%, rgb(255 255 255 / 18%), transparent 38%),
    linear-gradient(135deg, #5b63f5 0%, #7c5cf5 45%, #4f8cf7 100%);
  box-shadow: 0 18px 40px -18px rgb(91 99 245 / 65%);
}

.home-banner__glow {
  position: absolute;
  border-radius: 9999px;
  background: rgb(255 255 255 / 12%);
  filter: blur(2px);
}

.home-banner__glow--one {
  top: -80px;
  right: 12%;
  width: 220px;
  height: 220px;
}

.home-banner__glow--two {
  right: -60px;
  bottom: -120px;
  width: 280px;
  height: 280px;
}
</style>
