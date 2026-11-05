import { Button, NewTabNote, externalProps } from '@/components/Button';
import { ArrowUpIcon, WhatsAppIcon } from '@/components/Icons';
import { Logo } from '@/components/Logo';
import { reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { siteInfo } from '@/content';
import { env } from '@/env';
import { track } from '@/lib/analytics';
import { homeHref, useLang } from '@/lib/lang';
import { fillTemplate, telHref, whatsappHref } from '@/lib/whatsapp';

const LINK =
  'inline-flex min-h-11 items-center text-neutral-300 underline-offset-[0.3em] transition-colors duration-(--dur-state) ease-ui hover:text-white hover:underline';
const HEADING = 'text-[0.9375rem] font-semibold text-neutral-400 [&:lang(ar)]:text-base';

/** v2 footer: black ground, the closing line set large with the one action, then the columns, then © and back to top. */
export function Footer() {
  const value = useLang();
  const { copy, lang, crane } = value;
  // On a crane page the section links lead to the home page, and "Back to top" to this page's main content.
  const toHome = (hash: string) => homeHref(value, hash);
  const tel = telHref();
  const whatsapp = env.whatsapp ? whatsappHref(copy.whatsapp.general) : null;

  return (
    // pb leaves room for the request bar, which floats over the bottom edge on every screen.
    <Section as="footer" surface="dark" width="wide" pad="none" data-footer="" className="pt-(--space-section) pb-28">
      {/* One reveal pattern for the whole footer: its three blocks rise 40 ms apart (below the fold only). */}
      <div {...reveal('stagger')}>
        <div className="grid items-end gap-10 lg:grid-cols-12">
          {/* Headline size, not display: the closing echo of the H1 must not shout louder than the hero (Q.1). */}
          <p className="t-headline lg:col-span-8">{copy.footer.tagline}</p>
          <div className="flex flex-wrap items-center gap-3 lg:col-span-4 lg:justify-end">
            <Button href={toHome('#request')} size="lg" magnetic>
              {copy.header.request}
            </Button>
            {whatsapp && (
              <Button
                href={whatsapp}
                external
                variant="ghost-dark"
                size="lg"
                icon={<WhatsAppIcon className="size-5" />}
                onClick={() => track('whatsapp_click', { location: 'footer' })}
              >
                {copy.header.menu.whatsapp}
              </Button>
            )}
          </div>
        </div>

        <div className="mt-(--space-head) grid gap-12 border-t border-line-dark pt-12 sm:grid-cols-2 lg:grid-cols-12">
          <div className="sm:col-span-2 lg:col-span-3">
            <Logo variant="footer" />
            <p className="t-small mt-6 max-w-sm text-neutral-400">{copy.footer.legalName}</p>
          </div>

          <nav aria-labelledby="footer-services" className="lg:col-span-2">
            <h2 id="footer-services" className={HEADING}>
              {copy.footer.servicesHeading}
            </h2>
            <ul className="mt-3">
              {copy.services.items.map((service) => (
                <li key={service.id}>
                  <a href={toHome('#services')} className={LINK}>
                    {service.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-page" className="lg:col-span-2">
            <h2 id="footer-page" className={HEADING}>
              {crane ? copy.footer.homeHeading : copy.footer.pageHeading}
            </h2>
            <ul className="mt-3">
              <li>
                <a href={toHome('#cranes')} className={LINK}>
                  {copy.footer.pageLinks.cranes}
                </a>
              </li>
              <li>
                <a href={toHome('#sites')} className={LINK}>
                  {copy.footer.pageLinks.sites}
                </a>
              </li>
              <li>
                <a href={toHome('#request')} className={LINK}>
                  {copy.footer.pageLinks.request}
                </a>
              </li>
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h2 className={HEADING}>{copy.footer.contactHeading}</h2>
            <ul className="mt-3">
              <li>
                <a href={`mailto:${siteInfo.email}`} className={`${LINK} break-words`}>
                  <bdi>{siteInfo.email}</bdi>
                </a>
              </li>
              {tel && env.phone && (
                <li>
                  <a href={tel} onClick={() => track('call_click')} className={LINK}>
                    <bdi dir="ltr">{env.phone}</bdi>
                  </a>
                </li>
              )}
              {whatsapp && env.whatsapp && (
                <li>
                  <a
                    href={whatsapp}
                    {...externalProps(whatsapp)}
                    onClick={() => track('whatsapp_click', { location: 'footer' })}
                    className={LINK}
                  >
                    <bdi dir="ltr">+{env.whatsapp.replace(/\D/g, '')}</bdi>
                    <NewTabNote />
                  </a>
                </li>
              )}
              {siteInfo.address && <li className="py-2 text-neutral-300">{siteInfo.address[lang]}</li>}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h2 className={HEADING}>{copy.footer.followHeading}</h2>
            <ul className="mt-3">
              <li>
                <a href={siteInfo.facebook} {...externalProps(siteInfo.facebook)} className={LINK}>
                  {copy.footer.facebook}
                  <NewTabNote />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col-reverse gap-4 border-t border-line-dark pt-6 sm:flex-row sm:items-center sm:justify-between">
          {/* The year is plain digits (formatNumber would group it). Prerendered at build time, so it may differ once a year. */}
          <p className="t-small text-neutral-400" suppressHydrationWarning>
            {fillTemplate(copy.footer.copyright, { year: String(new Date().getFullYear()) })}
          </p>
          <a
            href={crane ? '#main' : '#top'}
            data-testid="back-to-top"
            data-back-to-top=""
            className="group inline-flex min-h-11 items-center gap-3 self-start rounded-full bg-white/10 ps-5 pe-1.5 font-semibold transition-[background-color,transform] duration-(--dur-state) ease-ui hover:bg-white/20 active:scale-[0.98] sm:self-auto"
          >
            {copy.footer.backToTop}
            <span className="grid size-8 place-items-center rounded-full bg-white text-ink">
              <ArrowUpIcon className="size-4" />
            </span>
          </a>
        </div>
      </div>
    </Section>
  );
}
