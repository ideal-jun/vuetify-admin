<script setup lang="ts">
import { useEventListener } from '@vueuse/core';
import { computed } from 'vue';

import { useTabMenu } from './use-tab-menu';

defineOptions({ name: 'TabContextMenu' });

const props = defineProps<{
  x: number;
  y: number;
  tabId: string;
}>();

const visible = defineModel<boolean>('visible', { default: false });

const { getMenuOptions, runTabAction } = useTabMenu();

const options = computed(() => getMenuOptions(props.tabId));

const MENU_WIDTH = 200;
const MENU_ITEM_HEIGHT = 40;
const MENU_PADDING = 8;

const menuStyle = computed(() => {
  const height = options.value.length * MENU_ITEM_HEIGHT + MENU_PADDING * 2;
  const maxX = Math.max(MENU_PADDING, window.innerWidth - MENU_WIDTH - MENU_PADDING);
  const maxY = Math.max(MENU_PADDING, window.innerHeight - height - MENU_PADDING);

  return {
    left: `${Math.min(Math.max(props.x, MENU_PADDING), maxX)}px`,
    top: `${Math.min(Math.max(props.y, MENU_PADDING), maxY)}px`,
  };
});

function closeMenu() {
  visible.value = false;
}

useEventListener(window, 'click', closeMenu);
useEventListener(window, 'scroll', closeMenu, { capture: true });
useEventListener(window, 'keydown', (event) => {
  if (event.key === 'Escape') {
    closeMenu();
  }
});

async function handleSelect(key: App.Global.DropdownKey) {
  closeMenu();

  await runTabAction(key, props.tabId);
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="tab-context-menu"
      :style="menuStyle"
      @click.stop
      @contextmenu.prevent
    >
      <VList bg-transparent density="compact" nav>
        <VListItem
          v-for="option in options"
          :key="option.key"
          :disabled="option.disabled"
          :prepend-icon="option.icon"
          :title="option.label"
          @click="handleSelect(option.key)"
        />
      </VList>
    </div>
  </Teleport>
</template>

<style scoped>
.tab-context-menu {
  position: fixed;
  z-index: 4000;
  min-width: 190px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), 60%);
  border-radius: 12px;
  background: rgb(var(--v-theme-surface));
  box-shadow: 0 12px 32px rgb(0 0 0 / 16%);
  animation: tab-context-in 0.12s ease-out;
}

@keyframes tab-context-in {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
}
</style>
