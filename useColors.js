import {
  reactive,
  ref,
  computed,
} from 'https://unpkg.com/vue@next/dist/vue.runtime.esm-browser.js';
import tinycolor from './tinycolor.js';

export default function useColors() {
  function _colorChange(data, oldHue) {
    const alpha = data && data.a;
    const color;

    // hsl is better than hex between conversions
    if (data && data.hsl) {
      color = tinycolor(data.hsl);
    } else if (data && data.hex && data.hex.length > 0) {
      color = tinycolor(data.hex);
    } else if (data && data.hsv) {
      color = tinycolor(data.hsv);
    } else if (data && data.rgba) {
      color = tinycolor(data.rgba);
    } else if (data && data.rgb) {
      color = tinycolor(data.rgb);
    } else {
      color = tinycolor(data);
    }

    if (color && (color._a === undefined || color._a === null)) {
      color.setAlpha(alpha || 1);
    }

    const hsl = color.toHsl();
    const hsv = color.toHsv();

    if (hsl.s === 0) {
      hsv.h = hsl.h = data.h || (data.hsl && data.hsl.h) || oldHue || 0;
    }

    /* --- comment this block to fix #109, may cause #25 again --- */
    // when the hsv.v is less than 0.0164 (base on test)
    // because of possible loss of precision
    // the result of hue and saturation would be miscalculated
    // if (hsv.v < 0.0164) {
    //   hsv.h = data.h || (data.hsv && data.hsv.h) || 0
    //   hsv.s = data.s || (data.hsv && data.hsv.s) || 0
    // }

    // if (hsl.l < 0.01) {
    //   hsl.h = data.h || (data.hsl && data.hsl.h) || 0
    //   hsl.s = data.s || (data.hsl && data.hsl.s) || 0
    // }
    /* ------ */

    return {
      hsl: hsl,
      hex: color.toHexString().toUpperCase(),
      hex8: color.toHex8String().toUpperCase(),
      rgba: color.toRgb(),
      hsv: hsv,
      oldHue: data.h || oldHue || hsl.h,
      source: data.source,
      a: data.a || color.getAlpha(),
    };
  }

  const colorConfig = {
    hex: '#194d33',
    hsl: { h: 150, s: 0.5, l: 0.2, a: 1 },
    hsv: { h: 150, s: 0.66, v: 0.3, a: 1 },
    rgba: { r: 25, g: 77, b: 51, a: 1 },
    a: 1,
  };

  const colors = ref(_colorChange(colorConfig));

  const colorChange = (data, oldHue) => {
    const _oldHue = colors.h;
    colors.value = _colorChange(data, oldHue || _oldHue);
  };

  const setColors = (newColors) => {
    colorChange(newColors);
  };

  return {
    colors,
    setColors,
  };
}
