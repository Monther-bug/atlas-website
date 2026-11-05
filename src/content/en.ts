import type { Copy } from './types';

// Transcribed verbatim from docs/03-copy-deck.md (section numbers in comments).
// Normalisations and new strings are listed in the plan, Part B, task B.2.
// Do not reword here without updating the deck.

export const en: Copy = {
  lang: 'en',

  // §1
  meta: {
    title: 'Atlas Alshraa | Crane Hire and Heavy Transport in Libya',
    description:
      'Crane hire from smaller cranes to the largest ones, plus heavy transport, handling and oil services in Libya. Send your load details on WhatsApp.',
    ogTitle: 'Atlas Alshraa: Every project has the right crane',
    ogDescription:
      'Crane hire, heavy transport, handling and oil services. Tell us about your load and we will tell you which crane fits.',
    ogImageAlt: "A yellow mobile crane seen from below: the operator's cab, the telescopic boom and the hook against a blue sky with white clouds.",
  },

  // §2
  header: {
    skipLink: 'Skip to content',
    homeLabel: 'back to top',
    name: 'Atlas Alshraa',
    nameAlt: 'أطلس الصحراء',
    nav: { services: 'Services', cranes: 'Cranes', sites: 'On site', contact: 'Contact' },
    langSwitch: { text: 'عربي', label: 'عربي: اعرض الصفحة بالعربية' },
    request: 'Request a crane',
    call: { text: 'Call', label: 'Call us on {phone}' },
    menu: { open: 'Menu', close: 'Close menu', whatsapp: 'Message us on WhatsApp' },
  },

  // §3 + spec §5.2, §15.1
  hero: {
    h1Lead: 'From smaller cranes to the largest ones,',
    h1Main: 'every project has the right crane.',
    servicesLine: 'Crane hire · Heavy transport · Handling · Oil services',
    whatsapp: 'WhatsApp us',
    browse: 'Browse cranes',
  },

  // §4 class names
  craneTypes: {
    'rough-terrain': {
      full: 'Rough-terrain crane',
      chip: 'Rough-terrain',
      explainer: 'Built for uneven ground inside the site.',
    },
    'all-terrain': {
      full: 'All-terrain crane',
      chip: 'All-terrain',
      explainer: 'Drives on public roads and works on site.',
    },
    crawler: {
      full: 'Crawler crane',
      chip: 'Crawler',
      explainer: 'Moves on tracks that spread its weight, for heavy lifts.',
    },
  },

  // §4
  hoist: {
    title: 'Choose your crane by capacity',
    intro: "Scroll to see the cranes from smallest to largest. The big number is each crane's maximum capacity.",
    listHeading: 'Cranes from smallest to largest',
    skipToList: 'See all cranes',
    capacity: 'Max capacity',
    model: 'Model',
    type: 'Class',
    unit: 't',
    footnote:
      "Maximum capacity is the maker's rating at the shortest radius. What a crane can lift on your site depends on radius and height, which is why we ask for both.",
    closing: 'Not sure which size you need? Send us the load details and we will choose with you.',
    closingButton: 'Send the details',
    chapters: 'Go to a crane',
    ratingNotes: {
      gmk6350: "The 350 on the boom is the maker's rating in US tons, which is {capacity} metric.",
      quy250: "The model name says {capacity}; Fuwa's page lists 260 t. We show {capacity} until Atlas confirms it.",
    },
  },

  // §5
  services: {
    title: 'Our services',
    intro: 'Four services from one company. Ask for one, or put several in a single request.',
    ask: 'Ask about this service',
    combine: 'Combine them in one request',
    items: [
      {
        id: 'crane-hire',
        title: 'Crane hire',
        body: 'Cranes for hire. Send us the load weight, radius and lift height, and we will suggest the right crane for your job.',
        confirm: '[[CONFIRM: Every crane comes with an experienced operator.]]',
      },
      {
        id: 'heavy-transport',
        title: 'Heavy transport',
        body: 'We move heavy loads and large equipment [[CONFIRM: by road, on low-bed trailers]]. Tell us what the load is, what it weighs and where it needs to go, and we will plan the move with you.',
        confirm: null,
      },
      {
        id: 'handling',
        title: 'Handling and rigging',
        body: 'We lift, rig and move loads on site [[CONFIRM: with a rigging crew, slings and lifting gear, and a lift plan]]. Book handling on its own, or with crane hire and transport in one request.',
        confirm: null,
      },
      {
        id: 'oil-services',
        title: 'Oil services',
        body: 'Support for oil and gas work [[CONFIRM: exact scope, for example lifting and transport at oil fields]]. Tell us about the work and where it is, and we will tell you clearly what we can do.',
        confirm: null,
      },
    ],
  },

  // §8c (v2): Why Atlas lives in src/content/why.ts (prerender-only strings, kept out of the main chunk)

  // §6 + spec §15.8
  grid: {
    title: 'Find your crane',
    intro: 'Filter the models by type, open the full specification of each crane, and compare up to three side by side.',
    availability: 'Tell us your dates and we will confirm availability.',
    typeLabel: 'Type',
    bandLabel: 'Capacity',
    all: 'All',
    bands: {
      '0-60': 'Up to {max}',
      '61-200': '{min}–{max}',
      '201+': 'Over {min}',
    },
    count: { one: '{n} crane', two: '{n} cranes', few: '{n} cranes', many: '{n} cranes' },
    empty: 'No cranes match this filter.',
    showAll: 'Show all',
    card: {
      type: 'Type',
      capacity: 'Max capacity',
      request: 'Request this crane',
      formLink: 'Or use the request form',
      details: 'Details',
      rating: 'Manufacturer rating',
      atRadius: 'at {radius} radius',
      boomMax: 'Max boom length',
      secondary: 'From a spec database, not the manufacturer’s own document',
    },
    continuation: 'Compare the specs and request the one that fits your lift.',
    compareLink: 'Compare models',
    fits: 'Rated for {load} or more at its shortest radius',
    below: 'Its maximum rating is below {load}',
  },

  // §3a (v2, new copy from confirmed facts)
  about: {
    title: 'Atlas Alshraa is a Libyan joint-stock company.',
    statement: 'We help you choose the crane that fits your load and your site. Every crane photo on this site is real.',
    legalLabel: 'Legal name',
    legalName: 'شركة أطلس الصحراء المساهمة للخدمات النفطية والنقل الثقيل والمناولة وتأجير الرافعات',
    fieldsLead: 'The name covers four lines of work:',
    channelsLabel: 'Contact',
    facebook: 'Our Facebook page',
    email: 'Email',
    photosLink: 'See the site photos',
    values: [],
  },

  // §7
  sites: {
    title: 'On site',
    intro: 'These photos were taken at two places: a building site and a coastal site.',
    all: 'All',
    filterLabel: 'Choose a site',
    galleries: { construction: 'Building site', coast: 'Coastal site' },
    swipeHint: 'Swipe for more',
    open: 'View larger',
    prev: 'Previous',
    next: 'Next',
    counter: '{i} of {n}',
    close: 'Close',
    captions: {
      '6374': 'Building site · White counterweight with red chevrons, boom rising into a blue sky',
      '6376': "Building site · The operator's cab, door open",
      '6379': "Building site · The operator's cab from below, with its steel step",
      '6380': 'Building site · Crawler crane beside a multi-storey frame',
      '6382': 'Building site · Red crawler crane body under the lattice boom',
      '6388': 'Building site · All-terrain crane on outrigger pads by the scaffolding',
      '6393': 'Building site · Yellow crane body lettered GROVE, boom rising into a blue sky',
      '6360': 'Coastal site · Two counterweights side by side',
      '6364': 'Coastal site · Outriggers out, sling on the hook',
      '6396': 'Coastal site · All-terrain crane with the sea behind',
      '6397': 'Coastal site · Outriggers on pads near the water',
      '6398': 'Coastal site · Two cranes set up on the sand',
    },
  },

  // §8b
  documents: {
    title: 'Prequalification documents',
    intro: 'For procurement and prequalification teams. Download the files, or ask for them by email.',
    meta: 'PDF · {language} · Updated {date}',
    languages: { ar: 'Arabic', en: 'English', both: 'Arabic and English' },
    download: 'Download',
    emailRequest: 'Request by email',
    emailSubject: 'Document request: {document}',
    names: {
      profile: 'Company profile',
      'fleet-list': 'Crane list with capacities',
      inspection: 'Third-party inspection certificates',
      hse: 'HSE policy',
      iso: 'ISO certificates',
      insurance: 'Insurance certificate',
      cr: 'Commercial registration',
    },
  },

  // §9 + spec §5.8, §15.1
  form: {
    title: 'Which crane does your project need?',
    lead: 'Get in touch and leave the rest to us.',
    intro: 'Fill in only what you know. We need your phone number and the load weight. We will ask about the rest.',
    next: {
      title: 'What happens next',
      steps: ['You send your phone number and the load weight.', 'We contact you on that number.', 'We agree the crane and the details with you.'],
    },
    summary: { title: 'Your lift', note: 'This only repeats what you entered. We confirm the right crane with you.' },
    contact: {
      email: 'Email',
      phone: 'Phone',
      whatsapp: 'WhatsApp',
      address: 'Address',
      facebook: 'Our Facebook page',
    },
    groups: { details: 'Your details', lift: 'Lift details', site: 'Site and dates' },
    required: 'Required',
    optional: 'Optional',
    submit: 'Send request',
    busy: 'Sending…',
    handoff: 'Opening your messaging app to send the request.',
    whatsappAlt: 'Or send the same details on WhatsApp',
    privacy: 'We use your details only to reply to your request. [[CONFIRM]]',
    errorSummary: 'Some fields need a fix. Check the messages below, then send again.',
    fields: {
      name: {
        label: 'Your name',
        hint: 'So we know who to ask for.',
        tooLong: 'That name is too long. Keep it to 80 characters or fewer.',
      },
      company: {
        label: 'Company',
        hint: 'Company or organisation, if any.',
        tooLong: 'That name is too long. Keep it to 120 characters or fewer.',
      },
      phone: {
        label: 'Phone or WhatsApp number',
        hint: 'We will call or message you on this number. Add the country code if you are outside Libya.',
        empty: 'Enter a phone number so we can reach you.',
        format: 'This number looks incomplete. Check the digits and try again.',
      },
      crane: {
        label: 'Crane or service',
        hint: 'If you tapped "Request this crane", it is already selected here.',
        unsure: 'Not sure, help me choose',
        servicesGroup: 'Services',
        cranesGroup: 'Cranes',
      },
      weight: {
        label: 'Load weight (t)',
        hint: 'A rough figure is fine.',
        unit: 't',
        empty: 'Enter the load weight in tonnes. A rough figure is fine.',
        format: 'Enter a number above zero, such as 12 or 7.5.',
      },
      radius: {
        label: 'Lift radius (m)',
        hint: "The flat distance from the centre of the crane to the load. Leave it blank if you don't know.",
        unit: 'm',
        format: 'Enter a number in metres, or leave this blank.',
      },
      height: {
        label: 'Lift height (m)',
        hint: 'The highest point the load must reach, measured from the ground.',
        unit: 'm',
        format: 'Enter a number in metres, or leave this blank.',
      },
      site: {
        label: 'Site location',
        hint: 'City or area. You can paste a Google Maps link.',
        tooLong: 'That is too long. Keep it to 200 characters.',
      },
      start: {
        label: 'Start date',
        hint: 'When do you need the crane on site?',
        past: 'Pick today or a later date.',
      },
      duration: {
        label: 'Duration',
        hint: 'Your best guess is fine.',
        unsure: 'Not sure yet',
        options: {
          day: 'One day or less',
          week: 'Two days to a week',
          month: 'One week to a month',
          long: 'More than a month',
        },
      },
      message: {
        label: 'Message',
        hint: 'Anything else: what the load is, its size, site access, or whether you also need transport.',
        counter: '{n} / {max}',
        tooLong: 'Your message is too long. Keep it to 1,000 characters.',
      },
    },
    success: {
      title: 'We have your request',
      text: 'Thank you. We will call or message you on {phone}.',
      nudge: 'In a hurry? Message us on WhatsApp.',
      button: 'WhatsApp',
    },
    failure: {
      title: 'Your request did not go through',
      text: 'Something went wrong while sending. Your details are still in the form. Try again, or send them on WhatsApp or by email.',
      retry: 'Try again',
      whatsapp: 'Send on WhatsApp',
      email: 'Send by email',
      offline: 'You seem to be offline. Check your connection and try again.',
    },
    emailSubject: 'Website request: {crane}',
  },

  // §10
  whatsapp: {
    general: ['Hello Atlas Alshraa,', 'I found you through your website and would like to ask about your services.'].join('\n'),
    crane: [
      'Hello Atlas Alshraa,',
      'I would like to ask about the {model} ({class}).',
      'Load weight: ___ t',
      'Site location: ___',
      'Start date: ___',
    ].join('\n'),
    service: ['Hello Atlas Alshraa,', 'I would like to ask about {service}.', 'Details: ___'].join('\n'),
    request: [
      'Hello Atlas Alshraa,',
      'Request from your website:',
      'Name: {name}',
      'Company: {company}',
      'Phone: {phone}',
      'Crane or service: {crane}',
      'Load weight: {weight} t',
      'Lift radius: {radius} m',
      'Lift height: {height} m',
      'Site location: {site}',
      'Start date: {start}',
      'Duration: {duration}',
      'Notes: {message}',
    ].join('\n'),
    followUp: ['Hello Atlas Alshraa,', 'I just sent a request through your website. Name: {name}, phone: {phone}.'].join('\n'),
  },

  // §10 floating button + spec §5.5
  bar: {
    onHook: 'On the hook:',
    clear: 'Remove this crane from the request',
    whatsapp: 'WhatsApp',
    whatsappLabel: 'Message us on WhatsApp',
    tooltip: 'Ask us about a crane',
  },

  // §11
  footer: {
    name: 'Atlas Alshraa · For oil services',
    legalName:
      'Atlas Alshraa Joint-Stock Company for Oil Services, Heavy Transport, Handling and Crane Hire. [[CONFIRM: English spelling]]',
    tagline: 'Every project has the right crane.',
    servicesHeading: 'Services',
    pageHeading: 'On this page',
    pageLinks: { cranes: 'Cranes', sites: 'On site', request: 'Request a crane' },
    contactHeading: 'Contact',
    followHeading: 'Follow us',
    facebook: 'Facebook',
    copyright: '© {year} Atlas Alshraa. All rights reserved.',
    backToTop: 'Back to top',
  },

  // §12
  alt: {
    '6359': "A yellow mobile crane seen from below: the operator's cab, the telescopic boom and the hook against a blue sky with white clouds.",
    '6360': 'The back of two yellow cranes on a beach: a Grove counterweight marked RT700E and a Faun counterweight with red and white chevrons, with barrier tape on the sand.',
    '6363': 'Close view of the yellow cab of a Grove rough-terrain crane, with the boom rising above it into a cloudy blue sky.',
    '6364': 'The back of a Grove RT700E crane on a beach with its outriggers extended on pads; an orange lifting sling hangs from the hook and the sea is behind.',
    '6374': 'Looking up at the white counterweight of a Terex crane, lettered TEREX with red and white chevrons, as the boom rises straight into a deep blue sky.',
    '6375': 'A white Terex all-terrain crane on a building site, outriggers on steel pads and counterweight blocks stacked at the back, with a yellow crane boom rising behind it.',
    '6376': `The operator's cab of a white Terex AC200-1 crane with the door open; a label on the side reads "200T capacity class".`,
    '6379': 'A close view from below of the Terex AC200-1 cab, with its open door, steel step and red, amber and green lights.',
    '6380': 'A red FW.China QUY250 crawler crane with a tall lattice boom beside a multi-storey concrete building, with an office tower in the distance.',
    '6382': 'A close view of the red body of a crawler crane, lettered FW.CHINA and QUY250, under its lattice boom.',
    '6385': 'A red FW.China QUY250 crawler crane on its tracks with its counterweight blocks in place, next to a concrete building under construction.',
    '6388': 'A yellow Grove GMK6350 all-terrain crane, its boom marked "350 TON", set up on outrigger pads beside blue and red scaffolding.',
    '6389': 'A yellow Grove GMK6350 crane with its boom raised and the hook hanging, framed by a concrete slab with steel rebar sticking out at the top of the picture.',
    '6392': 'A yellow Grove all-terrain crane seen from the front corner on a concrete yard, boom raised, with building materials stacked on the left.',
    '6393': 'A close-up of the GROVE name on a yellow crane body, with the extended boom rising into a blue sky.',
    '6395': 'A yellow Faun all-terrain crane with its boom raised on a sandy shore, ringed by traffic cones and barrier tape, with a tipper trailer beside it.',
    '6396': 'A yellow Faun crane marked "ATF 60-3" on its cab, seen past a grey steel structure on a sandy shore, with the sea on the left.',
    '6397': 'The back of a yellow Faun all-terrain crane by the sea, outriggers extended, with black and white stripes on the beams.',
    '6398': 'Two yellow cranes, a Grove and a Faun, set up side by side on a beach with their booms raised against a blue sky, ringed by traffic cones.',
  },

  misc: {
    draftBadge: 'DRAFT · unverified',
    newTab: 'opens in a new tab',
  },

  ui: {
    prev: 'Previous',
    next: 'Next',
    pause: 'Pause motion',
    play: 'Play motion',
    close: 'Close',
    carousel: 'carousel',
    slide: 'slide',
    slideOf: '{i} of {n}',
    scrollTable: '{name}, scrolls sideways',
    details: '{name} details',
    notStated: 'Not stated',
    specification: 'Specification',
  },

  specs: {
    heading: 'Manufacturer specification',
    disclaimer: "These are the manufacturer's figures for this model, not figures Atlas Alshraa has confirmed for its own cranes.",
    source: 'Source',
    official: 'manufacturer document',
    secondary: 'spec database',
    fields: {
      maxCapacity: 'Max capacity',
      capacityRadius: 'At radius',
      boom: 'Main boom',
      tipHeight: 'Max tip height',
      jib: 'Longest jib',
      tipHeightJib: 'Tip height with jib',
      maxRadius: 'Max radius',
      counterweight: 'Counterweight',
      axles: 'Axles',
      drive: 'Drive',
      engine: 'Engine',
      enginePower: 'Engine power',
      travelSpeed: 'Top road speed',
      gradeability: 'Gradeability',
      transportWeight: 'Basic weight',
      dimensions: 'Dimensions (L × W × H)',
      trackWidth: 'Track width',
      groundPressure: 'Ground pressure',
      country: 'Made in',
    },
    units: { t: 't', m: 'm', kw: 'kW', kmh: 'km/h', pct: '%', mpa: 'MPa' },
  },
};
