import { gsap } from 'gsap';
import { getImage, type PhotoId } from '@/generated/images';
import type { GlLayer, GlState } from './hero-gl';
import type { Dispose, MotionEnv } from './shared';

/** Top of the hoist rope (the boom-tip sheave) in source pixels, read off each photo like assets-src/hook-points.json. */
export const ROPE_TOP: Partial<Record<PhotoId, { x: number; y: number }>> = {
  '6398': { x: 3041, y: 27 },
  '6359': { x: 1646, y: 248 },
};

/** Must match HERO_PHOTO in src/sections/Hero.tsx (a test checks). Kept here so the core chunk needs no section code. */
export const LIVE_PHOTO = { ar: '6398', en: '6359' } as const satisfies Record<MotionEnv['lang'], PhotoId>;

/** ± swing limit (radians, about 1.7°, ~15 px at the hook): enough to read, never enough to reach the navy plane. */
const MAX_SWING = 0.03;

/**
 * The live hook (desktop, fine pointer, motion allowed; started after the intro). A damped pendulum that the cursor's
 * speed near the hook can kick. With the WebGL layer (hero-gl.ts, a separate chunk fetched on idle) it is the REAL
 * rope swinging about the boom tip, and the rig (an empty box on the hook: nothing hangs from it since 11 Nov 2026)
 * follows the hook to its new place. The ticker runs only while something moves.
 */
export function startLiveHook(hero: HTMLElement, rig: HTMLElement, env: MotionEnv): Dispose {
  const photo = getImage(LIVE_PHOTO[env.lang], 'desktop_16x9');
  const tip = ROPE_TOP[photo.photo];
  const st: GlState = { px: 0, py: 0, theta: 0 };
  const target = { x: 0, y: 0 };
  let omega = 0;
  let last: { x: number; t: number } | null = null;
  let gl = false;
  let awake = false;
  let alive = true;
  let layer: GlLayer | null = null;

  const host = hero.querySelector<HTMLElement>('[data-hero-gl]');
  const img = hero.querySelector<HTMLImageElement>('[data-hero-photo] img');
  const tick = (_time: number, deltaMs: number) => {
    const dt = Math.min(deltaMs, 50) / 1000;
    // The WebGL layer can drop itself (slow first frame, lost context): then the swing goes back to the DOM rig.
    if (gl && host && host.childElementCount === 0) gl = false;
    const w0 = (2 * Math.PI) / (gl ? 2.6 : 1.7);
    omega += (-w0 * w0 * st.theta - 2 * 0.1 * w0 * omega) * dt;
    st.theta = Math.max(-MAX_SWING, Math.min(MAX_SWING, st.theta + omega * dt));
    st.px += (target.x - st.px) * 0.06;
    st.py += (target.y - st.py) * 0.06;
    layer?.draw(); // the canvas renders only while something moves
    const deg = (st.theta * 180) / Math.PI;
    if (gl && tip && photo.hook) {
      // The hook swings about the boom tip: move the rig to the hook's new place and turn it with the rope.
      const r = hero.getBoundingClientRect();
      const s = Math.max(r.width / photo.rect.width, r.height / photo.rect.height);
      const dx = (photo.hook.x - tip.x) * s;
      const dy = (photo.hook.y - tip.y) * s;
      const c = Math.cos(st.theta);
      const sn = Math.sin(st.theta);
      gsap.set(rig, { x: c * dx - sn * dy - dx, y: sn * dx + c * dy - dy, rotation: deg });
    } else {
      gsap.set(rig, { rotation: deg });
    }
    const still = Math.abs(st.theta) < 0.0004 && Math.abs(omega) < 0.002 && Math.abs(target.x - st.px) < 0.002 && Math.abs(target.y - st.py) < 0.002;
    // The cursor parallax eases too, so the ticker (and the canvas) run until that has settled as well.
    if (still) {
      gsap.ticker.remove(tick);
      awake = false;
    }
  };
  const wake = () => {
    if (!awake) {
      awake = true;
      gsap.ticker.add(tick);
    }
  };
  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    const r = hero.getBoundingClientRect();
    target.x = ((event.clientX - r.left) / r.width) * 2 - 1;
    target.y = ((event.clientY - r.top) / r.height) * 2 - 1;
    const now = performance.now();
    if (last && now - last.t < 80) {
      const vx = (event.clientX - last.x) / Math.max(now - last.t, 1); // px per ms
      const b = rig.getBoundingClientRect(); // the hook point (a zero-size box)
      const reach = Math.exp(-((Math.hypot(event.clientX - (b.left + b.width / 2), event.clientY - (b.top + b.height / 2)) / 320) ** 2));
      omega += vx * 0.35 * reach; // pushing right swings the hook right
    }
    last = { x: event.clientX, t: now };
    wake();
  };
  hero.addEventListener('pointermove', onMove);

  // The WebGL layer: after the intro, on idle, only when it can run (the module checks WebGL itself).
  const hasIdle = typeof window.requestIdleCallback === 'function';
  const idle = (fn: () => void) => (hasIdle ? window.requestIdleCallback(fn, { timeout: 1500 }) : window.setTimeout(fn, 200));
  const idleId = host && img && tip
    ? idle(() => {
        import('./hero-gl')
          .then(({ startDepth }) => startDepth(host, hero, img, photo, tip, st))
          .then((started) => {
            if (!alive) started?.stop();
            else if (started) {
              layer = started;
              gl = true;
            }
          })
          .catch((error: unknown) => console.error('[motion] hero webgl', error));
      })
    : null;

  return () => {
    alive = false;
    if (idleId !== null) {
      if (hasIdle) window.cancelIdleCallback(idleId);
      else window.clearTimeout(idleId);
    }
    hero.removeEventListener('pointermove', onMove);
    gsap.ticker.remove(tick);
    layer?.stop();
    gsap.set(rig, { clearProps: 'transform' });
  };
}
