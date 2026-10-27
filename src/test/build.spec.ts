import { mount } from '@vue/test-utils';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { waitForText } from '@/test/wait';
import ToolBuild from '@/views/tool/build/index.vue';

beforeAll(() => {
  // Vuetify overlays measure the visual viewport, which jsdom does not implement.
  vi.stubGlobal('visualViewport', {
    width: 1280,
    height: 800,
    offsetLeft: 0,
    offsetTop: 0,
    scale: 1,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  });
});

function mountPage() {
  return mount({
    components: { ToolBuild },
    template: '<VApp><ToolBuild /></VApp>',
  });
}

describe('form builder page', () => {
  it('adds a field from the palette and updates the canvas count', async () => {
    const wrapper = mountPage();

    await waitForText(wrapper, '0 个组件');
    expect(wrapper.text()).toContain('表单构建');
    expect(wrapper.text()).toContain('表单还是空的');

    const inputPaletteItem = wrapper
      .findAll('button')
      .find((button) => button.text().trim() === '单行文本');

    expect(inputPaletteItem).toBeDefined();

    await inputPaletteItem?.trigger('click');

    await waitForText(wrapper, '1 个组件');
    expect(wrapper.text()).not.toContain('表单还是空的');

    wrapper.unmount();
  });

  it('opens the JSON dialog with the generated form schema', async () => {
    const wrapper = mountPage();

    await waitForText(wrapper, '0 个组件');

    const inputPaletteItem = wrapper
      .findAll('button')
      .find((button) => button.text().trim() === '单行文本');

    await inputPaletteItem?.trigger('click');
    await waitForText(wrapper, '1 个组件');

    const jsonButton = wrapper.findAll('button').find((button) => button.text().trim() === 'JSON');

    expect(jsonButton).toBeDefined();

    await jsonButton?.trigger('click');

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain('表单 JSON');
    });

    wrapper.unmount();
  });
});
