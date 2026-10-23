import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import PageTab from './index.vue';

describe('PageTab', () => {
  it('applies the selected style and exposes the active color as CSS variables', () => {
    const wrapper = mount(PageTab, {
      props: {
        mode: 'slider',
        active: true,
        activeColor: '#646cff',
      },
      slots: {
        default: 'Home',
      },
    });

    expect(wrapper.classes()).toContain('page-tab--slider');
    expect(wrapper.classes()).toContain('page-tab--active');
    expect(wrapper.attributes('style')).toContain('--page-tab-primary: #646cff');

    wrapper.unmount();
  });

  it('emits close from the close button and hides it when the tab is not closable', async () => {
    const wrapper = mount(PageTab, {
      props: {
        closable: true,
      },
      slots: {
        default: 'User',
      },
    });

    await wrapper.get('.page-tab__close').trigger('click');

    expect(wrapper.emitted('close')).toHaveLength(1);

    await wrapper.setProps({ closable: false });

    expect(wrapper.find('.page-tab__close').exists()).toBe(false);

    wrapper.unmount();
  });

  it('renders the pin icon for a pinned tab', () => {
    const wrapper = mount(PageTab, {
      props: {
        pinned: true,
        closable: false,
      },
      slots: {
        default: 'Pinned',
      },
    });

    expect(wrapper.find('.page-tab__pin').exists()).toBe(true);

    wrapper.unmount();
  });
});
