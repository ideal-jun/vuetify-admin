import { describe, expect, it } from 'vitest';

import {
  addColorAlpha,
  getColorPalette,
  getPaletteColorByNumber,
  getRgb,
  getRgbString,
  transformColorWithOpacity,
} from './color';

describe('color utils', () => {
  it('parses hex and rgb colors', () => {
    expect(getRgb('#646cff')).toEqual({ r: 100, g: 108, b: 255 });
    expect(getRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(getRgb('rgb(1, 2, 3)')).toEqual({ r: 1, g: 2, b: 3 });
  });

  it('keeps the base color at the 500 shade', () => {
    expect(getPaletteColorByNumber('#646cff', 500)).toBe('#646cff');

    const palette = getColorPalette('#646cff');

    expect(palette.size).toBe(11);
    expect(palette.get(50)).toBeDefined();
    expect(palette.get(950)).toBeDefined();
  });

  it('creates css ready values', () => {
    expect(getRgbString('#646cff')).toBe('100 108 255');
    expect(addColorAlpha('#646cff', 0.5)).toBe('rgba(100, 108, 255, 0.5)');
    expect(transformColorWithOpacity('#646cff', 0.1, '#ffffff')).toBe('#f0f0ff');
    expect(transformColorWithOpacity('#646cff', 0.3, '#000000')).toBe('#1e204d');
  });
});
