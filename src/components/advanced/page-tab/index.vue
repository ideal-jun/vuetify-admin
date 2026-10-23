<script setup lang="ts">
import { computed } from 'vue';

import { $t } from '@/locales';

import ChromeTabBg from './ChromeTabBg.vue';
import type { PageTabCssVars, PageTabMode } from './shared';
import { createTabCssVars } from './shared';

defineOptions({ name: 'PageTab', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The tab style */
    mode?: PageTabMode;
    /** Whether the tab is active */
    active?: boolean;
    /** Whether the dark mode is enabled */
    darkMode?: boolean;
    /** Whether the close button is visible */
    closable?: boolean;
    /** Whether the pin icon is visible */
    pinned?: boolean;
    /** The active color of the tab */
    activeColor?: string;
  }>(),
  {
    mode: 'chrome',
    active: false,
    darkMode: false,
    closable: true,
    pinned: false,
    activeColor: '#1890ff',
  },
);

const emit = defineEmits<{
  close: [];
}>();

const cssVars = computed<PageTabCssVars>(() => createTabCssVars(props.activeColor));
</script>

<template>
  <div
    v-bind="$attrs"
    class="page-tab"
    :class="[
      `page-tab--${mode}`,
      {
        'page-tab--active': active,
        'page-tab--dark': darkMode,
      },
    ]"
    :style="cssVars"
  >
    <ChromeTabBg v-if="mode === 'chrome'" class="page-tab__bg" />

    <span v-if="$slots.prefix" class="page-tab__prefix">
      <slot name="prefix" />
    </span>

    <span class="page-tab__label">
      <slot />
    </span>

    <VIcon v-if="pinned" class="page-tab__pin" icon="mdi-pin" size="13" />

    <button
      v-if="closable"
      :aria-label="$t('icon.close')"
      class="page-tab__close"
      type="button"
      @click.stop="emit('close')"
    >
      <svg height="1em" viewBox="0 0 1024 1024" width="1em">
        <path
          d="m563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8L295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512L196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1l216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"
          fill="currentColor"
        />
      </svg>
    </button>

    <span v-if="mode === 'chrome'" class="page-tab__divider" />
  </div>
</template>

<style scoped>
.page-tab {
  position: relative;
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s;
}

.page-tab__prefix,
.page-tab__label,
.page-tab__pin,
.page-tab__close {
  position: relative;
  z-index: 1;
}

.page-tab__label {
  display: block;
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.page-tab__bg {
  position: absolute;
  z-index: 0;
  inset: 0;
  width: 100%;
  height: 100%;
  color: transparent;
  pointer-events: none;
}

.page-tab__pin {
  flex: none;
  color: var(--page-tab-primary);
}

.page-tab__close {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-tab__close:hover {
  color: #ffffff;
  background-color: #9ca3af;
}

.page-tab__divider {
  position: absolute;
  z-index: 1;
  top: 50%;
  right: 7px;
  width: 1px;
  height: 16px;
  background-color: #1f2225;
  transform: translateY(-50%);
}

.page-tab--dark .page-tab__divider {
  background-color: rgb(255 255 255 / 90%);
}

/* Chrome tab */
.page-tab--chrome {
  gap: 16px;
  margin-right: -18px;
  padding: 6px 24px;
}

.page-tab--chrome:hover {
  z-index: 9;
}

.page-tab--chrome.page-tab--active {
  z-index: 10;
  color: var(--page-tab-primary);
}

.page-tab--chrome.page-tab--active .page-tab__bg {
  color: var(--page-tab-primary-1);
}

.page-tab--dark.page-tab--chrome.page-tab--active .page-tab__bg {
  color: var(--page-tab-primary-2);
}

.page-tab--chrome:hover .page-tab__bg {
  color: #dee1e6;
}

.page-tab--chrome.page-tab--active:hover .page-tab__bg {
  color: var(--page-tab-primary-1);
}

.page-tab--dark.page-tab--chrome:hover .page-tab__bg {
  color: #333333;
}

.page-tab--dark.page-tab--chrome.page-tab--active:hover .page-tab__bg {
  color: var(--page-tab-primary-2);
}

.page-tab--chrome.page-tab--active .page-tab__divider,
.page-tab--chrome:hover .page-tab__divider {
  opacity: 0;
}

.page-tab--chrome .page-tab__close:hover {
  background-color: #9ca3af;
}

.page-tab--chrome.page-tab--active .page-tab__close:hover {
  background-color: var(--page-tab-primary);
}

.page-tab--dark .page-tab__close:hover {
  color: #000000;
}

/* Button tab */
.page-tab--button {
  gap: 12px;
  padding: 4px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
}

.page-tab--dark.page-tab--button {
  border-color: rgb(255 255 255 / 24%);
}

.page-tab--button:hover {
  color: var(--page-tab-primary);
  border-color: var(--page-tab-primary-opacity-3);
}

.page-tab--button.page-tab--active {
  color: var(--page-tab-primary);
  border-color: var(--page-tab-primary-opacity-3);
  background-color: var(--page-tab-primary-opacity-1);
}

.page-tab--dark.page-tab--button.page-tab--active {
  background-color: var(--page-tab-primary-opacity-2);
}

.page-tab--button .page-tab__close:hover {
  background-color: var(--page-tab-primary);
}

/* Slider tab */
.page-tab--slider {
  gap: 6px;
  height: 100%;
  padding: 4px 12px;
  border-bottom: 2px solid transparent;
  background-color: transparent;
}

.page-tab--slider:hover {
  color: var(--page-tab-primary);
}

.page-tab--slider.page-tab--active {
  color: var(--page-tab-primary);
  border-bottom-color: var(--page-tab-primary);
  background-color: var(--page-tab-primary-opacity-1);
}

.page-tab--dark.page-tab--slider.page-tab--active {
  background-color: var(--page-tab-primary-opacity-2);
}
</style>
