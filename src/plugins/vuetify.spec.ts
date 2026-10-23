import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { defineComponent, h } from 'vue';
import { useLocale } from 'vuetify';

const LocaleProbe = defineComponent({
  setup() {
    const { t } = useLocale();

    return () => h('div', t('$vuetify.noDataText'));
  },
});

describe('Vuetify locale adapter', () => {
  it('resolves Vuetify messages through vue-i18n', () => {
    const wrapper = mount(LocaleProbe);

    expect(wrapper.text()).toBe('没有数据');
  });
});
