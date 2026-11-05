import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Button } from '@/components/Button';
import { ArrowIcon, CloseIcon, MenuIcon, PhoneIcon, WhatsAppIcon } from '@/components/Icons';
import { Logo } from '@/components/Logo';
import { sheetTrigger } from '@/components/ui/sheet-trigger';
import { env } from '@/env';
import { track } from '@/lib/analytics';
import { homeHref, useLang } from '@/lib/lang';
import { fillTemplate, telHref, whatsappHref } from '@/lib/whatsapp';

/** C9 nav targets. */
export const NAV = [
  { key: 'services', href: '#services' },
  { key: 'cranes', href: '#cranes' },
  { key: 'sites', href: '#sites' },
  { key: 'contact', href: '#request' },
] as const;

type Tone = 'dark' | 'light';

/** The header is 64 px (h-16). Its middle is where the ground under it is read; the spy line is just below it. */
const GROUND_Y = 32;
const SPY_Y = 88;
/** Within this many pixels of the top of the page over the hero, the bar is transparent. */
const TOP_SLACK = 16;

/** Dark or light, from `data-ground` on the section under the header, else from the first opaque background above it. */
function groundUnder(header: HTMLElement): Tone | null {
  if (typeof document.elementsFromPoint !== 'function') return null;
  const hit = document
    .elementsFromPoint(window.innerWidth / 2, GROUND_Y)
    .find((el) => !header.contains(el) && el !== document.documentElement && el !== document.body);
  if (!hit) return null;
  const declared = hit.closest('[data-ground]')?.getAttribute('data-ground');
  if (declared === 'dark' || declared === 'light') return declared;
  for (let node: Element | null = hit; node; node = node.parentElement) {
    const channels = getComputedStyle(node).backgroundColor.match(/[\d.]+/g)?.map(Number);
    if (!channels || channels.length < 3) continue;
    if ((channels[3] ?? 1) < 0.5) continue;
    const [r = 255, g = 255, b = 255] = channels;
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.4 ? 'dark' : 'light';
  }
  return 'light';
}

/** The nav target the spy line is inside, if any. */
function sectionAtSpyLine(): string | null {
  for (const item of NAV) {
    const el = document.querySelector(item.href);
    if (!el) continue;
    const box = el.getBoundingClientRect();
    if (box.top <= SPY_Y && box.bottom > SPY_Y) return item.key;
  }
  return null;
}

/**
 * Scroll state for the bar, read at most once per frame: `atTop` (the first pixels; the bar keeps its dark glass over the hero photo), `tone`
 * (the ground under the bar: black glass over dark sections, white glass over light ones) and `active` (the nav target
 * in view). The server render assumes the first screen: dark glass over the home hero, light glass over a crane page's
 * white hero, nothing active.
 */
function useChromeState(initialTone: Tone) {
  const [atTop, setAtTop] = useState(false);
  const [tone, setTone] = useState<Tone>(initialTone);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const header = document.querySelector<HTMLElement>('[data-header]');
    if (!header) return;
    let frame = 0;
    const read = () => {
      frame = 0;
      const hero = document.getElementById('top');
      setAtTop(hero !== null && window.scrollY < TOP_SLACK);
      setTone(groundUnder(header) ?? 'dark');
      setActive(sectionAtSpyLine());
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('hashchange', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('hashchange', schedule);
    };
  }, []);

  return { atTop, tone, active };
}

export function Header() {
  const value = useLang();
  const { lang, copy, otherLang, otherHref, crane } = value;
  // On a crane page every section link leads to the home page; the logo too, and "Request" pre-selects the crane.
  const toHome = (hash: string) => homeHref(value, hash);
  const requestHref = crane ? `${value.home}?crane=${crane}#request` : '#request';
  // A crane page opens on a white hero, so its first paint (before any script) is already the light glass.
  const { atTop, tone, active } = useChromeState(crane ? 'light' : 'dark');
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDialogElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const pill = useRef<HTMLSpanElement>(null);
  const hovered = useRef<string | null>(null);
  const tel = telHref();

  // Over the hero's first pixels the bar is clear and white-on-black; everywhere else it is glass in the ground's tone.
  const onLight = !atTop && tone === 'light';
  const fg = onLight ? 'text-ink' : 'text-white';
  const fg2 = onLight ? 'text-ink-2 hover:text-ink' : 'text-neutral-300 hover:text-white';
  const wash = onLight ? 'hover:bg-black/[0.06]' : 'hover:bg-white/10';

  // Sliding pill: sits behind the hovered/focused link, else the one in view, and slides between them.
  const place = useCallback((key: string | null) => {
    const track = list.current;
    const mark = pill.current;
    if (!track || !mark) return;
    const link = key ? track.querySelector<HTMLElement>(`[data-nav="${key}"]`) : null;
    if (!link) {
      mark.dataset.on = 'false';
      return;
    }
    mark.style.setProperty('--x', `${link.offsetLeft}px`);
    mark.style.setProperty('--w', `${link.offsetWidth}px`);
    mark.dataset.on = 'true';
    // Slide only after the first placement, so the pill never travels in from the corner.
    requestAnimationFrame(() => {
      mark.dataset.ready = 'true';
    });
  }, []);

  useEffect(() => {
    place(hovered.current ?? active);
  }, [place, active, lang]);

  useEffect(() => {
    const track = list.current;
    if (!track || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => place(hovered.current ?? active));
    observer.observe(track);
    return () => observer.disconnect();
  }, [place, active]);

  // Keep aria-expanded in sync (Esc closes natively) and close the menu when the viewport reaches lg.
  useEffect(() => {
    const dialog = menu.current;
    if (!dialog) return;
    const onClose = () => setOpen(false);
    dialog.addEventListener('close', onClose);
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) dialog.close();
    };
    mq.addEventListener('change', onChange);
    return () => {
      dialog.removeEventListener('close', onClose);
      mq.removeEventListener('change', onChange);
    };
  }, []);

  const closeMenu = () => menu.current?.close();
  const callLabel = env.phone
    ? fillTemplate(copy.header.call.label, { phone: lang === 'ar' ? `‎${env.phone}‎` : env.phone })
    : undefined;

  return (
    <header
      data-header=""
      data-top={atTop ? '' : undefined}
      data-ground={onLight ? 'light' : 'dark'}
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-(--dur-ui) ease-ui ${fg}`}
    >
      {/* Two glass layers cross-fade (opacity only): black over the hero and dark sections, white over light ones. */}
      <span
        aria-hidden="true"
        className={`glass-dark pointer-events-none absolute inset-0 border-b border-line-dark transition-opacity duration-(--dur-ui) ease-ui ${!onLight ? 'opacity-100' : 'opacity-0'}`}
      />
      <span
        aria-hidden="true"
        className={`glass-light pointer-events-none absolute inset-0 border-b border-line transition-opacity duration-(--dur-ui) ease-ui ${onLight ? 'opacity-100' : 'opacity-0'}`}
      />

      <div className="shell-wide relative grid h-16 grid-cols-[1fr_auto] items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
        {/* Named by what it shows (both name lines) plus a hidden "back to top", so the name contains the visible label. */}
        <a href={crane ? value.home : '#top'} className="inline-flex min-h-11 items-center justify-self-start rounded-full">
          <Logo tone={onLight ? 'light' : 'dark'} />
          <span className="sr-only">
            {lang === 'ar' ? '، ' : ', '}
            {crane ? copy.header.homePage : copy.header.homeLabel}
          </span>
        </a>

        <nav aria-label={copy.header.menu.open} className="hidden lg:block">
          <ul
            ref={list}
            className="relative flex items-center"
            onPointerLeave={() => {
              hovered.current = null;
              place(active);
            }}
            onBlur={(event) => {
              if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return;
              hovered.current = null;
              place(active);
            }}
          >
            <span
              ref={pill}
              aria-hidden="true"
              data-on="false"
              className={`pointer-events-none absolute inset-y-0 left-0 my-auto h-10 w-(--w) translate-x-(--x) rounded-full opacity-0 transition-opacity duration-(--dur-state) ease-ui data-[on=true]:opacity-100 data-[ready=true]:transition-[translate,width,opacity] data-[ready=true]:duration-(--dur-ui) ${onLight ? 'bg-black/[0.06]' : 'bg-white/[0.12]'}`}
            />
            {NAV.map((item) => (
              <li key={item.key}>
                <a
                  href={toHome(item.href)}
                  data-nav={item.key}
                  aria-current={active === item.key ? 'location' : undefined}
                  onPointerEnter={() => {
                    hovered.current = item.key;
                    place(item.key);
                  }}
                  onFocus={() => {
                    hovered.current = item.key;
                    place(item.key);
                  }}
                  className={`relative inline-flex min-h-11 items-center rounded-full px-4 text-[0.9375rem] font-semibold transition-colors duration-(--dur-state) ease-ui [&:lang(ar)]:text-base ${
                    active === item.key ? fg : fg2
                  }`}
                >
                  {copy.header.nav[item.key]}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1 justify-self-end sm:gap-2">
          <a
            href={otherHref}
            hrefLang={otherLang}
            lang={otherLang}
            aria-label={copy.header.langSwitch.label}
            data-testid="lang-switch"
            onClick={() => track('lang_switch')}
            // min-w: «عربي» is set before its font arrives (not preloaded on English pages); the box keeps one width
            // either way, so nothing beside it moves when the font swaps in (layout shift 0).
            className={`inline-flex min-h-11 min-w-[4.5rem] items-center justify-center rounded-full px-4 text-[0.9375rem] font-semibold transition-colors duration-(--dur-state) ease-ui ${fg2} ${wash}`}
          >
            {copy.header.langSwitch.text}
          </a>
          <div className="hidden sm:block">
            {/* One look, following the ground like the glass: white on dark, ink on light. Never red: red stays with the
                actions in the content and the request bar (Q.1: the outline-then-red flip read as a glitch, and a red
                pill here doubled the bar's red WhatsApp on every desktop screen). */}
            <Button href={requestHref} size="sm" variant={onLight ? 'secondary' : 'inverse'} data-testid="header-request">
              {copy.header.request}
            </Button>
          </div>
          <button
            type="button"
            data-testid="menu-open"
            aria-controls="menu-dialog"
            aria-expanded={open}
            {...sheetTrigger('menu-dialog', () => setOpen(true))}
            className={`inline-flex size-11 items-center justify-center rounded-full transition-[background-color,transform] duration-(--dur-state) ease-ui active:scale-95 lg:hidden ${wash}`}
          >
            <MenuIcon className="size-6" />
            <span className="sr-only">{copy.header.menu.open}</span>
          </button>
        </div>
      </div>

      {/* Mobile menu: a full-screen sheet on a native modal <dialog> (focus trap, Esc, inert page). Always black. */}
      <dialog
        ref={menu}
        id="menu-dialog"
        data-testid="menu-dialog"
        data-ground="dark"
        aria-label={copy.header.menu.open}
        data-lenis-prevent=""
        className="menu-sheet m-0 h-dvh max-h-none w-full max-w-none bg-black p-0 text-white overscroll-contain backdrop:bg-black"
      >
        <div className="flex min-h-full flex-col">
          <div className="shell-wide flex h-16 w-full shrink-0 items-center justify-between">
            <Logo />
            <button
              type="button"
              onClick={closeMenu}
              className="inline-flex size-11 items-center justify-center rounded-full bg-white/10 transition-[background-color,transform] duration-(--dur-state) ease-ui hover:bg-white/20 active:scale-95"
            >
              <CloseIcon className="size-6" />
              <span className="sr-only">{copy.header.menu.close}</span>
            </button>
          </div>
          <nav aria-label={copy.header.menu.open} className="shell-wide w-full flex-1 pt-4">
            <ul>
              {NAV.map((item, index) => (
                <li key={item.key} className="menu-item border-b border-line-dark" style={{ '--i': index } as CSSProperties}>
                  <a
                    href={toHome(item.href)}
                    onClick={closeMenu}
                    className="t-headline group flex min-h-20 items-center justify-between gap-4 transition-colors duration-(--dur-state) ease-ui hover:text-neutral-300"
                  >
                    {copy.header.nav[item.key]}
                    <ArrowIcon className="size-7 shrink-0 text-neutral-400 transition-transform duration-(--dur-ui) ease-ui group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="shell-wide menu-item flex w-full flex-col gap-3 pt-8 pb-10" style={{ '--i': NAV.length } as CSSProperties}>
            <Button
              href={whatsappHref(copy.whatsapp.general)}
              external
              icon={<WhatsAppIcon className="size-5" />}
              onClick={() => track('whatsapp_click', { location: 'menu' })}
            >
              {copy.header.menu.whatsapp}
            </Button>
            {tel && env.phone && (
              <Button
                href={tel}
                variant="ghost-dark"
                icon={<PhoneIcon className="size-5" />}
                aria-label={callLabel}
                onClick={() => track('call_click')}
              >
                {copy.header.call.text}
              </Button>
            )}
            <a
              href={otherHref}
              hrefLang={otherLang}
              lang={otherLang}
              aria-label={copy.header.langSwitch.label}
              data-testid="menu-lang-switch"
              onClick={() => track('lang_switch')}
              className="inline-flex min-h-11 items-center justify-center self-center rounded-full px-5 font-semibold text-neutral-300 transition-colors duration-(--dur-state) ease-ui hover:text-white"
            >
              {copy.header.langSwitch.text}
            </a>
          </div>
        </div>
      </dialog>
    </header>
  );
}
