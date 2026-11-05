// The slice of the `jsdom` package API that src/loader.test.ts uses (the package ships no types; @types/jsdom is not
// installed, and node_modules is shared).
declare module 'jsdom' {
  export interface JSDOMOptions {
    url?: string;
    runScripts?: 'dangerously' | 'outside-only';
    pretendToBeVisual?: boolean;
    beforeParse?: (window: Window & typeof globalThis) => void;
  }
  export class JSDOM {
    constructor(html?: string, options?: JSDOMOptions);
    readonly window: Window & typeof globalThis;
  }
}
