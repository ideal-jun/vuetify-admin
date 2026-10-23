import { afterEach, describe, expect, it } from 'vitest';

import { createStorage } from './storage';

interface TestStorage {
  name: string;
  count: number;
}

describe('createStorage', () => {
  const storage = createStorage<TestStorage>('local', 'test-prefix-');

  afterEach(() => {
    storage.clear();
  });

  it('stores and reads typed values', () => {
    storage.set('name', 'vuetify');
    storage.set('count', 3);

    expect(storage.get('name')).toBe('vuetify');
    expect(storage.get('count')).toBe(3);
  });

  it('removes values and handles expired values', () => {
    storage.set('name', 'expired', new Date(Date.now() - 1000));

    expect(storage.get('name')).toBeNull();

    storage.set('name', 'kept');
    storage.remove('name');

    expect(storage.get('name')).toBeNull();
  });
});
