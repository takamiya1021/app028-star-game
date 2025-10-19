class PolyfillTouch {
  constructor(init: TouchInit) {
    Object.assign(this, init);
  }
}

class PolyfillTouchEvent extends Event {
  touches: PolyfillTouch[];
  constructor(type: string, init: TouchEventInit) {
    super(type, init);
    this.touches = init.touches ? Array.from(init.touches as unknown as PolyfillTouch[]) : [];
  }
}

if (typeof global !== 'undefined') {
  // @ts-ignore
  global.Touch = PolyfillTouch;
  // @ts-ignore
  global.TouchEvent = PolyfillTouchEvent;
}
