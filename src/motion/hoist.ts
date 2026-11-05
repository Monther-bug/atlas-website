import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Lang } from '@/content/types';
import { cranes } from '@/content';
import { getImage, type CropName } from '@/generated/images';
import {
  HOIST,
  counterLabel,
  counterSteps,
  coverPositionX,
  coverPositionY,
  directionalSnap,
  hoistPinLength,
  hoistSnapPoints,
  hoistTimelineUnits,
  hookToBox,
  type Point,
  type Rect,
} from './math';
import { lenisRef, noop, type Dispose } from './shared';

/*
 * The fleet showcase (v2). Desktop: one sticky, scrubbed stage. The first crane is hoisted in while the stage rises
 * into view; once it sticks, each scroll beat lifts the readout away on the rope, opens the next photo bottom-up
 * (clip-path, the "hoist" mask) over the last one, lowers the next readout and counts from the previous rating to the
 * exact new one. The last beat lands the rope's hook on the real hook in IMG_6389; the exit carries the rope to the
 * reading-start edge, where the page's progress rope (rope.ts, read-only here: D-notes 13) takes over.
 * rope.ts starts the progress rope when the bottom of [data-hoist-track] reaches the viewport bottom (the stage
 * releases), so the hand-off is continuous; this module only reads the rope's rect.
 * Touch: each card plays once as it arrives. Reduced motion never loads this file. Every change is undone on cleanup.
 */

/** The crop the Hoist <Picture> shows from 768 px up (Hoist.tsx: crop="desktop_16x9"). */
const HOIST_CROP: CropName = 'desktop_16x9';
/** Where the hook waits above the stage's top edge between loads, in px. */
const PARK = 56;
/** From the hook point (where the rope meets the block) to the top of the readout it carries, in px (glyph 45 + 11). */
const HOOK_GAP = 56;
/** The rope hangs this far inside the readout's reading-start edge, in px (half the 36 px glyph). */
const HOOK_INSET = 18;
/** The glyph's bowl sits this far from its hook point (x right, y down), so it lands over the real hook, in px. */
const LAND_DX = 6.75;
const LAND_DY = 38;
/** The real hook stays this share of the frame width away from the frame's side edges. */
const HOOK_MARGIN_X = 0.12;
/** ...and no lower than this share of its height. */
const HOOK_MAX_Y = 0.8;
/** How dark the previous photo gets under the next one. */
const SHADE = 0.6;
const BLUR = 'blur(6px)';
const SHARP = 'blur(0px)';
/** A snap that settles half a pixel early must still show the final frame (the exact rating, the landed hook). */
const SETTLED = HOIST.setDownAt - 0.02;
/**
 * Inside a beat: the old readout is lifted away by LIFTED, the next photo opens from 0.12 to 0.55 and the next readout
 * comes down from SWITCH, where that crane also becomes the current one. Short gaps, so a keyboard scroll that stops
 * anywhere never shows a photo with no readout, or a readout under another crane's photo for long.
 */
const LIFTED = 0.24;
const SWITCH = 0.25;

const px = (value: number) => `${value}px`;
/** A crane hook block: sheave block with its axle, swivel, forged hook and safety latch. The rope meets it at (16, 0). */
const SVG =
  '<svg class="hoist-rig__glyph" viewBox="0 0 32 40" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">' +
  '<rect x="8" y="0.5" width="16" height="14" rx="4" fill="currentColor" stroke="none"/>' +
  '<circle cx="16" cy="7.5" r="2.4" fill="#0a0a0a" stroke="none"/>' +
  '<path d="M16 14.5v6" stroke-width="3"/><path d="M16 20.5v9.5a6 6 0 1 1-12 0v-3" stroke-width="2.6"/>' +
  '<path d="M16 24.5 5.5 26.5" stroke-width="1.4"/></svg>';

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
    // The aria-hidden counter only: its sr-only twin always keeps the final value (D-notes 2).
    counter: item.querySelector<HTMLElement>('[data-counter][aria-hidden="true"]'),
    anchor: item.querySelector<HTMLElement>('[data-hook-anchor]'),
  };
}

interface CounterWriter {
  /** Shows `value`: whole tonnes mid-run, the exact rating at the ends (counterLabel). Non-finite values are ignored. */
  write(value: number): void;
  /** Holds the counter at the width of its final number, so nothing moves while digits change. */
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
      // D-notes 1: formatNumber throws on NaN/Infinity, and nothing inside a GSAP callback would catch it.
      if (!Number.isFinite(value)) return;
      node.nodeValue = counterLabel(value, { from, to }, lang);
    },
    lock: () => {
      const shown = node.nodeValue;
      node.nodeValue = final;
      counter.style.removeProperty('min-inline-size');
      // Inline-start aligned: a digit added mid-run grows towards the unit, so the text's start never moves (no CLS).
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

/** The real hook in this item's photo (source pixels), when the crop has one and the anchor was rendered. */
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
 * The exact `style` attributes React rendered, put back verbatim on cleanup (after ctx.revert(), which can leave an
 * empty `style=""` or re-serialise React's custom properties). No gsap call here: this runs while matchMedia reverts.
 */
function styleSnapshot(elements: Array<Element | null>): Dispose {
  const saved = elements.filter((el): el is Element => el !== null).map((el) => [el, el.getAttribute('style')] as const);
  return () => {
    for (const [el, style] of saved) putStyle(el, style);
  };
}

/** `el`'s layout offset inside `ancestor` (its offsetParent chain; transforms and clip-paths do not count). */
function offsetIn(el: HTMLElement, ancestor: HTMLElement): Point {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== ancestor) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

/** A rounded window onto the frame: `top` % of it closed from the top edge (100 = shut, 0 = open). */
const clip = (top: number, side: number, radius: number) => `inset(${top}% ${side}% ${side ? top : 0}% ${side}% round ${px(radius)})`;

function radiusOf(el: HTMLElement | null): number {
  return el ? parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0 : 0;
}

/** Motion-owned and decorative: the rope and its hook, one zero-size point moved with x/y. */
function buildRig(): { root: HTMLElement; hook: HTMLElement } {
  const root = document.createElement('div');
  root.className = 'hoist-rig';
  root.setAttribute('aria-hidden', 'true');
  const hook = document.createElement('div');
  hook.className = 'hoist-rig__hook';
  hook.innerHTML = `<span class="hoist-rig__rope"></span>${SVG}`;
  root.append(hook);
  return { root, hook };
}

/**
 * Snapping gives way to the keyboard: after a key press (arrows, Page Down, Space, Tab, Enter on a link) the scroll
 * lands exactly where the browser put it. Wheel, touch and pointer scrolls snap.
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
 * Moves the page to `from + delta` in one frame. With Lenis, through Lenis: a glide in progress would otherwise put
 * its old position back on the next frame.
 */
function shiftScroll(from: number, delta: number): void {
  if (Math.abs(delta) < 0.5) return;
  const lenis = lenisRef.current;
  if (lenis) lenis.scrollTo(from + delta, { immediate: true, force: true });
  else window.scrollTo({ top: from + delta, behavior: 'instant' });
}

/** Glides to `y`; the longer the way, the longer the glide (0.45–1.2 s). */
function glideTo(y: number): void {
  const lenis = lenisRef.current;
  const distance = Math.abs(y - window.scrollY);
  if (distance <= 4) return;
  if (lenis) lenis.scrollTo(y, { duration: Math.min(1.2, Math.max(0.45, (distance / window.innerHeight) * 0.6)) });
  else window.scrollTo({ top: y });
}

/** The Hoist, desktop: a sticky, scrubbed stage that snaps to each crane. */
export function hoistDesktop(section: HTMLElement, lang: Lang, rtl: boolean): Dispose {
  const track = section.querySelector<HTMLElement>('[data-hoist-track]');
  const stage = section.querySelector<HTMLElement>('[data-hoist-stage]');
  const list = section.querySelector<HTMLElement>('[data-hoist-list]');
  const items = Array.from(section.querySelectorAll<HTMLElement>('[data-hoist-item]'));
  if (!track || !stage || !list || items.length === 0) return noop;

  const n = items.length;
  const parts = items.map(partsOf);
  const steps = counterSteps(items.map((el) => Number(el.dataset.capacity)));
  const writers = parts.map((p, i) => counterWriter(p.counter, lang, steps[i].from, steps[i].to));
  const snaps = hoistSnapPoints(n);
  const total = hoistTimelineUnits(n);
  const nav = section.querySelector<HTMLElement>('[data-hoist-chapters]');
  const links = parts.map((p) => section.querySelector<HTMLAnchorElement>(`[data-chapter="${p.item.dataset.crane}"]`));
  const fills = links.map((a) => a?.querySelector<HTMLElement>('[data-chapter-fill]') ?? null);
  const buttons = parts.map((p) => p.item.querySelector<HTMLElement>('[data-hoist-request]'));
  const last = parts[n - 1];
  const lastHook = realHookOf(last);

  const restoreStyles = styleSnapshot([
    track,
    stage,
    list,
    ...parts.flatMap((p) => [p.item, p.photo, p.picture, p.tag, p.counter]),
    ...fills,
  ]);
  // A visitor already past the section (a deep link, scrolling back up) must not see the page jump while the stage
  // changes the section's height above them: whatever follows the section stays where it is on screen.
  const before = section.getBoundingClientRect();
  const scrollBefore = window.scrollY;
  const keepBottom = before.top < 0 && before.bottom <= window.innerHeight;

  section.classList.add('hoist--staged');
  const rig = buildRig();
  stage.append(rig.root);

  // Geometry in px, in the stage's coordinates; re-measured at the start of every ScrollTrigger refresh.
  const geo = {
    vh: 0,
    pin: 0,
    radius: 0,
    ropeX: parts.map(() => 0),
    hookY: parts.map(() => 0),
    land: null as Point | null,
    exitX: 0,
    exitY: 0,
  };
  const measure = () => {
    const header = document.querySelector<HTMLElement>('[data-header]');
    const headerBottom = header ? Math.max(0, header.getBoundingClientRect().bottom) : 0;
    stage.style.setProperty('--hoist-top', px(headerBottom));
    geo.vh = window.innerHeight;
    geo.pin = hoistPinLength(n, geo.vh);
    track.style.blockSize = px(geo.vh + geo.pin);
    writers.forEach((writer) => writer.lock());

    geo.radius = radiusOf(parts[0].photo);
    // Readouts start level with the photo frame's top edge (the frames are the same size in every item).
    stage.style.setProperty('--hoist-photo-y', '0px');
    if (parts[0].photo) stage.style.setProperty('--hoist-photo-y', px(offsetIn(parts[0].photo, parts[0].item).y - parts[0].item.clientTop));
    parts.forEach((p, i) => {
      if (!p.tag) return;
      const at = offsetIn(p.tag, stage);
      geo.ropeX[i] = rtl ? at.x + p.tag.offsetWidth - HOOK_INSET : at.x + HOOK_INSET;
      geo.hookY[i] = at.y - HOOK_GAP;
    });

    // The climax: the GMK6350 crop moves just enough to keep its real hook clear of the frame's edges; the rope's
    // hook lands there. If the hook still cannot be shown well, there is no landing.
    geo.land = null;
    if (last.photo) {
      last.photo.style.removeProperty('--photo-ox');
      last.photo.style.removeProperty('--photo-oy');
    }
    if (lastHook && last.photo) {
      const box = { width: last.photo.offsetWidth, height: last.photo.offsetHeight };
      const ox = coverPositionX(lastHook.hook, lastHook.rect, box, HOOK_MARGIN_X);
      const oy = coverPositionY(lastHook.hook, lastHook.rect, box, HOOK_MAX_Y);
      const p = hookToBox(lastHook.hook, lastHook.rect, box, { x: ox, y: oy });
      if (box.width > 0 && p.x >= 24 && p.x <= box.width - 24 && p.y >= LAND_DY + 24 && p.y <= box.height - 16) {
        const frame = offsetIn(last.photo, stage);
        geo.land = { x: frame.x + p.x + LAND_DX, y: frame.y + p.y - LAND_DY };
        last.photo.style.setProperty('--photo-ox', `${ox * 100}%`);
        last.photo.style.setProperty('--photo-oy', `${oy * 100}%`);
        last.photo.style.setProperty('--hook-ax', px(p.x));
        last.photo.style.setProperty('--hook-ay', px(p.y));
      }
    }

    // The exit: the progress rope's line (read-only: rope.ts owns it), else the reading-start edge of the stage.
    const stageLeft = stage.getBoundingClientRect().left;
    const rope = document.querySelector<HTMLElement>('[data-progress-rope]');
    const ropeBox = rope && rope.getClientRects().length > 0 ? rope.getBoundingClientRect() : null;
    geo.exitX = ropeBox && ropeBox.width > 0 ? ropeBox.left + ropeBox.width / 2 - stageLeft : rtl ? stage.clientWidth : 0;
    // In view, just under the header, so the walk to the reading-start edge can be seen.
    geo.exitY = headerBottom + 28;
  };
  measure();
  ScrollTrigger.addEventListener('refreshInit', measure);
  // Chrome's scroll anchoring may already have moved the page; browsers without it leave the change to us. Either
  // way, Lenis must learn the new position.
  const anchored = window.scrollY - scrollBefore;
  const shift = anchored + (keepBottom ? section.getBoundingClientRect().bottom - before.bottom : 0);

  // The scroll position where the stage sticks, from the (non-sticky) track: ScrollTrigger mis-measures sticky elements.
  const stuckAt = () => track.getBoundingClientRect().top + window.scrollY;
  const parked = (i: number) => -PARK - geo.hookY[i]; // a readout's y while its hook waits above the stage
  const landX = () => (geo.land ? geo.land.x : geo.ropeX[n - 1]);
  const landY = () => (geo.land ? geo.land.y : geo.hookY[n - 1]);
  let st: ScrollTrigger | undefined;
  let active = -1;
  /** The crane on show: its progress link is current and its item takes the pointer. (Every crane's button stays in
   * the tab order: focusing one brings its crane to rest, see onFocus.) */
  const setActive = (index: number) => {
    if (index === active) return;
    active = index;
    parts.forEach((p, i) => {
      const on = i === index;
      links[i]?.toggleAttribute('aria-current', false);
      if (on) links[i]?.setAttribute('aria-current', 'step');
      p.item.toggleAttribute('data-hoist-active', on);
    });
  };
  const E = HOIST.enterUnits;
  const b = HOIST.beatUnits;
  const O = E + (n - 1) * b;

  const ctx = gsap.context(() => {
    // Progress 0: the stage is still below the viewport. Every photo shut, every readout parked with its hook.
    gsap.set(rig.hook, { x: () => geo.ropeX[0], y: -PARK, opacity: 1 });
    parts.forEach((p, i) => {
      if (p.photo) gsap.set(p.photo, { clipPath: () => (i === 0 ? clip(9, 7, geo.radius) : clip(100, 0, geo.radius)), '--shade': 0 });
      if (p.picture) gsap.set(p.picture, { scale: i === 0 ? 1.2 : 1.18 });
      if (p.tag) gsap.set(p.tag, { y: () => parked(i), opacity: 0, filter: BLUR });
      writers[i].write(steps[i].from);
      if (fills[i]) gsap.set(fills[i], { scaleX: 0 });
    });

    const tl = gsap.timeline({
      defaults: { ease: 'none', immediateRender: false },
      scrollTrigger: {
        start: () => stuckAt() - geo.vh,
        end: () => stuckAt() + geo.pin,
        scrub: 0.6,
        invalidateOnRefresh: true,
        refreshPriority: 1,
        onUpdate: (self) => {
          const units = self.progress * total;
          let index = 0;
          for (let k = 1; k < n; k++) if (units >= E + (k - 1) * b + SWITCH * b) index = k;
          setActive(index);
        },
      },
    });
    st = tl.scrollTrigger;

    // Entrance (0–100): the first photo opens out as the stage rises; its readout comes down on the rope (40–92) and
    // counts up from 0; its progress track fills.
    const first = parts[0];
    if (first.photo) tl.fromTo(first.photo, { clipPath: () => clip(9, 7, geo.radius) }, { clipPath: () => clip(0, 0, geo.radius), duration: 65, ease: 'power2.out' }, 5);
    if (first.picture) tl.fromTo(first.picture, { scale: 1.2 }, { scale: 1, duration: E, ease: 'power1.out' }, 0);
    tl.fromTo(rig.hook, { x: () => geo.ropeX[0], y: -PARK }, { x: () => geo.ropeX[0], y: () => geo.hookY[0], duration: 52, ease: 'expo.out' }, 40);
    if (first.tag) tl.fromTo(first.tag, { y: () => parked(0), opacity: 0, filter: BLUR }, { y: 0, opacity: 1, filter: SHARP, duration: 52, ease: 'expo.out' }, 40);
    const firstCount = { value: steps[0].from };
    tl.fromTo(
      firstCount,
      { value: steps[0].from },
      { value: steps[0].to, duration: 56, ease: 'expo.out', onUpdate: () => writers[0].write(firstCount.value) },
      40,
    );
    if (fills[0]) tl.fromTo(fills[0], { scaleX: 0 }, { scaleX: 1, duration: 56 }, 40);

    for (let k = 1; k < n; k++) {
      const s = E + (k - 1) * b;
      const prev = parts[k - 1];
      const p = parts[k];
      const lands = k === n - 1 && geo.land !== null;

      // 0–24 %: the hook lifts the previous readout away; it fades and softens on the way up.
      tl.fromTo(rig.hook, { x: () => geo.ropeX[k - 1], y: () => geo.hookY[k - 1] }, { x: () => geo.ropeX[k - 1], y: -PARK, duration: LIFTED * b, ease: 'power2.in' }, s);
      if (prev.tag) {
        tl.fromTo(prev.tag, { y: 0 }, { y: () => parked(k - 1), duration: LIFTED * b, ease: 'power2.in' }, s);
        tl.fromTo(prev.tag, { opacity: 1, filter: SHARP }, { opacity: 0, filter: BLUR, duration: 0.16 * b, ease: 'power1.in' }, s);
      }

      // 12–55 %: the next photo opens bottom-up over the last one, which darkens; the image settles from 1.18.
      if (p.photo) tl.fromTo(p.photo, { clipPath: () => clip(100, 0, geo.radius) }, { clipPath: () => clip(0, 0, geo.radius), duration: 0.43 * b, ease: 'power3.out' }, s + 0.12 * b);
      if (p.picture) tl.fromTo(p.picture, { scale: 1.18 }, { scale: 1, duration: 0.6 * b, ease: 'power2.out' }, s + 0.12 * b);
      if (prev.photo) tl.fromTo(prev.photo, { '--shade': 0 }, { '--shade': SHADE, duration: 0.43 * b }, s + 0.12 * b);

      // 25–83 % (the last crane: 25–58 %, then 60–83 % the hook lets go and lands on the real hook).
      const lowerEnd = lands ? 0.58 : SETTLED;
      const at = s + SWITCH * b;
      tl.fromTo(rig.hook, { x: () => geo.ropeX[k], y: -PARK }, { x: () => geo.ropeX[k], y: () => geo.hookY[k], duration: (lowerEnd - SWITCH) * b, ease: 'expo.out' }, at);
      if (p.tag) {
        tl.fromTo(p.tag, { y: () => parked(k), opacity: 0, filter: BLUR }, { y: 0, opacity: 1, filter: SHARP, duration: (lowerEnd - SWITCH) * b, ease: 'expo.out' }, at);
      }
      const proxy = { value: steps[k].from };
      tl.fromTo(
        proxy,
        { value: steps[k].from },
        { value: steps[k].to, duration: (SETTLED - SWITCH) * b, ease: 'expo.out', onUpdate: () => writers[k].write(proxy.value) },
        at,
      );
      if (fills[k]) tl.fromTo(fills[k], { scaleX: 0 }, { scaleX: 1, duration: SETTLED * b }, s);
      if (lands) {
        // The hook lets go and travels above the photo, then drops onto the real hook (never sweeping across it).
        tl.fromTo(rig.hook, { y: () => geo.hookY[k] }, { y: () => geo.exitY, duration: 0.07 * b, ease: 'power2.inOut' }, s + 0.6 * b);
        tl.fromTo(rig.hook, { x: () => geo.ropeX[k] }, { x: landX, duration: 0.08 * b, ease: 'power2.inOut' }, s + 0.65 * b);
        tl.fromTo(rig.hook, { y: () => geo.exitY }, { y: landY, duration: (SETTLED - 0.72) * b, ease: 'expo.out' }, s + 0.72 * b);
      }
    }

    // Exit (30): the hook rises off the real hook, travels to the reading-start edge and hands over to the progress rope.
    const out = HOIST.outUnits;
    tl.fromTo(rig.hook, { y: landY }, { y: () => geo.exitY, duration: 0.45 * out, ease: 'power2.inOut' }, O);
    tl.fromTo(rig.hook, { x: landX }, { x: () => geo.exitX, duration: 0.7 * out, ease: 'power2.inOut' }, O + 0.3 * out);
    tl.fromTo(rig.hook, { opacity: 1 }, { opacity: 0, duration: 0.4 * out }, O + 0.6 * out);
    tl.set({}, {}, total); // the timeline spans exactly `total` units, so snap points line up
  });

  setActive(0);

  // Snap to a crane once a wheel or touch scroll stops on the stuck stage (never after keyboard scrolling, never in
  // the entrance, so the page never pulls a reader into the stage).
  const input = lastInputTracker();
  const snap = () => {
    if (!st || input.keyboard) return;
    const range = st.end - st.start;
    if (range <= 0 || st.progress < snaps[0] - 0.002 || st.progress >= 1) return;
    const target = directionalSnap(snaps, st.progress, st.direction, 4 / range);
    glideTo(st.start + range * target);
  };
  ScrollTrigger.addEventListener('scrollEnd', snap);

  // Page Down / Page Up / Space on the stuck stage move one crane, like one wheel notch (Apple's product stories do
  // the same). Arrow keys and Tab still scroll exactly where the browser puts them, and snapping never follows them.
  const onPageKey = (event: KeyboardEvent) => {
    if (!st || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    const back = event.key === 'PageUp' || (event.key === ' ' && event.shiftKey);
    if (!back && event.key !== 'PageDown' && event.key !== ' ') return;
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest('a, button, input, textarea, select, summary, [contenteditable], dialog[open]')) return;
    const range = st.end - st.start;
    const progress = (window.scrollY - st.start) / range;
    if (range <= 0 || progress < snaps[0] - 0.002 || progress > 1 - 0.002 || (back && progress <= snaps[0] + 0.002)) return;
    const ahead = back ? snaps.filter((p) => p < progress - 0.002).pop() : snaps.find((p) => p > progress + 0.002);
    if (ahead === undefined) return;
    event.preventDefault();
    glideTo(st.start + range * ahead);
  };
  window.addEventListener('keydown', onPageKey);

  // The progress links glide to their crane's snap point (core's anchor glide ignores a prevented click).
  const onChapter = (event: MouseEvent) => {
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('[data-chapter]') : null;
    const index = link ? links.indexOf(link) : -1;
    if (!st || index < 0 || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    glideTo(st.start + (st.end - st.start) * snaps[index]);
  };
  nav?.addEventListener('click', onChapter);
  // A crane's button can take focus while the stage is still rising (its readout half lowered): bring that crane to
  // rest, so the focused control is never shown faded.
  const onFocus = (event: FocusEvent) => {
    const index = event.target instanceof HTMLElement ? buttons.indexOf(event.target) : -1;
    if (st && index >= 0) glideTo(st.start + (st.end - st.start) * snaps[index]);
  };
  list.addEventListener('focusin', onFocus);

  ScrollTrigger.sort();
  ScrollTrigger.refresh();
  // After the refresh, which puts back the scroll position it cached earlier. Same task: no paint between.
  shiftScroll(scrollBefore, shift);
  // A shared link to one crane (#hoist-gmk6350) opens on that crane, not on the first one.
  const linked = parts.findIndex((p) => p.item.id && `#${p.item.id}` === window.location.hash);
  if (st && linked >= 0) shiftScroll(window.scrollY, st.start + (st.end - st.start) * snaps[linked] - window.scrollY);

  return () => {
    nav?.removeEventListener('click', onChapter);
    list.removeEventListener('focusin', onFocus);
    window.removeEventListener('keydown', onPageKey);
    ScrollTrigger.removeEventListener('scrollEnd', snap);
    ScrollTrigger.removeEventListener('refreshInit', measure);
    input.dispose();
    ctx.revert();
    writers.forEach((writer) => writer.restore());
    links.forEach((link) => link?.removeAttribute('aria-current'));
    parts.forEach((p) => p.item.removeAttribute('data-hoist-active'));
    rig.root.remove();
    section.classList.remove('hoist--staged');
    restoreStyles(); // also drops --hoist-top, the track height, --photo-ox/-oy, --hook-ax/-ay and --shade
    ScrollTrigger.refresh();
  };
}

/**
 * Touch or narrower than 64rem: each card plays once, when its top reaches 88 % of the viewport (the shared reveal
 * line): the photo opens bottom-up and settles, the readout rises in and counts from the previous rating to its own.
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
      writer.lock();
      const radius = radiusOf(p.photo);
      const tl = gsap.timeline({ paused: true, onComplete: undo });
      if (p.photo) tl.fromTo(p.photo, { clipPath: clip(100, 0, radius) }, { clipPath: clip(0, 0, radius), duration: 1, ease: 'expo.out', immediateRender: true }, 0);
      if (p.picture) tl.fromTo(p.picture, { scale: 1.12 }, { scale: 1, duration: 1.25, ease: 'expo.out', immediateRender: true }, 0);
      if (p.tag) tl.fromTo(p.tag, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out', immediateRender: true }, 0.2);
      const proxy = { value: steps[i].from };
      writer.write(steps[i].from);
      tl.to(proxy, { value: steps[i].to, duration: 1.1, ease: 'expo.out', onUpdate: () => writer.write(proxy.value) }, 0.25);
      ScrollTrigger.create({ trigger: p.item, start: 'top 88%', once: true, onEnter: () => tl.play() });
    });
  });

  return () => {
    ctx.revert();
    undos.forEach((undo) => undo());
  };
}
