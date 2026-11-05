import { Fragment } from 'react';
import { NewTabNote, buttonClass, externalProps } from '@/components/Button';
import { ArrowIcon } from '@/components/Icons';
import { BADGE_MEDIUM } from '@/components/Logo';
import { Picture } from '@/components/Picture';
import { Chip, Section, parallax, reveal } from '@/components/ui';
import { siteInfo } from '@/content';
import type { GalleryPhotoId, SiteGalleryId } from '@/content/types';
import { useLang } from '@/lib/lang';
import './about.css';

/** The two photos beside the statement: one from each shoot site (never the hero's photo, 6398). */
export const ABOUT_PHOTOS = [
  { photo: '6388', site: 'construction' },
  { photo: '6396', site: 'coast' },
] as const satisfies readonly { photo: GalleryPhotoId; site: SiteGalleryId }[];

/** Splits a sentence into words for the scroll highlight. Spaces stay as plain text between the spans. */
export function splitWords(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

function Words({ text }: { text: string }) {
  return (
    <>
      {splitWords(text).map((word, i) => (
        <Fragment key={i}>
          {i > 0 ? ' ' : null}
          <span data-about-word="">{word}</span>
        </Fragment>
      ))}
    </>
  );
}

/** Shared accent link (ui.css .ui-link: navy on light, always underlined). */
const LINK = 'ui-link';

/**
 * About Atlas (v2 spec §10, new). An editorial statement in large type that the motion layer highlights word by
 * word as it is read (src/motion/about.ts), two real photos from the two shoot sites, and the confirmed facts: the
 * Arabic legal name, the four lines of work it names, the Facebook page and the email. Nothing else is claimed:
 * no years, numbers, clients or ownership. Mission, vision and values render only once Atlas supplies them
 * (`copy.about.values`, empty until then).
 */
export function About() {
  const { copy, lang } = useLang();
  const a = copy.about;
  const [first, second] = ABOUT_PHOTOS;

  return (
    <Section id="about" surface="white" aria-labelledby="about-title" className="overflow-x-clip">
      <div data-about-statement="" className="about-statement">
        <h2 id="about-title" className="inline">
          <span data-about-badge="" className="about-badge">
            <img src={BADGE_MEDIUM} alt="" width={96} height={96} loading="lazy" decoding="async" />
          </span>{' '}
          <Words text={a.title} />
        </h2>{' '}
        <p className="inline">
          <Words text={a.statement} />
        </p>
      </div>

      <div className="about-grid about-media">
        <figure className="about-wide">
          <div className="frame about-frame-wide" {...reveal('mask')}>
            <div className="size-full" {...parallax}>
              <Picture
                photo={first.photo}
                crop="desktop_16x9"
                mobileCrop="mobile_4x5"
                alt={copy.alt[first.photo]}
                sizes="(min-width: 1440px) 58rem, (min-width: 768px) 58vw, 46vw"
                pictureClassName="block size-full"
                className="size-full"
              />
            </div>
          </div>
          <figcaption className="mt-3">
            <Chip>{copy.sites.galleries[first.site]}</Chip>
          </figcaption>
        </figure>
        <figure className="about-narrow">
          <div className="frame about-frame" {...reveal('mask', 120)}>
            <Picture
              photo={second.photo}
              crop="mobile_4x5"
              alt={copy.alt[second.photo]}
              sizes="(min-width: 1440px) 28rem, (min-width: 1024px) 30vw, (min-width: 768px) 40vw, 46vw"
              pictureClassName="block size-full"
              className="size-full"
            />
          </div>
          <figcaption className="mt-3">
            <Chip>{copy.sites.galleries[second.site]}</Chip>
          </figcaption>
        </figure>
      </div>
      <p className="mt-4 flex justify-end">
        <a href="#sites" className={buttonClass('plain', 'sm', 'ui-nudge')}>
          <span>{a.photosLink}</span>
          <ArrowIcon className="size-4" />
        </a>
      </p>

      <dl className="about-grid about-facts">
        <div className="about-wide">
          <dt className="about-term t-caption">{a.legalLabel}</dt>
          <dd className="mt-3">
            <p className="about-legal t-title max-w-[40rem]">
              {lang === 'ar' ? (
                a.legalName
              ) : (
                <span lang="ar" dir="rtl">
                  {a.legalName}
                </span>
              )}
            </p>
            <p className="t-body mt-6 text-(--surface-fg-2)">{a.fieldsLead}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {copy.services.items.map((service) => (
                <li key={service.id}>
                  <Chip className="about-chip">{service.title}</Chip>
                </li>
              ))}
            </ul>
          </dd>
        </div>
        {a.values.map((value) => (
          <div key={value.term} className="md:col-span-6">
            <dt className="about-term t-caption">{value.term}</dt>
            <dd className="t-body mt-3">{value.text}</dd>
          </div>
        ))}
        <div className="about-narrow">
          <dt className="about-term t-caption">{a.channelsLabel}</dt>
          <dd className="mt-3">
            <ul className="t-body flex flex-col gap-4">
              <li>
                <a
                  href={siteInfo.facebook}
                  {...externalProps(siteInfo.facebook)}
                  className={`${LINK} inline-flex min-h-11 items-center gap-2`}
                >
                  {a.facebook}
                  <ArrowIcon className="size-4 -rotate-45 rtl:rotate-45" />
                  <NewTabNote />
                </a>
              </li>
              <li className="flex flex-col">
                <span className="about-term t-caption">{a.email}</span>
                <a
                  href={`mailto:${siteInfo.email}`}
                  dir="ltr"
                  className={`${LINK} inline-flex min-h-11 items-center self-start break-all`}
                >
                  {siteInfo.email}
                </a>
              </li>
            </ul>
          </dd>
        </div>
      </dl>
    </Section>
  );
}
