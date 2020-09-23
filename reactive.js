import { render } from 'https://unpkg.com/lit-html?module';
import {
  shallowReactive,
  effect,
} from 'https://unpkg.com/@vue/reactivity/dist/reactivity.esm-browser.js';

export const LifeCycleMap = {
  BeforeMount: 'BeforeMount',
  Mounted: 'Mounted',
  BeforeUpdate: 'BeforeUpdate',
  Updated: 'Updated',
  Unmounted: 'Unmounted',
};

let currentInstance;

export function defineComponent(name, propDefs, factory) {
  if (typeof propDefs === 'function') {
    factory = propDefs;
    propDefs = [];
  }

  customElements.define(
    name,
    class extends HTMLElement {
      static get observedAttributes() {
        return propDefs;
      }
      constructor() {
        super();
        const props = (this._props = shallowReactive({}));
        currentInstance = this;
        const template = factory.call(this, props);
        currentInstance = null;
        this[LifeCycleMap.BeforeMount] &&
          this[LifeCycleMap.BeforeMount].forEach((cb) => cb());
        // Shadow Dom
        const root = this.attachShadow({ mode: 'open' });
        let isMounted = false;
        effect(() => {
          if (isMounted) {
            this[LifeCycleMap.BeforeUpdate] &&
              this[LifeCycleMap.BeforeUpdate].forEach((cb) => cb());
          }
          render(template(), root);
          if (isMounted) {
            this[LifeCycleMap.Updated] &&
              this[LifeCycleMap.Updated].forEach((cb) => cb());
          } else {
            isMounted = true;
          }
        });
      }
      connectedCallback() {
        this[LifeCycleMap.Mounted] &&
          this[LifeCycleMap.Mounted].forEach((cb) => cb());
      }
      disconnectedCallback() {
        this[LifeCycleMap.Unmounted] &&
          this[LifeCycleMap.Unmounted].forEach((cb) => cb());
      }
      attributeChangedCallback(name, oldValue, newValue) {
        this._props[name] = newValue;
      }
    }
  );
}

function createLifecycleMethod(name) {
  return (cb) => {
    if (currentInstance) {
      (currentInstance[name] || (currentInstance[name] = [])).push(cb);
    }
  };
}

export const onBeforeMount = createLifecycleMethod(LifeCycleMap.BeforeMount);
export const onMounted = createLifecycleMethod(LifeCycleMap.Mounted);
export const onBeforeUpdate = createLifecycleMethod(LifeCycleMap.BeforeUpdate);
export const onUpdated = createLifecycleMethod(LifeCycleMap.Updated);
export const onUnmounted = createLifecycleMethod(LifeCycleMap.Unmounted);

export * from 'https://unpkg.com/lit-html?module';
export * from 'https://unpkg.com/@vue/reactivity/dist/reactivity.esm-browser.js';
