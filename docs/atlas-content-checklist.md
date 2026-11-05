# Atlas Alshraa website: what we need from Atlas before launch
# قائمة ما نحتاجه من أطلس الصحراء قبل إطلاق الموقع

One list, three parts. Answer in Arabic or English; a one-word answer is enough where it says "yes / no".
Each item says **where it appears on the site** and **what changes when you answer**.
The site is built so that nothing unconfirmed can go live: the production build refuses to run until every fact below is settled (see README, "Truth gate").

قائمة واحدة من ثلاثة أجزاء. أجيبوا بالعربية أو بالإنجليزية. كل بند يذكر **أين يظهر في الموقع** و**ما الذي يتغير عند الإجابة**.
الموقع مبني بحيث لا يمكن نشر أي معلومة غير مؤكدة: لا يعمل بناء النسخة النهائية قبل حسم كل البنود أدناه.

Status: `[ ]` open, `[x]` answered. Item count: **A = 14 facts, B = 16 data items, C = 6 approvals (36 in total).**

---

## A. Facts to confirm | معلومات نحتاج تأكيدها

### A1. The five cranes: ownership, quantity and rating | الرافعات الخمس: الملكية والعدد والسعة

The site shows each crane's **maker's maximum rating**, not a figure from Atlas. Every one carries a red "DRAFT · unverified" tag on the staging site. For each crane we need three answers: is it owned by Atlas (or a partner's)? how many units? is the rating below right for **your** machine?

الموقع يعرض **التصنيف الأقصى من الشركة المصنّعة**، وليس رقماً من أطلس، وعليه وسم "مسودة" أحمر في النسخة التجريبية. نحتاج لكل رافعة: هل هي ملك أطلس أم شريك؟ كم عددها؟ وهل التصنيف المذكور صحيح لرافعتكم؟

| # | Crane | Rating on the site | Where it appears | Question for Atlas |
|---|---|---|---|---|
| A1.1 | [ ] Grove RT700E (rough-terrain) | 55 t (the maker's 60 US tons) | Hoist section, "Find your crane" list, compare table, detail sheet, and the Why Atlas range figure | Owned? How many? Is 55 t the right rating? |
| A1.2 | [ ] Tadano Faun ATF 60-3 (all-terrain) | 60 t | same | Owned? How many? Is 60 t right? |
| A1.3 | [ ] Terex AC200-1 (all-terrain) | 200 t | same | Owned? How many? Is 200 t right? |
| A1.4 | [ ] Fuwa QUY250 (crawler) | 250 t. **Fuwa's own data page says 260 t** (secondary sources vary) | same | Which is right for your machine: 250 t (the model name) or 260 t? |
| A1.5 | [ ] Grove GMK6350 (all-terrain) | 317.5 t. The boom reads "350 TON", which is **US tons**; 350 US tons = 317.5 metric tonnes | same, plus a note under the list explaining 350 vs 317.5 | Owned? How many? Is 317.5 t right? |
| A1.6 | [ ] Ownership and quantity, all five | not shown | decides whether the copy may say "our fleet" / «أسطولنا» | One line per crane: owned / partner, and number of units |

**What changes:** each crane you confirm loses its DRAFT tag, and the Hoist and list use your number. When all five are confirmed the "Find your crane" filter switches from crane-type chips to capacity-band chips (0-60, 61-200, 201+ t). A wrong rating we cannot confirm is removed rather than published.
**Developer:** set `verified: true` for that crane in `src/content/cranes.ts`; change `capacityT` if the rating differs (and `maxCapacityT` in `src/content/crane-specs.ts`).

### A2. Service details | تفاصيل الخدمات

These are sentences the site holds back until confirmed. Each shows today as a `[[CONFIRM: …]]` marker on staging (the full list of markers is in section A4).

| # | Question | Where it appears | What changes when you answer |
|---|---|---|---|
| A2.1 | [ ] **Is an operator included with every crane hire?** May we say "experienced operator"? | Services > Crane hire (extra sentence); Why Atlas > step 4 "The crane arrives on site" | Yes: the sentence goes live in both places. No: both are deleted and nothing about operators is said. |
| A2.2 | [ ] **Heavy transport:** is it by road, on low-bed (لوبد) trailers? Any weight or size limit worth stating? | Services > Heavy transport | The bracketed phrase becomes plain text, or is replaced by what you tell us. |
| A2.3 | [ ] **Handling (المناولة):** what does it cover? Rigging crew, slings and lifting gear, a lift plan, loading and unloading? | Services > Handling | The bracketed phrase is replaced by exactly what you list. |
| A2.4 | [ ] **Oil services:** the exact scope, in two or three lines (for example lifting and transport at oil fields?) | Services > Oil services | The bracketed phrase is replaced by your scope. |
| A2.5 | [ ] **Load chart check:** when a customer sends load, radius and height, do you check the lift against the crane maker's load chart? | Why Atlas > step 2 "We match the right crane" | Yes: stays as written. No: we reword the step. |
| A2.6 | [ ] **Usual reply time**, if you want to promise one (for example "within 30 minutes") | Not shown today. Would appear in the request form's success message: "We usually reply within …" | Give a time and we add the line; say no and nothing is promised. |

### A3. Name and privacy wording | الاسم والخصوصية

| # | Question | Where it appears | What changes when you answer |
|---|---|---|---|
| A3.1 | [ ] **English spelling of the company name.** The logo says "Alshraa"; your email says "alsahra"; a literal transliteration is "Al-Sahraa". | English footer (full legal name), page titles, social previews, the structured data Google reads | We use your spelling everywhere in English. The marker in the English footer is removed. |
| A3.2 | [ ] **Privacy line approval:** «نستخدم بياناتك للرد على طلبك فقط.» / "We use your details only to reply to your request." Is this true for how you use form data? | Request form, under the Send button, both languages | Approved: the marker is removed. If you also store or share the data, tell us and we will reword it. |

### A4. Every `[[CONFIRM]]` marker currently on the site | كل علامات `[[CONFIRM]]` الموجودة الآن

Staging shows these in the page text. The production build **fails** while any remains. Each is answered by an item above; this table is so nobody has to hunt for them. (To regenerate: `grep -rn "\[\[" src/content/ar.ts src/content/en.ts src/content/why.ts`.)

| Lang | File and field | Current text | Answered by |
|---|---|---|---|
| AR | `src/content/ar.ts` > `services.items[crane-hire].confirm` | `[[CONFIRM: كل رافعة تأتي مع مشغّل ذي خبرة.]]` | A2.1 |
| AR | `ar.ts` > `services.items[heavy-transport].body` | `… [[CONFIRM: براً، على مقطورات منخفضة (لوبد)]] …` | A2.2 |
| AR | `ar.ts` > `services.items[handling].body` | `… [[CONFIRM: مع فريق ربط ومعدات الربط والرفع وخطة رفع]] …` | A2.3 |
| AR | `ar.ts` > `services.items[oil-services].body` | `… [[CONFIRM: النطاق بالتحديد، مثل الرفع والنقل في الحقول]] …` | A2.4 |
| AR | `ar.ts` > `request.privacy` | `نستخدم بياناتك للرد على طلبك فقط. [[CONFIRM]]` | A3.2 |
| AR | `src/content/why.ts` > `ar.steps.items[3].text` | `… [[CONFIRM: ومعها مشغّل ذو خبرة.]]` | A2.1 |
| EN | `src/content/en.ts` > `services.items[crane-hire].confirm` | `[[CONFIRM: Every crane comes with an experienced operator.]]` | A2.1 |
| EN | `en.ts` > `services.items[heavy-transport].body` | `… [[CONFIRM: by road, on low-bed trailers]] …` | A2.2 |
| EN | `en.ts` > `services.items[handling].body` | `… [[CONFIRM: with a rigging crew, slings and lifting gear, and a lift plan]] …` | A2.3 |
| EN | `en.ts` > `services.items[oil-services].body` | `… [[CONFIRM: exact scope, for example lifting and transport at oil fields]] …` | A2.4 |
| EN | `en.ts` > `request.privacy` | `We use your details only to reply to your request. [[CONFIRM]]` | A3.2 |
| EN | `en.ts` > `footer.legalName` | `… Crane Hire. [[CONFIRM: English spelling]]` | A3.1 |
| EN | `why.ts` > `en.steps.items[3].text` | `… [[CONFIRM: An experienced operator comes with it.]]` | A2.1 |

Also in the code (not visible on the page): `cranes.ts` has a `[[CAPACITY:CKE2500]]` comment for the hidden Kobelco crane (see B14).

---

## B. Data to supply | معلومات نحتاج استلامها

| # | Item | Where it appears | What changes when you supply it |
|---|---|---|---|
| B1 | [ ] **Phone number** (international format, e.g. +218 9X XXX XXXX) | Header "Call" button, contact panel, footer, call link next to WhatsApp | The Call button and phone line appear. Required for production. |
| B2 | [ ] **WhatsApp number** (digits only, with country code) | Every WhatsApp button, the floating request bar, the form's WhatsApp option | Messages open a chat with this number, with the chosen crane already written in. Required for production. |
| B3 | [ ] **Address** (city and street, in Arabic and English) and opening hours, if any | Contact panel and footer | The address line appears in both. Until then none is shown. |
| B4 | [ ] **Domain name** (for example atlasalsahra.ly) | Page addresses, social previews, sitemap, search results | Canonical links, sitemap and previews use your domain. Required for production. |
| B5 | [ ] **Who receives form requests**: an email inbox or a form service account | The request form | With a form endpoint the form sends directly and shows a success message. Without one, the form opens WhatsApp with the request written out. Either works; tell us which you prefer. |
| B6 | [ ] **Google Analytics 4 measurement ID** (G-XXXXXXX), if you want visit statistics. Note: the site does not ask visitors for consent (README, "Analytics") | Nowhere visible | Counts visits and taps on WhatsApp, Call and the form. Without it no tracking runs at all. |
| B7 | [ ] **Company profile** (PDF; say if Arabic, English or both, and the date) | "Documents" section | The section appears with a download card for each file you supply. With no files the section is not on the page at all. |
| B8 | [ ] **Crane list / fleet list** (PDF) | same | same |
| B9 | [ ] **Crane inspection certificates** (PDF) | same | same |
| B10 | [ ] **HSE documents** (PDF) | same | same |
| B11 | [ ] **ISO certificates** (PDF) | same | same |
| B12 | [ ] **Insurance** (PDF), only if you want it public | same | same |
| B13 | [ ] **Commercial registration (CR)** (PDF or number), only if you want it public | same | same |
| B14 | [ ] **Kobelco CKE2500:** do you own it, share it with a partner, or neither? May we show it? Its photos carry another company's logo and website, so it is hidden today. | Would add a sixth crane to the Hoist and list | Yes and capacity confirmed: it is shown (the photos must be cleaned of the other company's branding first). Otherwise it stays hidden. |
| B15 | [ ] **Mission, vision, values**, only if you have them in writing | About section | Each approved item appears as one more fact beside the legal name. Nothing is shown (not even a placeholder) until you supply them. |
| B16 | [ ] **Logo as a vector file** (SVG, AI or PDF) | Header, footer, browser tab icon, social previews | Today the site uses the round badge cropped from a photo. The vector file gives sharp edges at every size and replaces the temporary tab icon. |

Optional, not counted: the source file of the 41-second fleet video; a photographer credit if one is required; the names of clients or projects you are happy to publish (written permission needed). None of these appear until supplied.

---

## C. Approvals | موافقات

All of this copy was written by us from facts already on hand. It says nothing about years, client names, numbers of cranes or certificates. Read it on the staging site, in Arabic first. Reply "approved" or send the change.

| # | Approve | Where it appears | Current text (summary) | What changes when you answer |
|---|---|---|---|---|
| C1 | [ ] **About** | About section | "Atlas Alshraa is a Libyan joint-stock company. From smaller cranes to the largest ones, we help you choose the crane that fits your load and your site. Every crane photo on this site is real." plus the Arabic legal name and the four lines of work | Approved: stays. Changes: we edit the text. |
| C2 | [ ] **Why Atlas** | Why Atlas section | Title, lead, the range ruler, "a crane for every kind of ground", the four hiring steps, the "Ask the way that suits you" strip | Same. The operator sentence in step 4 depends on A2.1 and the load-chart wording in step 2 on A2.5. |
| C3 | [ ] **Form "What happens next"** | Request section | (1) You send your phone number and the load weight. (2) We contact you on that number. (3) We agree the crane and the details with you. | Make sure this is how you really work. Edit anything that is not. |
| C4 | [ ] **Hoist section title and intro** | The scrolling crane showcase | "Choose your crane by capacity. Scroll to see the cranes from smallest to largest. The big number is each crane's maximum capacity." | Approved: stays. |
| C5 | [ ] **Positioning and tagline** | Hero headline, social previews | Your own Facebook line (29 Oct 2026): "From smaller cranes to the largest ones, every project has the right crane", and the positioning "crane hire, heavy transport, handling and oil services" | Approved: stays. |
| C6 | [ ] **Photos used** | Hero, Hoist, About, "On site" gallery (12 photos of two sites), crane cards | Photos from the 3 Nov 2026 shoot, cropped so the burned-in watermark is out of frame. The two sites are shown unnamed. Kobelco photos are not used. | Confirm we may show them, and that the two sites may be shown without names. Tell us any photo to remove. |
