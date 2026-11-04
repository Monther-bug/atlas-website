import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { CloseIcon, MenuIcon, PhoneIcon, WhatsAppIcon } from '@/components/Icons';
import { Logo } from '@/components/Logo';
import { env } from '@/env';
import { track } from '@/lib/analytics';
import { useLang } from '@/lib/lang';
import { fillTemplate, telHref, whatsappHref } from '@/lib/whatsapp';

/** C9 nav targets. */
export const NAV = [
  { key: 'services', href: '#services' },
  { key: 'cranes', href: '#cranes' },
  { key: 'sites', href: '#sites' },
  { key: 'contact', href: '#request' },
] as const;

const HEADER_HEIGHT_PX = 72; // h-[4.5rem]

export function Header() {
  const { lang, copy, otherLang, otherHref } = useLang();
  const [atTop, setAtTop] = useState(false);
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDialogElement>(null);
  const tel = telHref();

  // Solid navy by default (server, no JS, first paint). Transparent only while the hero (#top) is under the header.
  useEffect(() => {
    const hero = document.getElementById('top');
    if (!hero) return;
    const observer = new IntersectionObserver(
      (entries) => setAtTop(entries.at(-1)?.isIntersecting ?? false),
      { rootMargin: `-${HEADER_HEIGHT_PX}px 0px 0px 0px` },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

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
    ? fillTemplate(copy.header.call.label, { phone: lang === 'ar' ? `\u200E${env.phone}\u200E` : env.phone })
    : undefined;

  return (
    <header
      data-header=""
      data-top={atTop ? '' : undefined}
      className="fixed inset-x-0 top-0 z-40 border-b border-line-dark bg-navy-950 text-white transition-colors duration-300 data-[top]:border-navy-950/0 data-[top]:bg-navy-950/0"
    >
      <div className="shell flex h-[4.5rem] items-center gap-4">
        <a href="#top" aria-label={copy.header.homeLabel} className="shrink-0">
          <Logo />
        </a>

        <nav aria-label={copy.header.menu.open} className="ms-auto hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.key}>
                <a
                  href={item.href}
                  className="inline-flex min-h-11 items-center px-3 text-[0.9375rem] font-semibold text-white/85 underline-offset-[0.4em] transition-colors hover:text-white hover:underline"
                >
                  {copy.header.nav[item.key]}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ms-auto flex items-center gap-2 lg:ms-2">
          <a
            href={otherHref}
            hrefLang={otherLang}
            lang={otherLang}
            aria-label={copy.header.langSwitch.label}
            data-testid="lang-switch"
            onClick={() => track('lang_switch')}
            className="inline-flex min-h-11 items-center px-3 text-[0.9375rem] font-semibold transition-colors hover:bg-white/10"
          >
            {copy.header.langSwitch.text}
          </a>
          <div className="hidden sm:block">
            <Button href="#request" size="md">
              {copy.header.request}
            </Button>
          </div>
          <button
            type="button"
            data-testid="menu-open"
            aria-haspopup="dialog"
            aria-controls="menu-dialog"
            aria-expanded={open}
            onClick={() => {
              menu.current?.showModal();
              setOpen(true);
            }}
            className="inline-flex size-11 items-center justify-center transition-colors hover:bg-white/10 lg:hidden"
          >
            <MenuIcon className="size-6" />
            <span className="sr-only">{copy.header.menu.open}</span>
          </button>
        </div>
      </div>

      <dialog
        ref={menu}
        id="menu-dialog"
        data-testid="menu-dialog"
        aria-label={copy.header.menu.open}
        data-lenis-prevent=""
        className="m-0 h-dvh max-h-none w-full max-w-none bg-navy-950 p-0 text-white overscroll-contain backdrop:bg-navy-950"
      >
        <div className="flex min-h-full flex-col">
          <div className="shell flex h-[4.5rem] w-full items-center justify-between">
            <Logo />
            <button
              type="button"
              onClick={closeMenu}
              className="inline-flex size-11 items-center justify-center transition-colors hover:bg-white/10"
            >
              <CloseIcon className="size-6" />
              <span className="sr-only">{copy.header.menu.close}</span>
            </button>
          </div>
          <nav aria-label={copy.header.menu.open} className="shell w-full flex-1 pt-6">
            <ul className="border-t border-line-dark">
              {NAV.map((item) => (
                <li key={item.key} className="border-b border-line-dark">
                  <a href={item.href} onClick={closeMenu} className="t-h3 flex min-h-16 items-center hover:underline">
                    {copy.header.nav[item.key]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="shell flex w-full flex-col gap-3 pt-8 pb-10">
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
                variant="outline-on-dark"
                icon={<PhoneIcon className="size-5" />}
                aria-label={callLabel}
                onClick={() => track('call_click')}
              >
                {copy.header.call.text}
              </Button>
            )}
          </div>
        </div>
      </dialog>
    </header>
  );
}
