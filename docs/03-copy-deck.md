# Atlas Alshraa: Copy deck, Arabic and English (Phase 6)

Draft of 4 November 2026, for review. No code is written here.
Sources: `01-brand-and-asset-audit.md` (facts, Facebook text, photos) and `02-creative-direction.md` (sections and form fields). Nothing in this deck goes beyond them. Where a fact is missing, there is a token.

---

## 0. How to read this deck

| Mark | Meaning | What the developer does |
|---|---|---|
| `[[TOKEN]]` | Real data that Atlas must supply (phone, city, capacity…) | Never publish the token. If the value is missing, hide the whole element |
| `[[CONFIRM: …]]` | A claim that reads well but needs a yes from Atlas | If Atlas confirms, keep the words and delete the marker. If not, cut that clause |
| `{variable}` | Filled in by the site at runtime (model name, form values, year) | Fill from data or from the form |
| HIDDEN UNTIL DATA | A whole block that stays out of the page until real facts arrive | Do not ship it with placeholders |

**Voice.** Arabic first. Clear Modern Standard Arabic in short sentences. One warm line from Atlas's own Facebook voice is kept, in the contact section only: «تواصلوا معانا وخلي الباقي علينا». English is plain, confident and short.

**Style rules**
- Tables list Arabic first, then English.
- Numbers: use Western digits (0–9) in both languages. Units: «طن» and «م» in Arabic; "t" and "m" in English, with a space (`350 t`).
- Name: "Atlas Alshraa" in English, as on the logo, until Atlas confirms the spelling (see section 13).
- Latin model names inside Arabic text (Grove RT700E, Terex AC200-1…) should be wrapped in `<bdi>` or a `lang="en"` span so the line order stays correct.
- Ownership is not confirmed. The copy never says "our cranes" or "our fleet" until Atlas confirms it. Where that wording is ready to switch on, it is noted.

---

## 1. SEO and Open Graph

Character counts were checked (limit 155 per language): title 52 AR / 55 EN; meta description 131 AR / 145 EN; `og:description` 102 AR / 118 EN.

| Element | العربية | English |
|---|---|---|
| `<title>` | أطلس الصحراء \| تأجير الرافعات والنقل الثقيل في ليبيا | Atlas Alshraa \| Crane Hire and Heavy Transport in Libya |
| Meta description | تأجير الرافعات (الكرينات) من الصغيرة إلى الكبيرة، ونقل ثقيل ومناولة وخدمات نفطية في ليبيا. أرسل وزن الحمولة وموقع العمل عبر واتساب. | Crane hire from smaller cranes to the largest ones, plus heavy transport, handling and oil services in Libya. Send your load details on WhatsApp. |
| `og:title` | أطلس الصحراء: لكل مشروع رافعته المناسبة | Atlas Alshraa: Every project has the right crane |
| `og:description` | تأجير الرافعات والنقل الثقيل والمناولة والخدمات النفطية. أخبرنا بحمولتك، ونخبرك بالرافعة التي تناسبها. | Crane hire, heavy transport, handling and oil services. Tell us about your load and we will tell you which crane fits. |
| `og:site_name` | أطلس الصحراء | Atlas Alshraa |
| `og:locale` | `ar_LY` | `en_GB` (as `og:locale:alternate` on the Arabic page, and the reverse) |
| `og:image` | IMG_6398, clean export, cropped 1200 × 630 from the top | same image |
| `og:image:alt` | رافعتان صفراوان منصوبتان جنباً إلى جنب على الشاطئ وذراعاهما مرفوعان نحو سماء زرقاء. | Two yellow cranes set up side by side on a beach, booms raised against a blue sky. |
| `og:url` / canonical | `https://[[DOMAIN]]/ar/` | `https://[[DOMAIN]]/` |

*Search phrases to cover, taken from Atlas's own Facebook hashtags and legal name:* تأجير رافعات، رافعات، كرينات، معدات ثقيلة، مشاريع إنشائية. English: crane hire Libya, heavy transport Libya. Twitter/X card: reuse the `og:` values.

---

## 2. Header

| Element | العربية | English |
|---|---|---|
| Skip link | انتقل إلى المحتوى | Skip to content |
| Logo link `aria-label` | أطلس الصحراء، العودة إلى أعلى الصفحة | Atlas Alshraa, back to top |
| Typeset name next to badge (needs Atlas approval) | أطلس الصحراء | Atlas Alshraa |
| Nav 1 | الخدمات | Services |
| Nav 2 | الرافعات *(switch to «الأسطول» once ownership is confirmed)* | Cranes *(switch to "Fleet" once ownership is confirmed)* |
| Nav 3 | مواقع العمل | On site |
| Nav 4 | تواصل معنا | Contact |
| Language switch, visible text | English | عربي |
| Language switch `aria-label` | View this page in English *(set `lang="en"`)* | اعرض الصفحة بالعربية *(set `lang="ar"`)* |
| Primary button | اطلب رافعة | Request a crane |
| Call button (shown only when `[[PHONE]]` exists) | اتصل | Call |
| Call button `aria-label` | اتصل بنا على [[PHONE]] | Call us on [[PHONE]] |
| Mobile menu open | القائمة | Menu |
| Mobile menu close | إغلاق القائمة | Close menu |
| WhatsApp link inside mobile menu | راسلنا على واتساب | Message us on WhatsApp |

---

## 3. Hero

| Element | العربية | English |
|---|---|---|
| Eyebrow | تأجير الرافعات · النقل الثقيل · المناولة · الخدمات النفطية | Crane hire · Heavy transport · Handling · Oil services |
| H1 (Atlas's own line, verbatim) | من الرافعات الصغيرة للكبيرات، لكل مشروع رافعته المناسبة | From smaller cranes to the largest ones, every project has the right crane. |
| Sub-line | أرسل لنا وزن الحمولة وموقع العمل، ونخبرك بالرافعة التي تناسب عملك. | Send us the load weight and the site location. We will tell you which crane fits the job. |
| Button 1 (primary) → WhatsApp, template A | راسلنا على واتساب | WhatsApp us |
| Button 2 (secondary) → contact form | اطلب عرض سعر | Request a quote |
| Readout chip label (HIDDEN UNTIL DATA) | نطاق السعة | Capacity range |
| Readout chip value (HIDDEN UNTIL DATA) | من [[MIN_CAPACITY]] إلى [[MAX_CAPACITY]] طن | [[MIN_CAPACITY]]–[[MAX_CAPACITY]] t |
| Scroll cue | مرّر للأسفل | Scroll down |

*Buttons follow `02` (WhatsApp + Request a quote). The audit's alternative for button 2 is «تصفّح الرافعات» / "Browse cranes", which would give the hero a path that the header button does not already cover. Pick one.*

Hero photo alt text: see section 12 (IMG_6398 or IMG_6359).

---

## 4. The Capacity Scale

| Element | العربية | English |
|---|---|---|
| Section label (mono) | السعة | Capacity |
| Title | اختر رافعتك حسب السعة | Choose your crane by capacity |
| Intro | مرّر لترى الرافعات مرتّبة من الأصغر إلى الأكبر. الرقم الكبير هو أقصى حمولة لكل رافعة. | Scroll to see the cranes from smallest to largest. The big number is each crane's maximum capacity. |
| Readout label: capacity | أقصى حمولة | Max capacity |
| Readout label: model | الطراز | Model |
| Readout label: class | الفئة | Class |
| Unit | طن | t |
| Capacity not yet confirmed (fallback) | السعة: اسألنا | Capacity: ask us |
| Footnote | أقصى حمولة هي تصنيف الشركة المصنّعة عند أقصر نصف قطر. ما ترفعه الرافعة في موقعك يعتمد على نصف القطر والارتفاع، لذلك نسألك عنهما. | Maximum capacity is the maker's rating at the shortest radius. What a crane can lift on your site depends on radius and height, which is why we ask for both. |
| Mobile swipe hint | اسحب لرؤية المزيد | Swipe for more |
| Closing line | لست متأكداً من الحجم؟ أرسل لنا تفاصيل الحمولة ونختار معك. | Not sure which size you need? Send us the load details and we will choose with you. |
| Closing button → form | أرسل التفاصيل | Send the details |

**Class names**

| Class | العربية (full) | العربية (chip) | English (full) | English (chip) | One-line explainer AR | One-line explainer EN |
|---|---|---|---|---|---|---|
| Rough-terrain | رافعة للأراضي الوعرة | أراضٍ وعرة | Rough-terrain crane | Rough-terrain | تعمل على الأرض غير الممهدة داخل موقع العمل. | Built for uneven ground inside the site. |
| All-terrain | رافعة لكل التضاريس | كل التضاريس | All-terrain crane | All-terrain | تسير على الطرق العامة وتعمل في الموقع. | Drives on public roads and works on site. |
| Crawler | رافعة مجنزرة | مجنزرة | Crawler crane | Crawler | تتحرك على جنازير توزّع وزنها على الأرض، للرفعات الثقيلة. | Moves on tracks that spread its weight, for heavy lifts. |

**Stops on the scale** (order them by the capacities Atlas confirms; the order below follows `02`)

| Stop | Model | Class | Readout | Photo |
|---|---|---|---|---|
| 1 | Grove RT700E | Rough-terrain | [[CAPACITY:RT700E]] t | 6359 |
| 2 | Faun ATF 60-3 [[CONFIRM: model; the cab reads "ATF 60-3"]] | All-terrain | [[CAPACITY:ATF]] t | 6397 |
| 3 | Terex AC200-1 | All-terrain | [[CAPACITY:AC200-1]] t | 6375 (6374 needs a clean export) |
| 4 | FW.China QUY250 | Crawler | [[CAPACITY:QUY250]] t | 6380 |
| 5 | Kobelco CKE2500. HIDDEN until Atlas confirms it may be shown | Crawler | [[CAPACITY:CKE2500]] t | 6367 |
| 6 | Grove GMK6350 | All-terrain | [[CAPACITY:GMK6350]] t | 6389 |

*`02` says capacities appear only once Atlas confirms them. Until then, either hold the whole scene or show model and class with the "Capacity: ask us" fallback.*

---

## 5. Services

| Element | العربية | English |
|---|---|---|
| Title | خدماتنا | Our services |
| Intro | أربع خدمات في شركة واحدة. اطلب خدمة واحدة، أو اجمع أكثر من خدمة في طلب واحد. | Four services from one company. Ask for one, or put several in a single request. |
| Link on each service → WhatsApp, template C | اسأل عن هذه الخدمة | Ask about this service |

**01. Crane hire**

| | العربية | English |
|---|---|---|
| Title | تأجير الرافعات | Crane hire |
| Text | رافعات للإيجار، من الرافعات الصغيرة إلى الكبيرة. أرسل لنا وزن الحمولة ونصف القطر وارتفاع الرفع، ونقترح عليك الرافعة المناسبة لعملك. | Cranes for hire, from smaller cranes to the largest ones. Send us the load weight, radius and lift height, and we will suggest the right crane for your job. |
| Add if confirmed | [[CONFIRM: كل رافعة تأتي مع مشغّل ذي خبرة.]] | [[CONFIRM: Every crane comes with an experienced operator.]] |

**02. Heavy transport**

| | العربية | English |
|---|---|---|
| Title | النقل الثقيل | Heavy transport |
| Text | ننقل الأحمال الثقيلة والمعدات الكبيرة [[CONFIRM: براً، على مقطورات منخفضة (لوبد)]]. أخبرنا بنوع الحمولة ووزنها ووجهتها، ونخطط معك لعملية النقل. | We move heavy loads and large equipment [[CONFIRM: by road, on low-bed trailers]]. Tell us what the load is, what it weighs and where it needs to go, and we will plan the move with you. |

**03. Handling (lifting and rigging)**

| | العربية | English |
|---|---|---|
| Title | المناولة | Handling and rigging |
| Text | نرفع الأحمال ونربطها ونحرّكها داخل موقع العمل [[CONFIRM: مع فريق ربط ومعدات الربط والرفع وخطة رفع]]. اطلب المناولة وحدها، أو مع تأجير الرافعة والنقل في طلب واحد. | We lift, rig and move loads on site [[CONFIRM: with a rigging crew, slings and lifting gear, and a lift plan]]. Book handling on its own, or with crane hire and transport in one request. |

**04. Oil services**

| | العربية | English |
|---|---|---|
| Title | الخدمات النفطية | Oil services |
| Text | خدمات مساندة لأعمال النفط والغاز [[CONFIRM: النطاق بالتحديد، مثل الرفع والنقل في الحقول]]. أخبرنا بطبيعة العمل وموقعه، ونجيبك بوضوح عمّا نستطيع تقديمه. | Support for oil and gas work [[CONFIRM: exact scope, for example lifting and transport at oil fields]]. Tell us about the work and where it is, and we will tell you clearly what we can do. |

*No photo for Oil services until Atlas supplies a real one (audit: no stock).*

---

## 6. Fleet grid

| Element | العربية | English |
|---|---|---|
| Title | اعثر على رافعتك *(switch to «أسطولنا» once ownership is confirmed)* | Find your crane *(switch to "Our fleet" once ownership is confirmed)* |
| Intro | اعرض الرافعات حسب النوع أو السعة، ثم اطلب الرافعة التي تناسبك عبر واتساب. | Filter by type or capacity, then request the crane you need on WhatsApp. |
| Availability line | أخبرنا بالتاريخ، ونؤكد لك التوفر. | Tell us your dates and we will confirm availability. |
| Filter group 1 label | النوع | Type |
| Chip | الكل | All |
| Chip | أراضٍ وعرة | Rough-terrain |
| Chip | كل التضاريس | All-terrain |
| Chip | مجنزرة | Crawler |
| Filter group 2 label (HIDDEN until capacities are confirmed) | السعة | Capacity |
| Chip | حتى 60 طن | Up to 60 t |
| Chip | من 60 إلى 200 طن | 60–200 t |
| Chip | أكثر من 200 طن | Over 200 t |
| Reset | إظهار الكل | Show all |
| Result count, 1 | رافعة واحدة | 1 crane |
| Result count, 2 | رافعتان | 2 cranes |
| Result count, 3–10 | {n} رافعات | {n} cranes |
| Result count, 11+ | {n} رافعة | {n} cranes |
| Empty filter | لا توجد رافعة في هذا التصنيف حالياً. أرسل لنا تفاصيل الحمولة، ونبحث معك عن حل. | No crane matches this filter yet. Send us your load details and we will look for an option with you. |

*Band rule: "Up to 60 t" includes 60. "60–200 t" means above 60 up to 200. Bands are set from the confirmed capacity only.*

**Card labels**

| Element | العربية | English |
|---|---|---|
| Model | الطراز | Model |
| Type | النوع | Type |
| Max capacity | أقصى حمولة | Max capacity |
| Capacity value | {capacity} طن | {capacity} t |
| Capacity fallback | اسألنا | Ask us |
| Units available (HIDDEN UNTIL DATA) | العدد: [[QTY:{model}]] | Units: [[QTY:{model}]] |
| Main boom (HIDDEN UNTIL DATA) | طول الذراع الرئيسي: [[BOOM:{model}]] م | Main boom: [[BOOM:{model}]] m |
| Load chart link (HIDDEN UNTIL DATA) | جدول الأحمال (PDF) | Load chart (PDF) |
| Button → WhatsApp, template B | اطلب هذه الرافعة | Request this crane |
| Button `aria-label` | اطلب الرافعة {model} عبر واتساب | Request the {model} on WhatsApp |
| Text link → form, crane pre-selected | أو استخدم نموذج الطلب | Or use the request form |

**Card data**

| Card | Model | Type AR | Type EN | Capacity | Photos | Status |
|---|---|---|---|---|---|---|
| 1 | Grove RT700E | رافعة للأراضي الوعرة | Rough-terrain crane | [[CAPACITY:RT700E]] | 6359, 6360, 6363, 6364 | [[OWNED_OR_PARTNER:RT700E]] |
| 2 | Faun ATF 60-3 [[CONFIRM: model]] | رافعة لكل التضاريس | All-terrain crane | [[CAPACITY:ATF]] | 6395, 6396, 6397 | [[OWNED_OR_PARTNER:ATF]] |
| 3 | Terex AC200-1 | رافعة لكل التضاريس | All-terrain crane | [[CAPACITY:AC200-1]] | 6374, 6375, 6376, 6379 | [[OWNED_OR_PARTNER:AC200-1]] |
| 4 | FW.China QUY250 | رافعة مجنزرة | Crawler crane | [[CAPACITY:QUY250]] | 6380, 6382, 6385 | [[OWNED_OR_PARTNER:QUY250]] |
| 5 | Kobelco CKE2500 | رافعة مجنزرة | Crawler crane | [[CAPACITY:CKE2500]] | 6367, 6370, 6371 | HIDDEN: carries another company's branding |
| 6 | Grove GMK6350 | رافعة لكل التضاريس | All-terrain crane | [[CAPACITY:GMK6350]] | 6388, 6389, 6392, 6393 | [[OWNED_OR_PARTNER:GMK6350]] |

---

## 7. Sites gallery

| Element | العربية | English |
|---|---|---|
| Title | من مواقع العمل | On site |
| Intro | كل الصور في هذه الصفحة حقيقية، التُقطت في موقعين: موقع إنشاءات وموقع ساحلي. | Every photo on this page is real. They were taken at two places: a building site and a coastal site. |
| Tab | الكل | All |
| Tab | موقع إنشاءات | Building site |
| Tab | موقع ساحلي | Coastal site |
| Previous | السابق | Previous |
| Next | التالي | Next |
| Counter | {i} من {n} | {i} of {n} |
| Open larger | تكبير الصورة | View larger |
| Close | إغلاق | Close |

**Captions** (no project names, no place names; Kobelco photos 6367, 6370 and 6371 stay out until Atlas confirms)

| Photo | العربية | English |
|---|---|---|
| 6398 | موقع ساحلي · رافعتان على مساندهما فوق الرمل | Coastal site · Two cranes set up on the sand |
| 6364 | موقع ساحلي · المساند ممدودة وحزام الرفع على الخطاف | Coastal site · Outriggers out, sling on the hook |
| 6360 | موقع ساحلي · ثقلا الموازنة لرافعتين جنباً إلى جنب | Coastal site · Two counterweights side by side |
| 6395 | موقع ساحلي · رافعة لكل التضاريس بجانب مقطورة قلّابة | Coastal site · All-terrain crane beside a tipper trailer (not in gallery, spec §4.2) |
| 6396 | موقع ساحلي · رافعة لكل التضاريس والبحر خلفها | Coastal site · All-terrain crane with the sea behind |
| 6397 | موقع ساحلي · المساند على قواعدها قرب البحر | Coastal site · Outriggers on pads near the water |
| 6380 | موقع إنشاءات · رافعة مجنزرة بجانب مبنى من عدة طوابق | Building site · Crawler crane beside a multi-storey frame |
| 6385 | موقع إنشاءات · رافعة مجنزرة وكتل الموازنة مركّبة | Building site · Crawler crane with its counterweight in place (not in gallery, spec §4.2) |
| 6388 | موقع إنشاءات · رافعة لكل التضاريس على قواعد المساند بجانب السقالات | Building site · All-terrain crane on outrigger pads by the scaffolding |
| 6389 | موقع إنشاءات · الذراع مرفوع والخطاف جاهز | Building site · Boom up, hook ready (not in gallery, spec §4.2) |
| 6375 | موقع إنشاءات · المساند على ألواح فولاذية | Building site · Outriggers on steel pads (not in gallery, spec §4.2) |
| 6376 | موقع إنشاءات · كابينة المشغّل وبابها مفتوح | Building site · The operator's cab, door open |
| 6374 | موقع إنشاءات · ثقل موازنة أبيض بخطوط حمراء والذراع يرتفع نحو سماء زرقاء | Building site · White counterweight with red chevrons, boom rising into a blue sky |
| 6379 | موقع إنشاءات · كابينة المشغّل من الأسفل بدرجتها المعدنية | Building site · The operator's cab from below, with its steel step |
| 6382 | موقع إنشاءات · جسم رافعة مجنزرة حمراء تحت الذراع الشبكي | Building site · Red crawler crane body under the lattice boom |
| 6393 | موقع إنشاءات · جسم رافعة صفراء عليه اسم GROVE، والذراع يرتفع نحو سماء زرقاء | Building site · Yellow crane body lettered GROVE, boom rising into a blue sky |

---

## 8. Why Atlas and Documents (HIDDEN UNTIL DATA)

The whole block stays out of the page until Atlas sends real facts. Show a proof point only when its token is filled. Suggested rule: at least three confirmed points before the block goes live. No invented numbers.

**8a. Why Atlas**

| Element | العربية | English |
|---|---|---|
| Title | لماذا أطلس الصحراء | Why Atlas Alshraa |
| Intro | حقائق ووثائق لملف التأهيل الخاص بك. | Facts and documents for your prequalification file. |
| Point: experience | نعمل منذ [[FOUNDING_YEAR]] | Working since [[FOUNDING_YEAR]] |
| Point: range | سعات من [[MIN_CAPACITY]] إلى [[MAX_CAPACITY]] طن | Capacities from [[MIN_CAPACITY]] t to [[MAX_CAPACITY]] t |
| Point: fleet size (only if owned) | [[FLEET_COUNT]] رافعة في الأسطول | [[FLEET_COUNT]] cranes in the fleet |
| Point: regions | نعمل في [[REGIONS]] | We work in [[REGIONS]] |
| Point: operators | مشغّلون معتمدون من [[OPERATOR_CERT_BODY]] | Operators certified by [[OPERATOR_CERT_BODY]] |
| Point: inspection | فحص الرافعات من طرف ثالث: [[INSPECTION_BODY]] | Third-party crane inspection: [[INSPECTION_BODY]] |
| Point: insurance | التأمين: [[INSURANCE]] | Insurance: [[INSURANCE]] |
| Point: references (written permission only) | عملاء ومشاريع: [[CLIENTS_PROJECTS]] | Clients and projects: [[CLIENTS_PROJECTS]] |

**8b. Documents**

| Element | العربية | English |
|---|---|---|
| Title | وثائق التأهيل المسبق | Prequalification documents |
| Intro | لفرق المشتريات والتأهيل. حمّل الملفات، أو اطلبها بالبريد الإلكتروني. | For procurement and prequalification teams. Download the files, or ask for them by email. |
| Meta line per file | PDF · {size} · {language} · آخر تحديث {date} | PDF · {size} · {language} · Updated {date} |
| Language values | عربي / إنجليزي / عربي وإنجليزي | Arabic / English / Arabic and English |
| Download button | تحميل | Download |
| Email request button | اطلبه بالبريد | Request by email |
| Email subject (mailto) | طلب وثيقة: {document} | Document request: {document} |

Document slots. List only the files Atlas actually has:

| Slot | العربية | English |
|---|---|---|
| [[DOC:PROFILE]] | ملف الشركة | Company profile |
| [[DOC:FLEET_LIST]] | قائمة الرافعات وسعاتها | Crane list with capacities |
| [[DOC:INSPECTION]] | شهادات الفحص من طرف ثالث | Third-party inspection certificates |
| [[DOC:HSE]] | سياسة الصحة والسلامة والبيئة | HSE policy |
| [[DOC:ISO]] | شهادات ISO | ISO certificates |
| [[DOC:INSURANCE]] | شهادة التأمين | Insurance certificate |
| [[DOC:CR]] | السجل التجاري | Commercial registration |

---

## 9. Contact and "Request a crane" form

| Element | العربية | English |
|---|---|---|
| Eyebrow (the one warm line from Facebook) | تواصلوا معانا وخلي الباقي علينا | Get in touch and leave the rest to us. |
| Title | اطلب رافعة | Request a crane |
| Intro | املأ ما تعرفه فقط. نحتاج رقم هاتفك ووزن الحمولة، وسنسألك عن الباقي. | Fill in only what you know. We need your phone number and the load weight. We will ask about the rest. |

**Contact details panel**

| Element | العربية | English |
|---|---|---|
| Email label + value | البريد الإلكتروني: atlasalsahralibya@gmail.com | Email: atlasalsahralibya@gmail.com |
| Phone | الهاتف: [[PHONE]] | Phone: [[PHONE]] |
| WhatsApp | واتساب: [[WHATSAPP]] | WhatsApp: [[WHATSAPP]] |
| Address | العنوان: [[ADDRESS]]، [[CITY]] | Address: [[ADDRESS]], [[CITY]] |
| Hours | ساعات العمل: [[HOURS]] | Hours: [[HOURS]] |
| Map link | افتح الموقع في خرائط جوجل | Open in Google Maps |
| Facebook link | صفحتنا على فيسبوك | Our Facebook page |
| New-tab note (screen readers) | يفتح في علامة تبويب جديدة | opens in a new tab |

**Form furniture**

| Element | العربية | English |
|---|---|---|
| Group 1 legend | بياناتك | Your details |
| Group 2 legend | تفاصيل الرفع | Lift details |
| Group 3 legend | الموقع والموعد | Site and dates |
| Required tag | مطلوب | Required |
| Optional tag | اختياري | Optional |
| Submit | أرسل الطلب | Send request |
| Submit, busy | جارٍ الإرسال… | Sending… |
| Hand-off (no endpoint, announced) | نفتح لك تطبيق المراسلة لإرسال الطلب. | Opening your messaging app to send the request. |
| WhatsApp alternative → template D | أو أرسل التفاصيل نفسها عبر واتساب | Or send the same details on WhatsApp |
| Privacy line | نستخدم بياناتك للرد على طلبك فقط. [[CONFIRM]] | We use your details only to reply to your request. [[CONFIRM]] |
| Error summary (top of form) | بعض الحقول تحتاج إلى تصحيح. راجع الرسائل أدناه، ثم أرسل مرة أخرى. | Some fields need a fix. Check the messages below, then send again. |

**Fields** (per `02`: only phone and load weight are required)

*1. Name (optional)*

| | العربية | English |
|---|---|---|
| Label | الاسم | Your name |
| Hint | كما تحب أن نناديك. | So we know who to ask for. |
| Error: too long | الاسم طويل جداً. اكتبه في 80 حرفاً أو أقل. | That name is too long. Keep it to 80 characters or fewer. |

*2. Company (optional)*

| | العربية | English |
|---|---|---|
| Label | الشركة | Company |
| Hint | اسم الشركة أو الجهة، إن وُجد. | Company or organisation, if any. |
| Error: too long | الاسم طويل جداً. اكتبه في 120 حرفاً أو أقل. | That name is too long. Keep it to 120 characters or fewer. |

*3. Phone (required)*

| | العربية | English |
|---|---|---|
| Label | رقم الهاتف أو واتساب | Phone or WhatsApp number |
| Hint | نتصل بك أو نراسلك على هذا الرقم. أضف رمز الدولة إن كنت خارج ليبيا. | We will call or message you on this number. Add the country code if you are outside Libya. |
| Error: empty | أدخل رقم هاتف لنتواصل معك. | Enter a phone number so we can reach you. |
| Error: format | يبدو أن الرقم غير مكتمل. تأكد من الأرقام وحاول مرة أخرى. | This number looks incomplete. Check the digits and try again. |

*4. Crane or service (optional; pre-filled from a fleet card or service link)*

| | العربية | English |
|---|---|---|
| Label | الرافعة أو الخدمة | Crane or service |
| Hint | إن ضغطت «اطلب هذه الرافعة»، ستجدها مختارة هنا. | If you tapped "Request this crane", it is already selected here. |
| Option (default) | لست متأكداً، ساعدوني في الاختيار | Not sure, help me choose |
| Option group | الخدمات | Services |
| Options | تأجير الرافعات / النقل الثقيل / المناولة / الخدمات النفطية | Crane hire / Heavy transport / Handling and rigging / Oil services |
| Option group | الرافعات | Cranes |
| Options | {model} لكل رافعة معروضة | {model} for each crane on show |

*5. Load weight, t (required)*

| | العربية | English |
|---|---|---|
| Label | وزن الحمولة (طن) | Load weight (t) |
| Unit suffix | طن | t |
| Hint | يكفي رقم تقريبي. | A rough figure is fine. |
| Error: empty | أدخل وزن الحمولة بالطن. يكفي رقم تقريبي. | Enter the load weight in tonnes. A rough figure is fine. |
| Error: format | أدخل رقماً أكبر من صفر، مثل 12 أو 7.5. | Enter a number above zero, such as 12 or 7.5. |

*Design note: if the visitor picks "Oil services", consider making this field optional. Decide with Atlas.*

*6. Lift radius, m (optional)*

| | العربية | English |
|---|---|---|
| Label | نصف قطر الرفع (م) | Lift radius (m) |
| Hint | المسافة الأفقية من مركز الرافعة إلى الحمولة. اترك الحقل فارغاً إن لم تعرفها. | The flat distance from the centre of the crane to the load. Leave it blank if you don't know. |
| Error: format | أدخل رقماً بالمتر، أو اترك الحقل فارغاً. | Enter a number in metres, or leave this blank. |

*7. Lift height, m (optional)*

| | العربية | English |
|---|---|---|
| Label | ارتفاع الرفع (م) | Lift height (m) |
| Hint | أعلى نقطة يجب أن تصل إليها الحمولة، من سطح الأرض. | The highest point the load must reach, measured from the ground. |
| Error: format | أدخل رقماً بالمتر، أو اترك الحقل فارغاً. | Enter a number in metres, or leave this blank. |

*8. Site location (optional)*

| | العربية | English |
|---|---|---|
| Label | موقع العمل | Site location |
| Hint | المدينة أو المنطقة. يمكنك لصق رابط من خرائط جوجل. | City or area. You can paste a Google Maps link. |
| Error: too long | النص طويل جداً. اختصره إلى 200 حرف. | That is too long. Keep it to 200 characters. |

*9. Start date (optional)*

| | العربية | English |
|---|---|---|
| Label | تاريخ البدء | Start date |
| Hint | متى تحتاج الرافعة في الموقع؟ | When do you need the crane on site? |
| Error: past date | اختر تاريخ اليوم أو تاريخاً لاحقاً. | Pick today or a later date. |

*10. Duration (optional, select)*

| | العربية | English |
|---|---|---|
| Label | المدة | Duration |
| Hint | تقديرك يكفي. | Your best guess is fine. |
| Options | يوم واحد أو أقل / من يومين إلى أسبوع / من أسبوع إلى شهر / أكثر من شهر / لا أعرف بعد | One day or less / Two days to a week / One week to a month / More than a month / Not sure yet |

*11. Message (optional)*

| | العربية | English |
|---|---|---|
| Label | رسالة | Message |
| Hint | أي تفاصيل أخرى: نوع الحمولة ومقاساتها، وصعوبة الوصول إلى الموقع، وهل تحتاج إلى نقل أيضاً. | Anything else: what the load is, its size, site access, or whether you also need transport. |
| Counter | {n} من 1000 | {n} / 1,000 |
| Error: too long | الرسالة طويلة. اختصرها إلى 1000 حرف. | Your message is too long. Keep it to 1,000 characters. |

**After sending**

| Element | العربية | English |
|---|---|---|
| Success title | وصل طلبك | We have your request |
| Success text | شكراً لك. سنتصل بك أو نراسلك على الرقم {phone}. | Thank you. We will call or message you on {phone}. |
| Success, reply time (HIDDEN UNTIL DATA) | نرد عادةً خلال [[RESPONSE_TIME]]. | We usually reply within [[RESPONSE_TIME]]. |
| Success, nudge | مستعجل؟ راسلنا على واتساب. | In a hurry? Message us on WhatsApp. |
| Success button → template E | واتساب | WhatsApp |
| Failure title | لم يصل طلبك | Your request did not go through |
| Failure text | حدثت مشكلة أثناء الإرسال، وبياناتك ما زالت في النموذج. حاول مرة أخرى، أو أرسلها عبر واتساب أو البريد الإلكتروني. | Something went wrong while sending. Your details are still in the form. Try again, or send them on WhatsApp or by email. |
| Failure button 1 | حاول مرة أخرى | Try again |
| Failure button 2 → template D | أرسل عبر واتساب | Send on WhatsApp |
| Failure button 3 → mailto | أرسل بالبريد الإلكتروني | Send by email |
| Offline | لا يوجد اتصال بالإنترنت. تحقق من الاتصال، ثم حاول مرة أخرى. | You seem to be offline. Check your connection and try again. |
| Email fallback subject | طلب من الموقع: {crane_or_service} | Website request: {crane_or_service} |
| Email fallback body | Same lines as template D | Same lines as template D |

---

## 10. WhatsApp messages and floating button

All links use `https://wa.me/[[WHATSAPP_INTL]]?text={URL-encoded message}`. `[[WHATSAPP_INTL]]` is the number in international format, digits only. In template D, drop any line whose field is empty. The `___` blanks are left for the visitor to fill in WhatsApp.

**A. General** (floating button, hero, mobile menu)

```text
السلام عليكم، أطلس الصحراء.
تعرّفت عليكم من خلال موقعكم الإلكتروني، وأريد الاستفسار عن خدماتكم.
```
```text
Hello Atlas Alshraa,
I found you through your website and would like to ask about your services.
```

**B. Per crane** (fleet card "Request this crane", Capacity Scale)

```text
السلام عليكم، أطلس الصحراء.
أريد الاستفسار عن الرافعة {model} ({class_ar}).
وزن الحمولة: ___ طن
موقع العمل: ___
تاريخ البدء: ___
```
```text
Hello Atlas Alshraa,
I would like to ask about the {model} ({class_en}).
Load weight: ___ t
Site location: ___
Start date: ___
```

**C. Per service** (services section)

```text
السلام عليكم، أطلس الصحراء.
أريد الاستفسار عن {service_ar}.
التفاصيل: ___
```
```text
Hello Atlas Alshraa,
I would like to ask about {service_en}.
Details: ___
```

**D. Full request** (form fallback when there is no backend, or after a failed send)

```text
السلام عليكم، أطلس الصحراء.
طلب من الموقع الإلكتروني:
الاسم: {name}
الشركة: {company}
الهاتف: {phone}
الرافعة أو الخدمة: {crane_or_service}
وزن الحمولة: {weight} طن
نصف قطر الرفع: {radius} م
ارتفاع الرفع: {height} م
موقع العمل: {site}
تاريخ البدء: {start_date}
المدة: {duration}
ملاحظات: {message}
```
```text
Hello Atlas Alshraa,
Request from your website:
Name: {name}
Company: {company}
Phone: {phone}
Crane or service: {crane_or_service}
Load weight: {weight} t
Lift radius: {radius} m
Lift height: {height} m
Site location: {site}
Start date: {start_date}
Duration: {duration}
Notes: {message}
```

**E. Follow-up after a successful form send**

```text
السلام عليكم، أطلس الصحراء.
أرسلت الآن طلباً عبر موقعكم الإلكتروني باسم {name}، ورقمي {phone}.
```
```text
Hello Atlas Alshraa,
I just sent a request through your website. Name: {name}, phone: {phone}.
```

**Floating WhatsApp button** (every screen; opens template A)

| Element | العربية | English |
|---|---|---|
| Visible label | واتساب | WhatsApp |
| `aria-label` | راسلنا على واتساب | Message us on WhatsApp |
| Desktop tooltip | اسألنا عن رافعة | Ask us about a crane |
| Click-to-call partner (only with `[[PHONE]]`) | اتصل | Call |

---

## 11. Footer

| Element | العربية | English |
|---|---|---|
| Name (as on the logo) | أطلس الصحراء للخدمات النفطية | Atlas Alshraa · For oil services |
| Legal name | شركة أطلس الصحراء المساهمة للخدمات النفطية والنقل الثقيل والمناولة وتأجير الرافعات (الكرينات). | Atlas Alshraa Joint-Stock Company for Oil Services, Heavy Transport, Handling and Crane Hire. [[CONFIRM: English spelling]] |
| Tagline | لكل مشروع رافعته المناسبة. | Every project has the right crane. |
| Column heading | الخدمات | Services |
| Links | تأجير الرافعات / النقل الثقيل / المناولة / الخدمات النفطية | Crane hire / Heavy transport / Handling and rigging / Oil services |
| Column heading | في هذه الصفحة | On this page |
| Links | الرافعات / مواقع العمل / اطلب رافعة | Cranes / On site / Request a crane |
| Column heading | تواصل معنا | Contact |
| Lines | atlasalsahralibya@gmail.com / [[PHONE]] / [[WHATSAPP]] / [[ADDRESS]]، [[CITY]] / [[HOURS]] | atlasalsahralibya@gmail.com / [[PHONE]] / [[WHATSAPP]] / [[ADDRESS]], [[CITY]] / [[HOURS]] |
| Column heading | تابعنا | Follow us |
| Link | فيسبوك | Facebook |
| Registration (optional, HIDDEN UNTIL DATA) | السجل التجاري: [[CR_NUMBER]] | Commercial registration: [[CR_NUMBER]] |
| Copyright | © {year} أطلس الصحراء. جميع الحقوق محفوظة. | © {year} Atlas Alshraa. All rights reserved. |
| Back to top | العودة إلى الأعلى | Back to top |

---

## 12. Alt text for all 22 photos

Each line describes only what is visible. No ownership claims. Model names appear only where they are printed on the machine (or listed in the audit for that photo). If a photo is used purely as texture behind text, use `alt=""` instead.

| Photo | العربية | English |
|---|---|---|
| IMG_6359 | رافعة متحركة صفراء من زاوية منخفضة: كابينة المشغّل والذراع التلسكوبي والخطاف أمام سماء زرقاء وغيوم بيضاء. | A yellow mobile crane seen from below: the operator's cab, the telescopic boom and the hook against a blue sky with white clouds. |
| IMG_6360 | الجهة الخلفية لرافعتين صفراوين على الشاطئ: ثقل موازنة عليه اسم Grove وعلامة RT700E، وثقل موازنة Faun بخطوط حمراء وبيضاء، وشريط تحذير على الرمل. | The back of two yellow cranes on a beach: a Grove counterweight marked RT700E and a Faun counterweight with red and white chevrons, with barrier tape on the sand. |
| IMG_6363 | لقطة قريبة لكابينة رافعة Grove صفراء للأراضي الوعرة، والذراع يرتفع فوقها في سماء زرقاء غائمة. | Close view of the yellow cab of a Grove rough-terrain crane, with the boom rising above it into a cloudy blue sky. |
| IMG_6364 | مؤخرة رافعة Grove RT700E على الشاطئ ومساندها ممدودة على قواعد، وحزام رفع برتقالي معلّق في الخطاف، والبحر في الخلفية. | The back of a Grove RT700E crane on a beach with its outriggers extended on pads; an orange lifting sling hangs from the hook and the sea is behind. |
| IMG_6367 | رافعة مجنزرة خضراء من Kobelco بذراع شبكي، تقف بين مبانٍ خرسانية قيد الإنشاء، وحولها أقماع مرورية ومواد مكدّسة. | A green Kobelco crawler crane with a lattice boom, standing between concrete buildings under construction, with traffic cones and stacked materials around it. |
| IMG_6370 | رافعة مجنزرة Kobelco CKE2500 باللونين الأخضر والأبيض بجانب مبنى خرساني مرتفع، ومشغّل بسترة عاكسة داخل الكابينة. | A green and white Kobelco CKE2500 crawler crane beside a tall concrete building, with an operator in a high-visibility vest in the cab. |
| IMG_6371 | لقطة مربّعة قريبة لرافعة Kobelco CKE2500 المجنزرة الخضراء، يتقاطع ذراعها الشبكي وصاريها أمام مبنى خرساني. | A square close view of the green Kobelco CKE2500 crawler crane, its lattice boom and mast crossing in front of a concrete building. |
| IMG_6374 | نظرة من الأسفل إلى ثقل الموازنة الأبيض لرافعة Terex، وعليه اسم TEREX وخطوط حمراء وبيضاء، والذراع يرتفع مستقيماً في سماء زرقاء صافية. | Looking up at the white counterweight of a Terex crane, lettered TEREX with red and white chevrons, as the boom rises straight into a deep blue sky. |
| IMG_6375 | رافعة Terex بيضاء لكل التضاريس في موقع إنشاءات، مساندها على ألواح فولاذية وكتل الموازنة مركّبة في الخلف، وذراع رافعة صفراء يرتفع خلفها. | A white Terex all-terrain crane on a building site, outriggers on steel pads and counterweight blocks stacked at the back, with a yellow crane boom rising behind it. |
| IMG_6376 | كابينة المشغّل في رافعة Terex AC200-1 بيضاء وبابها مفتوح، وعلى جانبها ملصق مكتوب عليه 200T capacity class. | The operator's cab of a white Terex AC200-1 crane with the door open; a label on the side reads "200T capacity class". |
| IMG_6379 | لقطة قريبة من الأسفل لكابينة رافعة Terex AC200-1، ببابها المفتوح ودرجتها المعدنية وأضوائها الحمراء والبرتقالية والخضراء. | A close view from below of the Terex AC200-1 cab, with its open door, steel step and red, amber and green lights. |
| IMG_6380 | رافعة مجنزرة حمراء FW.China QUY250 بذراع شبكي طويل بجانب مبنى خرساني متعدد الطوابق، وبرج مكاتب في الأفق. | A red FW.China QUY250 crawler crane with a tall lattice boom beside a multi-storey concrete building, with an office tower in the distance. |
| IMG_6382 | لقطة قريبة لجسم رافعة مجنزرة حمراء مكتوب عليه FW.CHINA وQUY250، تحت ذراعها الشبكي. | A close view of the red body of a crawler crane, lettered FW.CHINA and QUY250, under its lattice boom. |
| IMG_6385 | رافعة مجنزرة حمراء FW.China QUY250 على جنازيرها وكتل الموازنة مركّبة، بجانب مبنى خرساني قيد الإنشاء. | A red FW.China QUY250 crawler crane on its tracks with its counterweight blocks in place, next to a concrete building under construction. |
| IMG_6388 | رافعة Grove GMK6350 صفراء لكل التضاريس، على ذراعها عبارة 350 TON، منصوبة على قواعد المساند بجانب سقالات زرقاء وحمراء. | A yellow Grove GMK6350 all-terrain crane, its boom marked "350 TON", set up on outrigger pads beside blue and red scaffolding. |
| IMG_6389 | رافعة Grove GMK6350 صفراء ذراعها مرفوع والخطاف معلّق، تؤطّرها بلاطة خرسانية تبرز منها قضبان حديد التسليح في أعلى الصورة. | A yellow Grove GMK6350 crane with its boom raised and the hook hanging, framed by a concrete slab with steel rebar sticking out at the top of the picture. |
| IMG_6392 | رافعة Grove صفراء لكل التضاريس من الأمام بزاوية جانبية، على أرضية خرسانية وذراعها مرفوع، ومواد بناء مكدّسة إلى اليسار. | A yellow Grove all-terrain crane seen from the front corner on a concrete yard, boom raised, with building materials stacked on the left. |
| IMG_6393 | لقطة قريبة لاسم GROVE على جسم رافعة صفراء، والذراع الممتد يرتفع في سماء زرقاء. | A close-up of the GROVE name on a yellow crane body, with the extended boom rising into a blue sky. |
| IMG_6395 | رافعة Faun صفراء لكل التضاريس ذراعها مرفوع على شاطئ رملي، تحيط بها أقماع مرورية وشريط تحذير، وبجانبها مقطورة قلّابة. | A yellow Faun all-terrain crane with its boom raised on a sandy shore, ringed by traffic cones and barrier tape, with a tipper trailer beside it. |
| IMG_6396 | رافعة Faun صفراء مكتوب على كابينتها ATF 60-3، تظهر من خلف هيكل فولاذي رمادي على شاطئ رملي، والبحر إلى اليسار. | A yellow Faun crane marked "ATF 60-3" on its cab, seen past a grey steel structure on a sandy shore, with the sea on the left. |
| IMG_6397 | مؤخرة رافعة Faun صفراء لكل التضاريس قرب البحر، مساندها ممدودة وعليها خطوط سوداء وبيضاء. | The back of a yellow Faun all-terrain crane by the sea, outriggers extended, with black and white stripes on the beams. |
| IMG_6398 | رافعتان صفراوان، Grove وFaun، منصوبتان جنباً إلى جنب على الشاطئ وذراعاهما مرفوعان نحو سماء زرقاء، وحولهما أقماع مرورية. | Two yellow cranes, a Grove and a Faun, set up side by side on a beach with their booms raised against a blue sky, ringed by traffic cones. |

---

## 13. Needs from Atlas

Every token above, grouped by what it blocks.

**A. Blocks launch**

- [ ] `[[PHONE]]`: header Call button, contact panel, footer, click-to-call next to WhatsApp.
- [ ] `[[WHATSAPP]]` and `[[WHATSAPP_INTL]]` (international format, digits only): every WhatsApp button and template.
- [ ] `[[CITY]]` and `[[ADDRESS]]`: contact panel and footer.
- [ ] `[[MAP_PIN]]`: "Open in Google Maps" link.
- [ ] `[[HOURS]]`: contact panel and footer.
- [ ] `[[FACEBOOK_URL]]`: contact panel and footer.
- [ ] `[[DOMAIN]]`: canonical and `og:url`.
- [ ] English spelling of the name: "Atlas Alshraa" (logo), "Al-Sahraa" (correct transliteration) or "alsahra" (email). The deck uses "Atlas Alshraa" for now.
- [ ] Approval of the positioning: crane hire, heavy transport, handling and oil services (not equipment trading).
- [ ] Approval to use the Facebook tagline as the H1, and the line «تواصلوا معانا وخلي الباقي علينا» in the contact section.
- [ ] Logo source file and approval of the badge + typeset name lockup.
- [ ] Clean photo exports without the watermark (needed for IMG_6374, the hero on mobile and the `og:image`).

**B. Fleet sheet, one row per crane**

| Token | Model | What the photos show (not a confirmation) | Question for Atlas |
|---|---|---|---|
| `[[CAPACITY:RT700E]]` | Grove RT700E | Model plate only. Manufacturer rating 60 US tons ≈ 55 t (Bigge, Cranepedia); unconfirmed for Atlas | Max capacity? Owned or partner? How many? |
| `[[CAPACITY:ATF]]` | Faun, cab reads "ATF 60-3" | Audit lists it as "ATF-series" | Exact model? Max capacity? Owned or partner? |
| `[[CAPACITY:AC200-1]]` | Terex AC200-1 | Label reads "200T capacity class" | Max capacity? Owned or partner? |
| `[[CAPACITY:QUY250]]` | FW.China QUY250 | Model name only | Max capacity? Owned or partner? |
| `[[CAPACITY:CKE2500]]` | Kobelco CKE2500 | Carries "CRANE HIRE" and another company's logo and website | Owned, partner or neither? May we show it at all? |
| `[[CAPACITY:GMK6350]]` | Grove GMK6350 | Boom reads "350 TON" | Max capacity? Owned or partner? |

- [ ] `[[OWNED_OR_PARTNER:{model}]]` for each crane. This also decides whether the copy can say «أسطولنا» / "Our fleet".
- [ ] `[[QTY:{model}]]`: units of each model.
- [ ] `[[BOOM:{model}]]`: main boom length in metres.
- [ ] `[[LOAD_CHART:{model}]]`: load chart PDF, if they can share it.
- [ ] `[[MIN_CAPACITY]]` and `[[MAX_CAPACITY]]`: smallest and largest confirmed capacity (hero chip, scale, Why block).
- [ ] `[[FLEET_COUNT]]`: total cranes, only if owned.
- [ ] Any cranes Atlas has that are not in these photos.

**C. Service details** (each `[[CONFIRM]]` in section 5)

- [ ] Crane hire: is an operator included? Can we say "experienced operator"?
- [ ] Heavy transport: by road? Which trailers (low-bed or others)? Any weight or size limit worth stating?
- [ ] Handling: what it covers (rigging crew, slings and lifting gear, lift plans, loading and unloading).
- [ ] Oil services: the exact scope, in 2–3 lines.
- [ ] Should "load weight" stay required when the request is for oil services?

**D. Proof for the hidden Why and Documents block**

- [ ] `[[FOUNDING_YEAR]]`
- [ ] `[[REGIONS]]`: cities or regions they work in.
- [ ] `[[OPERATOR_CERT_BODY]]`: operator training or certification, if any.
- [ ] `[[INSPECTION_BODY]]`: third-party crane inspection, if any.
- [ ] `[[INSURANCE]]`: insurer or cover type, if they want it shown.
- [ ] `[[CLIENTS_PROJECTS]]`: names they may publish, with written permission.
- [ ] Documents as PDFs, only those that exist: `[[DOC:PROFILE]]`, `[[DOC:FLEET_LIST]]`, `[[DOC:INSPECTION]]`, `[[DOC:HSE]]`, `[[DOC:ISO]]`, `[[DOC:INSURANCE]]`, `[[DOC:CR]]`. For each: language (Arabic, English or both) and date.
- [ ] `[[CR_NUMBER]]`: commercial registration number, if they want it in the footer.

**E. Form and replies**

- [ ] `[[RESPONSE_TIME]]`: how fast they usually reply, if they want to promise it.
- [ ] Who receives form requests (which inbox or WhatsApp number).
- [ ] Approval of the privacy line: "We use your details only to reply to your request."
- [ ] Form backend, or WhatsApp-only (template D) at launch.

**F. Photos and sites**

- [ ] Permission to show the two shoot sites as they are, unnamed.
- [ ] Permission to show the Kobelco photos (6367, 6370, 6371), or to leave them out.
- [ ] Source file of the 41-second Facebook fleet video (optional hero loop).
- [ ] Photographer credit, if one is required.

### 9b. Request form v2 additions

| Element | العربية | English |
|---|---|---|
| What happens next (title) | ماذا يحدث بعد الإرسال | What happens next |
| Step 1 | ترسل رقم هاتفك ووزن الحمولة. | You send your phone number and the load weight. |
| Step 2 | نتواصل معك على الرقم نفسه. | We contact you on that number. |
| Step 3 | نتفق معك على الرافعة والتفاصيل. | We agree the crane and the details with you. |
| Lift summary title | رفعتك | Your lift |
| Lift summary note | هذا تكرار لما كتبته فقط. نؤكد معك الرافعة المناسبة. | This only repeats what you entered. We confirm the right crane with you. |
