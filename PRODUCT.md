# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite 8 + React 19 + TypeScript + Tailwind CSS 4, with GSAP + Lenis for motion. Static output, prerendered per language. The user chose this on 4 Nov 2026 to reuse the pipeline from their previous AFHAM site; the client proposal had named Next.js.

## Users

- **Primary:** site and project managers at construction contractors in Libya. They need a crane of a specific capacity on a specific date, decide fast, mostly on a phone, and often arrive from Facebook or WhatsApp.
- **Secondary:** procurement teams at oil & gas operators and service companies. They need proof (fleet list, inspection certificates, HSE documents, references) in Arabic and English, read on desktop, and forward links internally.
- **Also:** port, coastal and infrastructure contractors who need lifting and heavy transport together.

Arabic is the default reading language. English is second.

## Product Purpose

A one-page bilingual website for شركة أطلس الصحراء المساهمة للخدمات النفطية والنقل الثقيل والمناولة وتأجير الرافعات ("Atlas Alshraa"). It should show, within seconds, that Atlas hires cranes from small to very large and also offers heavy transport, handling (lifting and rigging) and oil services. A visitor should be able to ask for the right crane in one tap: WhatsApp, a call, or a short request form.

Success means more qualified enquiries that include the load weight and site, and a site that oil & gas buyers can use for prequalification.

## Positioning

Atlas's own claim, published on Facebook on 29 Oct 2026: «من الرافعات الصغيرة للكبيرات، لكل مشروع رافعته المناسبة» ("From smaller cranes to the largest ones, every project has the right crane."). The range of cranes is the differentiator. In Libya, no crane-hire company has a real website; the market runs on Facebook posts with phone numbers in them.

## Operating Context

- Buyers compare capacities against manufacturer load charts and National Oil Corporation paperwork, which use Western digits.
- Oil & gas tenders (for example Mellitah Oil & Gas's crane-hire prequalification, Dec 2025) ask for inspection certificates, HSEQ/ISO documents, a company profile, references and an Arabic + English technical file.
- Median mobile download speed in Libya is about 17 Mbps.
- WhatsApp and Facebook Messenger are the everyday business channels.

## Capabilities and Constraints

- **Services, from the legal name:** crane hire · heavy transport · handling (المناولة) · oil services.
- **Crane models visible in Atlas's photos:** Grove RT700E, Tadano Faun ATF 60-3, Terex AC200-1, Fuwa QUY250, Grove GMK6350, and a Kobelco CKE2500 that carries another company's branding and stays hidden. **Ownership, quantities and capacities are not yet confirmed by Atlas.** The site uses manufacturer ratings behind a truth gate that blocks a production build until they are verified.
- **Confirmed contact:** atlasalsahralibya@gmail.com and the Facebook page. **Not yet supplied:** phone, WhatsApp number, address, domain.
- **Commercial frame:** one page, Arabic + English, 10 working days (proposal PRP-ATL-2611-001).
- **Undecided:** the English spelling of the name ("Alshraa" on the logo, "alsahra" in the email), and which documents can be published.

## Brand Commitments

- **The logo:** a round illustrated badge with hand-lettered Arabic, an oil derrick with a flame, a globe with a red orbit arrow and a mobile crane. Navy #23207A and red #C9221C on white. It is kept as it is; no redesign.
- **Voice:** Arabic first, with warm Libyan dialect on social media («شنو الرافعة اللي يحتاجها مشروعك؟ تواصلوا معانا وخلي الباقي علينا»). English is plain and service-led. Dialect is used on the site only where Atlas already used it.

## Evidence on Hand

- **22 professional photos** from one shoot on 3 Nov 2026 (Sony FX3) at a construction site and a coastal site. They are in the parent folder as `IMG_63*.JPG`, and every one has a burned-in logo watermark. Watermark-free crops are in `docs/asset-crops.json`.
- **A 41-second fleet video** on Facebook (source file not yet supplied).
- **No** client names, project names, founding year, statistics, certifications, testimonials or partner logos. **None may be invented.**

## Product Principles

1. **Prove the range, don't just claim it.** Every capacity shown is real and traceable.
2. **One tap to ask.** WhatsApp, call or a short form, with the chosen crane already filled in.
3. **Arabic composed, not mirrored.** Libyan readers come first.
4. **Truth over polish.** Unverified facts never reach production; missing proof is left out, not faked.
5. **Fast on Libyan mobile networks.**

## Accessibility & Inclusion

- WCAG 2.2 AA.
- Full keyboard and screen-reader support in both languages.
- Reduced motion respected.
- Tap targets of at least 44 px.
- Forms accept Arabic-Indic digits.
