import { useRef, useState } from 'react';
import { Lightbox } from '@/components/Lightbox';
import { Picture } from '@/components/Picture';
import { sites } from '@/content';
import type { SiteGallery } from '@/content/types';
import { useLang } from '@/lib/lang';

export function Sites() {
  const { copy } = useLang();
  const [open, setOpen] = useState<{ gallery: SiteGallery; index: number } | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);

  return (
    <section id="sites" aria-labelledby="sites-title" className="section-y bg-concrete text-ink">
      <div className="shell">
        <h2 id="sites-title" className="t-h2 text-balance text-navy">
          {copy.sites.title}
        </h2>
        <p className="t-lead measure mt-5">{copy.sites.intro}</p>
      </div>

      {sites.map((gallery) => {
        const titleId = `sites-${gallery.id}`;
        const title = copy.sites.galleries[gallery.id];
        return (
          <div key={gallery.id} className="mt-14">
            <div className="shell flex items-baseline justify-between gap-4">
              <h3 id={titleId} className="t-h3 text-navy">
                {title}
              </h3>
              <p aria-hidden="true" className="t-small text-ink/75 md:hidden">
                {copy.sites.swipeHint}
              </p>
            </div>
            {/* Flex + overflow scroll flows in the page direction, so the Arabic strip starts at the right. */}
            <ul
              data-sites-strip=""
              aria-labelledby={titleId}
              className="mt-6 flex snap-x snap-mandatory scroll-px-[clamp(1rem,4vw,3.5rem)] gap-4 overflow-x-auto px-[clamp(1rem,4vw,3.5rem)] pb-4"
            >
              {gallery.photos.map((photo, index) => {
                const caption = copy.sites.captions[photo];
                return (
                  <li key={photo} className="w-[78vw] max-w-[22rem] shrink-0 snap-start">
                    <button
                      type="button"
                      data-testid="site-photo"
                      onClick={(event) => {
                        opener.current = event.currentTarget;
                        setOpen({ gallery, index });
                      }}
                      className="group relative block w-full text-start"
                    >
                      <Picture
                        photo={photo}
                        crop="mobile_4x5"
                        alt=""
                        sizes="(min-width: 640px) 22rem, 78vw"
                        pictureClassName="block aspect-[4/5] overflow-hidden"
                        className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <span className="t-small mt-3 block group-hover:underline">{caption}</span>
                      <span className="sr-only"> {copy.sites.open}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}

      <Lightbox
        photos={open?.gallery.photos ?? []}
        index={open?.index ?? null}
        title={open ? copy.sites.galleries[open.gallery.id] : ''}
        onIndexChange={(index) => setOpen((current) => (current ? { ...current, index } : current))}
        onClose={() => {
          setOpen(null);
          opener.current?.focus();
        }}
      />
    </section>
  );
}
