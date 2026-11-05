import type { ReactNode } from 'react';
import { Button, NewTabNote, externalProps } from '@/components/Button';
import { ArrowIcon } from '@/components/Icons';
import { Picture } from '@/components/Picture';
import { BentoGrid, BentoTile, Section, SectionHeader, cx, parallax, reveal } from '@/components/ui';
import type { ServiceCopy } from '@/content/types';
import { useLang } from '@/lib/lang';
import { fillTemplate, whatsappHref } from '@/lib/whatsapp';
import { KeptShell, useTrackedClicks } from './island';
import { DerrickArt, RouteArt, ServiceIcon } from './service-art';

/**
 * Services (v2 spec §10). A bento of the four services from the company's legal name, on the mist ground, so brand
 * navy can carry the icons, the drawings and the links (palette follow-up, 5 Nov), with Why Atlas below as the navy
 * band. Every tile is a different kind of tile: a black split tile with the lead photo, a route diagram, a detail
 * photo, a split line drawing. So the grid never reads as four identical cards. Each tile ends with "Ask about this
 * service": a WhatsApp message about that service (template C), tracked with the service id. On a fine pointer the
 * whole tile is the link's target.
 *
 * Motion: the tiles rise in a stagger (data-reveal); the crane-hire photo settles from 1.08 as it scrolls (desktop,
 * data-parallax); the two line drawings draw themselves (src/motion/services.ts). Hover lifts a tile and slowly zooms
 * its photo (CSS). Reduced motion and no-JS: everything rendered in its final state.
 *
 * A static island (./island.tsx): the client keeps the prerendered HTML; only the click tracking runs as JS.
 */

const ID = 'services';

/** Tile chrome shared by all four: hover/focus lift (motion allowed) and the raised shadow. */
const TILE =
  'group transition-[translate,box-shadow] duration-(--dur-ui) ease-ui hover:shadow-e2 has-[:focus-visible]:shadow-e2 motion-safe:hover:-translate-y-1 motion-safe:has-[:focus-visible]:-translate-y-1';
/** Slow zoom for a tile's photo on hover. A CSS `scale`, so it composes with the parallax transform on its parent. */
const ZOOM = 'size-full transition-[scale] duration-[1200ms] ease-set motion-safe:group-hover:scale-[1.04]';

function AskLink({ service }: { service: ServiceCopy }) {
  const { copy } = useLang();
  const href = whatsappHref(fillTemplate(copy.whatsapp.service, { service: service.title }));
  const ext = externalProps(href);
  return (
    <a
      href={href}
      {...ext}
      data-testid="service-ask"
      data-track="whatsapp_click"
      data-track-location="services"
      data-track-service={service.id}
      // pointer-fine: the link's ::after covers the tile (the tile is position: relative), so the whole tile is the
      // target on desktop. On touch only the link itself is, so a stray tap while reading never leaves the page.
      className="mt-auto inline-flex min-h-11 items-center gap-2 self-start pt-6 font-semibold text-(--surface-accent) decoration-1 underline-offset-[0.28em] hover:underline pointer-fine:after:absolute pointer-fine:after:inset-0 pointer-fine:after:rounded-[inherit]"
    >
      <span>{copy.services.ask}</span>
      <span className="sr-only">: {service.title}</span>
      <ArrowIcon className="size-4 shrink-0 transition-[translate] duration-(--dur-ui) ease-ui motion-safe:group-hover:translate-x-1 motion-safe:rtl:group-hover:-translate-x-1" />
      {ext.target && <NewTabNote />}
    </a>
  );
}

/** Title (with the service's icon), the copy-deck text, the "add if confirmed" sentence, then the action. */
function ServiceText({ service, className }: { service: ServiceCopy; className?: string }) {
  return (
    // relative: the link's stretched ::after covers this text column only, never the photo or the drawing.
    <div className={cx('relative flex flex-1 flex-col', className)}>
      <h3 className="t-title flex items-center gap-3">
        <ServiceIcon id={service.id} className="size-[1.1em] shrink-0 text-(--surface-accent)" />
        <span>{service.title}</span>
      </h3>
      <p className="t-body max-w-[36rem] [&:lang(ar)]:max-w-[38rem] mt-3 text-(--surface-fg-2)">{service.body}</p>
      {service.confirm && <p className="t-body max-w-[36rem] [&:lang(ar)]:max-w-[38rem] mt-3 text-(--surface-fg-2)">{service.confirm}</p>}
      <AskLink service={service} />
    </div>
  );
}

/** The media half of a split tile: bleeds to the tile's edges; above the text on phones, at the inline end after. */
function SplitMedia({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx('relative order-first overflow-clip @min-[40rem]:order-none @min-[40rem]:shrink-0 @min-[40rem]:basis-[46%]', className)}>
      {children}
    </div>
  );
}

/** The whole section, as the prerender (and dev, and tests) render it. */
export function ServicesContent() {
  const { copy } = useLang();
  const [hire, transport, handling, oil] = copy.services.items;
  return (
    <div className="shell">
      <SectionHeader
        id="services-title"
        title={copy.services.title}
        lead={copy.services.intro}
        actions={
          <Button href="#request" variant="ghost-light" size="md" iconEnd={<ArrowIcon className="size-4" />}>
            {copy.services.combine}
          </Button>
        }
      />
      <BentoGrid as="ul" role="list" {...reveal('stagger')}>
        {/* Crane hire: the lead tile, black. Text first, the photo at the inline end (GMK6350 set up by the scaffold). */}
        {/* [&_*]:--ring: a dark tile inside a light section; the light ground's navy ring would be 1.5:1 on black. */}
        <BentoTile
          as="li"
          span="two-thirds"
          tone="night"
          data-service-tile={hire.id}
          className={cx(TILE, 'p-0 @min-[40rem]:flex-row [&_*]:[--ring:var(--color-white)]')}
        >
          <ServiceText service={hire} className="p-(--space-tile) @min-[40rem]:py-[calc(var(--space-tile)*1.25)]" />
          {/* Phones: a 4:3 window on the lower part of the 4:5 crop (the machine, not the sky). */}
          <SplitMedia className="aspect-[4/3] @min-[40rem]:aspect-auto">
            <div {...parallax} className="absolute inset-0">
              <div className={ZOOM}>
                <Picture
                  photo="6388"
                  crop="mobile_4x5"
                  alt={copy.alt['6388']}
                  sizes="(min-width: 1024px) 30vw, (min-width: 672px) 46vw, 100vw"
                  pictureClassName="block size-full"
                  className="size-full object-[50%_80%]! @min-[40rem]:object-[50%_0%]!"
                />
              </div>
            </div>
          </SplitMedia>
        </BentoTile>

        {/* Heavy transport: the route diagram, drawn in brand navy; the load is the one red mark. */}
        <BentoTile as="li" span="third" data-service-tile={transport.id} className={cx(TILE, 'p-0')}>
          <div className="px-(--space-tile) pt-(--space-tile) text-(--surface-accent)">
            <RouteArt className="block h-auto w-full" />
          </div>
          <ServiceText service={transport} className="p-(--space-tile)" />
        </BentoTile>

        {/* Handling: the real sling on the RT700E's hook, as a detail photo above the text. */}
        <BentoTile as="li" span="third" data-service-tile={handling.id} className={cx(TILE, 'p-0')}>
          <div className="relative aspect-[16/10] overflow-clip">
            <div className={ZOOM}>
              <Picture
                photo="6364"
                crop="desktop_16x9"
                alt={copy.alt['6364']}
                sizes="(min-width: 1024px) 30vw, (min-width: 672px) 46vw, 100vw"
                pictureClassName="block size-full"
                className="size-full object-[76%_30%]!"
              />
            </div>
          </div>
          <ServiceText service={handling} className="p-(--space-tile)" />
        </BentoTile>

        {/* Oil services: no photo until Atlas supplies one (copy deck §5), so a line drawing of a derrick. */}
        <BentoTile as="li" span="two-thirds" data-service-tile={oil.id} className={cx(TILE, 'p-0 @min-[40rem]:flex-row')}>
          <ServiceText service={oil} className="p-(--space-tile) @min-[40rem]:py-[calc(var(--space-tile)*1.25)]" />
          <SplitMedia className="flex items-end justify-center bg-(--surface-wash) px-(--space-tile) pt-(--space-tile) text-(--surface-accent)">
            <DerrickArt className="block h-auto w-full max-w-[11rem] @min-[40rem]:max-w-[21rem]" />
          </SplitMedia>
        </BentoTile>
      </BentoGrid>
    </div>
  );
}

export function Services() {
  useTrackedClicks(ID);
  return (
    <Section id={ID} surface="mist" width="bleed" aria-labelledby="services-title">
      {import.meta.env.SSR || import.meta.env.DEV ? <ServicesContent /> : <KeptShell id={ID} />}
    </Section>
  );
}
