import { afterEach } from 'vitest';
import { cleanup } from './render';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

afterEach(async () => {
  await cleanup();
});
