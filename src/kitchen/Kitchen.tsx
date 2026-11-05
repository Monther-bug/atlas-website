/**
 * DEV ONLY: /?v2=kitchen (Arabic) and /en/?v2=kitchen (English). Every v2 primitive on real Atlas content.
 * main.tsx imports this behind `import.meta.env.DEV`, so it never reaches the production bundle.
 * Kitchen-only strings (block labels, tab names) live in K below; everything else comes from the copy deck.
 */
import { useRef, useState, type ReactNode } from 'react';
import { Button } from '@/components/Button';
import { DraftBadge } from '@/components/DraftBadge';
import { ArrowIcon, DerrickIcon, HookIcon, PhoneIcon, WhatsAppIcon } from '@/components/Icons';
import { Picture } from '@/components/Picture';
import {
  BentoGrid,
  BentoTile,
  Card,
  Carousel,
  Chip,
  CompareTable,
  Field,
  Marquee,
  Section,
  SectionHeader,
  SegmentedControl,
  Sheet,
  SpecList,
  Stat,
  StickyStory,
  Tabs,
  ToggleChip,
  fill,
  reveal,
  sheetTrigger,
  useFlip,
} from '@/components/ui';
import { craneSpecs, type CraneSpecId } from '@/content/crane-specs';
import { visibleCranes, sites } from '@/content';
import { sharedFields, specRows } from '@/content/spec-rows';
import type { Crane, CraneType, GalleryPhotoId } from '@/content/types';
import type { PhotoId } from '@/generated/images';
import { useLang } from '@/lib/lang';
import { formatNumber } from '@/lib/numbers';
import { useSiteMotion } from '@/motion';
import '@/motion/motion.css';

const K = {
  ar: {
    title: 'مطبخ الإصدار الثاني',
    intro: 'كل مكوّن مشترك في الإصدار الثاني على محتوى أطلس الحقيقي. صفحة للمطوّرين فقط.',
    other: 'English',
    otherHref: '/en/?v2=kitchen',
    blocks: {
      tokens: 'الألوان والتباين',
      type: 'سلّم الخطوط',
      shape: 'الزوايا والظلال والأسطح',
      buttons: 'الأزرار',
      explorer: 'مستكشف الرافعات',
      compare: 'جدول المقارنة',
      bento: 'شبكة البنتو',
      why: 'لماذا أطلس (أدوات صادقة)',
      carousel: 'العرض المتتابع',
      marquee: 'الشريط المتحرك',
      fields: 'الشرائح والحقول',
    },
    tabs: { overview: 'نظرة عامة', specs: 'المواصفات', photos: 'الصور' },
    explorerLabel: 'اختر رافعة',
    typesLabel: 'تصفية حسب النوع',
    range: 'نطاق السعة',
    types: 'أنواع الرافعات',
    services: 'خدمات في طلب واحد',
    channels: 'قنوات التواصل',
    steps: ['أرسل وزن الحمولة وموقع العمل.', 'نقترح الرافعة المناسبة.', 'نؤكد لك التوفر في تاريخك.'],
    stepsTitle: 'كيف يتم الطلب',
    compareTitle: 'قارن الطرازات',
    sources: 'المصادر',
    surfaces: { white: 'أبيض', mist: 'رمادي فاتح جداً', tint: 'رمادي فاتح', dark: 'أسود', night: 'ليل', navy: 'كحلي', brand: 'كحلي عميق' },
  },
  en: {
    title: 'v2 kitchen',
    intro: "Every shared v2 primitive on Atlas's real content. A developer page only.",
    other: 'عربي',
    otherHref: '/?v2=kitchen',
    blocks: {
      tokens: 'Colour and contrast',
      type: 'Type scale',
      shape: 'Radii, elevation, surfaces',
      buttons: 'Buttons',
      explorer: 'Crane explorer',
      compare: 'Compare table',
      bento: 'Bento grid',
      why: 'Why Atlas (truthful instruments)',
      carousel: 'Carousel',
      marquee: 'Marquee',
      fields: 'Chips and fields',
    },
    tabs: { overview: 'Overview', specs: 'Specification', photos: 'Photos' },
    explorerLabel: 'Choose a crane',
    typesLabel: 'Filter by type',
    range: 'Capacity range',
    types: 'Crane types',
    services: 'Services in one request',
    channels: 'Ways to reach Atlas',
    steps: ['Send the load weight and the site.', 'We suggest the crane that fits.', 'We confirm it is free on your dates.'],
    stepsTitle: 'How a request works',
    compareTitle: 'Compare the models',
    sources: 'Sources',
    surfaces: { white: 'White', mist: 'Mist', tint: 'Tint', dark: 'Black', night: 'Night (navy glow)', navy: 'Navy (flat)', brand: 'Brand (deep navy)' },
  },
} as const;

/** Photos per crane, from the copy deck §6 card data (Kobelco excluded). */
const CRANE_PHOTOS: Record<CraneSpecId, readonly PhotoId[]> = {
  rt700e: ['6363', '6364', '6359', '6360'],
  'atf60-3': ['6397', '6395', '6396'],
  'ac200-1': ['6376', '6375', '6374', '6379'],
  quy250: ['6380', '6385', '6382'],
  gmk6350: ['6392', '6389', '6388', '6393'],
};

const PALETTE = [
  ['black', '#0A0A0A', 'Dark ground'],
  ['neutral-900', '#171717', 'Raised on black'],
  ['brand-950', '#100E3D', 'Brand ground (deep)'],
  ['brand-300', '#A5A3F5', 'Accent on black'],
  ['neutral-300', '#D4D4D4', 'Secondary on black'],
  ['mist', '#F5F5F5', 'Light ground'],
  ['white', '#FFFFFF', 'Tiles, sheet'],
  ['line-control', '#8A8A8A', 'Control border'],
  ['ink', '#111111', 'Text'],
  ['ink-2', '#4A4A4A', 'Secondary text'],
  ['ink-3', '#6B6B6B', 'Tertiary text'],
  ['red', '#C9221C', 'Action, hook'],
  ['red-600', '#A81B16', 'Action hover'],
  ['red-bright', '#FF5A4F', 'Red on black'],
  ['brand', '#23207A', 'Secondary accent (light)'],
  ['ok', '#1C7A45', 'Success'],
] as const;

function luminance(hex: string): number {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * (c[0] ?? 0) + 0.7152 * (c[1] ?? 0) + 0.0722 * (c[2] ?? 0);
}
function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return ((x ?? 0) + 0.05) / ((y ?? 0) + 0.05);
}

function Label({ children }: { children: ReactNode }) {
  return (
    <p className="t-caption mb-6 border-b border-(--surface-line) pb-3 font-semibold tracking-wide text-(--surface-fg-3)" lang="en" dir="auto">
      {children}
    </p>
  );
}

function specId(crane: Crane): CraneSpecId | null {
  return crane.id in craneSpecs ? (crane.id as CraneSpecId) : null;
}

export function Kitchen() {
  const { lang, copy } = useLang();
  useSiteMotion();
  const k = K[lang];
  const cranes = visibleCranes.filter((c) => specId(c) !== null);
  const [craneId, setCraneId] = useState<string>('gmk6350');
  const crane = cranes.find((c) => c.id === craneId) ?? cranes[0];
  const [types, setTypes] = useState<ReadonlySet<CraneType>>(new Set());
  const flipList = useRef<HTMLUListElement>(null);
  const filtered = visibleCranes.filter((c) => types.size === 0 || types.has(c.type));
  useFlip(flipList, filtered.map((c) => c.id).join());
  if (!crane) return null;
  const sid = specId(crane) as CraneSpecId;
  const spec = craneSpecs[sid];
  const rows = specRows(spec, copy, lang);
  const photos = CRANE_PHOTOS[sid];
  const sheetId = `sheet-${crane.id}`;
  const fullName = `${crane.make} ${crane.model}`;
  const min = Math.min(...cranes.map((c) => c.capacityT));
  const max = Math.max(...cranes.map((c) => c.capacityT));
  const tons = (n: number) => formatNumber(n, lang);

  const compareRows = sharedFields(
    cranes.map((c) => craneSpecs[specId(c) as CraneSpecId]),
    copy,
    lang,
  ).map((id) => ({
    id,
    label: copy.specs.fields[id],
    cells: Object.fromEntries(cranes.map((c) => [c.id, specRows(craneSpecs[specId(c) as CraneSpecId], copy, lang, [id])[0] ?? null])),
  }));

  const galleryPhotos = sites.flatMap((g) => g.photos) as GalleryPhotoId[];
  const sources = Array.from(new Map(spec.sources.map((s) => [s.url, s])).values());

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      {/* ── Masthead ── */}
      <Section surface="night" pad="none" className="py-16 md:py-24">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-[46rem]">
            <h1 className="t-display">{k.title}</h1>
            <p className="t-sub mt-5 text-(--surface-fg-2)">{k.intro}</p>
          </div>
          <Button href={k.otherHref} variant="glass" size="sm" lang={lang === 'ar' ? 'en' : 'ar'}>
            {k.other}
          </Button>
        </div>
        <div className="mt-12 flex flex-wrap gap-3">
          <Button href="#explorer" magnetic icon={<HookIcon className="size-5" />}>
            {copy.header.request}
          </Button>
          <Button href="#explorer" variant="inverse" icon={<WhatsAppIcon className="size-5" />}>
            {copy.hero.whatsapp}
          </Button>
          <Button href="#compare" variant="ghost-dark" iconEnd={<ArrowIcon direction="down" className="size-5" />}>
            {copy.hero.browse}
          </Button>
        </div>
        <Marquee
          className="mt-16"
          label={k.blocks.marquee}
          repeat={2}
          itemClassName="flex items-baseline gap-3 whitespace-nowrap"
          items={cranes.map((c) => (
            <>
              <span className="t-spec text-white" lang="en" dir="ltr">
                {c.make} {c.model}
              </span>
              <span className="t-sub t-accent">
                {tons(c.capacityT)} {copy.hoist.unit}
              </span>
            </>
          ))}
        />
      </Section>

      {/* ── Tokens ── */}
      <Section surface="white">
        <Label>{k.blocks.tokens}</Label>
        <ul className="grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-4 lg:grid-cols-8">
          {PALETTE.map(([name, hex, role]) => {
            const onWhite = contrast(hex, '#FFFFFF');
            const onNight = contrast(hex, '#0A0A0A');
            return (
              <li key={name} className="ui-card overflow-clip" data-tone="outline">
                <div className="h-20" style={{ backgroundColor: hex }} />
                <div className="p-3" lang="en" dir="ltr">
                  <p className="t-small m-0 font-semibold">{name}</p>
                  <p className="t-spec m-0 text-ink-3">{hex}</p>
                  <p className="t-caption m-0 text-ink-2">{role}</p>
                  <p className="t-caption m-0 text-ink-3">
                    W {onWhite.toFixed(1)} · N {onNight.toFixed(1)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-20">
          <Label>{k.blocks.type}</Label>
          <div className="flex flex-col gap-8">
            <p className="t-display m-0">{copy.hero.h1Main}</p>
            <p className="t-headline m-0">
              {copy.hoist.title}
              <span className="t-muted"> {copy.hoist.intro}</span>
            </p>
            <p className="t-title m-0">{copy.services.items[0].title}</p>
            <p className="t-sub m-0 max-w-[40rem] text-ink-2">{copy.grid.intro}</p>
            <p className="t-body m-0 max-w-[38rem]">{copy.hoist.footnote}</p>
            <p className="t-caption m-0 text-ink-3">{copy.sites.captions['6398']}</p>
            <div className="flex flex-wrap items-baseline gap-10">
              <span className="t-figure">{tons(max)}</span>
              <span className="t-readout">{tons(min)}</span>
              <span className="t-spec" lang="en" dir="ltr">
                GMK6350 · 12x6x12
              </span>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Shape: radii, elevation, surfaces, glass ── */}
      <Section surface="mist">
        <Label>{k.blocks.shape}</Label>
        <div className="grid gap-(--space-gap) md:grid-cols-4">
          {(['e1', 'e2', 'e3', 'e4'] as const).map((e, i) => (
            <div
              key={e}
              className={`flex h-32 items-end bg-white p-4 ${['shadow-e1', 'shadow-e2', 'shadow-e3', 'shadow-e4'][i]} ${['rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl'][i]}`}
            >
              <span className="t-spec" lang="en" dir="ltr">
                shadow-{e} · {['sm 10', 'md 14', 'lg 20', 'xl 20-28'][i]}
              </span>
            </div>
          ))}
        </div>
        <ul className="mt-(--space-gap) grid list-none grid-cols-2 gap-(--space-gap) p-0 md:grid-cols-7">
          {(['white', 'mist', 'tint', 'dark', 'night', 'navy', 'brand'] as const).map((s) => (
            <li key={s} className={`surface-${s} flex h-28 flex-col justify-end rounded-lg p-4 shadow-e1`} data-ground={s === 'dark' || s === 'night' || s === 'navy' || s === 'brand' ? 'dark' : 'light'}>
              <span className="t-small font-semibold">{k.surfaces[s]}</span>
              <span className="t-caption text-(--surface-fg-3)" lang="en" dir="ltr">
                surface-{s}
              </span>
            </li>
          ))}
        </ul>
        <figure className="frame relative mt-(--space-gap) aspect-[16/7]">
          <Picture photo="6374" crop="desktop_16x9" mobileCrop="mobile_4x5" alt={copy.alt['6374']} sizes="(min-width: 1440px) 1300px, 100vw" className="h-full w-full" />
          <figcaption className="absolute inset-x-4 bottom-4 flex flex-wrap items-center justify-between gap-3 md:inset-x-6 md:bottom-6">
            <span className="glass-dark t-small rounded-full px-4 py-2">{copy.sites.captions['6374']}</span>
            <span className="glass-light t-small rounded-full px-4 py-2" lang="en" dir="ltr">
              glass-dark · glass-light
            </span>
          </figcaption>
        </figure>
      </Section>

      {/* ── Buttons ── */}
      <div className="grid md:grid-cols-2">
        <Section surface="white" width="bleed" className="px-[clamp(1rem,4vw,3.5rem)]">
          <Label>{k.blocks.buttons}</Label>
          <div className="flex flex-wrap gap-3">
            <Button>{copy.header.request}</Button>
            <Button variant="secondary">{copy.hoist.closingButton}</Button>
            <Button variant="ghost-light">{copy.hero.browse}</Button>
            <Button variant="plain" iconEnd={<ArrowIcon className="size-4" />}>
              {copy.grid.card.formLink}
            </Button>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="md">{copy.form.submit}</Button>
            <Button size="sm" variant="secondary">
              {copy.grid.showAll}
            </Button>
            <Button loading loadingLabel={copy.form.busy}>
              {copy.form.submit}
            </Button>
            <Button disabled variant="ghost-light">
              {copy.grid.all}
            </Button>
          </div>
        </Section>
        <Section surface="dark" width="bleed" className="px-[clamp(1rem,4vw,3.5rem)]">
          <Label>{k.blocks.buttons}</Label>
          <div className="flex flex-wrap gap-3">
            <Button magnetic icon={<WhatsAppIcon className="size-5" />}>
              {copy.hero.whatsapp}
            </Button>
            <Button variant="inverse">{copy.header.request}</Button>
            <Button variant="ghost-dark" icon={<PhoneIcon className="size-5" />}>
              {copy.header.call.text}
            </Button>
            <Button variant="glass">{copy.sites.open}</Button>
            <Button variant="plain" iconEnd={<ArrowIcon className="size-4" />}>
              {copy.services.ask}
            </Button>
          </div>
        </Section>
      </div>

      {/* ── Crane explorer: segmented control + tabs + spec list + sheet ── */}
      <Section surface="mist" id="explorer" aria-labelledby="k-explorer">
        <Label>{k.blocks.explorer}</Label>
        <SectionHeader
          id="k-explorer"
          title={copy.grid.title}
          continuation={fill(lang === 'ar' ? 'من {min} إلى {max} طن.' : '{min} t to {max} t.', { min: tons(min), max: tons(max) })}
          lead={copy.grid.availability}
        />
        <SegmentedControl
          name="k-crane"
          label={k.explorerLabel}
          value={crane.id}
          onChange={setCraneId}
          options={cranes.map((c) => ({
            value: c.id,
            label: (
              <span lang="en" dir="ltr">
                {c.model}
              </span>
            ),
          }))}
        />
        <div className="mt-8 grid grid-cols-1 gap-(--space-gap) lg:grid-cols-12">
          <figure className="frame relative aspect-[4/5] sm:aspect-[16/11] lg:col-span-7 lg:aspect-auto lg:min-h-[38rem]" {...reveal('mask')}>
            <Picture key={photos[0]} photo={photos[0] ?? '6392'} crop="desktop_16x9" mobileCrop="mobile_4x5" alt={copy.alt[photos[0] ?? '6392']} sizes="(min-width: 1024px) 58vw, 100vw" className="h-full w-full" />
            <figcaption className="glass-dark absolute inset-x-3 bottom-3 flex flex-wrap items-center justify-between gap-3 rounded-lg px-4 py-3 md:inset-x-5 md:bottom-5">
              <span className="t-spec" lang="en" dir="ltr">
                {fullName}
              </span>
              <Chip className="bg-white/12! text-white!">{copy.craneTypes[crane.type].chip}</Chip>
            </figcaption>
          </figure>
          <Card tone="raised" padding="lg" className="lg:col-span-5">
            <Stat value={crane.capacityT} unit={copy.hoist.unit} label={copy.hoist.capacity} verified={crane.verified} from={0} decimals={1} />
            <Tabs
              className="mt-8"
              label={fullName}
              items={[
                {
                  id: 'overview',
                  label: k.tabs.overview,
                  panel: (
                    <div className="pt-6">
                      <h3 className="t-title">{copy.craneTypes[crane.type].full}</h3>
                      <p className="t-body mt-3 text-ink-2">{copy.craneTypes[crane.type].explainer}</p>
                      <p className="t-small mt-4 text-ink-3">{copy.hoist.footnote}</p>
                    </div>
                  ),
                },
                {
                  id: 'specs',
                  label: k.tabs.specs,
                  panel: (
                    <div className="pt-6">
                      <h3 className="t-tag m-0 flex flex-wrap items-center gap-2">
                        {copy.specs.heading}
                        <DraftBadge verified={false} />
                      </h3>
                      <SpecList className="mt-4" items={rows.slice(0, 6)} />
                    </div>
                  ),
                },
                {
                  id: 'photos',
                  label: k.tabs.photos,
                  panel: (
                    <div className="pt-6">
                      <h3 className="sr-only">{k.tabs.photos}</h3>
                      <Carousel
                        label={fullName}
                        slideWidth="min(80%, 14rem)"
                        slides={photos.map((p) => (
                          <div key={p} className="frame aspect-[4/5]">
                            <Picture photo={p} crop="mobile_4x5" alt={copy.alt[p]} sizes="14rem" className="h-full w-full" />
                          </div>
                        ))}
                      />
                    </div>
                  ),
                },
              ]}
            />
            <div className="mt-auto flex flex-wrap gap-3 pt-8">
              <Button href="#explorer" magnetic>
                {copy.grid.card.request}
              </Button>
              <Button variant="ghost-light" {...sheetTrigger(sheetId)}>
                {fill(copy.ui.details, { name: crane.model })}
              </Button>
            </div>
          </Card>
        </div>
        <Sheet
          id={sheetId}
          title={
            <span lang="en" dir="ltr">
              {fullName}
            </span>
          }
          footer={
            <Button href="#explorer" className="w-full">
              {copy.grid.card.request}
            </Button>
          }
        >
          <div className="frame aspect-[16/10]">
            <Picture photo={photos[1] ?? photos[0] ?? '6392'} crop="desktop_16x9" alt={copy.alt[photos[1] ?? photos[0] ?? '6392']} sizes="40rem" className="h-full w-full" />
          </div>
          <p className="t-body mt-5 text-ink-2">{copy.craneTypes[crane.type].explainer}</p>
          <h3 className="t-title mt-8 flex flex-wrap items-center gap-3">
            {copy.specs.heading}
            <DraftBadge verified={false} />
          </h3>
          <p className="t-small mt-2 text-ink-3">{copy.specs.disclaimer}</p>
          <SpecList className="mt-4" items={rows} />
          <h4 className="t-small mt-8 font-semibold">{k.sources}</h4>
          <ul className="t-caption mt-2 flex list-none flex-col gap-1 p-0 text-ink-3">
            {sources.map((s) => (
              <li key={s.url}>
                <bdi lang="en" dir="ltr">
                  {new URL(s.url).hostname}
                </bdi>{' '}
                · {s.official ? copy.specs.official : copy.specs.secondary}
              </li>
            ))}
          </ul>
        </Sheet>
      </Section>

      {/* ── Compare ── */}
      <Section surface="white" id="compare" aria-labelledby="k-compare">
        <Label>{k.blocks.compare}</Label>
        <SectionHeader id="k-compare" title={k.compareTitle} lead={copy.specs.disclaimer} />
        <div {...reveal('fade')}>
          <CompareTable
            name={k.compareTitle}
            caption={
              <span className="inline-flex flex-wrap items-center gap-2">
                {copy.specs.heading}
                <DraftBadge verified={false} />
              </span>
            }
            columns={cranes.map((c) => ({
              id: c.id,
              highlight: c.id === crane.id,
              header: (
                <span className="t-spec" lang="en" dir="ltr">
                  {c.model}
                </span>
              ),
            }))}
            rows={compareRows}
          />
        </div>
      </Section>

      {/* ── Services bento ── */}
      <Section surface="night" aria-labelledby="k-services">
        <Label>{k.blocks.bento}</Label>
        <SectionHeader id="k-services" title={copy.services.title} continuation={copy.services.intro} />
        <BentoGrid as="ul" {...reveal('stagger')}>
          <BentoTile as="li" span="two-thirds" rows={2} tone="photo">
            <Picture photo="6389" crop="desktop_16x9" mobileCrop="mobile_4x5" alt={copy.alt['6389']} sizes="(min-width: 1024px) 62vw, 100vw" pictureClassName="absolute inset-0 -z-10" className="h-full w-full" />
            <div className="mt-auto p-(--space-tile)">
              <div className="glass-dark max-w-[30rem] rounded-lg p-5">
                <h3 className="t-title">{copy.services.items[0].title}</h3>
                <p className="t-body mt-2 text-neutral-300">{copy.services.items[0].body}</p>
              </div>
            </div>
          </BentoTile>
          <BentoTile as="li" tone="tile">
            <h3 className="t-title">{copy.services.items[1].title}</h3>
            <p className="t-body mt-3 text-ink-2">{copy.services.items[1].body}</p>
          </BentoTile>
          <BentoTile as="li" tone="raised">
            <h3 className="t-title">{copy.services.items[2].title}</h3>
            <p className="t-body mt-3 text-(--surface-fg-2)">{copy.services.items[2].body}</p>
          </BentoTile>
          <BentoTile as="li" span="full" tone="navy" className="md:flex-row md:items-center md:gap-10">
            <DerrickIcon className="size-16 shrink-0 text-white" />
            <div className="max-w-[44rem]">
              <h3 className="t-title">{copy.services.items[3].title}</h3>
              <p className="t-body mt-2 text-(--surface-fg-2)">{copy.services.items[3].body}</p>
            </div>
            <Button variant="inverse" size="md" className="md:ms-auto">
              {copy.services.ask}
            </Button>
          </BentoTile>
        </BentoGrid>
      </Section>

      {/* ── Why Atlas: instruments built from facts on hand, no invented numbers ── */}
      <Section surface="brand" aria-labelledby="k-why">
        <Label>{k.blocks.why}</Label>
        <BentoGrid>
          <BentoTile span="two-thirds" tone="raised">
            <h3 id="k-why" className="t-tag m-0">
              {k.range}
            </h3>
            <div className="mt-6 flex flex-wrap items-end gap-x-6 gap-y-2">
              <Stat value={min} unit={copy.hoist.unit} label={cranes[0]?.model ?? ''} from={0} verified={false} />
              <ArrowIcon className="mb-10 size-6 t-accent" />
              <Stat value={max} unit={copy.hoist.unit} label={cranes[cranes.length - 1]?.model ?? ''} from={0} decimals={1} verified={false} />
            </div>
            <ol className="relative mt-10 flex list-none justify-between border-t border-white/24 p-0 pt-3" aria-label={k.range}>
              {cranes.map((c) => (
                <li key={c.id} className="t-caption flex flex-col items-center gap-1 text-steel">
                  <span aria-hidden="true" className="-mt-[1.0625rem] block h-3 w-px bg-brand-300" />
                  <span lang="en" dir="ltr">
                    {c.model}
                  </span>
                  <span className="text-white">
                    {tons(c.capacityT)} {copy.hoist.unit}
                  </span>
                </li>
              ))}
            </ol>
          </BentoTile>
          <BentoTile tone="raised">
            <Stat value={new Set(cranes.map((c) => c.type)).size} label={k.types} />
            <div className="mt-auto flex flex-wrap gap-2 pt-6">
              {(['rough-terrain', 'all-terrain', 'crawler'] as const).map((t) => (
                <Chip key={t}>{copy.craneTypes[t].chip}</Chip>
              ))}
            </div>
          </BentoTile>
          <BentoTile tone="raised">
            <Stat value={copy.services.items.length} label={k.services} />
            <ul className="t-small mt-auto flex list-none flex-col gap-1 p-0 pt-6 text-(--surface-fg-2)">
              {copy.services.items.map((s) => (
                <li key={s.id}>{s.title}</li>
              ))}
            </ul>
          </BentoTile>
          <BentoTile span="third" tone="raised">
            <h3 className="t-tag m-0">{k.channels}</h3>
            <ul className="mt-5 flex list-none flex-col gap-3 p-0">
              <li className="flex items-center gap-3">
                <WhatsAppIcon className="size-5 t-accent" />
                {copy.form.contact.whatsapp}
              </li>
              <li className="flex items-center gap-3">
                <PhoneIcon className="size-5 t-accent" />
                {copy.form.contact.phone}
              </li>
              <li className="flex items-center gap-3">
                <ArrowIcon className="size-5 t-accent" />
                {copy.form.contact.email}
              </li>
            </ul>
          </BentoTile>
          <BentoTile span="third" tone="raised">
            <h3 className="t-tag m-0">{k.stepsTitle}</h3>
            <ol className="mt-5 flex list-none flex-col gap-4 p-0">
              {k.steps.map((s, i) => (
                <li key={s} className="flex items-baseline gap-3">
                  <span className="t-spec t-accent">{formatNumber(i + 1, lang)}</span>
                  <span className="t-body">{s}</span>
                </li>
              ))}
            </ol>
          </BentoTile>
        </BentoGrid>
      </Section>

      {/* ── StickyStory ── */}
      <Section surface="white" aria-labelledby="k-story">
        <Label>StickyStory</Label>
        <SectionHeader id="k-story" title={k.stepsTitle} />
        <StickyStory
          label={k.stepsTitle}
          steps={k.steps.map((step, i) => {
            const photo = (['6398', '6364', '6389'] as const)[i] ?? '6398';
            return {
              id: `s${i}`,
              media: <Picture photo={photo} crop="desktop_16x9" mobileCrop="mobile_4x5" alt={copy.alt[photo]} sizes="(min-width: 1024px) 55vw, 100vw" className="h-full w-full" />,
              content: (
                <div className="max-w-[28rem]">
                  <span className="t-spec t-accent">{formatNumber(i + 1, lang)}</span>
                  <p className="t-title mt-3">{step}</p>
                </div>
              ),
            };
          })}
        />
      </Section>

      {/* ── Carousel ── */}
      <Section surface="white" width="bleed" aria-labelledby="k-sites">
        <div className="shell">
          <Label>{k.blocks.carousel}</Label>
          <SectionHeader id="k-sites" title={copy.sites.title} lead={copy.sites.intro} />
        </div>
        <Carousel
          label={copy.sites.title}
          inset="max(clamp(1rem, 4vw, 3.5rem), calc((100vw - 90rem) / 2 + 3.5rem))"
          slideWidth="min(78%, 21rem)"
          slides={galleryPhotos.map((p) => (
            <figure key={p} className="m-0">
              <div className="frame aspect-[4/5]">
                <Picture photo={p} crop="mobile_4x5" alt={copy.alt[p]} sizes="21rem" className="h-full w-full" />
              </div>
              <figcaption className="t-small mt-3 text-ink-2">{copy.sites.captions[p]}</figcaption>
            </figure>
          ))}
        />
      </Section>

      {/* ── Chips and fields ── */}
      <Section surface="night" aria-labelledby="k-form">
        <Label>{k.blocks.fields}</Label>
        <h2 id="k-form" className="t-headline">
          {copy.form.title}
          <span className="t-muted"> {copy.form.lead}</span>
        </h2>
        <div role="group" aria-label={k.typesLabel} className="mt-10 flex flex-wrap gap-2">
          {(['rough-terrain', 'all-terrain', 'crawler'] as const).map((t) => (
            <ToggleChip
              key={t}
              pressed={types.has(t)}
              onPressedChange={(on) => {
                const next = new Set(types);
                if (on) next.add(t);
                else next.delete(t);
                setTypes(next);
              }}
            >
              {copy.craneTypes[t].chip}
            </ToggleChip>
          ))}
        </div>
        <ul ref={flipList} className="mt-6 flex list-none flex-wrap gap-3 p-0" aria-live="polite">
          {filtered.map((c) => (
            <li key={c.id} data-flip-id={c.id} className="ui-card flex items-baseline gap-3 px-5 py-4" data-tone="raised">
              <span className="t-spec" lang="en" dir="ltr">
                {c.model}
              </span>
              <span className="t-small text-(--surface-fg-2)">
                {tons(c.capacityT)} {copy.hoist.unit}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Field label={copy.form.fields.weight.label} hint={copy.form.fields.weight.hint} error={copy.form.fields.weight.empty} required tag={copy.form.required}>
            {(p) => <input {...p} inputMode="decimal" placeholder={copy.form.fields.weight.unit} />}
          </Field>
          <Field label={copy.form.fields.phone.label} hint={copy.form.fields.phone.hint} required tag={copy.form.required}>
            {(p) => <input {...p} type="tel" dir="ltr" />}
          </Field>
          <Field label={copy.form.fields.crane.label} hint={copy.form.fields.crane.hint} tag={copy.form.optional}>
            {(p) => (
              <select {...p} defaultValue="">
                <option value="">{copy.form.fields.crane.unsure}</option>
                {cranes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.make} {c.model}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label={copy.form.fields.message.label} hint={copy.form.fields.message.hint} tag={copy.form.optional}>
            {(p) => <textarea {...p} rows={3} />}
          </Field>
        </div>
      </Section>
    </main>
  );
}

export default Kitchen;
