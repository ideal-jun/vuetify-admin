<script setup lang="ts">
import { useEventListener } from '@vueuse/core';
import { computed, nextTick, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import ButtonIcon from '@/components/custom/ButtonIcon.vue';
import SvgIcon from '@/components/custom/SvgIcon.vue';
import { $t } from '@/locales';
import { useRouteStore } from '@/store/modules/route';

defineOptions({ name: 'GlobalSearch' });

const router = useRouter();
const routeStore = useRouteStore();

const visible = ref(false);
const keyword = ref('');
const activeIndex = ref(0);
const inputRef = ref<{ focus: () => void } | null>(null);

const results = computed(() => {
  const value = keyword.value.trim().toLowerCase();

  if (!value) {
    return routeStore.searchMenus.slice(0, 8);
  }

  return routeStore.searchMenus
    .filter((menu: App.Global.Menu) => {
      return (
        menu.label.toLowerCase().includes(value) ||
        menu.routePath.toLowerCase().includes(value) ||
        menu.key.toLowerCase().includes(value)
      );
    })
    .slice(0, 10);
});

function open() {
  visible.value = true;
  keyword.value = '';
  activeIndex.value = 0;

  void nextTick(() => inputRef.value?.focus());
}

function close() {
  visible.value = false;
}

function go(menu?: App.Global.Menu) {
  const target = menu ?? results.value[activeIndex.value];

  if (!target) {
    return;
  }

  close();
  void router.push(target.routePath);
}

function onKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    open();

    return;
  }

  if (!visible.value) {
    return;
  }

  switch (event.key) {
    case 'ArrowDown': {
      event.preventDefault();
      activeIndex.value = Math.min(activeIndex.value + 1, results.value.length - 1);

      break;
    }
    case 'ArrowUp': {
      event.preventDefault();
      activeIndex.value = Math.max(activeIndex.value - 1, 0);

      break;
    }
    case 'Enter': {
      event.preventDefault();
      go();

      break;
    }
    case 'Escape': {
      close();

      break;
    }
    // No default
  }
}

useEventListener(window, 'keydown', onKeydown);

watch(keyword, () => {
  activeIndex.value = 0;
});
</script>

<template>
  <div>
    <ButtonIcon :tooltip-content="`${$t('icon.search')} (Ctrl + K)`" @click="open">
      <SvgIcon icon="mdi-magnify" />
    </ButtonIcon>

    <VDialog v-model="visible" max-width="620" :scrim="true">
      <VCard class="overflow-hidden">
        <div class="flex items-center gap-3 px-5 py-4">
          <VIcon class="opacity-60" icon="mdi-magnify" size="22" />

          <input
            ref="inputRef"
            v-model="keyword"
            class="h-9 flex-1 border-0 bg-transparent text-base outline-none"
            :placeholder="$t('common.keywordSearch')"
          />

          <VChip size="small" variant="tonal">ESC</VChip>
        </div>

        <VDivider />

        <div class="max-h-[420px] overflow-y-auto p-2">
          <button
            v-for="(menu, index) in results"
            :key="menu.key"
            class="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition"
            :class="
              index === activeIndex
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-black/5 dark:hover:bg-white/5'
            "
            type="button"
            @click="go(menu)"
            @mouseenter="activeIndex = index"
          >
            <VIcon :icon="menu.icon || 'mdi-menu'" size="20" />

            <div class="flex-1">
              <div class="text-sm font-600">{{ menu.label }}</div>
              <div class="text-xs opacity-50">{{ menu.routePath }}</div>
            </div>

            <VIcon class="opacity-40" icon="mdi-arrow-right" size="16" />
          </button>

          <div v-if="results.length === 0" class="px-4 py-10 text-center text-sm opacity-50">
            {{ $t('common.noData') }}
          </div>
        </div>

        <div
          class="flex items-center justify-between border-t border-black/5 px-5 py-2 text-xs opacity-50 dark:border-white/10"
        >
          <span>↑ ↓ {{ $t('common.switch') }}</span>
          <span>Enter {{ $t('common.confirm') }}</span>
        </div>
      </VCard>
    </VDialog>
  </div>
</template>
