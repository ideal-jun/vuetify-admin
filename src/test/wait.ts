import type { VueWrapper } from '@vue/test-utils';
import { expect, vi } from 'vitest';

/** The default timeout used by the UI wait helpers */
const WAIT_TIMEOUT = 5000;

/** Wait until the rendered text contains the expected content */
export function waitForText(wrapper: VueWrapper, text: string, timeout = WAIT_TIMEOUT) {
  return vi.waitFor(
    () => {
      expect(wrapper.text()).toContain(text);
    },
    { timeout },
  );
}

/** Wait until the rendered table has the expected amount of rows */
export function waitForTableRows(wrapper: VueWrapper, count: number, timeout = WAIT_TIMEOUT) {
  return vi.waitFor(
    () => {
      expect(wrapper.findAll('tbody tr')).toHaveLength(count);
    },
    { timeout },
  );
}

/** Wait until a button with the given label is rendered */
export function waitForButton(wrapper: VueWrapper, label: string, timeout = WAIT_TIMEOUT) {
  return vi.waitFor(
    () => {
      const button = wrapper.findAll('button').find((item) => item.text().trim() === label);

      if (!button) {
        throw new Error(`The "${label}" button is not rendered`);
      }

      return button;
    },
    { timeout },
  );
}

/** Wait until the operate drawer is rendered and return it */
export function waitForDrawer(wrapper: VueWrapper, title: string, timeout = WAIT_TIMEOUT) {
  return vi.waitFor(
    () => {
      const drawer = wrapper
        .findAll('.v-navigation-drawer')
        .find((item) => item.text().includes(title));

      if (!drawer) {
        throw new Error(`The "${title}" drawer is not rendered`);
      }

      return drawer;
    },
    { timeout },
  );
}
