<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import CountTo from '@/components/custom/CountTo.vue';
import { $t } from '@/locales';
import { fetchGetHomeOverview } from '@/service/api';

import HomeHeaderBanner from './modules/HomeHeaderBanner.vue';
import HomeProjectNews from './modules/HomeProjectNews.vue';
import HomeRecentActivity from './modules/HomeRecentActivity.vue';
import HomeSourceChart from './modules/HomeSourceChart.vue';
import HomeTrendChart from './modules/HomeTrendChart.vue';

defineOptions({ name: 'Home' });

interface StatCardConfig {
  key: Api.Home.StatKey;
  label: string;
  desc: string;
  icon: string;
  color: 'primary' | 'info' | 'success' | 'warning';
  sparkClass: string;
  prefix: string;
  suffix: string;
  decimals: number;
}

/** The fallback data keeps the dashboard readable while the overview request is pending */
const fallbackOverview: Api.Home.Overview = {
  stats: [
    {
      key: 'users',
      value: 12_840,
      trend: '+12.5%',
      positive: true,
      sparkline: '0,22 12,18 24,20 36,12 48,14 60,6 72,8',
    },
    {
      key: 'orders',
      value: 3280,
      trend: '+8.2%',
      positive: true,
      sparkline: '0,18 12,20 24,14 36,16 48,10 60,12 72,5',
    },
    {
      key: 'revenue',
      value: 86_420,
      trend: '+18.9%',
      positive: true,
      sparkline: '0,20 12,14 24,16 36,8 48,12 60,4 72,7',
    },
    {
      key: 'conversion',
      value: 12.8,
      trend: '-1.4%',
      positive: false,
      sparkline: '0,8 12,6 24,10 36,14 48,12 60,18 72,20',
    },
  ],
  trend: {
    thisWeek: [32, 45, 38, 64, 52, 78, 88],
    lastWeek: [22, 30, 42, 36, 48, 55, 62],
  },
  sources: {
    direct: 38,
    search: 28,
    social: 20,
    referral: 14,
  },
  creativity: {
    quickActions: 24,
    presets: 4,
    columns: 16,
  },
  totalUsers: 12_840,
};

const overview = ref<Api.Home.Overview>(fallbackOverview);
const loading = ref(false);

const statConfig = computed<StatCardConfig[]>(() => [
  {
    key: 'users',
    label: $t('page.home.stats.users'),
    desc: $t('page.home.stats.usersDesc'),
    icon: 'mdi-account-group-outline',
    color: 'primary',
    sparkClass: 'text-primary',
    prefix: '',
    suffix: '',
    decimals: 0,
  },
  {
    key: 'orders',
    label: $t('page.home.stats.orders'),
    desc: $t('page.home.stats.ordersDesc'),
    icon: 'mdi-cart-outline',
    color: 'info',
    sparkClass: 'text-info',
    prefix: '',
    suffix: '',
    decimals: 0,
  },
  {
    key: 'revenue',
    label: $t('page.home.stats.revenue'),
    desc: $t('page.home.stats.revenueDesc'),
    icon: 'mdi-currency-usd',
    color: 'success',
    sparkClass: 'text-success',
    prefix: '$',
    suffix: '',
    decimals: 0,
  },
  {
    key: 'conversion',
    label: $t('page.home.stats.conversion'),
    desc: $t('page.home.stats.conversionDesc'),
    icon: 'mdi-target',
    color: 'warning',
    sparkClass: 'text-warning',
    prefix: '',
    suffix: '%',
    decimals: 1,
  },
]);

const stats = computed(() =>
  statConfig.value.map((item) => {
    const remote = overview.value.stats.find((stat) => stat.key === item.key);

    return {
      ...item,
      value: remote?.value ?? 0,
      trend: remote?.trend ?? '0%',
      positive: remote?.positive ?? true,
      sparkline: remote?.sparkline ?? '',
    };
  }),
);

const creativityStats = computed(() => [
  { label: $t('page.home.quickActions'), value: overview.value.creativity.quickActions },
  { label: $t('theme.tabs.preset'), value: overview.value.creativity.presets },
  { label: $t('common.columnSetting'), value: overview.value.creativity.columns },
]);

async function loadOverview() {
  loading.value = true;

  try {
    const { data, error } = await fetchGetHomeOverview();

    if (!error) {
      overview.value = data;
    }
  } finally {
    loading.value = false;
  }
}

onMounted(loadOverview);
</script>

<template>
  <div class="flex flex-col gap-5">
    <VProgressLinear v-if="loading" class="rounded" color="primary" indeterminate />

    <HomeHeaderBanner />

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <VCard
        v-for="stat in stats"
        :key="stat.key"
        class="app-panel stat-card group relative overflow-hidden"
        variant="flat"
      >
        <VCardText class="p-5">
          <div class="flex items-start justify-between">
            <div
              class="size-11 flex items-center justify-center rounded-2xl"
              :class="`stat-icon stat-icon--${stat.color}`"
            >
              <VIcon :icon="stat.icon" size="22" />
            </div>

            <VChip
              class="font-600"
              :color="stat.positive ? 'success' : 'error'"
              size="x-small"
              variant="tonal"
            >
              <VIcon
                class="mr-0.5"
                :icon="stat.positive ? 'mdi-trending-up' : 'mdi-trending-down'"
                size="13"
              />
              {{ stat.trend }}
            </VChip>
          </div>

          <div class="mt-4 text-2xl text-base-text font-800">
            <CountTo
              :decimals="stat.decimals"
              :duration="1200"
              :end-value="stat.value"
              :prefix="stat.prefix"
              :suffix="stat.suffix"
            />
          </div>

          <div class="mt-0.5 text-sm font-500 opacity-70">{{ stat.label }}</div>

          <div class="mt-1 flex items-center justify-between gap-2">
            <span class="truncate text-[11px] opacity-40">{{ stat.desc }}</span>

            <svg class="h-7 w-[72px] shrink-0 overflow-visible" viewBox="0 0 72 28">
              <polyline
                class="stat-spark"
                :class="stat.sparkClass"
                fill="none"
                :points="stat.sparkline"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
              />
            </svg>
          </div>
        </VCardText>
      </VCard>
    </div>

    <div class="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <HomeTrendChart
        class="xl:col-span-2"
        :last-week="overview.trend.lastWeek"
        :this-week="overview.trend.thisWeek"
      />
      <HomeSourceChart :sources="overview.sources" :total="overview.totalUsers" />
    </div>

    <div class="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <HomeProjectNews class="xl:col-span-2" />
      <HomeRecentActivity />
    </div>

    <VCard class="creativity-banner relative overflow-hidden" rounded="xl" variant="flat">
      <div
        class="relative z-10 flex flex-col items-start justify-between gap-6 p-6 md:flex-row md:items-center"
      >
        <div>
          <h3 class="text-2xl text-white font-800">{{ $t('page.home.creativity.title') }}</h3>
          <p class="mt-2 max-w-xl text-sm text-white/75">{{ $t('page.home.creativity.desc') }}</p>

          <div class="mt-5 flex flex-wrap gap-6">
            <div v-for="item in creativityStats" :key="item.label">
              <div class="text-xl text-white font-800">{{ item.value }}+</div>
              <div class="text-[11px] text-white/60">{{ item.label }}</div>
            </div>
          </div>
        </div>

        <VBtn
          class="bg-white text-primary"
          href="https://vuetifyjs.com/"
          rounded="lg"
          size="large"
          variant="flat"
        >
          {{ $t('page.home.creativity.action') }}
          <VIcon class="ml-1" icon="mdi-arrow-right" size="18" />
        </VBtn>
      </div>
    </VCard>
  </div>
</template>

<style scoped>
.stat-card {
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 30px -20px rgb(0 0 0 / 30%);
}

.stat-icon--primary {
  background: rgba(var(--v-theme-primary), 12%);
  color: rgb(var(--v-theme-primary));
}

.stat-icon--info {
  background: rgba(var(--v-theme-info), 12%);
  color: rgb(var(--v-theme-info));
}

.stat-icon--success {
  background: rgba(var(--v-theme-success), 12%);
  color: rgb(var(--v-theme-success));
}

.stat-icon--warning {
  background: rgba(var(--v-theme-warning), 14%);
  color: rgb(var(--v-theme-warning));
}

.stat-spark {
  opacity: 0.8;
}

.creativity-banner {
  background:
    radial-gradient(circle at 90% 0%, rgb(255 255 255 / 16%), transparent 36%),
    linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #312e81 100%);
  box-shadow: 0 20px 40px -24px rgb(15 23 42 / 70%);
}
</style>
