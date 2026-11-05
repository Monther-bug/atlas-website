import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Lang } from '@/content/types';
import { cranes } from '@/content';
import { getImage, type CropName } from '@/generated/images';
import {
  HOIST,
  counterLabel,
  counterSteps,
  coverPositionY,
  directionalSnap,
  hoistPinLength,
  hoistSnapPoints,
  hookToBox,
  type Point,
  type Rect,
} from './math';
import { lenisRef, noop, type Dispose } from './shared';

const SVG_NS = 'http://www.w3.org/2000/svg';
/** Share of the stage height given to the photo. Keep in sync with `inset: 0 0 24% 0` in motion.css. */
const STAGE_PHOTO = 0.76;
/** The crop Part C's Hoist <Picture> shows at ≥ 768 px (C.5: crop="desktop_16x9"). */
const HOIST_CROP: CropName = 'desktop_16x9';
/** The real hook is kept at or above this share of the photo box, so it never sits on the photo's bottom edge. */
const HOOK_MAX_Y = 0.8;
/** Where every hidden load waits before its first beat: far above any stage, whatever the viewport. */
const PARKED = -10000;
const px = (value: number) => `${value}px`;
/**
 * Each beat is still a little before its snap point (HOIST.setDownAt): a snap that settles half a pixel
 * early must still show the final frame (the exact rating, the hook on the real hook).
 */
const SETTLED = HOIST.setDownAt - 0.02;

interface ItemParts {
  item: HTMLElement;
  photo: HTMLElement | null;
  picture: HTMLElement | null;
  tag: HTMLElement | null;
  counter: HTMLElement | null;
  anchor: HTMLElement | null;
}

function partsOf(item: HTMLElement): ItemParts {
  const photo = item.querySelector<HTMLElement>('[data-hoist-photo]');
  return {
    item,
    photo,
    picture: photo?.querySelector<HTMLElement>('picture') ?? null,
    tag: item.querySelector<HTMLElement>('[data-load-tag]'),
    // The aria-hidden counter only: its sr-only twin always keeps the final value (C.5).
    counter: item.querySelector<HTMLElement>('[data-counter][aria-hidden="true"]'),
    anchor: item.querySelector<HTMLElement>('[data-hook-anchor]'),
  };
}

interface CounterWriter {
  /** Shows `value`: whole tonnes mid-run, the exact rating at the ends (counterLabel). Non-finite values are ignored. */
  write(value: number): void;
  /** Holds the counter at the width of its final number, so the tag never changes size while digits change. */
  lock(): void;
  /** Puts back React's text and inline style. */
  restore(): void;
}

const NO_COUNTER: CounterWriter = { write: () => {}, lock: () => {}, restore: () => {} };

/**
 * Puts an element's `style` attribute back to exactly `value`. For "no attribute", the empty write first is
 * needed: after CSSOM writes, Chrome re-syncs a removed style attribute as `style=""` unless it was set first.
 */
function putStyle(el: Element, value: string | null): void {
  el.setAttribute('style', value ?? '');
  if (value === null) el.removeAttribute('style');
}

/** Rewrites only the nodeValue of the counter's own text node; React's nodes are never replaced. */
function counterWriter(counter: HTMLElement | null, lang: Lang, from: number, to: number): CounterWriter {
  const node = counter?.firstChild ?? null;
  if (!counter || !node || node.nodeType !== Node.TEXT_NODE) return NO_COUNTER;
  if (!Number.isFinite(from) || !Number.isFinite(to)) return NO_COUNTER;
  const final = node.nodeValue ?? '';
  const style = counter.getAttribute('style');
  return {
    write: (value) => {
      if (!Number.isFinite(value)) return;
      node.nodeValue = counterLabel(value, { from, to }, lang);
    },
    lock: () => {
      const shown = node.nodeValue;
      node.nodeValue = final;
      counter.style.removeProperty('min-inline-size');
      // Inline-start aligned: a digit added mid-run grows towards the unit, so the text's start point
      // (what Layout Instability measures) never moves and the run adds no layout shift.
      counter.style.display = 'inline-block';
      counter.style.minInlineSize = px(counter.getBoundingClientRect().width);
      node.nodeValue = shown;
    },
    restore: () => {
      node.nodeValue = final;
      putStyle(counter, style);
    },
  };
}

/** The real hook in this item's photo (source pixels), when the crop has one and Part C rendered the anchor. */
function realHookOf(parts: ItemParts): { hook: Point; rect: Rect } | null {
  if (!parts.anchor) return null;
  const crane = cranes.find((c) => c.id === parts.item.dataset.crane);
  if (!crane) return null;
  try {
    const image = getImage(crane.hoistPhoto, HOIST_CROP);
    return image.hook ? { hook: image.hook, rect: image.rect } : null;
  } catch {
    return null;
  }
}

/**
 * The exact `style` attributes React rendered, put back verbatim on cleanup (after ctx.revert(), which
 * also resets GSAP's transform cache): a revert can leave an empty `style=""` or re-serialise React's
 * custom properties. No gsap call here: this runs while gsap.matchMedia reverts its context.
 */
function styleSnapshot(elements: Array<Element | null>): Dispose {
  const saved = elements.filter((el): el is Element => el !== null).map((el) => [el, el.getAttribute('style')] as const);
  return () => {
    for (const [el, style] of saved) putStyle(el, style);
  };
}

interface Rig {
  li: HTMLLIElement;
  hook: HTMLElement;
  curves: SVGPathElement[];
}

/** Motion-owned, decorative: faint load-chart arcs plus the rope and the hook block. */
function buildRig(rtl: boolean): Rig {
  const li = document.createElement('li');
  li.className = 'hoist-rig';
  li.setAttribute('aria-hidden', 'true');

  // Arcs about the bottom inline-end corner. No values, no axes: nothing reads as Atlas load data.
  const chart = document.createElementNS(SVG_NS, 'svg');
  chart.setAttribute('class', 'hoist-rig__curves');
  chart.setAttribute('viewBox', '0 0 1000 760');
  chart.setAttribute('preserveAspectRatio', rtl ? 'xMinYMax slice' : 'xMaxYMax slice');
  const curves = [260, 420, 580, 740].map((r) => {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', rtl ? `M ${r} 760 A ${r} ${r} 0 0 0 0 ${760 - r}` : `M ${1000 - r} 760 A ${r} ${r} 0 0 1 1000 ${760 - r}`);
    // As an attribute, not CSS: DrawSVGPlugin reads it to measure the on-screen length.
    path.setAttribute('vector-effect', 'non-scaling-stroke');
    chart.append(path);
    return path;
  });

  // One zero-size point: the rope runs up past the top edge, the block hangs just above the point.
  const hook = document.createElement('div');
  hook.className = 'hoist-rig__hook';
  hook.innerHTML =
    '<svg class="hoist-rig__rope" viewBox="0 0 2 100" preserveAspectRatio="none"><line x1="1" y1="0" x2="1" y2="100" vector-effect="non-scaling-stroke"/></svg>' +
    '<svg class="hoist-rig__block" viewBox="0 0 28 40"><rect x="7" y="0" width="14" height="14" rx="1"/><path d="M14 14v9a7 7 0 1 1-7 7"/></svg>';

  li.append(chart, hook);
  return { li, hook, curves };
}

/**
 * Snapping gives way to the keyboard: after a key press (arrows, Page Down, Space, Tab, Enter on the
 * skip link) the scroll lands exactly where the browser put it. Wheel, touch and pointer scrolls snap.
 */
function lastInputTracker(): { readonly keyboard: boolean; dispose: Dispose } {
  let keyboard = false;
  const onKey = () => (keyboard = true);
  const onPointer = () => (keyboard = false);
  const opts = { capture: true, passive: true } as const;
  window.addEventListener('keydown', onKey, opts);
  for (const type of ['wheel', 'pointerdown', 'touchstart'] as const) window.addEventListener(type, onPointer, opts);
  return {
    get keyboard() {
      return keyboard;
    },
    dispose: () => {
      window.removeEventListener('keydown', onKey, opts);
      for (const type of ['wheel', 'pointerdown', 'touchstart'] as const) window.removeEventListener(type, onPointer, opts);
    },
  };
}

/**
 * Moves the page to `from + delta` in one frame. With Lenis, through Lenis: a glide in progress would
 * otherwise put its old position back on the next frame. The rest of that glide is dropped; nothing jumps.
 */
function shiftScroll(from: number, delta: number): void {
  if (Math.abs(delta) < 0.5) return;
  const lenis = lenisRef.current;
  if (lenis) lenis.scrollTo(from + delta, { immediate: true, force: true });
  else window.scrollTo({ top: from + delta, behavior: 'instant' });
}

/** The Hoist, desktop (spec §5.3). One sticky, scrubbed stage that snaps to each crane. */
export function hoistDesktop(section: HTMLElement, lang: Lang, rtl: boolean): Dispose {
  const list = section.querySelector<HTMLElement>('[data-hoist-list]');
  const host = list?.parentElement ?? null;
  const items = Array.from(section.querySelectorAll<HTMLElement>('[data-hoist-item]'));
  if (!list || !host || items.length === 0) return noop;

  const parts = items.map(partsOf);
  const steps = counterSteps(items.map((el) => Number(el.dataset.capacity)));
  const writers = parts.map((p, i) => counterWriter(p.counter, lang, steps[i].from, steps[i].to));
  const snaps = hoistSnapPoints(items.length);
  const lastIndex = parts.length - 1;
  const last = parts[lastIndex];
  const lastHook = realHookOf(last);

  const restoreStyles = styleSnapshot([list, ...parts.flatMap((p) => [p.item, p.photo, p.picture, p.tag, p.counter])]);
  // A visitor already past the section (a deep link, scrolling back up) must not see the page jump while the
  // stage changes the section's height above them: whatever follows the section stays where it is on screen.
  const before = section.getBoundingClientRect();
  const scrollBefore = window.scrollY;
  const keepBottom = before.top < 0 && before.bottom <= window.innerHeight;

  // Static staging, set once.
  section.classList.add('hoist--staged');
  const rig = buildRig(rtl);
  list.append(rig.li);
  const runway = document.createElement('div');
  runway.className = 'hoist-runway';
  runway.setAttribute('aria-hidden', 'true');
  list.after(runway);

  // Geometry in px, stage coordinates; re-measured at the start of every ScrollTrigger refresh.
  const geo = {
    top: 0, // the sticky offset: the fixed header's height
    h: 0,
    tail: 0,
    pin: 0,
    ropeX: 0,
    hookY: 0,
    lift: 0, // how far the hook and its tag rise to leave the frame
    tagX: parts.map(() => 0),
    land: null as Point | null, // the real hook in IMG_6389, when it is in view
    exitX: 0,
  };
  const measure = () => {
    const header = document.querySelector<HTMLElement>('[data-header]');
    geo.top = header ? Math.max(0, header.getBoundingClientRect().bottom) : 0;
    list.style.setProperty('--stage-top', px(geo.top));

    // Content after the runway (footnote, closing button) must not pass unseen under the stuck stage:
    // a bottom margin of the same height releases the stage just as that content arrives. The stage
    // is then stuck for runway + margin, so the runway is the pin length minus the margin.
    list.style.marginBlockEnd = '0px';
    geo.tail = Math.max(0, host.getBoundingClientRect().bottom - runway.getBoundingClientRect().bottom);
    list.style.marginBlockEnd = px(geo.tail);
    geo.pin = hoistPinLength(items.length, window.innerHeight);
    runway.style.blockSize = px(Math.max(0, geo.pin - geo.tail));

    const w = list.clientWidth;
    geo.h = list.clientHeight;
    geo.ropeX = w * (rtl ? 0.7 : 0.3); // the rope hangs in the reading-start third
    geo.hookY = geo.h * STAGE_PHOTO * 0.26;
    list.style.setProperty('--rope-x', px(geo.ropeX));
    list.style.setProperty('--hook-y', px(geo.hookY));

    writers.forEach((writer) => writer.lock());
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const tallest = Math.max(0, ...parts.map((p) => p.tag?.offsetHeight ?? 0));
    geo.lift = geo.hookY + 3.5 * rem + tallest + rem;

    // The climax: the GMK6350 crop moves down just enough to show its real hook clear of the photo's
    // bottom edge; the UI hook lands there. If the hook still cannot be shown, there is no landing.
    geo.tagX = parts.map(() => geo.ropeX);
    geo.land = null;
    last.item.style.removeProperty('--photo-oy');
    if (lastHook) {
      const box = { width: w, height: geo.h * STAGE_PHOTO };
      const oy = coverPositionY(lastHook.hook, lastHook.rect, box, HOOK_MAX_Y);
      const p = hookToBox(lastHook.hook, lastHook.rect, box, { x: 0.5, y: oy });
      const margin = 2 * rem;
      if (p.x >= margin && p.x <= box.width - margin && p.y >= margin && p.y <= box.height - margin / 2) {
        geo.land = p;
        last.item.style.setProperty('--photo-oy', `${oy * 100}%`);
        last.item.style.setProperty('--hook-ax', px(p.x));
        last.item.style.setProperty('--hook-ay', px(p.y));
        // Never hang the last tag over its own real hook (the landing rope would cross it): use the other third.
        const half = (last.tag?.offsetWidth ?? 0) / 2;
        if (Math.abs(p.x - geo.ropeX) < half + margin) geo.tagX[lastIndex] = w - geo.ropeX;
      }
    }
    // Every tag stays whole inside the stage, however wide its readout (e.g. "317.5" at 12.5rem).
    parts.forEach((p, i) => {
      const half = (p.tag?.offsetWidth ?? 0) / 2;
      geo.tagX[i] = Math.min(w - half - rem, Math.max(half + rem, geo.tagX[i]));
    });
    parts.forEach((p, i) => {
      if (geo.tagX[i] === geo.ropeX) p.item.style.removeProperty('--tag-x');
      else p.item.style.setProperty('--tag-x', px(geo.tagX[i]));
    });

    // The exit: the reading-start edge, where the 1 px progress rope (D.8) takes over.
    const stageLeft = list.getBoundingClientRect().left;
    const rope = document.querySelector<HTMLElement>('[data-progress-rope]');
    const ropeBox = rope && rope.getClientRects().length > 0 ? rope.getBoundingClientRect() : null;
    geo.exitX = ropeBox ? ropeBox.left + ropeBox.width / 2 - stageLeft : rtl ? w : 0;
  };
  measure();
  ScrollTrigger.addEventListener('refreshInit', measure);
  // Chrome's scroll anchoring may already have moved the page (Lenis, mid-glide, would undo that on its next
  // frame); browsers without anchoring leave the growth to us. Either way, Lenis must learn the new position.
  const anchored = window.scrollY - scrollBefore;
  const shift = anchored + (keepBottom ? section.getBoundingClientRect().bottom - before.bottom : 0);

  // Rig offsets (x, y) from its resting point at (--rope-x, --hook-y).
  const dx = (i: number) => geo.tagX[i] - geo.ropeX;
  const up = () => -geo.lift;
  const landX = () => (geo.land ? geo.land.x - geo.ropeX : dx(lastIndex));
  const landY = () => (geo.land ? geo.land.y - geo.hookY : 0);
  // The scroll position where the stage sticks, from the (non-sticky) runway: ScrollTrigger mis-measures
  // sticky elements while they are stuck. Runway top − margin − stage height − sticky offset.
  const stageStart = () => runway.getBoundingClientRect().top + window.scrollY - geo.tail - list.offsetHeight - geo.top;
  let st: ScrollTrigger | undefined;

  const ctx = gsap.context(() => {
    // Start: every load parked above the frame, every photo below the ground.
    gsap.set(rig.hook, { x: 0, y: PARKED, opacity: 1 });
    gsap.set(rig.curves, { drawSVG: '0% 0%' });
    for (const p of parts) {
      if (p.tag) gsap.set(p.tag, { xPercent: -50, y: PARKED });
      if (p.photo && p.picture) {
        gsap.set(p.photo, { yPercent: 100 });
        gsap.set(p.picture, { yPercent: -100 });
      }
    }

    const tl = gsap.timeline({
      defaults: { ease: 'none', immediateRender: false },
      scrollTrigger: {
        start: () => stageStart(),
        end: () => stageStart() + geo.pin,
        scrub: 0.6,
        invalidateOnRefresh: true,
        refreshPriority: 1,
      },
    });
    st = tl.scrollTrigger;

    // Enter (0–30): the faint load-chart arcs draw.
    tl.fromTo(rig.curves, { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: 24, stagger: 2, ease: 'expo.out' }, 0);

    parts.forEach((p, i) => {
      const s = HOIST.inUnits + i * HOIST.beatUnits;
      const b = HOIST.beatUnits;
      const prev = parts[i - 1];
      const landsOnRealHook = i === lastIndex && lastHook !== null;

      // 0–30 %: the hook hoists the previous tag out of frame (the rope shortens).
      if (prev) {
        tl.fromTo(rig.hook, { x: () => dx(i - 1), y: 0 }, { x: () => dx(i - 1), y: up, duration: b * 0.3, ease: 'power2.in' }, s);
        if (prev.tag) tl.fromTo(prev.tag, { y: 0 }, { y: up, duration: b * 0.3, ease: 'power2.in' }, s);
      }

      // 25–65 %: the photo rises out of the ground (transform-only shutter: the window opens, the image holds still).
      if (p.photo && p.picture) {
        tl.fromTo(p.photo, { yPercent: 100 }, { yPercent: 0, duration: b * 0.4, ease: 'expo.out' }, s + b * 0.25);
        tl.fromTo(p.picture, { yPercent: -100 }, { yPercent: 0, duration: b * 0.4, ease: 'expo.out' }, s + b * 0.25);
      }

      // 50–83 % (last crane: 50–70 %): the hook lowers with the new tag and sets it down; the counter runs.
      const at = s + b * 0.5;
      const lower = landsOnRealHook ? b * 0.2 : b * (SETTLED - 0.5);
      tl.fromTo(rig.hook, { x: () => dx(i), y: up }, { x: () => dx(i), y: 0, duration: lower, ease: 'expo.out' }, at);
      if (p.tag) tl.fromTo(p.tag, { y: up }, { y: 0, duration: lower, ease: 'expo.out' }, at);
      const proxy = { value: steps[i].from };
      tl.fromTo(
        proxy,
        { value: steps[i].from },
        { value: steps[i].to, duration: b * (SETTLED - 0.5), ease: 'expo.out', onUpdate: () => writers[i].write(proxy.value) },
        at,
      );

      // Last crane, 70–83 %: the hook lets go of the tag and settles on the real hook in the photo.
      if (landsOnRealHook) {
        tl.fromTo(rig.hook, { x: () => dx(i), y: 0 }, { x: landX, y: landY, duration: b * (SETTLED - 0.7), ease: 'expo.out' }, s + b * 0.7);
      }
    });

    // Out (30): the rope travels to the reading-start edge and hands over to the progress rope.
    tl.fromTo(
      rig.hook,
      { x: landX, y: landY, opacity: 1 },
      { x: () => geo.exitX - geo.ropeX, y: landY, opacity: 0, duration: HOIST.outUnits, ease: 'power2.inOut' },
      HOIST.inUnits + parts.length * HOIST.beatUnits,
    );
  });

  // Snap to a crane once a wheel or touch scroll stops inside the stage (never after keyboard scrolling).
  const input = lastInputTracker();
  const snap = () => {
    if (!st || input.keyboard) return;
    const range = st.end - st.start;
    if (range <= 0 || st.progress <= 0 || st.progress >= 1) return;
    const target = directionalSnap(snaps, st.progress, st.direction, 4 / range);
    const distance = Math.abs(target - st.progress) * range;
    if (distance <= 4) return;
    const y = st.start + range * target;
    if (lenisRef.current) {
      const beat = (HOIST.beatUnits * window.innerHeight) / 100;
      lenisRef.current.scrollTo(y, { duration: Math.min(0.8, Math.max(0.3, (distance / beat) * 0.8)) });
    } else {
      window.scrollTo({ top: y });
    }
  };
  ScrollTrigger.addEventListener('scrollEnd', snap);

  ScrollTrigger.sort();
  ScrollTrigger.refresh();
  // After the refresh, which puts back the scroll position it cached earlier. Same task: no paint between.
  shiftScroll(scrollBefore, shift);

  return () => {
    ScrollTrigger.removeEventListener('scrollEnd', snap);
    ScrollTrigger.removeEventListener('refreshInit', measure);
    input.dispose();
    ctx.revert();
    writers.forEach((writer) => writer.restore());
    rig.li.remove();
    runway.remove();
    section.classList.remove('hoist--staged');
    restoreStyles(); // also drops --stage-top, --rope-x, --hook-y, the margin, --tag-x, --photo-oy, --hook-ax/-ay
    ScrollTrigger.refresh();
  };
}

/**
 * Touch or narrower than 64rem: the "load stack" (spec §5.3). Each card plays once, when its top reaches
 * 80 % of the viewport: the photo opens upward (the same transform-only shutter), the tag drops 40 px on its
 * own short red rope and settles 2° about the rope's top, and the counter runs from the previous rating.
 * Cards already on screen when this starts are left exactly as rendered. Adds no nodes and needs no CSS.
 */
export function hoistTouch(section: HTMLElement, lang: Lang): Dispose {
  const items = Array.from(section.querySelectorAll<HTMLElement>('[data-hoist-item]'));
  if (items.length === 0) return noop;
  const parts = items.map(partsOf);
  const steps = counterSteps(items.map((el) => Number(el.dataset.capacity)));
  const undos: Dispose[] = [];

  const ctx = gsap.context(() => {
    parts.forEach((p, i) => {
      // Any part of the card on screen: leave it exactly as React rendered it (never hide visible content).
      if (p.item.getBoundingClientRect().top < window.innerHeight) return;

      const writer = counterWriter(p.counter, lang, steps[i].from, steps[i].to);
      const restoreStyles = styleSnapshot([p.photo, p.picture, p.tag, p.counter]);
      // At rest the card is React's again: the final text, no inline transforms, React's exact style attributes.
      const undo = () => {
        writer.restore();
        restoreStyles();
      };
      undos.push(undo);
      writer.lock(); // the final number's width, so the tag never changes size while digits change
      const tl = gsap.timeline({ paused: true, onComplete: undo });
      if (p.photo && p.picture) {
        tl.fromTo(p.photo, { yPercent: 100 }, { yPercent: 0, duration: 0.7, ease: 'expo.out', immediateRender: true }, 0);
        tl.fromTo(p.picture, { yPercent: -100 }, { yPercent: 0, duration: 0.7, ease: 'expo.out', immediateRender: true }, 0);
      }
      if (p.tag) {
        // Displaced, never faded: it swings from the top of its own 3.5rem rope, i.e. from the hook.
        tl.fromTo(
          p.tag,
          { y: -40, rotation: 2, transformOrigin: '50% -3.5rem' },
          { y: 0, rotation: 0, duration: 0.6, ease: 'expo.out', immediateRender: true },
          0.3,
        );
      }
      const proxy = { value: steps[i].from };
      writer.write(steps[i].from);
      tl.to(proxy, { value: steps[i].to, duration: 0.8, ease: 'expo.out', onUpdate: () => writer.write(proxy.value) }, 0.35);
      ScrollTrigger.create({ trigger: p.item, start: 'top 80%', once: true, onEnter: () => tl.play() });
    });
  });

  return () => {
    ctx.revert();
    undos.forEach((undo) => undo());
  };
}
