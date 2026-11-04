import { CHEVRON_STRIPES, NewTabNote, externalProps } from '@/components/Button';
import { HookIcon } from '@/components/Icons';
import { Logo } from '@/components/Logo';
import { siteInfo } from '@/content';
import { env } from '@/env';
import { track } from '@/lib/analytics';
import { useLang } from '@/lib/lang';
import { fillTemplate, telHref, whatsappHref } from '@/lib/whatsapp';

const LINK = 'inline-flex min-h-11 items-center hover:underline';
const HEADING = 'text-[0.9375rem] font-semibold text-steel';

export function Footer() {
  const { copy, lang } = useLang();
  const tel = telHref();
  const whatsapp = env.whatsapp ? whatsappHref(copy.whatsapp.general) : null;

  return (
    <footer data-footer="" data-ground="dark" className="bg-navy-950 pb-28 text-white lg:pb-28">
      <OutriggerPad />
      <div className="shell grid gap-12 pt-14 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo variant="footer" />
          <p className="t-small measure mt-6 text-steel">{copy.footer.legalName}</p>
          <p className="t-lead mt-4">{copy.footer.tagline}</p>
        </div>

        <nav aria-labelledby="footer-services" className="md:col-span-2">
          <h2 id="footer-services" className={HEADING}>
            {copy.footer.servicesHeading}
          </h2>
          <ul className="mt-3">
            {copy.services.items.map((service) => (
              <li key={service.id}>
                <a href="#services" className={LINK}>
                  {service.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-page" className="md:col-span-2">
          <h2 id="footer-page" className={HEADING}>
            {copy.footer.pageHeading}
          </h2>
          <ul className="mt-3">
            <li>
              <a href="#cranes" className={LINK}>
                {copy.footer.pageLinks.cranes}
              </a>
            </li>
            <li>
              <a href="#sites" className={LINK}>
                {copy.footer.pageLinks.sites}
              </a>
            </li>
            <li>
              <a href="#request" className={LINK}>
                {copy.footer.pageLinks.request}
              </a>
            </li>
          </ul>
        </nav>

        <div className="md:col-span-2">
          <h2 className={HEADING}>{copy.footer.contactHeading}</h2>
          <ul className="mt-3">
            <li>
              <a href={`mailto:${siteInfo.email}`} className={`${LINK} break-all`}>
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
            {siteInfo.address && <li className="py-2">{siteInfo.address[lang]}</li>}
          </ul>
        </div>

        <div className="md:col-span-2">
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

      <div className="shell mt-14 flex flex-col-reverse gap-4 border-t border-line-dark pt-6 sm:flex-row sm:items-center sm:justify-between">
        {/* The year is plain digits (formatNumber would group it). Prerendered at build time, so it may differ once a year. */}
        <p className="t-small text-steel" suppressHydrationWarning>
          {fillTemplate(copy.footer.copyright, { year: String(new Date().getFullYear()) })}
        </p>
        <a href="#top" data-testid="back-to-top" data-back-to-top="" className="inline-flex min-h-11 items-center gap-2 font-semibold hover:underline">
          <HookIcon className="size-5 text-red-bright" />
          {copy.footer.backToTop}
        </a>
      </div>
    </footer>
  );
}

/** Where the rope ends: an outrigger pad in red/white chevrons (spec §5.9). Physical drawing, never mirrored. */
function OutriggerPad() {
  return (
    <div className="shell" aria-hidden="true">
      <svg data-footer-pad="" viewBox="0 0 160 20" width="160" height="20" focusable="false" className="block h-5 w-40" style={CHEVRON_STRIPES} />
    </div>
  );
}
