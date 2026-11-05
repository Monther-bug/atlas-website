import type { PhotoId } from '@/generated/images';

/* ------------------------------------------------------------------ */
/* Fixed by contract C7                                                */
/* ------------------------------------------------------------------ */

export type Lang = 'ar' | 'en';
export type CraneId = 'rt700e' | 'atf60-3' | 'ac200-1' | 'quy250' | 'gmk6350' | 'cke2500';
export type CraneType = 'rough-terrain' | 'all-terrain' | 'crawler';

export interface Crane {
  id: CraneId;
  make: string;
  model: string;
  type: CraneType;
  capacityT: number; // manufacturer max rating in METRIC tonnes (GMK6350 is 350 US tons = 317.5 t; see crane-specs.ts)
  hoistPhoto: PhotoId;
  cardPhoto: PhotoId;
  verified: boolean; // Atlas confirmed ownership + capacity
  hidden: boolean; // never rendered (cke2500)
}

export interface DocumentFile {
  id: string; // one of DocumentSlot below
  href: string;
  lang: 'ar' | 'en' | 'both';
  date: string; // YYYY-MM-DD
}

export interface SiteInfo {
  email: string; // 'atlasalsahralibya@gmail.com'
  facebook: string; // the share URL from the brief
  address: { ar: string; en: string } | null;
  documents: DocumentFile[]; // [] until real files exist
}

/* ------------------------------------------------------------------ */
/* Part B additions                                                    */
/* ------------------------------------------------------------------ */

/** Service rows, form options and footer links share these ids (copy deck §5). */
export type ServiceId = 'crane-hire' | 'heavy-transport' | 'handling' | 'oil-services';

/** Capacity bands (copy deck §6). C9 filter values are `band:${CapacityBand}`. */
export type CapacityBand = '0-60' | '61-200' | '201+';

/** Duration choices in the request form. No choice (value '') shows `unsure`. */
export type DurationId = 'day' | 'week' | 'month' | 'long';

/** Document slots (copy deck §8b). `DocumentFile.id` uses these values. */
export type DocumentSlot = 'profile' | 'fleet-list' | 'inspection' | 'hse' | 'iso' | 'insurance' | 'cr';

/**
 * The 12 photos in the spec §4.2 galleries (construction: 6374, 6376, 6379, 6380, 6382, 6388, 6393;
 * coast: 6360, 6364, 6396, 6397, 6398). Must equal the photos listed in src/content/sites.ts.
 * Kobelco photos are excluded.
 */
export type GalleryPhotoId = '6374' | '6376' | '6379' | '6380' | '6382' | '6388' | '6393' | '6360' | '6364' | '6396' | '6397' | '6398';

export type SiteGalleryId = 'construction' | 'coast';
export interface SiteGallery {
  id: SiteGalleryId;
  photos: readonly GalleryPhotoId[];
}

export interface ServiceCopy {
  id: ServiceId;
  title: string;
  body: string;
  /** A whole sentence that ships only once Atlas confirms it (deck "Add if confirmed"). Render only when non-null; null = withheld. */
  confirm: string | null;
}

/** One step of the hire process (WhyCopy.steps). `text` may hold a [[CONFIRM]] clause. */
export interface WhyStep {
  title: string;
  text: string;
}

/**
 * v2 "Why Atlas" (copy deck §8c), strings in src/content/why.ts. Built only from facts on hand: the capacity range of
 * the cranes on the page (manufacturer ratings, draft), the crane types, the four services of the legal name, the
 * request channels and the hire process. No years, counts, clients or certificates (those stay in §8a, HIDDEN UNTIL
 * DATA). Kept out of `Copy` on purpose: the section is static HTML on the client (src/sections/island.tsx), so these
 * strings are only needed by the prerender and stay out of the main JS chunk. The prerender's HTML token scan
 * (scripts/prerender.mjs) still blocks a production build on any [[CONFIRM]] left in them.
 */
export interface WhyCopy {
  title: string;
  continuation: string; // two-tone second sentence of the heading
  lead: string;
  range: {
    figure: string; // {min} {max}: formatted numbers; the unit (hoist.unit) follows
    label: string;
    listLabel: string; // accessible name of the capacity bar list
  };
  types: { title: string };
  steps: { title: string; items: readonly [WhyStep, WhyStep, WhyStep, WhyStep] };
  /** The closing strip. `text` holds {list}, replaced by a link (`listLink`) to the crane list. */
  channels: { title: string; text: string; listLink: string; form: string };
}

export interface CraneTypeCopy {
  full: string; // "Rough-terrain crane"
  chip: string; // "Rough-terrain"
  explainer: string; // one line
}

export interface FieldCopy {
  label: string;
}

/**
 * Every string the site renders. `ar.ts` and `en.ts` both satisfy this type,
 * so a missing line fails type-checking. `{x}` = runtime variable (fillTemplate),
 * `[[X]]` = fact Atlas has not supplied (blocked by the truth gate).
 */
export interface Copy {
  lang: Lang;

  /** Fixed by C7. Copy deck §1. */
  meta: { title: string; description: string; ogTitle: string; ogDescription: string; ogImageAlt: string };

  /** Copy deck §2. */
  header: {
    skipLink: string;
    homeLabel: string; // logo link: sr-only words after the visible name (WCAG 2.5.3: the name starts with what is seen)
    homePage: string; // the same, on a crane page, where the logo goes to the home page instead of the top
    name: string; // typeset name beside the badge
    nameAlt: string; // the same name in the other language (second line of the lockup)
    nav: { services: string; cranes: string; sites: string; contact: string };
    langSwitch: { text: string; label: string }; // both in the OTHER language
    request: string;
    call: { text: string; label: string }; // label has {phone}
    menu: { open: string; close: string; whatsapp: string };
  };

  /** Copy deck §3 + spec §5.2 and §15.1. */
  hero: {
    h1Lead: string; // first clause, set smaller
    h1Main: string; // second clause, set large
    servicesLine: string; // renders BELOW the H1 (deck "Eyebrow"; spec §15.1)
    whatsapp: string; // the button on the sling
    browse: string; // secondary button → #cranes (spec §5.2)
  };

  /** Copy deck §4 "Class names". Used by the Hoist, the grid, the form and template B. */
  craneTypes: Record<CraneType, CraneTypeCopy>;

  /** Copy deck §4 (the Capacity Scale is the Hoist). */
  hoist: {
    title: string;
    intro: string;
    listHeading: string; // visually hidden heading of the <ol>
    skipToList: string; // "See all cranes" skip link → #crane-list (spec §14)
    capacity: string; // data label inside each load tag
    model: string;
    type: string;
    unit: string; // 'طن' | 't'
    footnote: string;
    closing: string;
    closingButton: string;
    /** v2: accessible name of the crane-by-crane progress links on the desktop stage. */
    chapters: string;
    /**
     * v2: a line under a crane whose machine shows a different number from its metric rating. `{capacity}` is filled
     * with the formatted rating and unit. Only the GMK6350 (its boom reads "350 TON": US tons, crane-specs.ts).
     */
    ratingNotes: Partial<Record<CraneId, string>>;
  };

  /** Copy deck §5. */
  services: {
    title: string;
    intro: string;
    ask: string; // link → WhatsApp template C
    combine: string; // v2: header action → #request (several services in one request)
    items: readonly [ServiceCopy, ServiceCopy, ServiceCopy, ServiceCopy];
  };

  /** Copy deck §6 + spec §15.8 (empty state). */
  grid: {
    title: string;
    intro: string;
    availability: string;
    typeLabel: string;
    bandLabel: string;
    all: string;
    bands: Record<CapacityBand, string>; // {min} / {max} are formatted numbers
    count: { one: string; two: string; few: string; many: string }; // few = 3–10, many = 11+
    empty: string;
    showAll: string;
    card: {
      type: string;
      capacity: string;
      request: string;
      formLink: string;
      details: string; // opens the detail sheet; the model is appended for screen readers
      rating: string; // "Manufacturer rating": the capacity is the maker's figure, not Atlas's
      atRadius: string; // {radius}
      boomMax: string; // key spec label: the longest main boom
      secondary: string; // footnote for a key spec taken from a spec database (marked *)
    }; // the model code is the card's heading
    /** v2: second sentence of the heading, in the muted tone (Stripe two-tone). */
    continuation: string;
    /** v2: header action → the comparison below. */
    compareLink: string;
    /** v2: card status while a load is typed in the load check (the rest of its copy is in crane-list-copy.ts). */
    fits: string; // {load}
    below: string; // {load}
  };

  /** v2: About Atlas (new section, copy deck §3a). Written from confirmed facts only; needs Atlas's approval. */
  about: {
    title: string; // h2: the statement's first sentence
    statement: string; // the sentences that continue the heading, set at the same size
    legalLabel: string;
    legalName: string; // the Arabic legal name; rendered with lang="ar" on the English page
    fieldsLead: string; // bridge from the legal name to the four lines of work (service chips)
    channelsLabel: string;
    facebook: string;
    email: string; // label before the address
    photosLink: string; // link to #sites
    /** HIDDEN UNTIL DATA: mission, vision, values. Empty until Atlas supplies them; each item renders as one fact. */
    values: readonly { term: string; text: string }[];
  };

  /** Copy deck §7. */
  sites: {
    title: string;
    intro: string;
    all: string; // segmented option: every photo (deck "Tab: All")
    filterLabel: string; // accessible name of the site picker
    galleries: Record<SiteGalleryId, string>;
    swipeHint: string;
    open: string;
    prev: string;
    next: string;
    counter: string; // {i} / {n}
    close: string;
    captions: Record<GalleryPhotoId, string>;
  };

  /** Copy deck §8b. Rendered only when siteInfo.documents is not empty. */
  documents: {
    title: string;
    intro: string;
    meta: string; // {language} {date}
    languages: { ar: string; en: string; both: string };
    download: string;
    emailRequest: string;
    emailSubject: string; // {document}
    names: Record<DocumentSlot, string>;
  };

  /** Copy deck §9 + spec §5.8 and §15.1. */
  form: {
    title: string; // the dialect question (spec §5.8)
    lead: string; // the dialect line, BELOW the title (deck "Eyebrow"; spec §15.1)
    next: { title: string; steps: [string, string, string] }; // what happens after sending: no times promised
    contact: { email: string; phone: string; whatsapp: string; address: string; facebook: string };
    more: string; // the one disclosure holding the optional fields
    required: string;
    optional: string;
    submit: string;
    busy: string;
    handoff: string; // no-endpoint hand-off, announced
    whatsappAlt: string;
    privacy: string;
    errorSummary: string;
    fields: {
      name: FieldCopy & { tooLong: string };
      company: FieldCopy & { tooLong: string };
      phone: FieldCopy & { hint: string; empty: string; format: string };
      crane: FieldCopy & { unsure: string; servicesGroup: string; cranesGroup: string };
      weight: FieldCopy & { unit: string; empty: string; format: string };
      radius: FieldCopy & { unit: string; format: string };
      height: FieldCopy & { unit: string; format: string };
      site: FieldCopy & { tooLong: string };
      start: FieldCopy & { past: string };
      duration: FieldCopy & { unsure: string; options: Record<DurationId, string> };
      message: FieldCopy & { counter: string; tooLong: string }; // counter: {n} / {max}
    };
    success: { title: string; text: string; nudge: string; button: string }; // text has {phone}
    failure: { title: string; text: string; retry: string; whatsapp: string; email: string; offline: string };
    emailSubject: string; // {crane}
  };

  /** Copy deck §10. Multi-line templates joined with '\n'. */
  whatsapp: {
    general: string; // A
    crane: string; // B: {model} {class}
    service: string; // C: {service}
    request: string; // D: one line per form field; lines with an empty field are dropped
    followUp: string; // E: {name} {phone}
  };

  /** Copy deck §10 "Floating WhatsApp button" + spec §5 RequestBar. */
  bar: {
    onHook: string;
    clear: string; // aria-label of the chip's Close icon button
    whatsapp: string; // visible
    whatsappLabel: string; // accessible name (contains the visible text)
    tooltip: string; // shown as a line of text on desktop
  };

  /** Copy deck §11. */
  footer: {
    name: string;
    legalName: string;
    tagline: string;
    servicesHeading: string;
    pageHeading: string;
    /** On a crane page the same links lead to the home page, so the column is named after it. */
    homeHeading: string;
    pageLinks: { cranes: string; sites: string; request: string };
    contactHeading: string;
    followHeading: string;
    facebook: string;
    copyright: string; // {year}
    backToTop: string;
  };

  /** Copy deck §12. Kobelco photos are not PhotoIds, so they cannot appear here. */
  alt: Record<PhotoId, string>;

  misc: {
    draftBadge: string; // spec §4.3
    newTab: string;
  };

  /** v2 shared control labels for src/components/ui (generic UI words, no facts). */
  ui: {
    prev: string;
    next: string;
    pause: string; // stops the marquee
    play: string; // restarts it
    close: string;
    carousel: string; // aria-roledescription of a carousel region
    slide: string; // aria-roledescription of one slide
    slideOf: string; // {i} {n}
    scrollTable: string; // {name}: label of a table that scrolls sideways
    details: string; // {name}: opens a crane's detail sheet
    notStated: string; // screen-reader text for an empty comparison cell
    specification: string; // corner header of a comparison table
  };

  /** v2: labels for the manufacturer specification fields (src/content/crane-specs.ts, src/content/spec-rows.ts). */
  specs: {
    heading: string;
    disclaimer: string; // manufacturer figures, not Atlas-confirmed
    source: string;
    official: string; // source kind: the manufacturer's own document
    secondary: string; // source kind: a spec database or seller
    fields: Record<SpecFieldId, string>;
    units: Record<SpecUnit, string>;
  };
}

/** v2: rows a spec table can show, in display order. */
export type SpecFieldId =
  | 'maxCapacity'
  | 'capacityRadius'
  | 'boom'
  | 'tipHeight'
  | 'jib'
  | 'tipHeightJib'
  | 'maxRadius'
  | 'counterweight'
  | 'axles'
  | 'drive'
  | 'engine'
  | 'enginePower'
  | 'travelSpeed'
  | 'gradeability'
  | 'transportWeight'
  | 'dimensions'
  | 'trackWidth'
  | 'groundPressure'
  | 'country';

/**
 * v2 «اعثر على رافعتك»: copy of the parts that load on demand (load check, detail sheet, comparison). It lives in
 * src/content/crane-list-copy.ts, outside `Copy`, so it ships in those lazy chunks and not in the initial bundle.
 */
export interface CraneListCopy {
  /** v2 load check. Max ratings only: it never promises a lift. */
  load: {
    title: string;
    label: string;
    unit: string;
    caveat: string; // always shown: the rating applies at the shortest radius
    cta: string; // → #request
    clear: string; // icon button name
    invalid: string;
    result: { none: string; one: string; two: string; few: string; many: string }; // {n} {load}
  };
  /** v2 detail sheet. */
  sheet: {
    whatsapp: string;
    compareWith: string;
    photos: string; // {name}
    noteHeading: string;
    sourcesHeading: string;
    /** Link from the quick view to the crane's own page (/cranes/<id>/). */
    fullPage: string;
  };
  /** v2 comparison: key rows by default, every other row on demand (CompareModels.tsx). */
  compare: {
    title: string;
    lead: string;
    pickerLabel: string; // screen readers: the group of column model selects
    slotLabel: string; // {n}: screen-reader name of one column's model select
    nowComparing: string; // {models}: announced after the columns change
    request: string; // short "Request" under each model; the model is appended for screen readers
    tableName: string; // screen readers: the key-figures table
    moreName: string; // screen readers: the table of every other figure
    showAll: string;
    showKey: string;
    withJib: string; // under a tip height measured with the jib (the model states no boom-only figure)
    axles: { one: string; two: string; few: string; many: string }; // {n}: under the carrier type
    notes: string; // per-column disclosure: the rating note and the source documents
    missing: string; // screen-reader text of an empty cell
    missingNote: string;
    secondary: string; // screen-reader text of the * mark
    secondaryNote: string;
  };
  /** v2: spec groups in the sheet and the comparison. */
  groups: Record<SpecGroupId, string>;
  /** v2: overall dimensions, one row each (the comparison reads them across models). */
  dims: { length: string; width: string; height: string };
  /**
   * v2: a crane whose shown maximum is not the manufacturer's listed one (QUY250): the label used instead of
   * "Manufacturer rating", and the screen-reader text of the † mark on its capacity cell (the note explains it).
   */
  conflict: { label: string; mark: string };
  /** v2: what each maximum rating means, from the notes in crane-specs.ts (shown in the sheet and under the comparison). */
  capacityNotes: Record<Exclude<CraneId, 'cke2500'>, string>;
}

/** v2: groups of spec rows in the detail sheet and the comparison (src/sections/crane-list/lineup-data.ts). */
export type SpecGroupId = 'lifting' | 'boom' | 'carrier' | 'engine' | 'dimensions';

export type SpecUnit = 't' | 'm' | 'kw' | 'kmh' | 'pct' | 'mpa';

/** Photos that belong to one crane (the crane pages' story): the visible cranes' photos, Kobelco excluded. */
export type CranePhotoId = Exclude<PhotoId, '6398'>;

/**
 * The crane pages (/cranes/<id>/, /en/cranes/<id>/), copy deck §6c. Prerender-only: the page body is a static island
 * on the client (src/crane-page/), so these strings never ship in a browser bundle. The truth gate checks them too.
 */
export interface CranePageCopy {
  meta: {
    title: string; // {name} {type}
    description: string; // {name} {type} {lead} {boom}
    /** {capacity} {radius}: the rating part of the description; `capacityNoRadius` without a radius. */
    capacity: string;
    capacityNoRadius: string;
  };
  breadcrumb: { label: string; home: string; cranes: string };
  hero: { form: string };
  highlights: {
    title: string;
    continuation: string;
    lineup: string; // caption of the five capacity bars
    top: { boom: string; jib: string; counterweight: string }; // this crane is the largest of the five
    other: { boom: string; jib: string; counterweight: string }; // {value} {model}
  };
  story: { label: string }; // accessible name of the photo list; the heading is craneListCopy.sheet.photos
  load: {
    title: string;
    lead: string; // {capacity} {radius}
    leadNoRadius: string; // {capacity}
    leadNoCapacity: string; // where the shown capacity is not the manufacturer's listed one (QUY250)
    rest: string;
    needs: string; // heading of the three figures to send
  };
  rail: { title: string };
  /** The short caption of each crane photo (copy deck §7 where it has one, §6c for the rest); the site comes first. */
  captions: Record<CranePhotoId, { site: 'construction' | 'coast' | null; text: string }>;
}
